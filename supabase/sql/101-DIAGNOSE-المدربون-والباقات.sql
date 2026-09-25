-- ============================================================
-- 101 — تشخيص: مين بيظهر في اختيار المدرب  (قراءة فقط)
-- ============================================================
--
-- ✅ **قراءة فقط.** مفيش تعديل ولا إنشاء.
--
-- ── السؤالان ────────────────────────────────────────────────
--
-- **① ليه بيظهر اتنين بس؟**
--
-- معالج الحجز بيفلتر `status = 'active'` **وبس** — مفيش أي فلتر
-- تاني. يعني العدد اللي بيظهر = عدد المدربين النشطين بالظبط.
-- القسم ١ بيطبع كل مدرب بحالته، فالرقم يبان.
--
-- **② هل المدرب يقدر يختار يدرّب أنهي باقة؟**
--
-- ⚠️ **لأ — ومفيش حتى مكان يتخزّن فيه الاختيار ده.**
--
--    فيه `creative_writing_packages` (الباقات) و`instructors`
--    (المدربين)، و**مفيش أي جدول بيربطهم**. فالمعالج بيعرض **كل**
--    مدرب نشط في **كل** باقة — مفيش فرق بين باقة تأسيس لطفل ٨ سنين
--    وباقة تخصص لمراهق.
--
--    القسم ٣ بيتأكد من ده من القاعدة نفسها (لا من ملفات المشروع —
--    وقعت في ده قبل كده في ملف 98).
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) المدربون وحالاتهم ═══════════════════════════════
  SELECT
    '1. المدربون'::text AS القسم,
    i.display_name::text AS البند,
    ('الحالة: ' || i.status::text
      || '  ·  اجتاز التدريب: ' || CASE WHEN i.training_passed THEN 'نعم' ELSE 'لأ' END
      || '  ·  نموذج العمل: ' || COALESCE(i.work_model::text, '—')
      || '  ·  عيّنة: ' || CASE WHEN i.is_sample THEN 'نعم' ELSE 'لأ' END)::text AS التفاصيل,
    CASE
      WHEN i.status::text = 'active' THEN '✓ بيظهر لولي الأمر'
      WHEN i.training_passed THEN '⚠️ اجتاز التدريب ولسه مش نشط — فعّله'
      ELSE '🔴 محتاج يجتاز التدريب الأول'
    END AS الحالة
  FROM public.instructors i

  UNION ALL

  -- ══ ٢) العدد اللي المعالج بيعرضه ═══════════════════════
  SELECT
    '2. الخلاصة',
    'اللي بيظهر في اختيار المدرب',
    'نشط: ' || (SELECT count(*)::text FROM public.instructors WHERE status::text = 'active')
      || '  ·  من إجمالي: ' || (SELECT count(*)::text FROM public.instructors)
      || '  ·  اجتازوا التدريب ومش نشطين: '
      || (SELECT count(*)::text FROM public.instructors
           WHERE training_passed AND status::text <> 'active'),
    'ده الرقم اللي بتشوفه'

  UNION ALL

  -- ══ ٣) هل في ربط بين المدرب والباقة؟ ═══════════════════
  SELECT
    '3. ربط المدرب بالباقة',
    'جدول الربط',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('instructor_packages', 'package_instructors')
    ) THEN 'موجود' ELSE '**مفيش جدول بيربطهم**' END,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('instructor_packages', 'package_instructors')
    ) THEN '✓ موجود' ELSE '⚠️ كل مدرب نشط بيظهر في كل باقة' END

  UNION ALL

  -- ══ ٤) الباقات المفعّلة ════════════════════════════════
  SELECT
    '4. الباقات',
    p.name::text,
    ('المسار: ' || COALESCE(p.track, '—')
      || '  ·  الفئة: ' || p.age_group::text
      || '  ·  جلسات: ' || COALESCE(p.sessions_count::text, '—')
      || '  ·  مدة الجلسة: ' || COALESCE(p.session_duration, '(مش مضبوطة)'))::text,
    CASE WHEN p.is_active THEN '✓ مفعّلة' ELSE '— موقوفة' END
  FROM public.creative_writing_packages p

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
