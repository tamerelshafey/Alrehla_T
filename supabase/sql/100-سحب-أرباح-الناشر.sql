-- ============================================================
-- 100 — سحب أرباح الناشر، وحارس المبلغ في القاعدة
-- ============================================================
--
-- ── اللي التشخيص (ملف 99) أثبته ─────────────────────────────
--
--   • `withdrawal_requests` متبني للمدرب وحده:
--       `instructor_id text NOT NULL`
--       `FOREIGN KEY → instructors(id) ON DELETE CASCADE`
--   • السياسات تلاتة: إدراج المدرب لنفسه · قراءته لصفوفه ·
--     مدير النظام على الكل
--   • ربط الحساب بالناشر بيتعمل كده في `publisher_payouts`:
--       `EXISTS (SELECT 1 FROM publishers
--                 WHERE publishers.id = ... AND user_id = auth.uid())`
--     — **نفس شكل المدرب بالظبط**، فبنمشي عليه بدل ما نخترع تالت.
--   • ناشران، الاتنين ليهم حسابات دخول. والجدولان **فاضيان**.
--
-- ⚠️ **والجدول فاضي ده مهم**: التعديل ده مالوش أي أثر رجعي على صف
--    قائم — لا مستحق ولا طلب سحب.
--
-- ── اللي بيتعمل ─────────────────────────────────────────────
--
--   ١. `publisher_id` + `instructor_id` يقبل الفراغ + قيد «واحد بس»
--   ٢. سياستان للناشر، بنفس شكل سياستَي المدرب
--   ٣. **حارس المبلغ** — وده الجزء الأهم
--
-- ── ٣ ليه أهم من ١ و٢ ───────────────────────────────────────
--
-- ⚠️ **سياسة الإدراج الحالية بتسمح للمدرب يكتب أي مبلغ.**
--
--    شرطها: `status = 'pending'` و«الصف ده بتاعي». **ومفيش أي شرط
--    على `amount`** — والصلاحيات بتحمي **الصفوف** لا **الأعمدة**
--    (قاعدة «ب»)، فمفيش سياسة تقدر تقيّد المبلغ أصلًا.
--
--    الكود بيحسب الرصيد من القاعدة صح، بس الكود مش الحارس: أي حد
--    معاه مفتاح الموقع العام — **وهو في صفحة الموقع نفسها** — يقدر
--    يكلّم القاعدة مباشرة ويقدّم طلب سحب بمليون جنيه.
--
--    والطلب ده هيوصل للإدارة **شكله سليم تمامًا**: حالة «معلّق»،
--    ومدرب حقيقي، وبيانات تحويل. ومحدّش هيلاحظ غير لو حد قعد يقارن
--    بالرصيد بإيده.
--
--    ده البند المسجَّل عندنا من زمان بـ«حارس قاعدة على مبلغ طلب
--    السحب — اليوم حارس تطبيق فقط». بيتقفل هنا.
--
-- ⚠️ **والحارس بيكتب المبلغ، مش بيتحقق منه.**
--
--    التحقق معناه «لو الرقم غلط ارفض» — والرفض بيدي المهاجم معلومة
--    (الرصيد الصح) ويدي المدرب الشريف رسالة خطأ لو الرصيد اتغيّر
--    بين ما فتح الشاشة وضغط. الكتابة أبسط وأأمن: **المبلغ بيتحسب من
--    القاعدة ويستبدل اللي جه**، مهما كان.
--
-- ⚠️ **والحارس بيمنع الطلب التاني كمان** — دي كانت في الكود وحده
--    برضه، ومن غيرها ينفع تتقدّم عشر طلبات على نفس الرصيد.
-- ============================================================

BEGIN;

-- ── ١) مكان الناشر في الجدول ───────────────────────────────

ALTER TABLE public.withdrawal_requests
  ALTER COLUMN instructor_id DROP NOT NULL;

