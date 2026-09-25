-- ============================================================
-- 92 — بيانات التحويل في طلب السحب
-- ============================================================
--
-- ── العطل ───────────────────────────────────────────────────
--
-- شاشة «طلب سحب» عند المدرب فيها خانات مطلوبة:
--
--     تحويل بنكي  →  اسم البنك · رقم الحساب أو الآيبان
--     محفظة       →  رقم المحفظة
--
-- والخانات دي **مش مربوطة بأي حالة، ومبتتبعتش للخادم خالص**. مكتوب
-- عليها `required` فالمتصفح بيمنع الإرسال من غيرها، والمدرب بيملاها،
-- وبعدين الكود بيبعت `method` وبس.
--
-- فالنتيجة: الإدارة بتشوف طلب سحب مكتوب عليه «تحويل بنكي» **من غير
-- رقم حساب**. يعني الطلب وصل ومينفعش يتنفّذ، ولازم حد يكلّم المدرب
-- يسأله على بياناته.
--
-- والجدول `withdrawal_requests` مفيهوش عمود للبيانات دي أصلًا —
-- الأعمدة الموجودة: `instructor_id`, `amount`, `method`, `status`,
-- `admin_notes`. فحتى لو الكود بعتها، مكانش فيه مكان تتخزّن فيه.
--
-- ── اللي بيتعمل هنا ─────────────────────────────────────────
--
-- عمود `payout_details` نصّي، بيتضاف فاضي والصفوف القديمة زي ما هي.
--
-- ⚠️ **ليه نص واحد مش أعمدة منفصلة (بنك / حساب / محفظة)؟**
--
--    لأن شكل البيانات بيختلف باختلاف الطريقة، والطرق ممكن تزيد
--    (إنستاباي، فودافون كاش، تحويل دولي). أعمدة منفصلة معناها عمود
--    جديد مع كل طريقة، وأغلبها فاضي في أغلب الصفوف.
--
--    والبيانات دي **الإدارة بتقراها بعينها وتنفّذ التحويل بإيدها** —
--    مفيش حساب ولا بحث عليها. فالنص المنسَّق كفاية.
--
-- ⚠️ **وملاحظة على الخصوصية:** العمود ده هيشيل أرقام حسابات بنكية
--    وأرقام محافظ. والصلاحيات على الجدول هي اللي بتحميه، فمتتوسّعش
--    سياسات `withdrawal_requests` من غير ما تراجع ده تحديدًا.
--    القسم ٣ في استعلام التأكيد بيطبع السياسات الحالية عشان تبقى
--    تحت عينك.
-- ============================================================

BEGIN;

ALTER TABLE public.withdrawal_requests
  ADD COLUMN IF NOT EXISTS payout_details text;

COMMENT ON COLUMN public.withdrawal_requests.payout_details IS
  'بيانات التحويل اللي المدرب كتبها (اسم البنك والحساب، أو رقم المحفظة). نص منسَّق — الإدارة بتقراه وتنفّذ. فيه بيانات حساسة (ملف 92).';

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) العمود
  SELECT
    '1. العمود'::text AS القسم,
    'payout_details'::text AS البند,
    COALESCE((SELECT data_type FROM information_schema.columns
               WHERE table_schema = 'public'
                 AND table_name = 'withdrawal_requests'
                 AND column_name = 'payout_details'), '(مش موجود)')::text AS التفاصيل,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'withdrawal_requests'
         AND column_name = 'payout_details'
    ) THEN '✓ اتضاف' ELSE '✗ ناقص' END AS الحالة

  UNION ALL

  -- ٢) الصفوف القديمة ما اتلمستش
  SELECT
    '2. الصفوف الحالية',
    'withdrawal_requests',
    'إجمالي الطلبات: ' || (SELECT count(*)::text FROM public.withdrawal_requests)
      || '  ·  منها معلّق: '
      || (SELECT count(*)::text FROM public.withdrawal_requests WHERE status = 'pending'),
    'للمراجعة'

  UNION ALL

  -- ٣) السياسات — تحت عينك لأن العمود فيه بيانات حساسة
  SELECT
    '3. صلاحيات الجدول',
    p.policyname::text,
    (p.cmd || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  ' || COALESCE(p.qual, p.with_check, '—'))::text,
    CASE
      WHEN p.cmd = 'SELECT' AND btrim(lower(coalesce(p.qual,''))) IN ('true','(true)')
        THEN '⚠️ قراءة مفتوحة — راجع فورًا'
      ELSE '✓'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'withdrawal_requests'

  UNION ALL

  -- ٤) RLS مفعّلة؟
  SELECT
    '4. حماية الجدول',
    'withdrawal_requests',
    CASE WHEN t.rowsecurity THEN 'RLS مفعّلة' ELSE 'RLS متوقفة' END,
    CASE WHEN t.rowsecurity THEN '✓ سليم' ELSE '✗ خطر — الجدول فيه بيانات بنكية' END
  FROM pg_tables t
  WHERE t.schemaname = 'public' AND t.tablename = 'withdrawal_requests'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ التراجع بيمسح بيانات التحويل اللي المدربين كتبوها.
--
-- BEGIN;
-- ALTER TABLE public.withdrawal_requests DROP COLUMN payout_details;
-- COMMIT;
-- ============================================================
