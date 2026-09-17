-- ============================================================
-- 40 — قفل الأعمدة الإدارية في جدولي المدربين والناشرين
-- ============================================================
--
-- المشكلة (مؤكدة من تشخيص ملف 38):
--   سياسة الحماية على `instructors` بتقول:
--       "Instructors can update their own profile" … USING (auth.uid() = user_id)
--   يعني المدرب يقدر يعدّل **صفه بالكامل**. والسياسات بتحمي الصفوف مش
--   الأعمدة، ومفيش محفّز على الجدول ده (بعكس `user_profiles` و`orders`
--   و`service_orders` اللي ليهم محفّزات شغّالة).
--
--   النتيجة: مدرب يكلّم قاعدة البيانات مباشرة يقدر:
--     • يرفع `approved_price` — ودي **مستحقه من كل جلسة**، يعني فلوس.
--     • يحط `status = 'active'` — فيظهر في الموقع من غير اعتماد.
--     • يحط `training_passed = true` — فيعدّي شرط التدريب.
--     • يعدّل `weekly_schedule` اللي المفروض تعدّل بعد مراجعة.
--
--   نفس الحكاية في `publishers`: "Publishers can update their own profile"
--   بتسمح للناشر يحط `status` لنفسه — يعني يعتمد نفسه.
--
--   ملحوظة مهمة: الموقع نفسه مش بيعمل كده. تعديلات المدرب بتمر على
--   `profile_update_requests` وبتتراجع. المشكلة إن الحماية معتمدة على
--   إن الناس تستخدم الموقع — واللي معاه مفتاح القراءة العام (وهو موجود
--   في كود المتصفح بطبيعته) يقدر يكلّم القاعدة من غير الموقع.
--
-- الحل:
--   محفّز على كل جدول بيشتغل قبل أي تعديل، وبيرجّع الأعمدة الإدارية
--   لقيمتها القديمة لو اللي بيعدّل مش إداري. نفس طريقة المحفّز الموجود
--   على `user_profiles` بالظبط — مش أسلوب جديد.
--
--   الأعمدة اللي **بتفضل** مفتوحة للمدرب: الاسم المعروض، النبذة،
--   التخصصات، سنوات الخبرة، والجدول المقترح (`pending_schedule`) اللي
--   هو أصلًا وسيلة طلب التعديل.
--
-- إيه اللي بيتغيّر في البيانات: **ولا حاجة**. مفيش صف بيتعدّل ولا عمود
-- بيتضاف. المحفّز بيشتغل على التعديلات الجاية بس.
--
-- لو حصل خطأ في النص، المعاملة بترجع وما يتنفذش أي جزء.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- المدربون
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_instructor_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- auth.uid() بتبقى فاضية في حالتين: طلب مجهول (وده بترفضه الصلاحيات
  -- قبل ما يوصل هنا)، أو مفتاح الخدمة اللي الإدارة بتستخدمه. والإداري
  -- مسموح له صراحة. غير كده: الأعمدة الإدارية بترجع زي ما كانت.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.user_id                    := OLD.user_id;
  NEW.status                     := OLD.status;
  NEW.training_passed            := OLD.training_passed;
  NEW.approved_price             := OLD.approved_price;
  NEW.requested_price            := OLD.requested_price;
  NEW.selected_pricing_option_id := OLD.selected_pricing_option_id;
  NEW.weekly_schedule            := OLD.weekly_schedule;
  NEW.monthly_hours_committed    := OLD.monthly_hours_committed;
  NEW.is_sample                  := OLD.is_sample;

  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS guard_instructor_fields_trg ON public.instructors;
CREATE TRIGGER guard_instructor_fields_trg
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.guard_instructor_fields();


-- ------------------------------------------------------------
-- الناشرون
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_publisher_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.user_id   := OLD.user_id;
  NEW.status    := OLD.status;
  -- الرابط جزء من هوية الناشر العامة، وتغييره بيكسر روابط قايمة.
  NEW.slug      := OLD.slug;
  NEW.is_sample := OLD.is_sample;

  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS guard_publisher_fields_trg ON public.publishers;
CREATE TRIGGER guard_publisher_fields_trg
  BEFORE UPDATE ON public.publishers
  FOR EACH ROW EXECUTE FUNCTION public.guard_publisher_fields();

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  c.relname AS الجدول,
  t.tgname  AS المحفّز,
  CASE WHEN t.tgenabled = 'D' THEN 'موقوف ✗' ELSE 'شغّال ✓' END AS الحالة,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✓' ELSE 'غير آمن ✗' END AS النوع
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc  p ON p.oid = t.tgfoid
WHERE c.relname IN ('instructors', 'publishers')
  AND NOT t.tgisinternal
ORDER BY c.relname;
