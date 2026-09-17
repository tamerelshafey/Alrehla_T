-- ============================================================
-- 47 — قفل إنشاء الحجوزات من المتصفح مباشرة
-- ============================================================
--
-- ⛔ ما تشغّلش الملف ده غير بعد ما تتأكد إن الحجز شغّال بالكود الجديد.
--    الترتيب: ملف 46 → رفع الكود → حجز تجريبي ناجح → الملف ده.
--
-- المشكلة:
--   سياسة `course_subscriptions` الحالية FOR ALL: يعني العميل يقدر
--   **يكتب** صف اشتراك بنفسه. وطول ما ده مفتوح، دالة الحجز الجديدة
--   (اللي بتحسب المبلغ من سعر الباقة) مجرد طريق مهذّب — واللي عايز
--   يتخطاها بيكتب في الجدول على طول بمبلغ من عنده.
--
--   ومعاها الحذف: العميل كان يقدر يمسح اشتراكه، ومعاه أثر الدفع.
--
-- بعد الملف ده:
--   • الإنشاء: عن طريق الدالة بس.
--   • القراءة والتعديل: صاحب الاشتراك (والمحفّز بيحدد إيه اللي يتعدّل).
--   • الحذف: الإدارة بس.
--
-- التراجع في آخر الملف.
-- ============================================================

BEGIN;

DROP POLICY IF EXISTS "Users manage their own subscriptions" ON public.course_subscriptions;

CREATE POLICY "Admins manage subscriptions"
  ON public.course_subscriptions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users read their own subscriptions"
  ON public.course_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update their own subscriptions"
  ON public.course_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.polname AS السياسة,
  CASE p.polcmd WHEN 'r' THEN 'قراءة' WHEN 'a' THEN 'إضافة'
                WHEN 'w' THEN 'تعديل' WHEN 'd' THEN 'حذف'
                ELSE 'الكل' END AS العملية
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'course_subscriptions'
ORDER BY p.polname;

-- ============================================================
-- للتراجع فقط — شيل التعليق وشغّل
-- ============================================================
-- DROP POLICY IF EXISTS "Users read their own subscriptions"   ON public.course_subscriptions;
-- DROP POLICY IF EXISTS "Users update their own subscriptions" ON public.course_subscriptions;
-- CREATE POLICY "Users manage their own subscriptions" ON public.course_subscriptions
--   FOR ALL USING ((auth.uid() = user_id) OR public.is_admin())
--   WITH CHECK ((auth.uid() = user_id) OR public.is_admin());
