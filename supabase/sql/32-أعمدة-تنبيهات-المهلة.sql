-- ============================================================
-- 32 — عمودان لمنع تكرار تنبيهات المهلة
-- ============================================================
--
-- المشكلة:
--   المهمة اليومية الجديدة بتفحص الطلبات كل يوم وتبعت تنبيه قبل المهلة
--   وتنبيه عند تجاوزها. من غير علامة بتقول «ده اتبعت»، مقدّم الخدمة
--   هياخد **نفس الرسالة كل يوم** لحد ما يسلّم — وده أسرع طريقة لخلّي
--   الناس تتجاهل إشعارات المنصة كلها.
--
-- الحل:
--   عمودان بيسجّلوا وقت إرسال كل تنبيه. المهمة بتتخطى الطلب اللي
--   اتبعتله قبل كده.
--
-- الملف ده إضافة بالكامل: عمودان جداد فاضيين. مفيش حذف ولا تعديل على
-- بيانات موجودة، ومفيش تغيير في سلوك الموقع قبل ما المهمة تشتغل.
-- ============================================================

BEGIN;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS due_warned_at timestamptz;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS due_overdue_notified_at timestamptz;

COMMENT ON COLUMN public.service_orders.due_warned_at IS
  'وقت إرسال تنبيه اقتراب المهلة. فاضي = لم يُرسل بعد.';
COMMENT ON COLUMN public.service_orders.due_overdue_notified_at IS
  'وقت إرسال تنبيه تجاوز المهلة. فاضي = لم يُرسل بعد.';

-- تغيير المهلة بإيد الإدارة بيصفّر العلامتين، عشان المهلة الجديدة
-- تاخد تنبيهاتها من أول وجديد. من غير ده، تمديد المهلة يخلي الطلب
-- يعدّي من غير أي تنبيه تاني.
CREATE OR REPLACE FUNCTION public.reset_due_notifications()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.due_at IS DISTINCT FROM OLD.due_at THEN
    NEW.due_warned_at           := NULL;
    NEW.due_overdue_notified_at := NULL;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS reset_due_notifications_trg ON public.service_orders;
CREATE TRIGGER reset_due_notifications_trg
  BEFORE UPDATE OF due_at ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.reset_due_notifications();

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT 1 AS n, 'عمود' AS البند, column_name AS القيمة
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'service_orders'
  AND column_name IN ('due_at', 'due_note', 'due_warned_at', 'due_overdue_notified_at')

UNION ALL
SELECT 2, 'محفّز', tgname
FROM pg_trigger WHERE tgname = 'reset_due_notifications_trg'

ORDER BY n, القيمة;
