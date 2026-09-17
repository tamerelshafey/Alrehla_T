-- ============================================================
-- 30 — نظام «مقدّمي الخدمة» (المرحلة الأولى: قاعدة البيانات)
-- ============================================================
--
-- المشكلة:
--   مقدّم الخدمة في النظام الحالي **لازم يكون مدرب**. عمود الطلب اسمه
--   instructor_id وبيشاور على جدول instructors. فمفيش طريقة إن المنصة
--   نفسها تقدّم خدمة، ولا إن حد يقدّم خدمة من غير ما يبقى مدرب.
--
-- الحل:
--   جدولين جداد:
--     service_providers  — مين يقدر يقدّم خدمة (المنصة / مدرب / مستقل)
--     provider_services  — إيه الخدمات اللي بيقدّمها وبكام
--   وعمود provider_id على الطلبات، جنب instructor_id القديم.
--
-- ليه ده آمن دلوقتي:
--   التشخيص (ملف 29) أثبت إن عدد طلبات الخدمات = **صفر**. مفيش طلب
--   عميل ولا فلوس معرّضة للنقل. ده أنسب وقت للتغيير ده، ومش هيتكرر.
--
-- الملف ده **إضافة بالكامل**:
--   ما بيمسحش جدول، ولا عمود، ولا صف. instructor_id بيفضل مكانه
--   شغّال، والموقع هيفضل يشتغل زي ما هو لحد ما الكود يتغيّر (مرحلة 3).
--
-- الأنواع:
--   كل المعرّفات نصّية (text) — ده النمط الموجود في المشروع كله، مش
--   اختيار جديد. والاتساق هنا أهم من «الصح نظريًا».
--
-- الحماية:
--   الجدولين الجداد عليهم صلاحيات ومحفّظات من أول لحظة. جدول من غير
--   حماية = باب مفتوح، حتى لو الشاشات لسه ما بُنيتش.
-- ============================================================

BEGIN;

-- ── الأنواع ─────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_kind') THEN
    CREATE TYPE provider_kind AS ENUM ('platform', 'instructor', 'individual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_status') THEN
    CREATE TYPE provider_status AS ENUM ('pending', 'active', 'suspended');
  END IF;
END $$;


-- ── جدول مقدّمي الخدمة ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.service_providers (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  kind          provider_kind   NOT NULL,
  -- مقدّم مستقل: صاحب الحساب. المنصة والمدرب: فاضي (المدرب بيوصل
  -- لحسابه من خلال instructor_id).
  user_id       uuid            REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  instructor_id text            REFERENCES public.instructors(id)   ON DELETE CASCADE,
  display_name  text            NOT NULL,
  bio           text            NOT NULL DEFAULT '',
  avatar_url    text,
  status        provider_status NOT NULL DEFAULT 'pending',
  -- المستقل بيظهر في قايمة اختيار مقدّم الخدمة بس — مالوش صفحة عامة.
  -- المدرب ليه صفحته الأصلية، فالعمود ده بيفضل false ليه كمان.
  is_public     boolean         NOT NULL DEFAULT false,
  created_at    timestamptz     NOT NULL DEFAULT now(),
  updated_at    timestamptz     NOT NULL DEFAULT now(),

  -- كل نوع لازم يبقى مربوط صح: المنصة مالهاش حساب ولا مدرب،
  -- والمدرب لازم يكون مربوط بصف مدرب، والمستقل لازم يكون له حساب.
  CONSTRAINT service_providers_kind_shape CHECK (
    (kind = 'platform'   AND user_id IS NULL     AND instructor_id IS NULL) OR
    (kind = 'instructor' AND instructor_id IS NOT NULL) OR
    (kind = 'individual' AND user_id IS NOT NULL AND instructor_id IS NULL)
  )
);

-- مقدّم واحد بس اسمه «المنصة».
CREATE UNIQUE INDEX IF NOT EXISTS service_providers_one_platform
  ON public.service_providers ((kind)) WHERE kind = 'platform';

-- مدرب واحد = صف مقدّم واحد.
CREATE UNIQUE INDEX IF NOT EXISTS service_providers_instructor_unique
  ON public.service_providers (instructor_id) WHERE instructor_id IS NOT NULL;

-- حساب واحد = مقدّم مستقل واحد.
CREATE UNIQUE INDEX IF NOT EXISTS service_providers_user_unique
  ON public.service_providers (user_id) WHERE user_id IS NOT NULL;


