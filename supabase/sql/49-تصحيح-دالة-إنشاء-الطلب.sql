-- ============================================================
-- 49 — تصحيح دالة إنشاء الطلب (خطأ أنواع)
-- ============================================================
--
-- الخطأ اللي ظهر عند الشراء:
--     column "order_id" is of type uuid but expression is of type text
--
-- السبب:
--   في ملف 43 عرّفت المتغيّر اللي شايل رقم الطلب كـ text. لكن `orders.id`
--   نوعه uuid فعليًا، و`order_items.order_id` كمان. فلما الدالة بتحاول
--   تكتب عناصر الطلب، بوستجرس بيرفض النص.
--
--   وده غلطي: استنتجت نوع العمود من ملف الأنواع في المشروع، وهو بيكتب
--   uuid و text الاتنين `string`. النوع الحقيقي بيتقرا من القاعدة بس.
--
-- التصحيح:
--   • رقم الطلب بقى uuid جوه الدالة، وبيترجع نص في الآخر (زي ما الكود
--     مستنيه).
--   • كل المقارنات مع أرقام جاية من الواجهة بقت على `::text` صراحة،
--     عشان تشتغل سواء العمود uuid أو text — نفس الغلطة ما تتكررش في
--     المنتجات ولا في ملفات المشاركين.
--   • رقم المنتج اللي بيتكتب في العنصر بقى **القيمة اللي طلعت من جدول
--     المنتجات نفسه**، مش النص اللي جاي من المتصفح — فنوعه صح دايمًا،
--     ومضمون إنه منتج موجود.
--
-- الدالة بتتستبدل بالكامل. مفيش جدول ولا عمود ولا صف بيتغيّر.
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
  v_order_id       uuid;
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

    -- المقارنة على ::text عشان تشتغل مهما كان نوع العمود.
    SELECT p.id, p.price, p.category
      INTO v_product
      FROM personalized_products p
     WHERE p.id::text = v_item->>'product_id';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'منتج غير موجود: %', v_item->>'product_id';
    END IF;

    IF v_product.category <> 'subscription' THEN
      v_needs_shipping := true;
    END IF;

    v_child := NULLIF(v_item->'customization_data'->>'childId', '');
    IF v_child IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM child_profiles c
         WHERE c.id::text = v_child AND c.user_profile_id = v_user
      ) THEN
        RAISE EXCEPTION 'ملف المشارك المرفق لا يخص صاحب الحساب';
      END IF;
    END IF;

    -- القيم من الجدول نفسه: النوع صح، والمنتج مضمون إنه موجود.
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
      RAISE EXCEPTION 'منطقة الشحن دي مش مسجّلة — تواصل معانا';
    END IF;
  END IF;

  UPDATE orders
     SET total_amount = v_subtotal + v_shipping,
         shipping_fee = v_shipping
   WHERE id = v_order_id;

  RETURN v_order_id::text;
END
$function$;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.proname AS الدالة,
  CASE WHEN pg_get_functiondef(p.oid) LIKE '%v_order_id       uuid%'
       THEN 'النوع اتصحّح ✓' ELSE 'لسه القديم ✗' END AS النتيجة,
  CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
       THEN 'متاحة للمستخدم المسجّل ✓' ELSE 'مش متاحة ✗' END AS الصلاحية
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'create_customer_order';
