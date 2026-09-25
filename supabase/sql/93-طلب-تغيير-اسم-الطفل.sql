-- ============================================================
-- 93 — طلب تغيير اسم الطفل
-- ============================================================
--
-- ── العطل ───────────────────────────────────────────────────
--
-- الطفل عدّل اسمه من لوحته («يوسف محمد» ← «يوسف بك محمد»)،
-- **والتعديل اتحفظ فعلًا** — بس في مكان محدّش بيقرا منه.
--
-- السبب إن في **اسمين** لنفس الطفل:
--
--   `user_profiles.full_name`   ← الطالب بيعدّله من لوحته
--   `child_profiles.full_name`  ← ولي الأمر بيعدّله من المركز العائلي
--
-- ودوال القاعدة مكتوبة `COALESCE(ch.full_name, up.full_name, …)` —
-- يعني **اسم المركز العائلي بيكسب دايمًا** طول ما الطفل مربوط بصف
-- عائلة. فاسم الطالب الجديد مبيوصلش لولي الأمر ولا للمدرب ولا للطلبات
-- ولا للكتاب اللي هيتطبع.
--
-- ⚠️ ودي نفس فئة الأعطال اللي بنقفلها: **عملية بتنجح وبتبان ناجحة
--    ومفيش حد بيشوف نتيجتها.**
--
-- ── القرار ──────────────────────────────────────────────────
--
-- الاسم ملك ولي الأمر، **والطالب يقترح**. نفس نمط طلبات الباقات
-- والخدمات الموجود: الطفل يطلب، وولي الأمر يوافق أو يرفض بسبب،
-- والحالة بترجع للطفل.
--
-- ── اللي بيتغيّر ────────────────────────────────────────────
--
--   ١. عمود `requested_name` على `dependent_requests`
--   ٢. القيد بتاع `kind` يقبل `name_change`
--   ٣. قيد الهدف يعرف الشكل الجديد
--   ٤. دالة بتطبّق التغيير على الاسمين مع بعض
--
-- ⚠️ **السياسات ما اتغيّرتش.** سياسة الإدراج شرطها
--    `can_see_dependent_request(child_profile_id)` — مالهاش علاقة
--    بنوع الطلب، فالطفل يقدر يسجّل الطلب الجديد من غير أي توسيع.
--
-- ⚠️ **وليه دالة للتطبيق؟** ولي الأمر يقدر يعدّل `child_profiles`
--    (الصف بتاعه)، لكنه **ممنوع** من `user_profiles` بتاع الطفل. ومن
--    غير تحديث الاتنين، الطالب هيفضل شايف اسمه القديم في لوحته بعد
--    الموافقة. الدالة بتعمل الاتنين في عملية واحدة.
-- ============================================================

BEGIN;

-- ── ١) العمود ───────────────────────────────────────────────

ALTER TABLE public.dependent_requests
  ADD COLUMN IF NOT EXISTS requested_name text;

COMMENT ON COLUMN public.dependent_requests.requested_name IS
  'الاسم اللي الطفل طلبه. لطلبات kind = name_change وبس (ملف 93).';


-- ── ٢+٣) القيود ────────────────────────────────────────────
--
-- ⚠️ القيود بتتشال وتترجع — مفيش `ALTER CONSTRAINT` لتعديل شرط
--    `CHECK` في Postgres.

ALTER TABLE public.dependent_requests
  DROP CONSTRAINT IF EXISTS dependent_requests_kind_check;

ALTER TABLE public.dependent_requests
  ADD CONSTRAINT dependent_requests_kind_check
  CHECK (kind IN ('service', 'package', 'name_change'));

ALTER TABLE public.dependent_requests
  DROP CONSTRAINT IF EXISTS dependent_requests_target_check;

-- الشكل الصح لكل نوع. ده بيمنع صف نصّه مظبوط ونصّه لأ — زي طلب
-- تغيير اسم بلا اسم مطلوب.
ALTER TABLE public.dependent_requests
  ADD CONSTRAINT dependent_requests_target_check
  CHECK (
    (kind = 'service'
      AND service_id IS NOT NULL AND package_id IS NULL AND requested_name IS NULL)
    OR
    (kind = 'package'
      AND package_id IS NOT NULL AND service_id IS NULL AND requested_name IS NULL)
    OR
    (kind = 'name_change'
      AND requested_name IS NOT NULL AND btrim(requested_name) <> ''
      AND service_id IS NULL AND package_id IS NULL)
  );


