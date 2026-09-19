-- ============================================================
-- 86 — الإهداء الخاص في حجز الباقات
-- ============================================================
--
-- ── إيه اللي ناقص ───────────────────────────────────────────
--
-- ولي الأمر يقدر يحجز باقة **لنفسه أو لواحد من أبنائه**، لكن مفيش
-- مكان يكتب فيه كلمة إهداء. معالج «إنها لك» عنده `dedicationText`
-- بيتخزّن في `customization_data`، أما حجز الباقات فجدوله
-- (`course_subscriptions`) **مفيهوش عمود للإهداء أصلًا** — فأي نص
-- المتصفح يبعته دلوقتي بيضيع.
--
-- ── اللي بيتعمل هنا ─────────────────────────────────────────
--
--   ١. عمود `gift_message` جديد على `course_subscriptions` — بيتضاف
--      فاضي، والصفوف القديمة متتلمسش.
--   ٢. `create_course_booking` بتاخد باراميتر خامس `p_gift_message`،
--      بتشيل الفراغات، وبتقصّه على 500 حرف.
--   ٣. محفّز `guard_course_subscription_fields` بيجمّد الإهداء بعد
--      الإنشاء — زي المبلغ والمدرب بالظبط.
--
-- ── ليه الإهداء بيتجمّد ─────────────────────────────────────
--
-- المحفّز شغّال بمنطق «رجّع كل حقل لقيمته القديمة إلا اللي مسموح».
-- أي عمود **مش مكتوب فيه** يبقى العميل يقدر يغيّره بتحديث مباشر عن
-- طريق REST. والإهداء جزء من الطلب اللي الإدارة بتنفّذه — فتغييره بعد
-- ما الشغل يبدأ بيخلّي المطبوع مختلفًا عن المسجَّل.
--
-- لو حابب العميل يعدّله قبل الدفع، ده تغيير تاني ومحتاج شرط صريح
-- (`OLD.status = 'pending'`) — مش بنعمله دلوقتي.
--
-- ⚠️ **خطوة إجبارية قبل التشغيل**
--
--    الدالة تحت **منسوخة حرفيًا** من ملف
--    `46-حجز-الكتابة-المبلغ-ورقم-التحويل.sql` بزيادة الإهداء وحده.
--    اتأكد إن ده لسه هو التعريف الشغّال، ومحدّش عدّله من لوحة
--    Supabase — القاعدة هي مصدر الحقيقة مش ملفات المشروع:
--
--      SELECT pg_get_functiondef(
--        'public.create_course_booking(text,text,text,text)'::regprocedure);
--      SELECT pg_get_functiondef(
--        'public.guard_course_subscription_fields()'::regprocedure);
--
--    قارنهم بالنص اللي تحت. **لو في أي فرق غير الإهداء، متشغّلش
--    الملف** وابعتلي اللي طلع.
--
-- ⚠️ الدالة القديمة بأربع باراميترات **بتفضل موجودة**: الباراميتر
--    الخامس له `DEFAULT NULL`، فـPostgres بيعتبرها نفس الدالة
--    ويستبدلها. يعني الكود القديم المنشور هيفضل شغّال لحد ما تدفع
--    الجديد — مفيش لحظة كسر.
-- ============================================================

BEGIN;

-- ── ١) العمود ───────────────────────────────────────────────

ALTER TABLE public.course_subscriptions
  ADD COLUMN IF NOT EXISTS gift_message text;

COMMENT ON COLUMN public.course_subscriptions.gift_message IS
  'إهداء خاص يكتبه صاحب الحجز — بيتقفل بعد الإنشاء زي المبلغ.';


-- ── ٢) دالة الحجز ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_course_booking(
  p_package_id       text,
  p_instructor_id    text DEFAULT NULL,
  p_participant_type text DEFAULT 'self',
  p_child_id         text DEFAULT NULL,
  p_gift_message     text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user    uuid := auth.uid();
  v_price   numeric;
  v_child   text := NULLIF(btrim(coalesce(p_child_id, '')), '');
  v_instr   text := NULLIF(btrim(coalesce(p_instructor_id, '')), '');
  -- القصّ في القاعدة مش في المتصفح: الـRPC ممكن تتنادى من غير الشاشة.
  v_gift    text := NULLIF(btrim(coalesce(p_gift_message, '')), '');
  v_id      text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'لازم تسجّل الدخول قبل الحجز';
  END IF;

  -- الباقة لازم تكون موجودة ومفعّلة — مش أي نص جاي في الرابط.
  SELECT price INTO v_price
    FROM creative_writing_packages
   WHERE id = p_package_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الباقة دي مش متاحة';
  END IF;

  -- المدرب اختياري، وبيتقبل بس لو موجود ومفعّل.
  IF v_instr IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM instructors
       WHERE id = v_instr AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'المدرب المختار مش متاح';
    END IF;
  END IF;

  IF p_participant_type = 'child' THEN
    IF v_child IS NULL THEN
      RAISE EXCEPTION 'اختار المشارك الأول';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM child_profiles c
       WHERE c.id = v_child AND c.user_profile_id = v_user
    ) THEN
      RAISE EXCEPTION 'ملف المشارك المرفق لا يخص صاحب الحساب';
    END IF;
  ELSE
    v_child := NULL;
  END IF;

  IF v_gift IS NOT NULL THEN
    v_gift := left(v_gift, 500);
  END IF;

  INSERT INTO course_subscriptions (
    package_id, user_id, participant_type, child_id,
    status, amount, preferred_instructor_id, gift_message
  )
  VALUES (
    p_package_id, v_user, p_participant_type, v_child,
    'pending', v_price, v_instr, v_gift
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END
$function$;

-- الصلاحيات من أول الأول (قاعدة §3): Supabase بيمنح `anon` تنفيذ أي
-- دالة **جديدة** تلقائيًا، وتغيير التوقيع بيخلّيها جديدة في نظره.
-- ⚠️ ملف 82 كان شايل التنفيذ من الزائر على الدالة دي — السطرين دول
--    بيحافظوا على القفل بعد تغيير التوقيع.
REVOKE ALL ON FUNCTION
  public.create_course_booking(text, text, text, text, text)
  FROM public, anon;
GRANT EXECUTE ON FUNCTION
  public.create_course_booking(text, text, text, text, text)
  TO authenticated;


-- ── ٣) المحفّز: الإهداء بيتقفل بعد الإنشاء ──────────────────

