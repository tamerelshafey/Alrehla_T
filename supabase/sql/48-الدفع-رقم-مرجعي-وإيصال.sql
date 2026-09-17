-- ============================================================
-- 48 — نظام الدفع اليدوي: رقم مرجعي تلقائي + إيصال + وسيلة الدفع
-- ============================================================
--
-- الوضع الحالي:
--   العميل بيشوف رقم المحفظة، بيحوّل، وبيكتب «رقم العملية» بإيده في خانة
--   نصية. والإدارة بتأكد الدفع **من غير ما تشوف أي إثبات**، ومن غير رقم
--   من عندنا تربط بيه التحويل بالطلب.
--
-- المطلوب (قرارك):
--   • وسيلة الدفع: إنستاباي أو فودافون كاش.
--   • رقم مرجعي **بيتولّد تلقائيًا لكل طلب**، متسلسل ومعاه حرفين:
--         ALR-000123-K7
--     المتسلسل عشان المحاسبة والمطابقة، والحرفين عشان ما ينفعش حد
--     يخمّن رقم طلب غيره ويدّعي إنه دفعه.
--   • صورة الإيصال **إجبارية** بعد التحويل.
--   • خانة «رقم العملية» اللي العميل كان بيكتبها بإيده اتلغت.
--
-- الملف ده بيعمل:
--   1. عدّاد ودالة بتولّد الرقم المرجعي.
--   2. تلات أعمدة على التلات مسارات: طلبات المتجر، حجوزات الكتابة،
--      طلبات الخدمات الإبداعية.
--   3. رقم مرجعي للصفوف القديمة كمان — عشان ما يكونش فيه طلب بلا رقم.
--   4. تحديث المحفّظات التلاتة: الرقم المرجعي مقفول تمامًا، والعميل
--      يقدر يحط وسيلة الدفع والإيصال **مرة واحدة** وهو بيقول «حوّلت».
--
-- العمود القديم `transaction_reference` سايبينه زي ما هو: فيه بيانات
-- قديمة، ومسحه بيضيّعها. هو بس مش هيتكتب فيه حاجة جديدة.
--
-- ⚠️ الترتيب: شغّل الملف ده → ارفع الكود → جرّب طلب كامل.
--    الملف لوحده ما بيكسرش الموقع الحالي: أعمدة جديدة فاضية بس.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) مولّد الرقم المرجعي
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.payment_reference_seq START 1;

CREATE OR REPLACE FUNCTION public.next_payment_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  -- حروف وأرقام من غير المتشابهين في الخط (0/O و1/I/L) عشان الناس
  -- بتقرا الرقم ده وتكتبه في تطبيق التحويل.
  alphabet CONSTANT text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  suffix   text := '';
  i        integer;
BEGIN
  FOR i IN 1..2 LOOP
    suffix := suffix || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  END LOOP;

  RETURN 'ALR-' || lpad(nextval('public.payment_reference_seq')::text, 6, '0') || '-' || suffix;
END
$function$;


-- ------------------------------------------------------------
-- 2) الأعمدة الجديدة على التلات جداول
-- ------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reference   text,
  ADD COLUMN IF NOT EXISTS payment_method      text,
  ADD COLUMN IF NOT EXISTS payment_receipt_url text;

ALTER TABLE public.course_subscriptions
  ADD COLUMN IF NOT EXISTS payment_reference   text,
  ADD COLUMN IF NOT EXISTS payment_method      text,
  ADD COLUMN IF NOT EXISTS payment_receipt_url text;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS payment_reference   text,
  ADD COLUMN IF NOT EXISTS payment_method      text,
  ADD COLUMN IF NOT EXISTS payment_receipt_url text;

-- وسيلة الدفع: القيمتين دول بس.
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check,
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('instapay', 'vodafone_cash'));

ALTER TABLE public.course_subscriptions
  DROP CONSTRAINT IF EXISTS course_subscriptions_payment_method_check,
  ADD CONSTRAINT course_subscriptions_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('instapay', 'vodafone_cash'));

