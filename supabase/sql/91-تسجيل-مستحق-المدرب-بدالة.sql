-- ============================================================
-- 91 — تسجيل مستحق المدرب بدالة، مش بصلاحية العميل
-- ============================================================
--
-- ── اللي التشخيص (ملف 90) أثبته ─────────────────────────────
--
--   • جدول `instructor_payouts` عليه سياسة كتابة **واحدة**:
--       `Super admin can manage instructor payouts` ← `is_super_admin()`
--   • الفهرس الفريد موجود فعلًا ✓ (التعليق في الكود كان صح)
--   • الجدول **فاضي**، ومفيش ولا طلب خدمة مكتمل ليه مدرب
--
-- يعني: **العطل مؤكَّد بالبناء، ولسه ما ضربش لأن المسار ما اشتغلش
-- ولا مرة.** أول طلب خدمة يوصل «مكتمل» هيقع فيه.
--
-- ── ليه هيقع ────────────────────────────────────────────────
--
-- اللي بيدوس «أكّد الاستلام» هو **العميل**. والكود بعدها بيعمل:
--
--     ١. الطلب يتحوّل لـ`completed`
--     ٢. INSERT في `instructor_payouts` — **بجلسة العميل**
--
-- والعميل مش `is_super_admin()`، فالصلاحيات بترفض الخطوة التانية.
-- والنتيجة:
--
--     الطلب مكتمل ✓     ·     المستحق ما اتسجّلش ✗
--
-- والكود بيرمي، فالعميل يشوف رسالة خطأ على عملية **تمّت**. ولو حاول
-- تاني، الإقفال مشروط بـ`status = 'delivered'` والحالة بقت
-- `completed` — فالمحاولة بترفض و**المستحق يضيع بلا طريق رجوع**.
--
-- ⚠️ والمدرب مش هيشتكي: هو مبيشوفش «طلب مكتمل بلا مستحق»، بيشوف
--    قايمة مستحقاته وبس — والصف مش موجود فيها أصلًا.
--
-- ⚠️ **وحتى الإداري العادي مش هيعدّي.** الإقفال الإداري
--    (`closeServiceOrderByAdmin`) بيمر على نفس السطر، والسياسة
--    بتطلب **مدير النظام** لا أي إداري. يعني المسارين الاتنين
--    مقفولين إلا على شخص واحد.
--
-- ── الحل ────────────────────────────────────────────────────
--
-- دالة `SECURITY DEFINER` بتسجّل المستحق. ودي نفس الفكرة اللي
-- المشروع ماشي عليها من ملف 70: **الدور اللي محتاج يكتب في جدول
-- مش بتاعه بيمر على دالة محدودة، مش على سياسة أوسع**.
--
-- والبديل اللي **مااتاخدش**: فتح سياسة إدراج للعميل على
-- `instructor_payouts`. ده كان هيخلّي أي عميل يكتب أي مبلغ لأي
-- مدرب — الصلاحيات بتحمي الصفوف لا الأعمدة (قاعدة «ب»)، فمفيش
-- سياسة تقدر تقيّد **المبلغ**.
--
-- ── اللي الدالة بتعمله بالظبط ───────────────────────────────
--
--   • بتقرا الطلب بنفسها وبتتأكد إنه `completed` فعلًا
--   • **بتحسب المبلغ من صف الطلب** — المتصفح مبيبعتش رقم خالص
--   • بتسمح للمشتري أو للإداري وبس
--   • `ON CONFLICT DO NOTHING` على الفهرس الفريد — فتشغيلها عشر
--     مرات بيدي نفس نتيجة المرة الواحدة (idempotent)
--
-- والصفة الأخيرة دي هي اللي بتخلّي **التعويض ممكن**: أي طلب ضاع
-- مستحقه ينفع يتسجّل بنداء تاني، من غير خوف من الدفع مرتين.
--
-- ⚠️ **الترتيب مفيهوش خطر:** الملف بيضيف دالة وبس. الكود المنشور
--    دلوقتي بيعمل INSERT مباشر وهيفضل يقع زي ما هو لحد ما تدفع
--    الكود الجديد — مفيش حاجة بتتكسر بتشغيل الملف ده.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.record_service_order_earning(p_order_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user     uuid := auth.uid();
  v_order    record;
  v_earning  numeric;
  v_name     text;
  v_inserted integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'لازم تسجّل الدخول';
  END IF;

  SELECT o.id, o.buyer_profile_id, o.instructor_id, o.instructor_earning,
         o.amount, o.status, o.standalone_service_id
    INTO v_order
    FROM service_orders o
   WHERE o.id::text = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب مش موجود';
  END IF;

  -- المشتري أو الإدارة وبس. مفيش طرف تالت بيسجّل مستحقات.
  IF v_order.buyer_profile_id::text <> v_user::text
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'الطلب ده مش طلبك';
  END IF;

  -- ⚠️ المستحق بيتسجّل **بعد** الاكتمال وبس. الدالة مبتقفلش الطلب
  --    ومبتغيّرش حالته — ده شغل الكود اللي بيناديها.
  IF v_order.status <> 'completed' THEN
    RAISE EXCEPTION 'الطلب لسه ما اكتملش';
  END IF;

  IF v_order.instructor_id IS NULL THEN
    RETURN jsonb_build_object('recorded', false, 'reason', 'no_instructor');
  END IF;

  -- المبلغ من صف الطلب لا من المتصفح.
  v_earning := COALESCE(v_order.instructor_earning, v_order.amount);
  IF v_earning IS NULL OR v_earning <= 0 THEN
    RETURN jsonb_build_object('recorded', false, 'reason', 'no_amount');
  END IF;

  SELECT s.name INTO v_name
    FROM standalone_services s
   WHERE s.id = v_order.standalone_service_id;

  INSERT INTO instructor_payouts (
    instructor_id, period, amount, status, source_type, source_id, description
  )
  VALUES (
    v_order.instructor_id,
    to_char(now(), 'YYYY-MM'),
    round(v_earning)::integer,
    'pending',
    'service_order',
    v_order.id::text,
    COALESCE(v_name, 'خدمة إبداعية')
  )
  -- الفهرس الفريد `instructor_payouts_service_order_unique` هو اللي
  -- بيمسك التكرار. `DO NOTHING` بيخلّي إعادة النداء آمنة.
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'recorded', v_inserted > 0,
    'reason', CASE WHEN v_inserted > 0 THEN 'inserted' ELSE 'already_recorded' END,
    'amount', round(v_earning)::integer
  );
