-- ============================================================
-- 68 — تشخيص: حجز جديد لم تظهر جلساته (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش حاجة**. قراءة فقط.
--
-- الشكوى: «حجزت جلسة ولم تظهر».
--
-- سلسلة الحجز فيها خمس محطات، والجلسات ما بتتعملش غير في المحطة
-- الأخيرة. الملف ده بيقول وقفت عند أنهي واحدة:
--
--   1. الحجز اتسجّل؟            ← صف في `course_subscriptions`
--   2. العميل رفع إيصال؟         ← الحالة `awaiting_verification`
--   3. الإدارة أكّدت الدفع؟       ← الحالة `active`
--   4. الباقة فيها عدد جلسات؟     ← `sessions_count > 0`
--   5. الجلسات اتولّدت؟           ← صفوف في `sessions`
--
-- **المحطة 3 هي الأشهر**: الجلسات بتتولّد **لحظة تأكيد الإدارة للدفع**،
-- مش لحظة الحجز. فحجز لسه `pending` أو `awaiting_verification` مالوش
-- جلسات — وده سلوك صحيح مش عطل.
--
-- **والمحطة 4 مصيدة معروفة**: تلات باقات نشطة عندك بلا `session_duration`،
-- ولو واحدة منهم بلا `sessions_count` كمان، التأكيد بيعدّي وما بتتعملش
-- ولا جلسة، والسبب بيتسجّل في لوج Vercel وبس.
-- ============================================================

-- ------------------------------------------------------------
-- 1) الحجوزات، وكل ما يلزم لتشخيصها
-- ------------------------------------------------------------
SELECT
  '1. الحجوزات'::text                                        AS القسم,

  COALESCE(p.name, '⚠️ باقة محذوفة')                          AS الباقة,
  COALESCE(cs.payment_reference, '—')                         AS الرقم_المرجعي,
  cs.status                                                   AS حالة_الحجز,

  CASE cs.status
    WHEN 'pending'              THEN '① اتسجّل — مستني إيصال من العميل'
    WHEN 'awaiting_verification' THEN '② الإيصال وصل — **مستني تأكيد الإدارة**'
    WHEN 'active'                THEN '③ اتأكّد — المفروض الجلسات اتعملت'
    ELSE '؟ حالة غير متوقعة: ' || cs.status
  END                                                         AS وقف_فين,

  COALESCE(cs.payment_method, '—')                            AS وسيلة_الدفع,
  CASE WHEN cs.payment_receipt_url IS NULL THEN '✗ مفيش' ELSE '✓ موجود' END
                                                              AS الإيصال,

  COALESCE(i.display_name, '⚠️ مفيش مدرب')                     AS المدرب,
  COALESCE(cs.preferred_slot::text, '⚠️ مفيش موعد مختار')      AS الموعد_المختار,

  COALESCE(p.sessions_count::text, '⚠️ فاضي')                  AS عدد_جلسات_الباقة,

  (SELECT count(*) FROM public.sessions s
   WHERE s.course_subscription_id = cs.id)::text              AS الجلسات_المتولّدة,

  to_char(cs.created_at AT TIME ZONE 'Africa/Cairo',
          'YYYY-MM-DD HH24:MI')                               AS وقت_الحجز

FROM public.course_subscriptions cs
LEFT JOIN public.creative_writing_packages p ON p.id = cs.package_id
LEFT JOIN public.instructors i ON i.id = cs.preferred_instructor_id
ORDER BY cs.created_at DESC;


-- ------------------------------------------------------------
-- 2) الجلسات المتولّدة (لو فيه)
-- ------------------------------------------------------------
SELECT
  '2. الجلسات'::text                                          AS القسم,
  s.session_number                                            AS رقم_الجلسة,
  s.status                                                    AS الحالة,
  COALESCE(i.display_name, '⚠️ بلا مدرب — مش هتظهر في لوحة المدرب')
                                                              AS المدرب,
  to_char(s.scheduled_at AT TIME ZONE 'Africa/Cairo',
          'Dy YYYY-MM-DD HH24:MI')                            AS الموعد_بتوقيت_القاهرة,
  to_char(s.scheduled_at AT TIME ZONE 'UTC',
          'HH24:MI')                                          AS المخزَّن_UTC
FROM public.sessions s
LEFT JOIN public.instructors i ON i.id = s.instructor_id
ORDER BY s.scheduled_at;


-- ------------------------------------------------------------
-- 3) الباقات — عدد الجلسات هو اللي التوليد بيعتمد عليه
-- ------------------------------------------------------------
SELECT
  '3. الباقات'::text                                          AS القسم,
  p.name                                                      AS الباقة,
  CASE WHEN p.is_active THEN 'مفعّلة' ELSE 'موقوفة' END        AS الحالة,
  COALESCE(p.sessions_count::text, '⚠️ فاضي — التأكيد مش هيعمل جلسات')
                                                              AS عدد_الجلسات,
  COALESCE(p.session_duration, '— (بند معلّق)')                AS مدة_الجلسة
FROM public.creative_writing_packages p
ORDER BY p.is_active DESC, p.name;


-- ------------------------------------------------------------
-- 4) جدول المدربين — التوليد بيقرا منه لو مفيش موعد مختار
-- ------------------------------------------------------------
SELECT
  '4. المدربون'::text                                         AS القسم,
  i.display_name                                              AS المدرب,
  i.status::text                                              AS الحالة,
  CASE WHEN i.weekly_schedule IS NULL
            OR jsonb_array_length(i.weekly_schedule::jsonb) = 0
       THEN '⚠️ جدول فاضي — الحجز منه مقفول'
       ELSE jsonb_array_length(i.weekly_schedule::jsonb)::text || ' موعد'
  END                                                         AS الجدول_الأسبوعي
FROM public.instructors i
ORDER BY i.display_name;
