-- ============================================================
-- 46 — حجز الكتابة الإبداعية: المبلغ ورقم التحويل والمدرب المختار
-- ============================================================
--
-- المشكلة:
--   مسار حجز الكتابة الإبداعية بيكتب صف في `course_subscriptions` بس،
--   والجدول ده **مفيهوش مبلغ ولا رقم تحويل**. النتيجة:
--     • الصفحة بتعرض للعميل رقم ثابت مكتوب في الكود (250 جنيه) مالوش
--       علاقة بسعر الباقة اللي اختارها.
--     • رقم التحويل اللي العميل بيكتبه **بيترمي** — فيه تعليق في الكود
--       بيقول كده صراحة.
--     • الإدارة بتضغط «تأكيد الدفع» وهي ما تعرفش المبلغ ولا المرجع.
--     • المدرب اللي العميل اختاره كان بيتسجّل عن طريق جلسة بتتعمل
--       تلقائيًا بتاريخ مخترع «بعد 3 أيام».
--
-- الحل:
--   1. تلات أعمدة في `course_subscriptions`: المبلغ، رقم التحويل،
--      والمدرب المختار.
--   2. دالة `create_course_booking` بتحسب المبلغ من سعر الباقة —
--      زي دالة الطلبات بالظبط، عشان المتصفح ما يبعتش أرقام.
--   3. تحديث محفّز الاشتراكات (من ملف 41) عشان يجمّد المبلغ والمدرب،
--      ويسمح للعميل يسيب رقم التحويل مرة واحدة وهو بيقول «حوّلت».
--
-- والجلسة الأولى **مش** هتتعمل تلقائيًا بتاريخ مخترع. الجدولة بتحصل
-- بعد تأكيد الدفع من شاشة الجلسات — تاريخ حقيقي بدل تاريخ مفبرك.
--
-- الأعمدة الجديدة بتتضاف فاضية، والصفوف القديمة بتفضل زي ما هي.
--
-- ⚠️ الترتيب: شغّل ده → ارفع الكود → اتأكد إن الحجز شغّال → وبعدها
--    ملف 47 اللي بيقفل الكتابة المباشرة.
-- ============================================================

BEGIN;

ALTER TABLE public.course_subscriptions
  ADD COLUMN IF NOT EXISTS amount                  numeric(10,2),
  ADD COLUMN IF NOT EXISTS transaction_reference   text,
  ADD COLUMN IF NOT EXISTS preferred_instructor_id text;

COMMENT ON COLUMN public.course_subscriptions.amount IS
  'سعر الباقة وقت الحجز — بيتحسب في القاعدة، والمتصفح ما بيبعتوش.';
COMMENT ON COLUMN public.course_subscriptions.transaction_reference IS
  'رقم تحويل العميل. كان بيترمي قبل كده.';
COMMENT ON COLUMN public.course_subscriptions.preferred_instructor_id IS
  'المدرب اللي العميل اختاره. الجدولة الفعلية بتحصل بعد تأكيد الدفع.';


-- ------------------------------------------------------------
-- دالة إنشاء الحجز
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_course_booking(
  p_package_id       text,
  p_instructor_id    text DEFAULT NULL,
  p_participant_type text DEFAULT 'self',
  p_child_id         text DEFAULT NULL
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

  INSERT INTO course_subscriptions (
    package_id, user_id, participant_type, child_id,
    status, amount, preferred_instructor_id
  )
  VALUES (
    p_package_id, v_user, p_participant_type, v_child,
    'pending', v_price, v_instr
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END
$function$;

REVOKE ALL ON FUNCTION public.create_course_booking(text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_course_booking(text, text, text, text) TO authenticated;


-- ------------------------------------------------------------
-- تحديث محفّز الاشتراكات: المبلغ مقفول، ورقم التحويل مرة واحدة
-- ------------------------------------------------------------
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
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
    WHERE table_name = 'course_subscriptions'
      AND column_name IN ('amount','transaction_reference','preferred_instructor_id'))
    AS الأعمدة_الجديدة_من_3,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = 'create_course_booking')
  THEN 'دالة الحجز موجودة ✓' ELSE 'مش موجودة ✗' END AS الدالة,
  CASE WHEN (SELECT pg_get_functiondef(p.oid) FROM pg_proc p
              JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname='public' AND p.proname='guard_course_subscription_fields')
       LIKE '%transaction_reference%'
  THEN 'المحفّز محدّث ✓' ELSE 'لسه القديم ✗' END AS المحفّز;
