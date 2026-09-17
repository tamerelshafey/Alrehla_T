-- ============================================================
-- 45 — نصوص الطلاب: كل مدرب يشوف طلابه هو بس
-- ============================================================
--
-- المشكلة:
--   سياسة `portfolio_documents` الحالية:
--       "Instructors can view and grade documents"
--       FOR ALL USING (is_instructor() OR is_admin())
--
--   يعني **أي** مدرب يقرا ويعدّل ويمسح نصوص **كل** الطلاب في المنصة،
--   مش طلابه. والنصوص دي شغل أطفال فيه أسماء وتفاصيل شخصية.
--
-- القرار (منك): كل مدرب لطلابه.
--
-- تعريف «طالبه» من البيانات الموجودة:
--   • طالب ليه جلسة مسندة للمدرب ده (`sessions`)، سواء الاشتراك باسمه
--     أو باسم ابنه.
--   • أو حجز مسند للمدرب ده (`bookings`).
--   مفيش جدول «ربط» بين مدرب وطالب، فالعلاقة بتتقرا من الجلسات — وده
--   نفس تعريف «طلابي» اللي المفروض الشاشة تستخدمه.
--
-- اللي بيتغيّر كمان:
--   المدرب كان يقدر **يمسح** نصوص الطلاب (لأن السياسة FOR ALL). بعد
--   الملف ده: يقرا ويصحّح بس. المسح للإدارة.
--
-- مفيش صف بيانات بيتعدّل.
--
-- تصحيح بعد أول تشغيل:
--   عمود `student_id` نوعه uuid، والدالة بتستقبل text — فبوستجرس رفض.
--   التحويل بقى مكتوب صراحة عند الاستخدام (student_id::text).
--   المعاملة كانت رجعت بالكامل، فمفيش حاجة اتعملت من التشغيل الأول.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- دالة العلاقة — مكتوبة مرة واحدة عشان تتقرا وتتصلّح في مكان واحد
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.instructor_teaches(p_student text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM sessions s
    JOIN instructors i           ON i.id  = s.instructor_id
    JOIN course_subscriptions cs ON cs.id = s.course_subscription_id
    LEFT JOIN child_profiles c   ON c.id  = cs.child_id
    WHERE i.user_id = auth.uid()
      AND (
        cs.user_id::text          = p_student
        OR c.user_profile_id::text = p_student
      )
  )
  OR EXISTS (
    SELECT 1
    FROM bookings b
    JOIN instructors i ON i.id = b.instructor_id
    WHERE i.user_id = auth.uid()
      AND b.independent_participant_id = p_student
  );
$function$;

REVOKE ALL ON FUNCTION public.instructor_teaches(text) FROM public;
GRANT EXECUTE ON FUNCTION public.instructor_teaches(text) TO authenticated;


-- ------------------------------------------------------------
-- استبدال السياسة الواسعة بتلاتة مضبوطة
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Instructors can view and grade documents" ON public.portfolio_documents;

-- الإدارة: كل حاجة، بما فيها المسح.
CREATE POLICY "Admins manage portfolio documents"
  ON public.portfolio_documents
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- المدرب: يقرا نصوص طلابه.
CREATE POLICY "Instructors read their own students documents"
  ON public.portfolio_documents
  FOR SELECT
  USING (public.instructor_teaches(student_id::text));

-- المدرب: يصحّح نصوص طلابه — ومش بيقدر ينقل النص لطالب تاني.
CREATE POLICY "Instructors grade their own students documents"
  ON public.portfolio_documents
  FOR UPDATE
  USING (public.instructor_teaches(student_id::text))
  WITH CHECK (public.instructor_teaches(student_id::text));

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.polname AS السياسة,
  CASE p.polcmd WHEN 'r' THEN 'قراءة' WHEN 'a' THEN 'إضافة'
                WHEN 'w' THEN 'تعديل' WHEN 'd' THEN 'حذف'
                ELSE 'الكل' END AS العملية,
  coalesce(pg_get_expr(p.polqual, p.polrelid), '—') AS شرط_الوصول
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'portfolio_documents'
ORDER BY p.polname;