-- ── جدول عروض مقدّمي الخدمة ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.provider_services (
  id             text        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_id    text        NOT NULL REFERENCES public.service_providers(id)   ON DELETE CASCADE,
  service_id     text        NOT NULL REFERENCES public.standalone_services(id) ON DELETE CASCADE,
  -- السعر اللي طلبه المقدّم، والسعر اللي اعتمدته الإدارة. العميل بيشوف
  -- المعتمد بس.
  requested_price numeric,
  approved_price  numeric,
  status         text        NOT NULL DEFAULT 'pending',
  is_active      boolean     NOT NULL DEFAULT true,
  admin_notes    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_services_unique UNIQUE (provider_id, service_id),
  CONSTRAINT provider_services_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'))
);


-- ── أعمدة على جدول الطلبات ──────────────────────────────────

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS provider_id text
    REFERENCES public.service_providers(id) ON DELETE SET NULL;

-- المهلة: بتتحسب وقت تأكيد الدفع (14 يوم افتراضيًا)، وتتعدّل لو
-- الطرفين اتفقوا على غير كده. السبب بيتكتب في due_note عشان يفضل
-- مكتوب ليه المهلة اتغيّرت.
ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS due_at timestamptz;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS due_note text;

CREATE INDEX IF NOT EXISTS service_orders_provider_idx
  ON public.service_orders (provider_id);

-- الطلبات المتأخرة: بحث الإدارة اليومي بيمرّ على ده.
CREATE INDEX IF NOT EXISTS service_orders_due_idx
  ON public.service_orders (due_at)
  WHERE due_at IS NOT NULL;


-- ── نقل الموجود ─────────────────────────────────────────────

-- 1) المنصة كمقدّم خدمة.
INSERT INTO public.service_providers (kind, display_name, bio, status, is_public)
SELECT 'platform', 'منصة الرحلة',
       'الخدمات التي يقدّمها فريق المنصة مباشرة.', 'active', false
WHERE NOT EXISTS (SELECT 1 FROM public.service_providers WHERE kind = 'platform');

-- 2) كل مدرب موجود يبقى له صف مقدّم خدمة.
--    حالته بتتبع حالة المدرب: المدرب الموقوف مقدّم موقوف.
INSERT INTO public.service_providers (kind, instructor_id, display_name, bio, status)
SELECT 'instructor', i.id, i.display_name, COALESCE(i.bio, ''),
       CASE WHEN i.status::text = 'active' THEN 'active'::provider_status
            ELSE 'pending'::provider_status END
FROM public.instructors i
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_providers sp WHERE sp.instructor_id = i.id
);

-- 3) عروض المدربين الحالية تتنسخ كعروض مقدّمين.
--    الأصل بيفضل مكانه — ده نسخ مش نقل.
INSERT INTO public.provider_services
  (provider_id, service_id, requested_price, approved_price, status, is_active, admin_notes)
SELECT sp.id, ins.service_id, ins.requested_price, ins.approved_price,
       CASE WHEN ins.status IN ('pending','approved','rejected') THEN ins.status
            ELSE 'pending' END,
       ins.is_active, ins.admin_notes
FROM public.instructor_services ins
JOIN public.service_providers sp ON sp.instructor_id = ins.instructor_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.provider_services ps
  WHERE ps.provider_id = sp.id AND ps.service_id = ins.service_id
);

-- 4) المنصة تقدّم كل الخدمات.
--    السعر المبدئي = سعر الخدمة المكتوب في جدول الخدمات — ده رقمك
--    إنت مش رقم من عندي. عدّله من اللوحة لأي خدمة تحب سعرها يختلف.
INSERT INTO public.provider_services
  (provider_id, service_id, requested_price, approved_price, status, is_active, admin_notes)
SELECT sp.id, s.id, s.price, s.price, 'approved', true,
       'أُنشئ تلقائيًا بسعر الخدمة المعتمد — يُعدّل من لوحة الإدارة.'
FROM public.service_providers sp
CROSS JOIN public.standalone_services s
WHERE sp.kind = 'platform'
  AND NOT EXISTS (
    SELECT 1 FROM public.provider_services ps
    WHERE ps.provider_id = sp.id AND ps.service_id = s.id
  );

-- 5) الطلبات القائمة تاخد مقدّمها الجديد.
--    (عددها صفر دلوقتي — الأمر موجود عشان الملف يفضل صحيح لو اتشغّل
--     بعدين على نسخة فيها طلبات.)
UPDATE public.service_orders o
SET provider_id = sp.id
FROM public.service_providers sp
WHERE o.instructor_id IS NOT NULL
  AND sp.instructor_id = o.instructor_id
  AND o.provider_id IS NULL;


