-- ============================================================
-- 74 — طلبات الأبناء وموافقة ولي الأمر
-- ============================================================
--
-- المشكلة:
--
--   فتحنا حسابات دخول للأطفال، وحساب الطفل كان يقدر يشتري ويحجز ويرفع
--   إيصالات زي أي عميل — لأن **ولا دالة واحدة في المشروع (من 89) بتفرّق
--   بين دور `student` ودور `customer`**.
--
--   اتقفل الطريق المباشر في الكود. والمقصود مش المنع: الطفل يطلب،
--   والطلب يروح لولي أمره في المركز العائلي، يوافق أو يعدّل، وبعدين
--   يروح لمرحلة الدفع.
--
-- ── الجدول ──────────────────────────────────────────────────
--
--   `dependent_requests` — «الطفل عايز إيه»، ومش طلبًا ولا حجزًا.
--
--   ليه جدول مستقل مش عمود «بانتظار الموافقة» على `service_orders`:
--     • الطلب ممكن يترفض ومايتحوّلش لأي حاجة
--     • ولي الأمر ممكن يعدّل (مقدّم خدمة تاني، أو باقة تانية) قبل ما
--       يوافق — فاللي بيتعمل في الآخر مش بالضرورة اللي الطفل طلبه
--     • خلط «رغبة» بـ«طلب مدفوع» في جدول واحد بيلخبط كل تقرير مالي
--
--   الموافقة **مابتعملش الطلب تلقائيًا**: بتوصّل ولي الأمر لنفس شاشة
--   الطلب العادية بالبيانات جاهزة، ويكمّل الدفع زي أي عملية. كده مسار
--   الشراء واحد، مش اتنين بيتفرّعوا.
--
-- ── الصلاحيات ───────────────────────────────────────────────
--
--   الطفل: يقرا ويعمل طلباته هو.
--   ولي الأمر: يقرا ويعدّل طلبات أبنائه.
--   الإدارة: تقرا كل حاجة.
--
--   الربط بيتم عبر `child_profiles`، فالسياسات بتعدّي عليه. دالة
--   `SECURITY DEFINER` بتتجنّب أي تكرار بين السياسات.
--
-- **جدول جديد بالكامل. مفيش صف قايم بيتغيّر.**
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.dependent_requests (
  id                    text PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- فرد العائلة صاحب الطلب، وولي أمره. الاتنين محفوظين عشان الطلب
  -- يفضل مفهوم حتى لو الحساب اتقفل بعدين.
  child_profile_id      text        NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  guardian_profile_id   text        NOT NULL,
  -- حساب الطفل اللي بعت الطلب — للسجل. فاضي لو ولي الأمر سجّله بنفسه.
  requester_profile_id  text,

  kind                  text        NOT NULL,
  -- خدمة إبداعية
  service_id            text        REFERENCES public.standalone_services(id) ON DELETE SET NULL,
  provider_id           text        REFERENCES public.service_providers(id)   ON DELETE SET NULL,
  -- باقة
  package_id            text        REFERENCES public.creative_writing_packages(id) ON DELETE SET NULL,
  instructor_id         text        REFERENCES public.instructors(id) ON DELETE SET NULL,
  preferred_slot        jsonb,

  -- رسالة الطفل: «عايز الخدمة دي عشان…»
  note                  text,
  status                text        NOT NULL DEFAULT 'pending',
  -- رد ولي الأمر عند الرفض أو التعديل
  guardian_note         text,
  decided_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT dependent_requests_kind_check
    CHECK (kind IN ('service', 'package')),
  CONSTRAINT dependent_requests_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  -- طلب خدمة لازم معاه خدمة، وطلب باقة لازم معاه باقة. ده بيمنع صف
  -- نصّه مظبوط ونصّه لأ.
  CONSTRAINT dependent_requests_target_check
    CHECK (
      (kind = 'service' AND service_id IS NOT NULL AND package_id IS NULL)
      OR
      (kind = 'package' AND package_id IS NOT NULL AND service_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS dependent_requests_guardian_idx
  ON public.dependent_requests (guardian_profile_id, status);
CREATE INDEX IF NOT EXISTS dependent_requests_child_idx
  ON public.dependent_requests (child_profile_id, status);

-- ------------------------------------------------------------
-- من يرى الطلب؟
--
-- SECURITY DEFINER عشان السياسة تقرا `child_profiles` من غير ما تعتمد
-- على سياسات الجدول ده — نفس أسلوب `instructor_teaches`، وبيمنع أي
-- تكرار متبادل بين السياسات.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_see_dependent_request(p_child_profile_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM child_profiles c
    WHERE c.id = p_child_profile_id
      AND (
        -- ولي الأمر
        c.user_profile_id = (auth.uid())::text
        -- أو الطفل نفسه بحسابه
        OR c.account_profile_id = (auth.uid())::text
      )
  ) OR public.is_admin();
$function$;

REVOKE ALL ON FUNCTION public.can_see_dependent_request(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.can_see_dependent_request(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_see_dependent_request(text) TO authenticated;

ALTER TABLE public.dependent_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family can read dependent requests" ON public.dependent_requests;
CREATE POLICY "Family can read dependent requests"
  ON public.dependent_requests
  FOR SELECT
  USING (public.can_see_dependent_request(child_profile_id));

-- الطفل وولي الأمر يقدروا يعملوا طلب. التحقق إن الطفل ده تابع فعلًا
-- بيتم في الكود كمان — دي طبقة تانية مش الوحيدة.
DROP POLICY IF EXISTS "Family can create dependent requests" ON public.dependent_requests;
CREATE POLICY "Family can create dependent requests"
  ON public.dependent_requests
  FOR INSERT
  WITH CHECK (public.can_see_dependent_request(child_profile_id));

-- **ولي الأمر وحده** هو اللي بيبتّ. الطفل مايقدرش يوافق لنفسه.
DROP POLICY IF EXISTS "Guardians decide dependent requests" ON public.dependent_requests;
CREATE POLICY "Guardians decide dependent requests"
  ON public.dependent_requests
  FOR UPDATE
  USING (
    guardian_profile_id = (auth.uid())::text OR public.is_admin()
  )
  WITH CHECK (
    guardian_profile_id = (auth.uid())::text OR public.is_admin()
  );

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT القسم, البند, النتيجة FROM (
  SELECT '1. الجدول'::text AS القسم, 'dependent_requests'::text AS البند,
         CASE WHEN EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                           WHERE n.nspname='public' AND c.relname='dependent_requests')
              THEN 'موجود ✓' ELSE 'ناقص ✗' END AS النتيجة
  UNION ALL
  SELECT '2. الحماية', 'RLS',
         CASE WHEN EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                           WHERE n.nspname='public' AND c.relname='dependent_requests'
                             AND c.relrowsecurity)
              THEN 'مفعّلة ✓' ELSE '⚠️ مطفية — الجدول مفتوح' END
  UNION ALL
  SELECT '3. السياسات', 'عددها',
         (SELECT count(*)::text FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
          WHERE c.relname='dependent_requests') || ' (المتوقع 3)'
  UNION ALL
  SELECT '4. القيود', 'عددها',
         (SELECT count(*)::text FROM pg_constraint pc JOIN pg_class c ON c.oid=pc.conrelid
          WHERE c.relname='dependent_requests' AND pc.contype='c') || ' قيد تحقق (المتوقع 3)'
  UNION ALL
  SELECT '5. الدالة', 'can_see_dependent_request',
         CASE WHEN EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                           WHERE n.nspname='public' AND p.proname='can_see_dependent_request'
                             AND NOT has_function_privilege('anon', p.oid, 'EXECUTE'))
              THEN 'موجودة والزوار ممنوعين ✓' ELSE '⚠️ راجعها' END
) t ORDER BY القسم;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
-- ============================================================
-- BEGIN;
-- DROP TABLE IF EXISTS public.dependent_requests;
-- DROP FUNCTION IF EXISTS public.can_see_dependent_request(text);
-- COMMIT;
