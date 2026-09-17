-- قراءة فقط — مفيش أي تغيير في القاعدة.
-- شغّل الملف ده لوحده وابعت النتيجة.

-- ============================================================
-- 3 — سياسات الجداول الحساسة بالتفصيل
-- ============================================================
-- ============================================================
-- الجداول اللي لو فيها ثغرة تبقى مؤثرة: الهوية، الفلوس، الطلبات،
-- الحجوزات، المدربين، مقدّمي الخدمة.
SELECT
  c.relname AS الجدول,
  p.polname AS السياسة,
  CASE p.polcmd WHEN 'r' THEN 'قراءة' WHEN 'a' THEN 'إضافة'
                WHEN 'w' THEN 'تعديل' WHEN 'd' THEN 'حذف'
                ELSE 'الكل' END AS العملية,
  coalesce(pg_get_expr(p.polqual, p.polrelid), '—')      AS شرط_الوصول,
  coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '—') AS شرط_الكتابة
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'user_profiles', 'instructors', 'bookings', 'sessions',
    'orders', 'order_items', 'service_orders', 'service_order_messages',
    'service_providers', 'provider_services',
    'publishers', 'publisher_payouts', 'instructor_payouts', 'withdrawals',
    'child_profiles', 'subscriptions', 'user_subscriptions'
  )
ORDER BY c.relname, p.polcmd;
