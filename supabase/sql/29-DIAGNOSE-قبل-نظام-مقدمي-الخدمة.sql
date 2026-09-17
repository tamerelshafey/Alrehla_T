-- ============================================================
-- 29 — تشخيص قبل بناء نظام «مقدّمي الخدمة»
-- ============================================================
--
-- ملف قراءة فقط. ما بيغيّرش أي حاجة.
--
-- ليه محتاجه قبل ما أكتب سطر واحد:
--   الجداول عندك بتستخدم أنواع مختلفة للمعرّفات — لقيت في ملف الصلاحيات
--   إن `buyer_profile_id` نصّي (text) بينما `instructors.user_id` من نوع
--   uuid. الجدول الجديد لازم يربط بالجداول دي بالنوع الصح، وإلا الربط
--   يترفض أو — الأسوأ — يشتغل غلط.
--
--   دي نفس الغلطة اللي وقعت فيها مرتين في الجلسة دي (اسم الجدول، وفرض
--   إن الجدول فاضي). القاعدة اللي مشيين عليها: **أقرا الموجود قبل ما
--   أكتب**، مش أفترض.
--
-- شغّل الملف كله وابعتلي الناتج زي ما هو.
-- ============================================================

SELECT 1 AS n, 'نوع العمود' AS البند,
       c.table_name || '.' || c.column_name || ' → ' || c.data_type ||
       CASE WHEN c.is_nullable = 'YES' THEN ' (يقبل الفراغ)' ELSE ' (إلزامي)' END AS القيمة
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (
    (c.table_name = 'service_orders'      AND c.column_name IN ('id','buyer_profile_id','instructor_id','standalone_service_id','amount','instructor_earning','status','delivered_at','completed_at','created_at'))
 OR (c.table_name = 'instructors'         AND c.column_name IN ('id','user_id','display_name','status'))
 OR (c.table_name = 'instructor_services' AND c.column_name IN ('id','instructor_id','service_id','approved_price','status','is_active'))
 OR (c.table_name = 'standalone_services' AND c.column_name IN ('id','name','price','price_type'))
 OR (c.table_name = 'user_profiles'       AND c.column_name IN ('id','role'))
 OR (c.table_name = 'service_order_messages' AND c.column_name IN ('id','order_id','sender_profile_id','is_delivery'))
  )

UNION ALL
-- المفاتيح الأساسية والفريدة — الجدول الجديد هيربط بيها
SELECT 2, 'قيد على ' || rel.relname,
       con.conname || ' :: ' || pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace ns ON ns.oid = rel.relnamespace
WHERE ns.nspname = 'public'
  AND rel.relname IN ('service_orders','instructors','instructor_services','standalone_services','service_order_messages')
  AND con.contype IN ('p','u','f')

UNION ALL
-- هل الدالة المساعدة للتحقق من الإدارة موجودة؟ الجدول الجديد هيستخدمها
SELECT 3, 'دالة الإدارة', p.proname || ' → ' || pg_get_function_result(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('is_admin','is_super_admin')

UNION ALL
-- هل توليد المعرّفات التلقائي متاح؟
SELECT 4, 'امتداد متاح', extname
FROM pg_extension
WHERE extname IN ('pgcrypto','uuid-ossp')

UNION ALL
-- كام طلب خدمة موجود فعلًا؟ ده بيحدد حجم عملية النقل
SELECT 5, 'عدد طلبات الخدمات', COUNT(*)::text FROM service_orders

UNION ALL
SELECT 6, 'عدد عروض المدربين على الخدمات', COUNT(*)::text FROM instructor_services

UNION ALL
SELECT 7, 'عدد الخدمات المستقلة', COUNT(*)::text FROM standalone_services

UNION ALL
SELECT 8, 'عدد المدربين', COUNT(*)::text FROM instructors

UNION ALL
-- طلبات مرتبطة بمدرب فعلًا (دي اللي هتتنقل)
SELECT 9, 'طلبات لها مقدّم خدمة محدد', COUNT(*)::text
FROM service_orders WHERE instructor_id IS NOT NULL

ORDER BY n, البند, القيمة;
