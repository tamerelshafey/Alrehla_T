-- ============================================================
-- 51 — نوع الطفل + طلبات حذف الحساب
-- ============================================================
--
-- حاجتين مستقلتين في ملف واحد لأنهم الاتنين صغيّرين:
--
-- 1) نوع الطفل (ذكر/أنثى)
--    المعالج بيسأل عن النوع فعلًا… وبيرمي الإجابة. مفيش عمود نوع في
--    `child_profiles` أصلًا، فمفيش مكان تشوفه أو تعدّله منه. والقصة
--    المخصّصة محتاجاه في الصياغة.
--
-- 2) طلبات حذف الحساب (قرارك: طلب للإدارة مش حذف فوري)
--    مفيش أي طريقة دلوقتي للعميل إنه يطلب حذف حسابه.
--    الحذف الفوري خطر: الحساب ممكن يكون عليه طلبات مدفوعة أو مستحقات،
--    وحذفه بيسيب سجلات بلا صاحب. فالعميل بيطلب، وإنت بتراجع وتنفّذ.
--
--    الجدول ده **بيسجّل الطلب بس**. الحذف نفسه بيتم منك يدويًا بعد
--    المراجعة — ومفيش دالة حذف تلقائي هنا عن قصد.
--
-- مفيش صف بيانات قديم بيتغيّر.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) نوع الطفل
-- ------------------------------------------------------------
ALTER TABLE public.child_profiles
  ADD COLUMN IF NOT EXISTS gender text;

ALTER TABLE public.child_profiles
  DROP CONSTRAINT IF EXISTS child_profiles_gender_check,
  ADD CONSTRAINT child_profiles_gender_check
  CHECK (gender IS NULL OR gender IN ('male', 'female'));

COMMENT ON COLUMN public.child_profiles.gender IS
  'ذكر/أنثى — تُستخدم في صياغة القصة. كانت تُجمع في المعالج وتُهمل.';


-- ------------------------------------------------------------
-- 2) طلبات حذف الحساب
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id           text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       text,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'done', 'rejected')),
  admin_notes  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  handled_at   timestamptz,
  handled_by   uuid
);

-- طلب مفتوح واحد لكل حساب: تكرار الطلب مش معناه استعجال، معناه لخبطة
-- في قايمة المراجعة.
CREATE UNIQUE INDEX IF NOT EXISTS account_deletion_one_open_per_user
  ON public.account_deletion_requests (user_id)
  WHERE status = 'pending';

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users file their own deletion request"  ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Users read their own deletion requests"  ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Admins manage deletion requests"         ON public.account_deletion_requests;

CREATE POLICY "Users file their own deletion request"
  ON public.account_deletion_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Users read their own deletion requests"
  ON public.account_deletion_requests
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- الإدارة بس هي اللي بتقفل الطلب أو ترفضه.
CREATE POLICY "Admins manage deletion requests"
  ON public.account_deletion_requests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT 'عمود نوع الطفل' AS البند,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='child_profiles' AND column_name='gender')
            THEN 'موجود ✓' ELSE 'مش موجود ✗' END AS النتيجة
UNION ALL
SELECT 'جدول طلبات الحذف',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
                          WHERE table_schema='public' AND table_name='account_deletion_requests')
            THEN 'موجود ✓' ELSE 'مش موجود ✗' END
UNION ALL
SELECT 'حماية جدول الطلبات',
       CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname='account_deletion_requests')
            THEN 'مفعّلة ✓' ELSE 'مقفولة ✗' END
UNION ALL
SELECT 'عدد سياسات جدول الطلبات',
       (SELECT count(*)::text FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
         WHERE c.relname='account_deletion_requests');
