-- ============================================================
-- 24 — تشخيص: إيه الموجود فعلًا في جداول المحتوى؟
-- ============================================================
--
-- ملف قراءة فقط. ما بيغيّرش أي حاجة. الغرض منه إني أعرف قبل ما
-- أكتب ملف التغذية:
--   1. فيه باقات كتابة موجودة ولا الجدول فاضي؟ ولو موجودة، بأي slug؟
--      (عشان ما أضيفش نسخة تانية من نفس الرحلة)
--   2. فيه قيد «تفرّد» على عمود slug؟ ده بيحدد شكل أمر الإضافة
--   3. كام نص اتعدّل فعلًا في page_content؟
--   4. فيه مقالات مدونة ولا لأ؟
--
-- شغّل الملف كله ومتاعش الناتج زي ما هو.
-- (استعلام واحد بـUNION ALL لأن محرر Supabase بيعرض آخر نتيجة بس)
-- ============================================================

SELECT 1 AS n, 'عدد باقات الكتابة' AS البند, COUNT(*)::text AS القيمة
FROM creative_writing_packages

UNION ALL
SELECT 2, 'باقة موجودة: ' || slug, name || ' — ' || age_group::text || ' — ' ||
       COALESCE(sessions_count::text, '؟') || ' جلسة — سعر ' || price::text ||
       CASE WHEN is_active THEN ' — منشورة' ELSE ' — مخفية' END
FROM creative_writing_packages

UNION ALL
SELECT 3, 'قيد تفرّد على creative_writing_packages', con.conname || ' على (' ||
       pg_get_constraintdef(con.oid) || ')'
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'creative_writing_packages' AND con.contype IN ('p','u')

UNION ALL
SELECT 4, 'نصوص معدّلة في page_content', COUNT(*)::text
FROM page_content

UNION ALL
SELECT 5, 'مقالات المدونة', COUNT(*)::text
FROM blog_posts

UNION ALL
SELECT 6, 'خدمات إبداعية مستقلة', COUNT(*)::text
FROM standalone_services

UNION ALL
SELECT 7, 'خطط صندوق الرحلة', COUNT(*)::text
FROM box_subscription_plans

ORDER BY n, البند;