-- ============================================================
-- الحماية
-- ============================================================

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

-- ── قراءة ───────────────────────────────────────────────────

-- الزائر بيشوف المقدّمين النشطين بس. ده اللي بيملا قايمة الاختيار.
DROP POLICY IF EXISTS "Active providers are readable" ON public.service_providers;
CREATE POLICY "Active providers are readable"
  ON public.service_providers FOR SELECT
  USING (status = 'active');

-- المقدّم بيشوف صفه هو حتى لو لسه مش نشط.
DROP POLICY IF EXISTS "Providers read their own row" ON public.service_providers;
CREATE POLICY "Providers read their own row"
  ON public.service_providers FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.instructors i
               WHERE i.id = service_providers.instructor_id AND i.user_id = auth.uid())
    OR public.is_admin()
  );

-- ── كتابة: الإدارة وحدها ────────────────────────────────────
-- المقدّم ما بيضيفش نفسه ولا بيفعّل نفسه. الإضافة والاعتماد من اللوحة.

DROP POLICY IF EXISTS "Admins insert providers" ON public.service_providers;
CREATE POLICY "Admins insert providers"
  ON public.service_providers FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins or owner update providers" ON public.service_providers;
CREATE POLICY "Admins or owner update providers"
  ON public.service_providers FOR UPDATE
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.instructors i
               WHERE i.id = service_providers.instructor_id AND i.user_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.instructors i
               WHERE i.id = service_providers.instructor_id AND i.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins delete providers" ON public.service_providers;
CREATE POLICY "Admins delete providers"
  ON public.service_providers FOR DELETE USING (public.is_admin());


-- ── عروض الخدمات ────────────────────────────────────────────

-- العميل بيشوف العروض المعتمدة والنشطة بس.
DROP POLICY IF EXISTS "Approved offerings are readable" ON public.provider_services;
CREATE POLICY "Approved offerings are readable"
  ON public.provider_services FOR SELECT
  USING (status = 'approved' AND is_active = true);

DROP POLICY IF EXISTS "Providers read their own offerings" ON public.provider_services;
CREATE POLICY "Providers read their own offerings"
  ON public.provider_services FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      LEFT JOIN public.instructors i ON i.id = sp.instructor_id
      WHERE sp.id = provider_services.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

-- المقدّم يقدر يقترح عرض على نفسه؛ الاعتماد والسعر المعتمد للإدارة
-- (المحفّز تحت هو اللي بيفرض ده فعلًا).
DROP POLICY IF EXISTS "Providers propose their own offerings" ON public.provider_services;
CREATE POLICY "Providers propose their own offerings"
  ON public.provider_services FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      LEFT JOIN public.instructors i ON i.id = sp.instructor_id
      WHERE sp.id = provider_services.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Providers update their own offerings" ON public.provider_services;
