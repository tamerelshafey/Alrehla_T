-- ============================================================
-- 90 — تشخيص: مستحق المدرب عند إقفال طلب الخدمة  (قراءة فقط)
-- ============================================================
--
-- ✅ **الملف ده قراءة فقط.** مفيش `INSERT` ولا `UPDATE` ولا `ALTER`
--    ولا سياسة بتتغيّر. شغّله مطمّن.
--
-- ── الشك ────────────────────────────────────────────────────
--
-- لما العميل يدوس «أكّد الاستلام» على طلب خدمة، بيحصل الآتي بالترتيب
-- في `confirmServiceOrderReceipt` → `completeOrder`:
--
--   ١. الطلب بيتحوّل لـ`completed`
--   ٢. **وبعدين** بيتعمل صف مستحق للمدرب في `instructor_payouts`
--
-- والخطوة التانية دي بتتنفّذ **بجلسة العميل** — مش بجلسة إداري ولا
-- بمفتاح الخدمة. والسؤال: هل العميل مسموح له يكتب في جدول مستحقات
-- المدربين أصلًا؟
--
-- لو **لأ**، اللي بيحصل:
--
--     الطلب بقى مكتملًا ✓   ·   المستحق **ما اتسجّلش** ✗
--
-- والكود بيرمي بعدها، فالعميل بيشوف رسالة خطأ على عملية **تمّت**.
-- ولو حاول تاني، `completeOrder` بيشترط `status = 'delivered'`
-- والحالة بقت `completed` — فالمحاولة بترفض، و**المستحق يبقى ضايعًا
-- بلا طريق رجوع**.
--
-- ⚠️ والمدرب مش هيشتكي: هو مبيشوفش «طلب مكتمل بلا مستحق»، هو بيشوف
--    قايمة مستحقاته وبس — والصف مش موجود فيها أصلًا.
--
-- ── والشك التاني ────────────────────────────────────────────
--
-- التعليق في الكود بيقول: «الفهرس الفريد في قاعدة البيانات يمنع تسجيل
-- نفس الطلب مرتين». **مفيش أي ملف SQL في المستودع بيعمل الفهرس ده.**
-- يبقى إما اتعمل من لوحة Supabase، وإما **مش موجود** — وساعتها
-- الإقفال مرتين بيدفع مرتين.
--
-- والقاعدة هي مصدر الحقيقة لا ملفات المشروع، فبنسأل.
--
-- ── والقياس المباشر ─────────────────────────────────────────
--
-- القسم ٤ بيعدّ الطلبات المكتملة اللي ليها مدرب و**ملهاش صف مستحق**.
-- الرقم ده هو العطل نفسه لو موجود — مش استنتاجًا عنه.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) مين يقدر يكتب في جدول المستحقات؟ ═════════════════
  --
  -- ⚠️ بنقرا `with_check` مش `qual` (قاعدة «ن»): سياسة `INSERT`
  --    بتخزّن شرطها في `with_check`، و`qual` بتبقى NULL دايمًا.
  SELECT
    '1. سياسات الكتابة'::text AS القسم,
    p.policyname::text         AS البند,
    (p.cmd || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  WITH CHECK: ' || COALESCE(p.with_check, '—')
      || '  ·  USING: ' || COALESCE(p.qual, '—'))::text AS التفاصيل,
    'للمراجعة'::text AS الحالة
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'instructor_payouts'
    AND p.cmd IN ('INSERT', 'ALL')

  UNION ALL

  -- ══ ٢) RLS شغّالة على الجدول؟ ════════════════════════════
  SELECT
    '2. حماية الجدول',
    'instructor_payouts',
    CASE WHEN t.rowsecurity THEN 'RLS مفعّلة' ELSE 'RLS متوقفة' END
      || '  ·  عدد السياسات: '
      || (SELECT count(*)::text FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'instructor_payouts'),
    CASE WHEN t.rowsecurity THEN '✓ مفعّلة' ELSE '⚠️ متوقفة' END
  FROM pg_tables t
  WHERE t.schemaname = 'public' AND t.tablename = 'instructor_payouts'

  UNION ALL

  -- ══ ٣) الفهرس الفريد — هل موجود فعلًا؟ ═══════════════════
  --
  -- الكود بيعتمد عليه في منع الدفع مرتين. لو مش موجود، الاعتماد ده
  -- على حاجة متخيّلة.
  SELECT
    '3. منع التكرار',
    COALESCE(i.indexname, '(مفيش فهرس على المصدر)')::text,
    COALESCE(i.indexdef, 'مفيش فهرس بيمنع تكرار نفس الطلب')::text,
    CASE
      WHEN i.indexdef IS NULL THEN '⚠️ مفيش — الإقفال مرتين بيدفع مرتين'
      WHEN i.indexdef ILIKE '%unique%' THEN '✓ فريد'
      ELSE '⚠️ فهرس مش فريد'
    END
  FROM (SELECT 1) one
  LEFT JOIN pg_indexes i
    ON i.schemaname = 'public'
   AND i.tablename = 'instructor_payouts'
   AND i.indexdef ILIKE '%source_id%'

  UNION ALL

  -- ══ ٤) القياس المباشر: مستحقات ضايعة ═══════════════════
  --
  -- طلبات خدمة **مكتملة** ليها مدرب، وملهاش صف في المستحقات.
  -- الرقم ده = العطل نفسه.
  SELECT
    '4. مستحقات ضايعة',
    'طلبات مكتملة بلا مستحق',
    'طلبات مكتملة ليها مدرب: '
      || (SELECT count(*)::text FROM service_orders o
           WHERE o.status = 'completed' AND o.instructor_id IS NOT NULL)
      || '  ·  منها بلا صف مستحق: '
      || (SELECT count(*)::text FROM service_orders o
           WHERE o.status = 'completed' AND o.instructor_id IS NOT NULL
             AND NOT EXISTS (
               SELECT 1 FROM instructor_payouts ip
                WHERE ip.source_type = 'service_order'
                  AND ip.source_id::text = o.id::text)),
    CASE WHEN (SELECT count(*) FROM service_orders o
                WHERE o.status = 'completed' AND o.instructor_id IS NOT NULL
                  AND NOT EXISTS (
                    SELECT 1 FROM instructor_payouts ip
                     WHERE ip.source_type = 'service_order'
                       AND ip.source_id::text = o.id::text)) > 0
         THEN '🔴 فيه مستحقات ضايعة'
         ELSE '✓ كل طلب مكتمل ليه مستحق' END

  UNION ALL

  -- ══ ٥) الأعمدة اللي الكود بيكتبها موجودة؟ ═══════════════
  --
  -- لو عمود زي `source_type` مش موجود، الإدراج بيقع من أول سطر.
  SELECT
    '5. أعمدة المستحقات',
    c.column_name::text,
    c.data_type::text || CASE WHEN c.is_nullable = 'NO' THEN '  ·  مطلوب' ELSE '' END,
    '✓ موجود'
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'instructor_payouts'
    AND c.column_name IN
      ('instructor_id','period','amount','status','source_type','source_id','description')

  UNION ALL

  -- ══ ٦) نفس السؤال لطلبات المنتجات ═══════════════════════
  --
  -- عشان نعرف إذا كان العطل خاص بالخدمات ولا عام.
  SELECT
    '6. مصادر المستحقات',
    COALESCE(ip.source_type, '(بلا مصدر)')::text,
    'عدد الصفوف: ' || count(*)::text
      || '  ·  إجمالي المبالغ: ' || COALESCE(sum(ip.amount), 0)::text,
    'للمراجعة'
  FROM instructor_payouts ip
  GROUP BY ip.source_type

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
