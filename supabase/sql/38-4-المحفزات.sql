-- قراءة فقط — مفيش أي تغيير في القاعدة.
-- شغّل الملف ده لوحده وابعت النتيجة.

-- ============================================================
-- 4 — محفّزات حماية الأعمدة
-- ============================================================
-- ============================================================
-- السياسات بتحمي الصفوف، مش الأعمدة. يعني «المستخدم يعدّل صفه» ممكن
-- تشمل عمود الدور نفسه. اللي بيمنع ده محفّز. الاستعلام ده بيقول
-- أنهي جداول عندها محفّز من النوع ده.
SELECT
  c.relname  AS الجدول,
  t.tgname   AS المحفّز,
  p.proname  AS الدالة,
  CASE WHEN t.tgenabled = 'D' THEN 'موقوف ✗' ELSE 'شغّال ✓' END AS الحالة
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'public' AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
