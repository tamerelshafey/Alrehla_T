-- ============================================================
-- 65 — تشخيص: الجلسات قبل الإزاحة (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش حاجة**. قراءة فقط. شغّله **قبل** ملف 64.
--
-- ليه: ملف 64 بيزيح كل جلسة قادمة تلات ساعات (إزاحة القاهرة)، عشان
-- يصلّح إن التوليد كان بيسجّل «18:00» كـ18:00 UTC بدل 18:00 بالقاهرة.
--
-- بس مفيش في القاعدة حاجة تفرّق بين:
--   • جلسة اتولّدت تلقائيًا بالقيمة الغلط ← **محتاجة إزاحة**
--   • جلسة الإدارة عدّلت ميعادها بإيدها من شاشة الجلسات ← الميعاد ده
--     صح زي ما هو، والإزاحة **هتبوّظه**
--
-- الملف ده بيعرض كل جلسة قادمة، وجنبها:
--   • الساعة اللي المستخدم في مصر بيشوفها دلوقتي
--   • الساعة اللي هتبقى بعد ملف 64
--   • الميعاد اللي المدرب حاطه في جدوله الأسبوعي — للمقارنة
--   • علامة لو الجلسة اتعدّلت بعد ما اتعملت (`updated_at` مليان)، وده
--     أقرب دليل على تدخّل يدوي
--
-- شوف الصفوف: لو «بعد الإزاحة» بيطابق «ميعاد الجدول»، يبقى ملف 64 صح.
-- ولو فيه صف اتعدّل يدويًا، بلّغني قبل ما تشغّل 64.
-- ============================================================

SELECT
  s.id                                                          AS الجلسة,
  COALESCE(i.display_name, '— بلا مدرب')                        AS المدرب,
  s.session_number                                              AS رقم_الجلسة,
  s.status                                                      AS الحالة,

  to_char(s.scheduled_at AT TIME ZONE 'Africa/Cairo',
          'Dy YYYY-MM-DD HH24:MI')                              AS المعروض_دلوقتي,

  to_char(
    (s.scheduled_at
      - ((s.scheduled_at AT TIME ZONE 'Africa/Cairo') - (s.scheduled_at AT TIME ZONE 'UTC'))
    ) AT TIME ZONE 'Africa/Cairo',
    'Dy YYYY-MM-DD HH24:MI')                                    AS بعد_الإزاحة,

  -- جدول المدرب الأسبوعي كما هو مسجّل، للمقارنة بالعين.
  COALESCE(i.weekly_schedule::text, '—')                        AS جدول_المدرب,

  CASE WHEN s.updated_at IS NOT NULL AND s.updated_at > s.created_at + interval '1 minute'
       THEN '⚠️ اتعدّلت بعد إنشائها — راجعها'
       ELSE 'كما تولّدت' END                                    AS تدخّل_يدوي

FROM public.sessions s
LEFT JOIN public.instructors i ON i.id = s.instructor_id
WHERE s.scheduled_at > now()
  AND s.status NOT IN ('completed', 'cancelled')
ORDER BY i.display_name NULLS LAST, s.scheduled_at;
