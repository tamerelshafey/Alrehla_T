-- ============================================================
-- 35 — صلاحيات مقدّم الخدمة على الطلبات والمحادثة
-- ============================================================
--
-- المشكلة (من تشخيص ملف 34):
--   الصلاحيات الحالية بتعرّف «الطرف التاني في الطلب» على إنه **مدرب**:
--
--       EXISTS (SELECT 1 FROM instructors i
--               WHERE i.id = service_orders.instructor_id
--                 AND i.user_id = auth.uid())
--
--   فمقدّم الخدمة المستقل:
--     • مش هيشوف طلباته (لوحته هترجّع صفر).
--     • مش هيقدر يحدّث حالة الطلب («سلّمت»).
--     • مش هيقرا ولا يكتب في محادثة الطلب.
--
--   ودي مش مشكلة في الشاشات — الصلاحية هي الحارس، والشاشة بتعرض اللي
--   الحارس يسمح بيه.
--
-- الحل — إضافة مش استبدال:
--   أربع صلاحيات جديدة باسم مقدّم الخدمة، جنب الموجود.
--
--   ليه ما استبدلتش الموجود؟ محادثة الطلب بتمرّ على دالة اسمها
--   `can_access_service_order()`، وكان ممكن أوسّعها وأخلص بتعديل واحد.
--   لكني ما قريتش جواها إيه، واستبدال دالة صلاحيات من غير قراءتها ممكن
--   يشيل شرطًا موجودًا من غير ما ينتبه له حد. فسبتها زي ما هي.
--
--   الصلاحيات المسموحة بتتجمع بـOR: الإضافة بتفتح لمقدّم الخدمة، وما
--   بتقفلش على المشتري ولا المدرب ولا الإدارة.
--
-- التداخل مع المدرب:
--   المدرب ليه صف مقدّم خدمة كمان، فهيتغطّى بالقاعدتين. ده مش خطر ولا
--   بيغيّر سلوك — الفرق إن عنده طريقين للوصول بدل واحد. تنظيف القواعد
--   القديمة يستاهل ملف منفصل بعد ما النظام الجديد يثبت، مش دلوقتي.
--
-- حدود التعديل:
--   قاعدة UPDATE بتقول **مين** يقدر يعدّل الصف، مش **أي أعمدة**. الأعمدة
--   بيحرسها المحفّز `guard_service_order_fields` اللي اتحدّث في ملف 30 —
--   فمقدّم الخدمة يقدر يقول «سلّمت» وبس، ومش هيقدر يلمس المبلغ ولا
--   المهلة ولا مقدّم الخدمة نفسه.
-- ============================================================

BEGIN;

-- ── طلبات الخدمات ───────────────────────────────────────────

DROP POLICY IF EXISTS "Assigned provider views their service orders" ON public.service_orders;
CREATE POLICY "Assigned provider views their service orders"
  ON public.service_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM service_providers sp
      LEFT JOIN instructors i ON i.id = sp.instructor_id
      WHERE sp.id = service_orders.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Assigned provider updates their service orders" ON public.service_orders;
CREATE POLICY "Assigned provider updates their service orders"
  ON public.service_orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM service_providers sp
      LEFT JOIN instructors i ON i.id = sp.instructor_id
      WHERE sp.id = service_orders.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM service_providers sp
      LEFT JOIN instructors i ON i.id = sp.instructor_id
      WHERE sp.id = service_orders.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );


-- ── محادثة الطلب ────────────────────────────────────────────

DROP POLICY IF EXISTS "Assigned provider reads order messages" ON public.service_order_messages;
CREATE POLICY "Assigned provider reads order messages"
  ON public.service_order_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM service_orders o
      JOIN service_providers sp ON sp.id = o.provider_id
      LEFT JOIN instructors i ON i.id = sp.instructor_id
      WHERE o.id = service_order_messages.order_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

-- الكتابة مشروطة إن المُرسِل هو نفسه صاحب الحساب — نفس شرط القاعدة
-- الموجودة. من غيره حد يقدر يكتب رسالة باسم غيره.
DROP POLICY IF EXISTS "Assigned provider writes order messages" ON public.service_order_messages;
CREATE POLICY "Assigned provider writes order messages"
  ON public.service_order_messages
  FOR INSERT
  WITH CHECK (
    sender_profile_id = (auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM service_orders o
      JOIN service_providers sp ON sp.id = o.provider_id
      LEFT JOIN instructors i ON i.id = sp.instructor_id
      WHERE o.id = service_order_messages.order_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.tablename  AS الجدول,
  p.cmd        AS العملية,
  p.policyname AS القاعدة,
  CASE WHEN p.qual LIKE '%service_providers%' OR p.with_check LIKE '%service_providers%'
       THEN 'تعرف مقدّم الخدمة ✓' ELSE 'المدرب/المشتري فقط' END AS النتيجة
FROM pg_policies p
WHERE p.schemaname = 'public'
  AND p.tablename IN ('service_orders', 'service_order_messages')
ORDER BY p.tablename, p.cmd, p.policyname;
