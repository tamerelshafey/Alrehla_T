-- قراءة فقط — مفيش أي تغيير في القاعدة.
-- استعلام واحد، شغّل الملف كله وابعت النتيجة.
--
-- ============================================================
-- 39 — سياسات الجداول اللي ما ظهرتش في ملف 38
-- ============================================================
-- ملف 38 غطّى الجداول اللي توقّعت إنها الحساسة، وسابع 18 جدول من غير
-- فحص — ومنهم جداول فيها كلام خاص فعلًا: مرفقات الجلسات، رسائل الدعم،
-- تقارير الجلسات، طلبات السحب، بيانات تعويض المدربين.
--
-- اللي بندوّر عليه: جدول عنده سياسة واحدة بس. السياسة الواحدة ممكن
-- تكون «الكل بشرط سليم» وتبقى تمام، وممكن تكون قراءة مفتوحة من غير أي
-- شرط على الكتابة — والفرق بينهم مش باين من العدد.
-- ============================================================

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
    -- جداول فيها بيانات خاصة بالمستخدم
    'course_subscriptions', 'box_subscriptions',
    'session_attachments', 'session_messages', 'session_reports',
    'support_ticket_messages', 'notifications',
    -- جداول فيها فلوس أو بيانات تعويض
    'withdrawal_requests', 'instructor_compensation_profiles',
    'portfolio_documents',
    -- جداول إدارية
    'audit_logs', 'user_emails', 'join_requests', 'profile_update_requests',
    -- جداول المدربين الباقية
    'instructor_certifications', 'instructor_weekly_slots',
    'instructor_services', 'reviews'
  )
ORDER BY c.relname, p.polcmd;
