-- قراءة فقط — مفيش أي تغيير في القاعدة.
-- شغّل الملف ده لوحده وابعت النتيجة.

-- ============================================================
-- 2 — السياسات المفتوحة على الآخر (أخطر استعلام في الملف)
-- ============================================================
-- ============================================================
-- أي سياسة شرطها «true» يعني مفيش شرط أصلًا. دي مقبولة في القراءة
-- لمحتوى عام (المدربين مثلًا)، ومصيبة في الكتابة أو في جدول خاص.
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
  AND (
    pg_get_expr(p.polqual, p.polrelid) = 'true'
    OR pg_get_expr(p.polwithcheck, p.polrelid) = 'true'
  )
ORDER BY
  CASE WHEN p.polcmd = 'r' THEN 2 ELSE 1 END,  -- الكتابة الأول
  c.relname;
