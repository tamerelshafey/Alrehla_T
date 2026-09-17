-- قراءة فقط — مفيش أي تغيير في القاعدة.
-- شغّل الملف ده لوحده وابعت النتيجة.

-- ============================================================
-- 1 — حالة الحماية (RLS) لكل جدول + عدد السياسات
-- ============================================================
-- ============================================================
-- المطلوب نشوفه: مفيش جدول حساس بحماية مقفولة، ومفيش جدول
-- حمايته شغّالة وهو من غير سياسة خالص (يعني مقفول على الكل).
SELECT
  c.relname                                   AS الجدول,
  CASE WHEN c.relrowsecurity THEN 'مفعّلة ✓' ELSE 'مقفولة ✗' END AS الحماية,
  count(p.polname)                            AS عدد_السياسات
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relrowsecurity ASC, count(p.polname) ASC, c.relname;
