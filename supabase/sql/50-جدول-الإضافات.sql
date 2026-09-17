-- ============================================================
-- 50 — جدول الإضافات + حسابها في سعر الطلب
-- ============================================================
--
-- الخلفية:
--   خطوة «الإضافات» في معالج التخصيص كانت فاضية في الإنتاج، وكان فيه
--   في كود المتصفح تلات أسعار مكتوبة بالإيد (150 و50 و100) مالهاش
--   مصدر ولا جدول — اتشالت في تنظيف سابق.
--
--   دلوقتي الإضافات بقت ميزة حقيقية: جدول في القاعدة، شاشة إدارة
--   تضيف وتسعّر وتفعّل، والسعر بيتحسب **في القاعدة** زي المنتجات.
--
-- الملف ده بيعمل:
--   1. جدول `addon_products` + حمايته (قراءة عامة للمفعّل، وإدارة كاملة
--      للإدارة).
--   2. تحديث دالة إنشاء الطلب عشان:
--        • تقرا الإضافات المختارة من كل صنف،
--        • ترفض أي إضافة مش موجودة أو موقوفة،
--        • تحسب سعرها من الجدول وتضيفه لسعر الصنف،
--        • وتحفظ نسخة من اسم وسعر كل إضافة **وقت الطلب** جوه بيانات
--          التخصيص — عشان لو السعر اتغيّر بعدين، الطلب القديم يفضل
--          محتفظ باللي العميل دفعه فعلًا.
--
--   الجدول بيتعمل **فاضي**: مفيش إضافات مخترعة. إنت هتضيفها من الشاشة.
--
-- ⚠️ الترتيب: شغّل ده → ارفع الكود → ضيف الإضافات من لوحة الإدارة.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.addon_products (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  price       numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addon_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active addons are public"   ON public.addon_products;
DROP POLICY IF EXISTS "Admins manage addons"       ON public.addon_products;

-- الزائر يشوف المفعّل بس. الموقوف بيفضل في الجدول للطلبات القديمة.
CREATE POLICY "Active addons are public"
  ON public.addon_products
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage addons"
  ON public.addon_products
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ------------------------------------------------------------
-- دالة إنشاء الطلب: بقت تعرف الإضافات
-- ------------------------------------------------------------
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
  v_addon          record;
  v_addon_id       text;
  v_qty            integer;
  v_child          text;
  v_unit           numeric;
  v_addons_total   numeric;
  v_addons_snap    jsonb;
  v_customization  jsonb;
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

    -- الإضافات: أرقامها بس هي اللي بتيجي من الواجهة، والسعر من الجدول.
    v_addons_total := 0;
    v_addons_snap  := '[]'::jsonb;

    IF jsonb_typeof(v_item->'addon_ids') = 'array' THEN
      FOR v_addon_id IN
        SELECT jsonb_array_elements_text(v_item->'addon_ids')
      LOOP
        SELECT a.id, a.name, a.price
          INTO v_addon
          FROM addon_products a
         WHERE a.id = v_addon_id AND a.is_active = true;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'إضافة غير متاحة: %', v_addon_id;
        END IF;

        v_addons_total := v_addons_total + v_addon.price;
        v_addons_snap  := v_addons_snap || jsonb_build_object(
          'id', v_addon.id, 'name', v_addon.name, 'price', v_addon.price
        );
      END LOOP;
    END IF;

    v_unit := v_product.price + v_addons_total;

    -- نسخة من الإضافات وقت الطلب: لو السعر اتغيّر بعدين، الطلب القديم
    -- بيفضل شايل اللي العميل دفعه فعلًا.
    v_customization := coalesce(v_item->'customization_data', '{}'::jsonb)
                       || jsonb_build_object('addons', v_addons_snap);

    INSERT INTO order_items (order_id, product_id, quantity, unit_price, customization_data)
    VALUES (v_order_id, v_product.id, v_qty, v_unit, v_customization);

    v_subtotal := v_subtotal + (v_unit * v_qty);
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
  'جدول الإضافات' AS البند,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_schema='public' AND table_name='addon_products')
       THEN 'موجود ✓' ELSE 'مش موجود ✗' END AS النتيجة
UNION ALL
SELECT 'الحماية مفعّلة',
  CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname='addon_products')
       THEN 'نعم ✓' ELSE 'لأ ✗' END
UNION ALL
SELECT 'عدد السياسات',
  (SELECT count(*)::text FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
    WHERE c.relname='addon_products')
UNION ALL
SELECT 'الدالة بتعرف الإضافات',
  CASE WHEN (SELECT pg_get_functiondef(p.oid) FROM pg_proc p
              JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='create_customer_order')
       LIKE '%addon_products%'
       THEN 'نعم ✓' ELSE 'لأ ✗' END
UNION ALL
SELECT 'عدد الإضافات المسجّلة', (SELECT count(*)::text FROM addon_products);