CREATE OR REPLACE FUNCTION public.guard_course_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.user_id                 := OLD.user_id;
  NEW.package_id              := OLD.package_id;
  NEW.child_id                := OLD.child_id;
  NEW.participant_type        := OLD.participant_type;
  NEW.started_at              := OLD.started_at;
  -- الفلوس والمدرب المعتمد: العميل ما بيلمسهمش.
  NEW.amount                  := OLD.amount;
  NEW.preferred_instructor_id := OLD.preferred_instructor_id;
  -- الإهداء بيتكتب مرة واحدة مع الحجز — جزء من المنفَّذ زي المبلغ.
  NEW.gift_message            := OLD.gift_message;

  -- الانتقال الوحيد المسموح للعميل: «حوّلت» + رقم التحويل معاه.
  IF OLD.status = 'pending' AND NEW.status = 'awaiting_verification' THEN
    NEW.transaction_reference := NEW.transaction_reference;
  ELSE
    NEW.status                := OLD.status;
    NEW.transaction_reference := OLD.transaction_reference;
  END IF;

  RETURN NEW;
END
$function$;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) العمود
  SELECT
    '1. العمود'::text AS القسم,
    'gift_message'::text AS البند,
    COALESCE((SELECT data_type FROM information_schema.columns
               WHERE table_schema = 'public'
                 AND table_name = 'course_subscriptions'
                 AND column_name = 'gift_message'), '(مش موجود)')::text AS التفاصيل,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'course_subscriptions'
         AND column_name = 'gift_message'
    ) THEN '✓ اتضاف' ELSE '✗ ناقص' END AS الحالة

  UNION ALL

  -- ٢) الدالة بقت بخمس باراميترات وبتكتب الإهداء
  SELECT
    '2. الدالة',
    'create_course_booking',
    'عدد الباراميترات: ' || p.pronargs::text
      || '  ·  بتكتب gift_message: '
      || CASE WHEN pg_get_functiondef(p.oid) LIKE '%gift_message%' THEN 'نعم' ELSE 'لأ' END,
    CASE
      WHEN p.pronargs = 5 AND pg_get_functiondef(p.oid) LIKE '%gift_message%'
        THEN '✓ اتحدّثت'
      ELSE '✗ راجع'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'create_course_booking'

  UNION ALL

  -- ٣) الصلاحيات — الزائر لازم يفضل ممنوعًا بعد تغيير التوقيع
  SELECT
    '3. الصلاحيات',
    'create_course_booking',
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
  WHERE n.nspname = 'public' AND p.proname = 'create_course_booking'

  UNION ALL

  -- ٤) المحفّز بيجمّد الإهداء
  SELECT
    '4. المحفّز',
    'guard_course_subscription_fields',
    'بيجمّد gift_message: '
      || CASE WHEN pg_get_functiondef(p.oid) LIKE '%NEW.gift_message%'
              THEN 'نعم' ELSE 'لأ' END
      || '  ·  مركّب على الجدول: '
      || CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger t
            WHERE t.tgrelid = 'public.course_subscriptions'::regclass
              AND NOT t.tgisinternal
              AND t.tgfoid = p.oid
         ) THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN pg_get_functiondef(p.oid) LIKE '%NEW.gift_message%'
         THEN '✓ سليم' ELSE '✗ راجع' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'guard_course_subscription_fields'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ متشغّلوش بعد ما الكود الجديد يتنشر — الشاشة بتبعت خمس
--    باراميترات، والرجوع لأربعة بيوقّع كل حجز جديد.
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS
--   public.create_course_booking(text, text, text, text, text);
-- -- وبعدين رجّع نسخة الأربع باراميترات من ملف 46.
-- -- العمود ممكن يفضل: وجوده فاضيًا مبيأذيش.
-- -- ALTER TABLE public.course_subscriptions DROP COLUMN gift_message;
-- COMMIT;
-- ============================================================
