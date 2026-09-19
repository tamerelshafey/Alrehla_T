-- ============================================================
-- 85 — تخصيص المنتجات الإضافية
-- ============================================================
--
-- ⚠️ **الملف ده بيعيد تعريف `create_customer_order`** — دالة مسار
--    الشراء. اقرا خطوة التحقق تحت قبل ما تشغّله.
--
-- ── المطلوب ─────────────────────────────────────────────────
--
-- المنتج الإضافي ممكن يتطلب بتخصيص أو من غيره، وكل حالة ليها سعر.
--
-- ── إزاي اتعمل ──────────────────────────────────────────────
--
-- عمودين في `addon_products`:
--   `supports_customization`  الإضافة دي أصلًا بتقبل تخصيص؟
--   `customization_price`     **الفرق** اللي بيتضاف لما يتخصّص
--
-- والواجهة بتبعت `customized_addon_ids` جنب `addon_ids` — **أرقام بس،
-- مفيش أسعار**. نفس القاعدة اللي ماشي عليها الملف من أول يوم: السعر
-- بييجي من الجدول، والعميل بيبعت اللي اختاره مش اللي هيدفعه.
--
-- والدالة بترفض لو حد طلب تخصيص لإضافة مش بتقبله — فمفيش طريق
-- لتزوير السعر حتى بطلب مباشر للقاعدة.
--
-- ============================================================
-- 🛑 خطوة تحقق قبل التشغيل — سطر واحد
-- ============================================================
--
-- الدالة اللي تحت منسوخة من **ملف 50** ومعدَّلة. والقاعدة هي مصدر
-- الحقيقة مش الملفات، فلو حد عدّل الدالة على القاعدة مباشرةً، الملف ده
-- هيمسح تعديله.
--
-- شغّل ده الأول:
--
--   SELECT pg_get_functiondef(
--     'public.create_customer_order(jsonb,jsonb)'::regprocedure);
--
-- وقارن: المفروض تلاقي `v_addons_snap` و`shipping_rates` و
-- `'ملف المشارك المرفق لا يخص صاحب الحساب'`. لو لقيت حاجة تانية مش
-- في ملف 50 — **قف وقل لي** قبل ما تكمّل.
-- ============================================================

BEGIN;

-- ── العمودان ───────────────────────────────────────────────

ALTER TABLE public.addon_products
  ADD COLUMN IF NOT EXISTS supports_customization boolean NOT NULL DEFAULT false;

ALTER TABLE public.addon_products
  ADD COLUMN IF NOT EXISTS customization_price numeric NOT NULL DEFAULT 0;

-- سعر التخصيص فرق مش سعر كامل، فما ينفعش يبقى سالبًا.
ALTER TABLE public.addon_products
  DROP CONSTRAINT IF EXISTS addon_customization_price_check;
ALTER TABLE public.addon_products
  ADD CONSTRAINT addon_customization_price_check
  CHECK (customization_price >= 0);

COMMENT ON COLUMN public.addon_products.supports_customization IS
  'الإضافة دي بتقبل تخصيص باسم الطفل/صورته؟';
COMMENT ON COLUMN public.addon_products.customization_price IS
  'الفرق اللي بيتضاف على السعر لما العميل يختار «بتخصيص». مش السعر الكامل.';