ALTER TABLE public.withdrawal_requests
  ADD COLUMN IF NOT EXISTS publisher_id text
    REFERENCES public.publishers(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.withdrawal_requests.publisher_id IS
  'صاحب الطلب لما يكون ناشرًا. واحد بس من `instructor_id` و`publisher_id` بيكون متملّي (ملف 100).';

-- ⚠️ **القيد ده هو اللي بيمنع الصف الملتبس**: لا صف بلا صاحب، ولا
--    صف بصاحبين. من غيره، `DROP NOT NULL` بيفتح باب لصفوف يتيمة.
ALTER TABLE public.withdrawal_requests
  DROP CONSTRAINT IF EXISTS withdrawal_requests_owner_check;

ALTER TABLE public.withdrawal_requests
  ADD CONSTRAINT withdrawal_requests_owner_check
  CHECK (
    (instructor_id IS NOT NULL AND publisher_id IS NULL)
    OR
    (instructor_id IS NULL AND publisher_id IS NOT NULL)
  );


-- ── ٢) سياسات الناشر ───────────────────────────────────────
--
-- ⚠️ **السياسات بتتجمع بـ«أو»** (قاعدة «أ»). فسياسة المدرب بتفضل
--    زي ما هي، ودي بتضيف طريقًا تانيًا — ومحدّش منهم بيوسّع التاني:
--    شرط المدرب بيفشل على صف الناشر (لأن `instructor_id` فاضي)
--    والعكس.

DROP POLICY IF EXISTS "Publishers file their own withdrawal requests"
  ON public.withdrawal_requests;

CREATE POLICY "Publishers file their own withdrawal requests"
  ON public.withdrawal_requests
  FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.publishers p
       WHERE p.id = withdrawal_requests.publisher_id
         AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Publishers view their own withdrawal requests"
  ON public.withdrawal_requests;

CREATE POLICY "Publishers view their own withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.publishers p
       WHERE p.id = withdrawal_requests.publisher_id
         AND p.user_id = auth.uid()
    )
  );


-- ── ٣) حارس المبلغ ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.guard_withdrawal_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_available numeric := 0;
  v_open      integer := 0;
BEGIN
  -- الحالة الابتدائية مش اختيارية.
  NEW.status := 'pending';

  IF NEW.instructor_id IS NOT NULL THEN
    SELECT COALESCE(sum(amount), 0) INTO v_available
      FROM instructor_payouts
     WHERE instructor_id = NEW.instructor_id
       AND status = 'pending';

    SELECT count(*) INTO v_open
      FROM withdrawal_requests
     WHERE instructor_id = NEW.instructor_id
       AND status = 'pending';

  ELSIF NEW.publisher_id IS NOT NULL THEN
    SELECT COALESCE(sum(amount), 0) INTO v_available
      FROM publisher_payouts
     WHERE publisher_id = NEW.publisher_id
       AND status = 'pending';

    SELECT count(*) INTO v_open
      FROM withdrawal_requests
     WHERE publisher_id = NEW.publisher_id
       AND status = 'pending';

  ELSE
    -- القيد بتاع القسم ١ بيمسك دي، والسطر ده حزام أمان.
    RAISE EXCEPTION 'طلب السحب لازم يكون لمدرب أو ناشر';
  END IF;

  IF v_open > 0 THEN
    RAISE EXCEPTION 'فيه طلب سحب مستني المراجعة خلاص';
  END IF;

  IF v_available <= 0 THEN
    RAISE EXCEPTION 'مفيش رصيد قابل للسحب';
  END IF;

  -- ⚠️ **المبلغ بيتكتب، مش بيتفحص.** اللي جه من العميل بيتجاهل
  --    تمامًا — مفيش فرق بين طلب بمليون وطلب بالرقم الصح: الاتنين
  --    بيتسجّلوا بالرصيد الحقيقي.
  NEW.amount := v_available;

  RETURN NEW;
END
$function$;

COMMENT ON FUNCTION public.guard_withdrawal_request() IS
  'بتكتب مبلغ طلب السحب من الرصيد الحقيقي وبتمنع الطلب التاني. المبلغ الجاي من العميل بيتجاهل (ملف 100).';

DROP TRIGGER IF EXISTS guard_withdrawal_request_trg ON public.withdrawal_requests;