ALTER TABLE public.service_orders
  DROP CONSTRAINT IF EXISTS service_orders_payment_method_check,
  ADD CONSTRAINT service_orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('instapay', 'vodafone_cash'));


-- ------------------------------------------------------------
-- 3) الرقم المرجعي: تلقائي للجديد، ومكمَّل للقديم
-- ------------------------------------------------------------
UPDATE public.orders               SET payment_reference = public.next_payment_reference()
 WHERE payment_reference IS NULL;
UPDATE public.course_subscriptions SET payment_reference = public.next_payment_reference()
 WHERE payment_reference IS NULL;
UPDATE public.service_orders       SET payment_reference = public.next_payment_reference()
 WHERE payment_reference IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN payment_reference SET DEFAULT public.next_payment_reference();
ALTER TABLE public.course_subscriptions
  ALTER COLUMN payment_reference SET DEFAULT public.next_payment_reference();
ALTER TABLE public.service_orders
  ALTER COLUMN payment_reference SET DEFAULT public.next_payment_reference();

-- رقم مكرر = تحويل يتحسب لطلبين. التفرّد بيمنع ده من الأساس.
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_key
  ON public.orders (payment_reference);
CREATE UNIQUE INDEX IF NOT EXISTS course_subscriptions_payment_reference_key
  ON public.course_subscriptions (payment_reference);
CREATE UNIQUE INDEX IF NOT EXISTS service_orders_payment_reference_key
  ON public.service_orders (payment_reference);


-- ------------------------------------------------------------
-- 4) المحفّظات: الرقم مقفول، والإيصال مرة واحدة
-- ------------------------------------------------------------

-- طلبات المتجر
CREATE OR REPLACE FUNCTION public.guard_order_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- الاستثناء الوحيد: العميل يقول «حوّلت» ويسيب وسيلة الدفع والإيصال.
  IF OLD.status = 'pending'
     AND NEW.status = 'awaiting_verification' THEN
    NULL;
  ELSE
    NEW.status              := OLD.status;
    NEW.payment_method      := OLD.payment_method;
    NEW.payment_receipt_url := OLD.payment_receipt_url;
  END IF;

  -- الفلوس والملكية والرقم المرجعي: العميل ما بيلمسهمش أبدًا.
  NEW.id                    := OLD.id;
  NEW.user_id               := OLD.user_id;
  NEW.total_amount          := OLD.total_amount;
  NEW.shipping_fee          := OLD.shipping_fee;
  NEW.created_at            := OLD.created_at;
  NEW.payment_reference     := OLD.payment_reference;
  NEW.transaction_reference := OLD.transaction_reference;

  -- التنفيذ والشحن: الإدارة وحدها.
  NEW.shipped_at         := OLD.shipped_at;
  NEW.delivered_at       := OLD.delivered_at;
  NEW.tracking_reference := OLD.tracking_reference;
  NEW.admin_notes        := OLD.admin_notes;

  -- عنوان الشحن سايبينه مفتوح عن قصد: العميل يصحّح عنوانه قبل الشحن.

  RETURN NEW;
END
$function$;

-- حجوزات الكتابة
CREATE OR REPLACE FUNCTION public.guard_course_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.user_id                 := OLD.user_id;
  NEW.package_id              := OLD.package_id;
  NEW.child_id                := OLD.child_id;
  NEW.participant_type        := OLD.participant_type;
  NEW.started_at              := OLD.started_at;
  NEW.amount                  := OLD.amount;
  NEW.preferred_instructor_id := OLD.preferred_instructor_id;
  NEW.payment_reference       := OLD.payment_reference;

  IF OLD.status = 'pending' AND NEW.status = 'awaiting_verification' THEN
    NULL;
  ELSE
    NEW.status                := OLD.status;
    NEW.transaction_reference := OLD.transaction_reference;
    NEW.payment_method        := OLD.payment_method;
    NEW.payment_receipt_url   := OLD.payment_receipt_url;
  END IF;

  RETURN NEW;
