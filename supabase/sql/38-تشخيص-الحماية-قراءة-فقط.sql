-- ============================================================
-- 38 — تشخيص الحماية (قراءة فقط — ما بيغيّرش أي حاجة)
-- ============================================================
--
-- ليه الملف ده:
--   ملفات الترحيل في المشروع قديمة، والقاعدة الحقيقية اتغيّرت بعدها
--   كتير. فأي كلام عن «الجدول ده محمي ولا لأ» مبني على الملفات دي
--   كلام على معلومة قديمة. الملف ده بيقرا الحقيقة من القاعدة نفسها.
--
-- مفيش BEGIN ولا COMMIT ولا أي كتابة. كله SELECT.
--
-- شغّل كل استعلام لوحده وابعتلي النتيجة (صورة أو نسخ).
-- ============================================================


-- ============================================================
-- 1 — حالة الحماية (RLS) لكل جدول + عدد السياسات
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


-- ============================================================
-- 2 — السياسات المفتوحة على الآخر (أخطر استعلام في الملف)
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


-- ============================================================
-- 3 — سياسات الجداول الحساسة بالتفصيل
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


-- ============================================================
-- 4 — محفّزات حماية الأعمدة
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


-- ============================================================
-- 5 — الدور: مين يقدر يغيّره؟
-- ============================================================
-- السؤال المباشر: هل فيه حاجة بتمنع المستخدم العادي إنه يحط لنفسه
-- دور «مدير نظام»؟ لو النتيجة فاضية، يبقى مفيش محفّز بيحمي العمود،
-- والحماية الوحيدة هي شرط سياسة التعديل (استعلام 3، صف user_profiles).
SELECT
  t.tgname  AS المحفّز,
  p.proname AS الدالة,
  pg_get_functiondef(p.oid) AS نص_الدالة
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relname = 'user_profiles' AND NOT t.tgisinternal;


-- ============================================================
-- 6 — مخازن الملفات
-- ============================================================
-- مخزن «عام» معناه إن أي حد معاه الرابط يفتح الملف من غير تسجيل دخول.
-- ده صح لصور المنتجات، وغلط لمرفقات الجلسات أو مستندات الناشرين.
SELECT
  id AS المخزن,
  CASE WHEN public THEN 'عام — أي حد معاه الرابط ✗' ELSE 'خاص ✓' END AS النوع,
  file_size_limit AS أقصى_حجم,
  created_at AS أُنشئ
FROM storage.buckets
ORDER BY public DESC, id;
