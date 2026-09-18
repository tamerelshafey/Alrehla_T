-- ============================================================
-- 61 — تشخيص: جدولان لنفس المفهوم (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش حاجة**. قراءة فقط. شغّله وابعتلي النتيجة.
--
-- المشكلة:
--
--   في المشروع جدولين بيخزّنوا نفس الحاجة — «مين بيقدّم الخدمة دي وبكام»:
--
--     • `instructor_services`  (instructor_id, service_id, ...)
--     • `provider_services`    (provider_id,  service_id, ...)
--
--   الأعمدة متطابقة حرفيًا ما عدا العمود الأول. واللي بيحصل دلوقتي:
--
--     • المدرب بيقترح سعر من لوحته  ← بيتكتب في instructor_services
--     • الإدارة بتوافق من صفحة المدرب ← بيتكتب في instructor_services
--     • «مركز المهام العاجلة» بيعدّ من instructor_services
--
--     • العميل بيشوف مقدّمي الخدمة  ← بيتقرا من provider_services
--     • الطلب نفسه (createServiceOrder) ← بيتقرا من provider_services
--
--   ومفيش **ولا سطر واحد** في المشروع بينقل بين الجدولين.
--
--   النتيجة العملية: عرض مدرب اتعمل واتعتمد من مسار المدرب لا يظهر
--   للعميل ولا يمكن طلبه أبدًا.
--
-- القرار: `provider_services` هو المعتمد، لأنه الوحيد اللي البيع بيمر
-- منه، ولأن `service_providers` بيسمح بمقدّم خدمة مش مدرب (المنصة نفسها
-- أو مستقل) — وده موجود وشغال في الكود وفي شاشة الإدارة.
--
-- الملف ده بيجاوب على أربع أسئلة لازم نعرفها قبل النقل:
--   1. كام صف في كل جدول، وحالتهم إيه؟
--   2. مين المدربين اللي عندهم عروض في instructor_services وملهمش
--      صف في service_providers أصلًا؟ (دول اللي النقل هيعملهم صفوف)
--   3. فيه عروض مكرّرة في الجدولين لنفس (المدرب، الخدمة) بأسعار مختلفة؟
--      (لو أيوه، لازم نقرر مين الصح قبل ما ننقل)
--   4. فيه طلبات مرتبطة بعروض مش موجودة في provider_services؟
-- ============================================================

-- ------------------------------------------------------------
-- استعلام تأكيد واحد — كل الإجابات في جدول واحد بـ UNION ALL
-- ------------------------------------------------------------
WITH
-- (1) أعداد وحالات
counts AS (
  SELECT '1. عدد الصفوف'::text AS القسم,
         'instructor_services — الإجمالي'::text AS البند,
         count(*)::text AS القيمة,
         'ℹ️'::text AS العلامة
  FROM public.instructor_services
  UNION ALL
  SELECT '1. عدد الصفوف',
         'instructor_services — حالة: ' || status,
         count(*)::text, 'ℹ️'
  FROM public.instructor_services GROUP BY status
  UNION ALL
  SELECT '1. عدد الصفوف',
         'provider_services — الإجمالي',
         count(*)::text, 'ℹ️'
  FROM public.provider_services
  UNION ALL
  SELECT '1. عدد الصفوف',
         'provider_services — حالة: ' || status,
         count(*)::text, 'ℹ️'
  FROM public.provider_services GROUP BY status
  UNION ALL
  SELECT '1. عدد الصفوف',
         'service_providers — نوع: ' || kind::text,
         count(*)::text, 'ℹ️'
  FROM public.service_providers GROUP BY kind
),

-- (2) مدربون عندهم عروض ومَلهمش صف مقدّم خدمة
orphan_instructors AS (
  SELECT DISTINCT i_s.instructor_id
  FROM public.instructor_services i_s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.instructor_id = i_s.instructor_id
  )
),
orphans AS (
  SELECT '2. مدربون بلا صف مقدّم خدمة'::text,
         COALESCE(i.display_name, o.instructor_id::text),
         (SELECT count(*)::text FROM public.instructor_services x
          WHERE x.instructor_id = o.instructor_id) || ' عرض',
         '⚠️ محتاج صف service_providers'::text
  FROM orphan_instructors o
  LEFT JOIN public.instructors i ON i.id = o.instructor_id
),

-- (3) تعارض: نفس (المدرب، الخدمة) في الجدولين بسعر معتمد مختلف
conflicts AS (
  SELECT '3. تعارض في السعر المعتمد'::text,
         COALESCE(i.display_name, 'مدرب ' || i_s.instructor_id::text)
           || ' / ' || COALESCE(ss.name, i_s.service_id::text),
         'instructor_services=' || COALESCE(i_s.approved_price::text, 'فاضي')
           || ' · provider_services=' || COALESCE(p_s.approved_price::text, 'فاضي'),
         '✗ لازم قرار قبل النقل'::text
  FROM public.instructor_services i_s
  JOIN public.service_providers sp ON sp.instructor_id = i_s.instructor_id
  JOIN public.provider_services p_s
    ON p_s.provider_id = sp.id AND p_s.service_id = i_s.service_id
  LEFT JOIN public.instructors        i  ON i.id  = i_s.instructor_id
  LEFT JOIN public.standalone_services ss ON ss.id = i_s.service_id
  WHERE i_s.approved_price IS DISTINCT FROM p_s.approved_price
),

-- (4) طلبات خدمة مرتبطة بمقدّم مالوش عرض معتمد في provider_services
orphan_orders AS (
  SELECT '4. طلبات بلا عرض معتمد'::text,
         'طلب ' || so.id::text,
         'الخدمة ' || COALESCE(ss.name, so.standalone_service_id::text)
           || ' · الحالة ' || so.status,
         '⚠️ راجعه يدويًا'::text
  FROM public.service_orders so
  LEFT JOIN public.standalone_services ss ON ss.id = so.standalone_service_id
  WHERE so.provider_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.provider_services p_s
      WHERE p_s.provider_id = so.provider_id
        AND p_s.service_id  = so.standalone_service_id
    )
)

SELECT القسم, البند, القيمة, العلامة FROM counts
UNION ALL SELECT * FROM orphans
UNION ALL SELECT * FROM conflicts
UNION ALL SELECT * FROM orphan_orders
ORDER BY 1, 2;
