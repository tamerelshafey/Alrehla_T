-- ============================================================
-- 57 — صلاحيات حقيقية + إشعارات جماعية + قفل ترقية الأدوار
-- ============================================================
--
-- ---------- (١) الصلاحيات: الوضع الحالي ----------
--
--   سألت: «هل عندنا إدارة للصلاحيات؟» — الإجابة الصريحة: لأ.
--
--   الصلاحيات دلوقتي **مكتوبة في الكود** مش في القاعدة:
--     • مدير النظام  → الإحدى عشر صلاحية كلها.
--     • المشرف العام → نفسهم ما عدا المالية والسجلات.
--   يعني مفيش طريقة تدّي مشرف صلاحية زيادة أو تشيل منه واحدة، غير
--   بتعديل الكود ورفعه من جديد.
--
--   الحل: عمود `permissions` على جدول المستخدمين.
--     • فاضي (NULL) = «زي الافتراضي بتاع دوره» — وده وضع كل الحسابات
--       الموجودة دلوقتي، فمفيش أي حاجة بتتغيّر عند أي حد بعد التشغيل.
--     • متملّي = دي صلاحياته بالظبط، والافتراضي بيتلغى.
--
-- ---------- (٢) ثغرة لقيتها وإنا بعمل ده ----------
--
--   جدول المستخدمين **مفيش عليه أي حارس أعمدة**. يعني لو فيه سياسة
--   «كل واحد يعدّل ملفه» — وهي موجودة — فأي مستخدم مسجّل يقدر نظريًا
--   يبعت تعديل على صفّه يحط فيه `role = 'super_admin'` ويبقى مدير
--   للمنصة. RLS بتحمي **الصفوف** مش **الأعمدة**، وده نفس النوع اللي
--   عالجناه قبل كده في المدربين والناشرين.
--
--   الحارس اللي تحت بيجمّد `role` و`permissions` على أي تعديل جاي من
--   مستخدم عادي. الإدارة والسيرفر بيعدّوا زي ما هما.
--
--   ⚠️ لو ده اشتغل غلط، أي حد هيبقى مش قادر يغيّر اسمه. جرّب بعد
--   التشغيل: ادخل بحساب عميل وغيّر الاسم في «حسابي» — المفروض يتحفظ.
--
-- ---------- (٣) الإشعارات الجماعية ----------
--
--   `notify_user` بتبعت لواحد، و`notify_admins` (ملف ٥٢) بتبعت للإدارة.
--   مفيش حاجة تبعت لكل المدربين أو لكل المستخدمين — وده اللي شاشة
--   «إرسال إشعار» محتاجاه. `notify_broadcast` بتعمل ده، وبتتأكد إن
--   اللي بينادي عليها إداري قبل أي حاجة.
--
-- ---------- (٤) الإدارة تقرا سجل الإشعارات ----------
--
--   سياسة القراءة الحالية بتدّي كل واحد إشعاراته هو بس — فشاشة «سجل
--   الإشعارات» كانت هتطلع فاضية حتى للإدارة. سياسة زيادة للإداريين.
--
-- مفيش أي صف بيتمسح ولا يتغيّر في الملف ده.
-- ============================================================

BEGIN;

-- ---------- (١) عمود الصلاحيات ----------

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS permissions text[];

COMMENT ON COLUMN public.user_profiles.permissions IS
  'صلاحيات الإدارة. NULL = الافتراضي بتاع الدور. مصفوفة = دي صلاحياته بالظبط.';

-- ---------- (٢) حارس الأعمدة ----------

CREATE OR REPLACE FUNCTION public.guard_user_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- auth.uid() فاضي = التعديل جاي من السيرفر (service role)، مش من متصفح.
  -- والمستخدم المجهول متمنوع أصلًا بالـ RLS قبل ما يوصل هنا.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.role        := OLD.role;
  NEW.permissions := OLD.permissions;
  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS guard_user_profile_fields_trg ON public.user_profiles;
CREATE TRIGGER guard_user_profile_fields_trg
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_profile_fields();

-- ---------- (٣) إشعار جماعي ----------

CREATE OR REPLACE FUNCTION public.notify_broadcast(
  p_title   text,
  p_message text DEFAULT NULL,
  p_link    text DEFAULT NULL,
  p_role    text DEFAULT NULL   -- NULL = كل المستخدمين
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer := 0;
BEGIN
  -- الإدارة بس. الدالة دي بتوصل لكل حساب في المنصة، فالبوابة ضيقة عن قصد.
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admins only';
  END IF;

  IF length(trim(coalesce(p_title, ''))) = 0 THEN
    RAISE EXCEPTION 'notification needs a title';
  END IF;

  INSERT INTO notifications (recipient_profile_id, title, message, link)
  SELECT
    u.id::text,
    trim(p_title),
    NULLIF(trim(coalesce(p_message, '')), ''),
    p_link
  FROM user_profiles u
  WHERE p_role IS NULL OR u.role::text = p_role;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END
$function$;

REVOKE ALL ON FUNCTION public.notify_broadcast(text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.notify_broadcast(text, text, text, text) TO authenticated;

-- ---------- (٤) الإدارة تقرا كل الإشعارات ----------

DROP POLICY IF EXISTS "Admins can read all notifications" ON public.notifications;
CREATE POLICY "Admins can read all notifications"
  ON public.notifications
  FOR SELECT
  USING (public.is_admin());

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  'عمود الصلاحيات' AS البند,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
      AND column_name = 'permissions'
  ) THEN 'موجود ✓' ELSE 'ناقص ✗' END AS الحالة
UNION ALL
SELECT 'حارس الأدوار',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'guard_user_profile_fields_trg' AND NOT tgisinternal
  ) THEN 'شغّال ✓' ELSE 'ناقص ✗' END
UNION ALL
SELECT 'دالة الإشعار الجماعي',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'notify_broadcast'
  ) THEN 'موجودة ✓' ELSE 'ناقصة ✗' END
UNION ALL
SELECT 'قراءة الإدارة للإشعارات',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
    WHERE c.relname = 'notifications' AND p.polname = 'Admins can read all notifications'
  ) THEN 'مضبوطة ✓' ELSE 'ناقصة ✗' END;

-- ============================================================
-- للتراجع فقط — شيل التعليق وشغّل
-- ============================================================
-- DROP TRIGGER IF EXISTS guard_user_profile_fields_trg ON public.user_profiles;
-- DROP POLICY IF EXISTS "Admins can read all notifications" ON public.notifications;
-- DROP FUNCTION IF EXISTS public.notify_broadcast(text, text, text, text);
-- ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS permissions;
