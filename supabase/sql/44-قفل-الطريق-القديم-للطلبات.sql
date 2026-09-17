-- ============================================================
-- 44 — قفل إنشاء الطلبات من المتصفح مباشرة
-- ============================================================
--
-- ⛔ ما تشغّلش الملف ده غير بعد ما تتأكد إن الشراء شغّال بالكود الجديد.
--
-- الترتيب الصح:
--   1) ملف 43 (الدالة)            ← اتعمل
--   2) رفع الكود الجديد ونجاح النشر
--   3) اشترِ طلب تجريبي واتأكد إنه اتسجّل بالمبلغ الصح
--   4) الملف ده
--
-- لو شغّلته قبل الخطوة 3، وكان لسه في الموقع كود قديم شغّال، الشراء
-- هيقف فورًا.
--
-- المشكلة اللي بيقفلها:
--   لسه فيه سياستين بتسمحوا للعميل يكتب في `orders` و`order_items`
--   مباشرة:
--       "Users can create their own orders"      WITH CHECK (auth.uid() = user_id)
--       "Users can create their own order items" WITH CHECK (الطلب بتاعه)
--   طول ما هما موجودين، دالة التسعير الجديدة مجرد **طريق مهذّب**: اللي
--   عايز يزوّر السعر بيتجاهلها ويكتب في الجدول على طول.
--
--   بعد الملف ده، الطريق الوحيد لإنشاء طلب هو الدالة — وهي بتحسب السعر
--   بنفسها. الإدارة سياستها منفصلة وما بتتأثرش.
--
-- التراجع (لو لقدر الله الشراء وقف):
--   شغّل الجزء المعلّق في آخر الملف عشان ترجّع السياستين، والموقع
--   هيرجع يشتغل بالطريقة القديمة لحد ما نراجع.
-- ============================================================

BEGIN;

DROP POLICY IF EXISTS "Users can create their own orders"      ON public.orders;
DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
    WHERE c.relname IN ('orders','order_items') AND p.polcmd = 'a'
      AND p.polname LIKE 'Users can create%'
  ) THEN 'الطريق القديم لسه مفتوح ✗' ELSE 'اتقفل ✓' END AS النتيجة,
  (SELECT count(*) FROM pg_proc pr JOIN pg_namespace n ON n.oid = pr.pronamespace
    WHERE n.nspname='public' AND pr.proname='create_customer_order') AS دالة_الطلب_موجودة;


-- ============================================================
-- للتراجع فقط — شيل التعليق وشغّل
-- ============================================================
-- CREATE POLICY "Users can create their own orders" ON public.orders
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can create their own order items" ON public.order_items
--   FOR INSERT WITH CHECK (
--     EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id
--                                    AND orders.user_id = auth.uid())
--   );