CREATE POLICY "Providers update their own offerings"
  ON public.provider_services FOR UPDATE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      LEFT JOIN public.instructors i ON i.id = sp.instructor_id
      WHERE sp.id = provider_services.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      LEFT JOIN public.instructors i ON i.id = sp.instructor_id
      WHERE sp.id = provider_services.provider_id
        AND (sp.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins delete offerings" ON public.provider_services;
CREATE POLICY "Admins delete offerings"
  ON public.provider_services FOR DELETE USING (public.is_admin());


-- ============================================================
-- المحفّزات — الحارس الحقيقي
-- ============================================================
--
-- الصلاحيات فوق بتتحكم في **الصفوف**: مين يقدر يعدّل صفه هو. لكنها
-- ما بتفرّقش بين الأعمدة. من غير المحفّزات دي، مقدّم خدمة يقدر يفتح
-- صفه ويكتب فيه approved_price = 1 أو status = 'active' — لأن الصف
-- صفه فعلًا. المحفّز بيرجّع الأعمدة المحمية لقيمتها القديمة.

CREATE OR REPLACE FUNCTION public.guard_provider_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.uid() فاضي = استدعاء بمفتاح الخدمة من الخادم، والمجهول
  -- مرفوض أصلًا بالصلاحيات. فالحالتين دول آمنين.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- المقدّم يعدّل اسمه ونبذته وصورته. الباقي للإدارة.
  NEW.kind          := OLD.kind;
  NEW.status        := OLD.status;
  NEW.is_public     := OLD.is_public;
  NEW.user_id       := OLD.user_id;
  NEW.instructor_id := OLD.instructor_id;
  NEW.created_at    := OLD.created_at;
  NEW.updated_at    := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_provider_fields_trg ON public.service_providers;
CREATE TRIGGER guard_provider_fields_trg
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.guard_provider_fields();


CREATE OR REPLACE FUNCTION public.guard_provider_service_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- عرض جديد من مقدّم = اقتراح. مش معتمد ومش بسعر معتمد.
    NEW.status         := 'pending';
    NEW.approved_price := NULL;
    NEW.admin_notes    := NULL;
    RETURN NEW;
  END IF;

  -- تعديل: السعر المعتمد وحالة الاعتماد وملاحظات الإدارة مالهمش دعوة
  -- بالمقدّم. هو يقدر يغيّر سعره المطلوب ويوقف عرضه مؤقتًا.
  NEW.status         := OLD.status;
  NEW.approved_price := OLD.approved_price;
  NEW.admin_notes    := OLD.admin_notes;
  NEW.provider_id    := OLD.provider_id;
  NEW.service_id     := OLD.service_id;
  NEW.created_at     := OLD.created_at;
  NEW.updated_at     := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_provider_service_fields_trg ON public.provider_services;
CREATE TRIGGER guard_provider_service_fields_trg
  BEFORE INSERT OR UPDATE ON public.provider_services
  FOR EACH ROW EXECUTE FUNCTION public.guard_provider_service_fields();

-- ── توسيع حارس الطلبات ليغطي الأعمدة الجديدة ────────────────
--
-- المحفّز الموجود على service_orders بيرجّع الأعمدة المحمية لقيمتها
-- القديمة لغير الإدارة. لكنه مش عارف الأعمدة الجديدة، فالمشتري كان
-- هيقدر يفتح طلبه ويغيّر مقدّم الخدمة أو يمدّ المهلة بنفسه — وقاعدة
-- الصلاحيات بتسمح له يعدّل صفه هو.
--
-- النسخة دي **نفس المنطق القديم حرفيًا**، مع حاجتين:
--   • التعرّف على مقدّم الخدمة بقى يشمل المستقل، مش المدرب بس.
--   • provider_id و due_at و due_note انضموا للأعمدة المحمية.

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
    -- المهلة بتتحط وقت تأكيد الدفع، مش وقت إنشاء الطلب.
    NEW.due_at             := NULL;
    NEW.due_note           := NULL;
    RETURN NEW;
  END IF;

  IF is_the_provider THEN
    -- مقدّم الخدمة: من «قيد التنفيذ» إلى «سُلّم» وبس.
    IF NOT (OLD.status = 'in_progress' AND NEW.status = 'delivered') THEN
      NEW.status := OLD.status;
    END IF;
    NEW.transaction_reference := OLD.transaction_reference;
  ELSE
    -- المشتري: انتقالان مسموحان — «حوّلت»، و«استلمت وأأكّد».
    IF OLD.status = 'pending' AND NEW.status = 'awaiting_verification' THEN
      NULL;
    ELSIF OLD.status = 'delivered' AND NEW.status = 'completed' THEN
      NULL;
    ELSE
      NEW.status                := OLD.status;
      NEW.transaction_reference := OLD.transaction_reference;
    END IF;
  END IF;

  -- الفلوس والأطراف والمهلة: محدش غير الإدارة.
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

  RETURN NEW;
END
$$;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT 1 AS n, 'مقدّم خدمة' AS البند,
       sp.display_name || ' — ' || sp.kind::text || ' — ' || sp.status::text ||
       ' — ' || (SELECT COUNT(*) FROM provider_services ps WHERE ps.provider_id = sp.id)::text
       || ' خدمة' AS القيمة
FROM service_providers sp

UNION ALL
SELECT 2, 'عروض معتمدة ونشطة', COUNT(*)::text
FROM provider_services WHERE status = 'approved' AND is_active = true

UNION ALL
SELECT 3, 'أعمدة جديدة على الطلبات',
       string_agg(column_name, '، ' ORDER BY column_name)
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'service_orders'
  AND column_name IN ('provider_id', 'due_at', 'due_note')

UNION ALL
SELECT 4, 'محفّزات الحماية الجديدة', tgname
FROM pg_trigger
WHERE tgname IN ('guard_provider_fields_trg', 'guard_provider_service_fields_trg',
                 'guard_service_order_fields_trg')

UNION ALL
SELECT 5, 'الحماية مفعّلة؟',
       relname || ' → ' || CASE WHEN relrowsecurity THEN 'نعم' ELSE 'لا ✗' END
FROM pg_class
WHERE relname IN ('service_providers', 'provider_services')

ORDER BY n, البند, القيمة;