-- ── ٤) تطبيق التغيير ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.apply_dependent_name_change(p_request_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user    uuid := auth.uid();
  v_req     record;
  v_account text;
  v_name    text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'لازم تسجّل الدخول';
  END IF;

  SELECT r.id, r.child_profile_id, r.guardian_profile_id, r.kind,
         r.status, r.requested_name
    INTO v_req
    FROM dependent_requests r
   WHERE r.id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب مش موجود';
  END IF;

  -- ولي الأمر صاحب الطلب وحده — ولا حتى الإدارة، ده قرار عائلي.
  IF v_req.guardian_profile_id <> v_user THEN
    RAISE EXCEPTION 'الطلب ده مش على حسابك';
  END IF;

  IF v_req.kind <> 'name_change' THEN
    RAISE EXCEPTION 'الطلب ده مش طلب تغيير اسم';
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'الطلب ده اتبتّ فيه خلاص';
  END IF;

  v_name := btrim(v_req.requested_name);
  IF v_name = '' OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'الاسم المطلوب مش صالح';
  END IF;

  -- ① اسم المركز العائلي — ده اللي بيتطبع وبيشوفه المدرب.
  UPDATE child_profiles
     SET full_name = v_name
   WHERE id = v_req.child_profile_id
     AND user_profile_id = v_user
  RETURNING account_profile_id INTO v_account;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ملف الطفل مش على حسابك';
  END IF;

  -- ② اسم حساب الطالب — عشان يشوف نفس الاسم في لوحته.
  --    ⚠️ ده اللي محتاج `SECURITY DEFINER`: ولي الأمر ممنوع من
  --       `user_profiles` بتاع غيره.
  IF NULLIF(btrim(coalesce(v_account, '')), '') IS NOT NULL THEN
    UPDATE user_profiles
       SET full_name = v_name
     WHERE id::text = v_account;
  END IF;

  -- ③ الطلب نفسه.
  UPDATE dependent_requests
     SET status = 'approved', decided_at = now()
   WHERE id = p_request_id
     AND status = 'pending';

  RETURN jsonb_build_object('ok', true, 'name', v_name);
END
$function$;

COMMENT ON FUNCTION public.apply_dependent_name_change(text) IS
  'ولي الأمر بيوافق على تغيير اسم ابنه: بتحدّث اسم المركز العائلي واسم حساب الطالب والطلب، في عملية واحدة (ملف 93).';

REVOKE ALL ON FUNCTION public.apply_dependent_name_change(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.apply_dependent_name_change(text) TO authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) العمود
  SELECT
    '1. العمود'::text AS القسم,
    'requested_name'::text AS البند,
    COALESCE((SELECT data_type FROM information_schema.columns
               WHERE table_schema='public' AND table_name='dependent_requests'
                 AND column_name='requested_name'), '(مش موجود)')::text AS التفاصيل,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema='public' AND table_name='dependent_requests'
                         AND column_name='requested_name')
         THEN '✓ اتضاف' ELSE '✗ ناقص' END AS الحالة

  UNION ALL

  -- ٢) القيود بقت تعرف النوع الجديد
  SELECT
    '2. القيود',
    c.conname::text,
    pg_get_constraintdef(c.oid)::text,
    CASE
      WHEN c.conname = 'dependent_requests_kind_check'
       AND pg_get_constraintdef(c.oid) LIKE '%name_change%' THEN '✓ بيقبل النوع'
      WHEN c.conname = 'dependent_requests_target_check'
       AND pg_get_constraintdef(c.oid) LIKE '%requested_name%' THEN '✓ بيفحص الاسم'
      ELSE '— للمراجعة'
    END
  FROM pg_constraint c
  WHERE c.conrelid = 'public.dependent_requests'::regclass
    AND c.contype = 'c'

  UNION ALL

  -- ٣) الدالة
  SELECT
    '3. الدالة',
    p.proname::text,
    ((CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)
      || '  ·  search_path: '
      || COALESCE(array_to_string(p.proconfig, ', '), '(غير مضبوط)')
      || '  ·  نسخ: ' || count(*) OVER (PARTITION BY p.proname)::text)::text,
    CASE WHEN p.prosecdef AND p.proconfig IS NOT NULL
         THEN '✓ سليمة' ELSE '✗ راجع' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public' AND p.proname='apply_dependent_name_change'

  UNION ALL

  -- ٤) الصلاحيات
  SELECT
    '4. الصلاحيات',
    'apply_dependent_name_change',
    'anon: ' || CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'نعم' ELSE 'لأ' END
      || '  ·  authenticated: ' || CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN NOT has_function_privilege('anon', p.oid, 'EXECUTE')
          AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
         THEN '✓ الزائر ممنوع' ELSE '✗ راجع' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public' AND p.proname='apply_dependent_name_change'

  UNION ALL

  -- ٥) السياسات زي ما هي — الطفل بيسجّل طلبه بلا توسيع
  SELECT
    '5. السياسات',
    p.policyname::text,
    (p.cmd || '  ·  ' || COALESCE(p.qual, p.with_check, '—'))::text,
    '✓ زي ما هي'
  FROM pg_policies p
  WHERE p.schemaname='public' AND p.tablename='dependent_requests'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ لو في طلبات `name_change` مسجّلة، رجوع القيد القديم هيفشل.
--    امسحها الأول أو سيب القيد واسع.
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.apply_dependent_name_change(text);
-- -- DELETE FROM public.dependent_requests WHERE kind = 'name_change';
-- -- وبعدين رجّع القيدين لنسخة ملف 74.
-- COMMIT;
-- ============================================================