END
$function$;

-- طلبات الخدمات الإبداعية
CREATE OR REPLACE FUNCTION public.guard_service_order_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_the_provider BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- مقدّم الخدمة المكلَّف: مدرب بالطريقة القديمة، أو مقدّم بالجديدة.
  SELECT EXISTS (
    SELECT 1 FROM instructors i
    WHERE i.id = OLD.instructor_id AND i.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM service_providers sp
    LEFT JOIN instructors i2 ON i2.id = sp.instructor_id
    WHERE sp.id = OLD.provider_id
      AND (sp.user_id = auth.uid() OR i2.user_id = auth.uid())
  ) INTO is_the_provider;

  IF TG_OP = 'INSERT' THEN
    NEW.status             := 'pending';
    NEW.instructor_earning := NULL;
    NEW.delivered_at       := NULL;
    NEW.completed_at       := NULL;
    NEW.due_at             := NULL;
    NEW.due_note           := NULL;
    -- الدفع ما بيتسجّلش وقت إنشاء الطلب.
    NEW.payment_method      := NULL;
    NEW.payment_receipt_url := NULL;
    RETURN NEW;
  END IF;

  IF is_the_provider THEN
    -- مقدّم الخدمة: من «قيد التنفيذ» إلى «سُلّم» وبس.
    IF NOT (OLD.status = 'in_progress' AND NEW.status = 'delivered') THEN
      NEW.status := OLD.status;
    END IF;
    NEW.transaction_reference := OLD.transaction_reference;
    NEW.payment_method        := OLD.payment_method;
    NEW.payment_receipt_url   := OLD.payment_receipt_url;
  ELSE
    -- المشتري: انتقالان مسموحان — «حوّلت»، و«استلمت وأأكّد».
    IF OLD.status = 'pending' AND NEW.status = 'awaiting_verification' THEN
      NULL;
    ELSIF OLD.status = 'delivered' AND NEW.status = 'completed' THEN
      NEW.payment_method        := OLD.payment_method;
      NEW.payment_receipt_url   := OLD.payment_receipt_url;
    ELSE
      NEW.status                := OLD.status;
      NEW.transaction_reference := OLD.transaction_reference;
      NEW.payment_method        := OLD.payment_method;
      NEW.payment_receipt_url   := OLD.payment_receipt_url;
    END IF;
  END IF;

  -- الفلوس والأطراف والمهلة والرقم المرجعي: محدش غير الإدارة.
  NEW.id                    := OLD.id;
  NEW.buyer_profile_id      := OLD.buyer_profile_id;
  NEW.instructor_id         := OLD.instructor_id;
  NEW.provider_id           := OLD.provider_id;
  NEW.amount                := OLD.amount;
  NEW.instructor_earning    := OLD.instructor_earning;
  NEW.package_id            := OLD.package_id;
  NEW.standalone_service_id := OLD.standalone_service_id;
  NEW.created_at            := OLD.created_at;
  NEW.due_at                := OLD.due_at;
  NEW.due_note              := OLD.due_note;
  NEW.payment_reference     := OLD.payment_reference;

  RETURN NEW;
END
$$;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  t.table_name AS الجدول,
  count(*) FILTER (WHERE c.column_name IN
    ('payment_reference','payment_method','payment_receipt_url')) AS الأعمدة_من_3,
  (SELECT count(*) FROM information_schema.table_constraints tc
    WHERE tc.table_name = t.table_name
      AND tc.constraint_name LIKE '%payment_method_check%')        AS قيد_الوسيلة
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('orders','course_subscriptions','service_orders')
GROUP BY t.table_name

UNION ALL

SELECT 'مثال على الرقم المرجعي', 0, 0
UNION ALL
SELECT public.next_payment_reference(), 0, 0;