CREATE TRIGGER guard_withdrawal_request_trg
  BEFORE INSERT ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.guard_withdrawal_request();

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الأعمدة
  SELECT
    '1. الأعمدة'::text AS القسم,
    c.column_name::text AS البند,
    (c.data_type
      || CASE WHEN c.is_nullable = 'NO' THEN '  ·  مطلوب' ELSE '  ·  يقبل الفراغ' END)::text
      AS التفاصيل,
    CASE
      WHEN c.column_name = 'instructor_id' AND c.is_nullable = 'YES' THEN '✓ بقى يقبل الفراغ'
      WHEN c.column_name = 'publisher_id' THEN '✓ اتضاف'
      ELSE '—'
    END AS الحالة
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = 'withdrawal_requests'
    AND c.column_name IN ('instructor_id', 'publisher_id', 'amount', 'status')

  UNION ALL

  -- ٢) قيد «واحد بس»
  SELECT
    '2. القيود',
    con.conname::text,
    pg_get_constraintdef(con.oid)::text,
    CASE WHEN con.conname = 'withdrawal_requests_owner_check'
         THEN '✓ صاحب واحد لا أكتر ولا أقل' ELSE '— قائم' END
  FROM pg_constraint con
  WHERE con.conrelid = 'public.withdrawal_requests'::regclass
    AND con.contype = 'c'

  UNION ALL

  -- ٣) السياسات — القديمة زي ما هي والجديدة جنبها
  SELECT
    '3. السياسات',
    p.policyname::text,
    (p.cmd || '  ·  ' || COALESCE(p.qual, p.with_check, '—'))::text,
    CASE WHEN p.policyname LIKE 'Publishers%' THEN '✓ جديدة' ELSE '✓ زي ما هي' END
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'withdrawal_requests'

  UNION ALL

  -- ٤) الحارس شغّال؟
  SELECT
    '4. حارس المبلغ',
    COALESCE(tg.tgname, '(المحفّز مش موجود)')::text,
    CASE WHEN tg.tgname IS NULL THEN 'المبلغ لسه بيتاخد زي ما جه'
         ELSE 'BEFORE INSERT · ' || pr.proname END,
    CASE WHEN tg.tgname IS NULL THEN '✗ ناقص' ELSE '✓ شغّال' END
  FROM (SELECT 1) one
  LEFT JOIN pg_trigger tg
    ON tg.tgrelid = 'public.withdrawal_requests'::regclass
   AND tg.tgname = 'guard_withdrawal_request_trg'
   AND NOT tg.tgisinternal
  LEFT JOIN pg_proc pr ON pr.oid = tg.tgfoid

  UNION ALL

  -- ٥) نسخة واحدة من الدالة (قاعدة «س»)
  SELECT
    '5. الدالة',
    pr.proname::text,
    ((CASE WHEN pr.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)
      || '  ·  search_path: ' || COALESCE(array_to_string(pr.proconfig, ', '), '(غير مضبوط)')
      || '  ·  نسخ: ' || count(*) OVER (PARTITION BY pr.proname)::text)::text,
    CASE WHEN pr.prosecdef AND pr.proconfig IS NOT NULL THEN '✓ سليمة' ELSE '✗ راجع' END
  FROM pg_proc pr
  JOIN pg_namespace n ON n.oid = pr.pronamespace
  WHERE n.nspname = 'public' AND pr.proname = 'guard_withdrawal_request'

  UNION ALL

  -- ٦) الصفوف ما اتلمستش
  SELECT
    '6. الصفوف',
    'withdrawal_requests',
    'إجمالي: ' || (SELECT count(*)::text FROM public.withdrawal_requests)
      || '  ·  لمدربين: '
      || (SELECT count(*)::text FROM public.withdrawal_requests WHERE instructor_id IS NOT NULL)
      || '  ·  لناشرين: '
      || (SELECT count(*)::text FROM public.withdrawal_requests WHERE publisher_id IS NOT NULL),
    'للمراجعة'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ شيل الحارس بيرجّع الثغرة: أي حد يقدر يقدّم طلب سحب بأي مبلغ.
-- ⚠️ ورجوع `NOT NULL` هيفشل لو في طلب ناشر واحد مسجَّل.
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS guard_withdrawal_request_trg ON public.withdrawal_requests;
-- DROP FUNCTION IF EXISTS public.guard_withdrawal_request();
-- DROP POLICY IF EXISTS "Publishers file their own withdrawal requests" ON public.withdrawal_requests;
-- DROP POLICY IF EXISTS "Publishers view their own withdrawal requests" ON public.withdrawal_requests;
-- ALTER TABLE public.withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_owner_check;
-- -- ALTER TABLE public.withdrawal_requests DROP COLUMN publisher_id;
-- -- ALTER TABLE public.withdrawal_requests ALTER COLUMN instructor_id SET NOT NULL;
-- COMMIT;
-- ============================================================