-- ── الدالة ─────────────────────────────────────────────────
--
-- منسوخة من ملف 50 حرفيًا، والتغيير في **حلقة الإضافات وحدها**
-- (متعلّم بـ«⭐ جديد» تحت).

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
  v_addon_custom   boolean;   -- ⭐ جديد
  v_addon_price    numeric;   -- ⭐ جديد
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
        SELECT a.id, a.name, a.price,
               a.supports_customization, a.customization_price   -- ⭐ جديد
          INTO v_addon
          FROM addon_products a
         WHERE a.id = v_addon_id AND a.is_active = true;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'إضافة غير متاحة: %', v_addon_id;
        END IF;

        -- ⭐ جديد: العميل اختار «بتخصيص» للإضافة دي؟
        --
        -- `jsonb_exists` مش المعامل `?` عن قصد: `?` بيتلخبط مع علامات
        -- الاستفهام اللي بعض عملاء SQL بيفسّروها كمعاملات استعلام.
        v_addon_custom := coalesce(
          jsonb_exists(v_item->'customized_addon_ids', v_addon_id),
          false
        );

        -- ⭐ جديد: ما ينفعش يطلب تخصيص لإضافة مبتقبلوش.
        --
        -- ده مش تحقق تجميلي: من غيره، طلب مباشر للقاعدة يقدر يحطّ أي
        -- إضافة في `customized_addon_ids` ويدفع فرقًا على حاجة مالهاش
        -- تخصيص أصلًا — أو الإدارة تلاقي طلبًا فيه تخصيص لمنتج مش
        -- بيتخصّص ومش عارفة تنفّذه.
        IF v_addon_custom AND NOT v_addon.supports_customization THEN
          RAISE EXCEPTION 'الإضافة «%» مبتقبلش تخصيص', v_addon.name;
        END IF;

        v_addon_price := v_addon.price
          + CASE WHEN v_addon_custom THEN v_addon.customization_price ELSE 0 END;

        v_addons_total := v_addons_total + v_addon_price;
        v_addons_snap  := v_addons_snap || jsonb_build_object(
          'id',    v_addon.id,
          'name',  v_addon.name,
          'price', v_addon_price,
          -- ⭐ جديد: الإدارة لازم تعرف تنفّذ إيه بالظبط
          'customized', v_addon_custom
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

-- الصلاحيات زي ما كانت: المسجَّل بس (ملف 82 سحبها من الزائر).
REVOKE ALL ON FUNCTION public.create_customer_order(jsonb, jsonb)
  FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_customer_order(jsonb, jsonb)
  TO authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  SELECT
    '1. الأعمدة'::text AS القسم,
    c.column_name::text AS البند,
    (c.data_type || '  ·  افتراضي: ' || coalesce(c.column_default, '—'))::text
      AS التفاصيل,
    '✓ اتضاف'::text AS الحالة
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'addon_products'
    AND c.column_name IN ('supports_customization', 'customization_price')

  UNION ALL

  SELECT
    '2. القيد',
    'addon_customization_price_check',
    'سعر التخصيص ما ينفعش يبقى سالبًا',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'addon_customization_price_check'
    ) THEN '✓ موجود' ELSE '✗ ناقص' END

  UNION ALL

  SELECT
    '3. الدالة',
    'create_customer_order',
    'بتقرا customized_addon_ids: '
      || CASE WHEN pg_get_functiondef(
                   'public.create_customer_order(jsonb,jsonb)'::regprocedure
                 ) LIKE '%customized_addon_ids%'
              THEN 'نعم' ELSE 'لأ' END
      || '  ·  بترفض التخصيص غير المدعوم: '
      || CASE WHEN pg_get_functiondef(
                   'public.create_customer_order(jsonb,jsonb)'::regprocedure
                 ) LIKE '%مبتقبلش تخصيص%'
              THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN pg_get_functiondef(
                'public.create_customer_order(jsonb,jsonb)'::regprocedure
              ) LIKE '%customized_addon_ids%'
         THEN '✓ اتحدّثت' ELSE '✗ القديمة' END

  UNION ALL

  SELECT
    '4. الصلاحيات',
    'create_customer_order',
    'anon: ' || CASE WHEN has_function_privilege(
                       'anon',
                       'public.create_customer_order(jsonb,jsonb)'::regprocedure,
                       'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END
    || '  ·  authenticated: ' || CASE WHEN has_function_privilege(
                       'authenticated',
                       'public.create_customer_order(jsonb,jsonb)'::regprocedure,
                       'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN NOT has_function_privilege(
                'anon',
                'public.create_customer_order(jsonb,jsonb)'::regprocedure,
                'EXECUTE')
         THEN '✓ الزائر ممنوع' ELSE '✗ الزائر لسه ينفّذها' END

  UNION ALL

  SELECT
    '5. الإضافات الحالية',
    a.name::text,
    a.price::text || ' ج.م'
      || CASE WHEN a.supports_customization
              THEN '  ·  بتخصيص: +' || a.customization_price::text || ' ج.م'
              ELSE '  ·  بلا تخصيص' END,
    '— للمراجعة'
  FROM public.addon_products a
  WHERE a.is_active = true

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ إرجاع الدالة لنسخة ملف 50 بيلغي قراءة `customized_addon_ids`،
--    فأي طلب جديد هيتحاسب بلا فرق التخصيص. شغّل ملف 50 من أوله لو
--    احتجت ترجع.
--
-- BEGIN;
-- ALTER TABLE public.addon_products
--   DROP CONSTRAINT IF EXISTS addon_customization_price_check;
-- ALTER TABLE public.addon_products DROP COLUMN IF EXISTS customization_price;
-- ALTER TABLE public.addon_products DROP COLUMN IF EXISTS supports_customization;
-- COMMIT;
-- ============================================================
