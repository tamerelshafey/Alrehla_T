-- ============================================================
-- 43 — دالة إنشاء الطلب: السعر يتحسب في القاعدة
-- ============================================================
--
-- المشكلة (مؤكدة من الكود ومن تشخيص ملف 42):
--   صفحة الدفع بتبعت للخادم **الأرقام نفسها**: سعر كل صنف، الشحن،
--   والإجمالي. والخادم بيكتبهم زي ما وصلوا. محفّز `guard_order_insert`
--   بيضبط حالة الطلب وبيانات الشحن، لكنه ما بيبصّش على الفلوس.
--
--   يعني حد يعرف يكلّم القاعدة (والمفتاح العام موجود في كود المتصفح
--   بطبيعته) يقدر يعمل طلب بكتاب بـ 5 جنيه. والمحفّز التاني بيجمّد
--   الرقم بعد كده — فالرقم الغلط بيتقفل عليه ويبان سليم.
--
--   ومعاها مشكلتين تانيين في نفس المكان:
--     • الطلب وعناصره بيتكتبوا في خطوتين منفصلتين. لو التانية فشلت
--       يفضل طلب بمبلغ من غير أي عناصر.
--     • رقم المنتج المتخزّن في العناصر رقم مركّب (رقم المنتج + التوقيت)
--       عشان العربة بتفرّق بين نسختين متخصصتين. يعني عناصر الطلبات
--       مش موصولة بالمنتجات فعليًا.
--
-- الحل:
--   دالة واحدة بتستقبل «إيه اتطلب وكام واحد» بس، وبتعمل الباقي:
--     • تجيب سعر كل منتج من `personalized_products`.
--     • تتأكد إن ملف الطفل المرفق يخص صاحب الحساب.
--     • تحسب الشحن من `shipping_rates` حسب المحافظة والمدينة، وترفض
--       لو المنطقة مش مسجّلة (بدل ما تخترع رقم).
--     • تكتب الطلب وعناصره في **عملية واحدة**: لو أي خطوة فشلت مفيش
--       حاجة بتتكتب خالص.
--   وبتستخدم هوية صاحب الحساب من الجلسة، مش من اللي الواجهة بتبعته.
--
-- إيه اللي بيتغيّر في البيانات: **ولا حاجة**. مفيش جدول ولا عمود ولا صف.
-- دالة جديدة بس، والطريق القديم بيفضل شغّال لحد ما نرفع الكود الجديد.
--
-- ⚠️ الترتيب مهم (ودي نفس النقطة اللي غلطت فيها قبل كده):
--     1) شغّل الملف ده  — الدالة بتتعمل، والموقع الحالي ما بيتأثرش.
--     2) نرفع الكود الجديد اللي بيستخدمها.
--     3) بعد ما تتأكد إن الشراء شغّال، نشغّل ملف 44 اللي بيقفل الطريق
--        القديم (إنشاء الطلبات مباشرة من المتصفح).
--   لو قفلنا الطريق القديم قبل رفع الكود، الشراء هيقف.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.create_customer_order(
  p_items    jsonb,
  p_shipping jsonb DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user           uuid    := auth.uid();
  v_order_id       text;
  v_item           jsonb;
  v_product        record;
  v_qty            integer;
  v_child          text;
  v_subtotal       numeric := 0;
  v_shipping       numeric := 0;
  v_needs_shipping boolean := false;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'لازم تسجّل الدخول قبل الطلب';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'الطلب فاضي';
  END IF;

  -- الطلب بيتعمل بإجمالي صفر، وبيتحدّث في الآخر بالمحسوب. كله جوه
  -- نفس المعاملة، فمفيش لحظة بيبان فيها الطلب ناقص لأي حد.
  INSERT INTO orders (
    user_id, total_amount, shipping_fee, status,
    recipient_name, recipient_phone, address_line, city, governorate, shipping_notes
  )
  VALUES (
    v_user, 0, 0, 'pending',
    NULLIF(btrim(coalesce(p_shipping->>'recipientName',  '')), ''),
    NULLIF(btrim(coalesce(p_shipping->>'recipientPhone', '')), ''),
    NULLIF(btrim(coalesce(p_shipping->>'addressLine',    '')), ''),
    NULLIF(btrim(coalesce(p_shipping->>'city',           '')), ''),
    NULLIF(btrim(coalesce(p_shipping->>'governorate',    '')), ''),
    NULLIF(btrim(coalesce(p_shipping->>'notes',          '')), '')
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := greatest(1, coalesce((v_item->>'quantity')::integer, 1));

    SELECT id, price, category
      INTO v_product
      FROM personalized_products
     WHERE id = v_item->>'product_id';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'منتج غير موجود: %', v_item->>'product_id';
    END IF;

    -- الاشتراك مش بيتشحن. أي حاجة تانية بتتشحن.
    IF v_product.category <> 'subscription' THEN
      v_needs_shipping := true;
    END IF;

    -- ملف الطفل المرفق لازم يكون لصاحب الحساب — مش لحد تاني.
    v_child := NULLIF(v_item->'customization_data'->>'childId', '');
    IF v_child IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM child_profiles c
         WHERE c.id = v_child AND c.user_profile_id = v_user
      ) THEN
        RAISE EXCEPTION 'ملف المشارك المرفق لا يخص صاحب الحساب';
      END IF;
    END IF;

    -- السعر من الجدول. اللي الواجهة بعتته مش بيتقرا أصلًا.
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, customization_data)
    VALUES (v_order_id, v_product.id, v_qty, v_product.price,
            v_item->'customization_data');

    v_subtotal := v_subtotal + (v_product.price * v_qty);
  END LOOP;

  IF v_needs_shipping THEN
    IF coalesce(btrim(p_shipping->>'governorate'), '') = ''
       OR coalesce(btrim(p_shipping->>'city'), '') = '' THEN
      RAISE EXCEPTION 'عنوان الشحن مطلوب';
    END IF;

    SELECT fee INTO v_shipping
      FROM shipping_rates
     WHERE is_active = true
       AND governorate = btrim(p_shipping->>'governorate')
       AND city        = btrim(p_shipping->>'city')
     LIMIT 1;

    IF NOT FOUND THEN
      -- بنرفض بدل ما نحط صفر أو رقم مخترع: أحسن من طلب بشحن غلط.
      RAISE EXCEPTION 'منطقة الشحن دي مش مسجّلة — تواصل معانا';
    END IF;
  END IF;

  UPDATE orders
     SET total_amount = v_subtotal + v_shipping,
         shipping_fee = v_shipping
   WHERE id = v_order_id;

  RETURN v_order_id;
END
$function$;

-- الدالة بتتنادى من المتصفح باسم صاحب الحساب، فلازم يكون له صلاحية
-- تشغيلها. الزائر غير المسجّل بترفضه أول سطر في الدالة.
REVOKE ALL ON FUNCTION public.create_customer_order(jsonb, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_customer_order(jsonb, jsonb) TO authenticated;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.proname AS الدالة,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✓' ELSE 'غير آمنة ✗' END AS النوع,
  CASE WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%'
       THEN 'search_path مثبّت ✓' ELSE 'غير مثبّت ✗' END AS الأمان,
  CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
       THEN 'المستخدم المسجّل يقدر يناديها ✓' ELSE 'مش متاحة ✗' END AS الصلاحية
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'create_customer_order';
