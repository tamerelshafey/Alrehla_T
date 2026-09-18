-- ============================================================
-- 58 — تجهيز جدول الإعدادات للمفاتيح الجديدة
-- ============================================================
--
-- ليه الملف ده:
--   شاشة «أنواع الإشعارات» بتخزّن حالتها في `site_settings` تحت مفتاح
--   `notifications` — مفتاح جديد مالوش صف. والكتابة بتتم بـ `upsert`
--   (يعدّل لو موجود، يعمل لو مش موجود)، و`upsert` في Postgres محتاج
--   **قيد فريد على العمود** عشان يعرف يحدد الصف المكرر. من غيره بيقع
--   برسالة: «there is no unique or exclusion constraint matching».
--
--   فالملف ده بيضيف الفهرس الفريد على `key`، وبيعمل الصفين اللي الشاشات
--   بتقرا منهم لو مش موجودين.
--
-- ⚠️ لو الملف وقع برسالة فيها «duplicate key»، يبقى فيه أكتر من صف بنفس
--    المفتاح في الجدول — بلّغني قبل ما تعمل أي حاجة، لأن ساعتها لازم
--    نعرف الصف الصح قبل ما نمسح حاجة.
--
-- مفيش أي قيمة موجودة بتتغيّر ولا تتمسح.
-- ============================================================

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_key_unique
  ON public.site_settings (key);

INSERT INTO public.site_settings (key, value)
VALUES ('general', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES ('notifications', '{"disabled": []}'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  key                                        AS المفتاح,
  jsonb_typeof(value)                        AS نوع_المحتوى,
  (SELECT count(*) FROM jsonb_object_keys(value)) AS عدد_الإعدادات,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND indexname = 'site_settings_key_unique'
  ) THEN 'موجود ✓' ELSE 'ناقص ✗' END        AS الفهرس_الفريد
FROM public.site_settings
ORDER BY key;