END
$function$;

COMMENT ON FUNCTION public.record_service_order_earning(text) IS
  'بتسجّل مستحق المدرب لطلب خدمة مكتمل. المبلغ من صف الطلب، والتكرار بيمنعه الفهرس الفريد. للمشتري أو الإدارة (ملف 91).';

-- الزائر ملوش علاقة. والمسجَّل بيقدر ينادي — والدالة بتفحص بنفسها
-- إنه المشتري أو إداري.
REVOKE ALL ON FUNCTION public.record_service_order_earning(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_service_order_earning(text) TO authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الدالة وإعداداتها
  SELECT
    '1. الدالة'::text AS القسم,
    p.proname::text    AS البند,
    ((CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)
      || '  ·  search_path: '
      || COALESCE(array_to_string(p.proconfig, ', '), '(غير مضبوط)'))::text AS التفاصيل,
    CASE WHEN p.prosecdef AND p.proconfig IS NOT NULL
         THEN '✓ سليمة' ELSE '✗ راجع' END AS الحالة
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'record_service_order_earning'

  UNION ALL

  -- ٢) نسخة واحدة — قاعدة «س»
  SELECT
    '2. عدد النسخ',
    'record_service_order_earning',
    'نسخ: ' || count(*)::text,
    CASE WHEN count(*) = 1 THEN '✓ واحدة' ELSE '✗ تحميل زائد' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'record_service_order_earning'

  UNION ALL

  -- ٣) الصلاحيات
  SELECT
    '3. الصلاحيات',
    'record_service_order_earning',
    'anon: ' || CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END
    || '  ·  authenticated: ' || CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END,
    CASE
      WHEN NOT has_function_privilege('anon', p.oid, 'EXECUTE')
       AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
        THEN '✓ الزائر ممنوع'
      ELSE '✗ راجع'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'record_service_order_earning'

  UNION ALL

  -- ٤) السياسات ما اتغيّرتش — الجدول لسه مقفول على مدير النظام
  SELECT
    '4. سياسات الجدول',
    p.policyname::text,
    (p.cmd || '  ·  ' || COALESCE(p.with_check, p.qual, '—'))::text,
    '✓ زي ما هي'
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'instructor_payouts'

  UNION ALL

  -- ٥) الفهرس الفريد لسه مكانه — عليه يعتمد ON CONFLICT
  SELECT
    '5. منع التكرار',
    COALESCE(i.indexname, '(مفقود)')::text,
    CASE WHEN i.indexdef IS NULL THEN 'الفهرس اتشال — ON CONFLICT مش هيشتغل'
         ELSE 'موجود' END,
    CASE WHEN i.indexdef ILIKE '%unique%' THEN '✓ فريد' ELSE '✗ راجع' END
  FROM (SELECT 1) one
  LEFT JOIN pg_indexes i
    ON i.schemaname = 'public'
   AND i.tablename = 'instructor_payouts'
   AND i.indexname = 'instructor_payouts_service_order_unique'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ متشغّلوش بعد ما الكود الجديد يتنشر — الكود بينادي الدالة دي،
--    وشيلها بيرجّع العطل.
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.record_service_order_earning(text);
-- COMMIT;
-- ============================================================
