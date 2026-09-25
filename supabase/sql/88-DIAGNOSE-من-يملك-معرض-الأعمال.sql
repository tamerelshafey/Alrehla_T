-- ============================================================
-- 88 — تشخيص: مين صاحب معرض الأعمال؟  (قراءة فقط)
-- ============================================================
--
-- ✅ **الملف ده قراءة فقط.** مفيش `INSERT` ولا `UPDATE` ولا `ALTER`
--    ولا سياسة بتتغيّر. شغّله مطمّن.
--
-- ── ليه الملف ده موجود ──────────────────────────────────────
--
-- كنت رايح أبني متابعة ولي الأمر لمعرض أعمال ابنه، فلقيت حاجة أهم
-- في الكود: **المشروع فيه تلات معرّفات مختلفة لـ«الطالب»**، والكود
-- بيخلط بينهم.
--
--   ١. `course_subscriptions.user_id`      → **المشتري** (ولي الأمر)
--   ٢. `child_profiles.id`                 → صف الطفل في المركز العائلي
--   ٣. `child_profiles.account_profile_id` → **حساب دخول الطفل**
--
-- و`portfolio_documents.student_id` بيتكتب بالرقم **التالت**: لوحة
-- الطالب بتنادي `getStudentDocuments(user.id)` — يعني حساب الطفل
-- نفسه هو صاحب المستند.
--
-- لكن صفحة «طلابي» عند المدرب بتقرا المستندات بالرقم **الأول**:
-- `instructor_students()` بترجّع `user_ref` = `cs.user_id`، والكود
-- بياخده ويسأل `portfolio_documents.student_id = user_ref`.
--
-- ── اللي ده بيعمله ──────────────────────────────────────────
--
-- لأي طفل تابع عنده حساب دخول:
--
--   الطفل يكتب نصًا  →  يتخزّن باسم حسابه
--   المدرب يفتح ملفه →  يسأل عن رقم **ولي الأمر**  →  **صفر مستندات**
--
-- يعني **المدرب مش شايف شغل الطالب**، وحلقة المراجعة كلها مقفولة
-- لأهم حالة عندنا: طفل بيتعلّم.
--
-- ⚠️ ومفيش أي خطأ بيظهر. الاستعلام بيرجع فاضي، والصفحة بتقول «لا توجد
--    مستندات» — نفس قاعدة «ك» بالظبط، بس المرة دي السبب معرّف غلط
--    مش صلاحيات.
--
-- والاستعلامات تحت **بتتحقق من ده على القاعدة الحقيقية** قبل ما أكتب
-- أي تعديل: يمكن مفيش حسابات أطفال أصلًا، ويمكن المستندات مكتوبة
-- بشكل تاني. **مش بفترض — بسأل.**
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) هل في حسابات دخول لأطفال أصلًا؟ ═══════════════════
  --
  -- لو صفر، العطل نظري لحد ما يتعمل أول حساب — وساعتها الإصلاح
  -- وقاية مش إسعاف.
  SELECT
    '1. حسابات الأطفال'::text AS القسم,
    'child_profiles'::text     AS البند,
    ('إجمالي الأطفال: ' || count(*)::text
      || '  ·  منهم بحساب دخول: '
      || count(*) FILTER (WHERE NULLIF(btrim(coalesce(account_profile_id,'')),'') IS NOT NULL)::text)::text
      AS التفاصيل,
    CASE
      WHEN count(*) FILTER (WHERE NULLIF(btrim(coalesce(account_profile_id,'')),'') IS NOT NULL) > 0
        THEN '⚠️ فيه حسابات — العطل واقع فعلًا'
      ELSE '✓ مفيش حسابات دخول لسه'
    END AS الحالة
  FROM public.child_profiles

  UNION ALL

  -- ══ ٢) المستندات: مين صاحبها فعلًا؟ ══════════════════════
  --
  -- كل مستند و`student_id` بتاعه: هو حساب طفل، أو حساب ولي أمر،
  -- أو رقم مش معروف؟
  SELECT
    '2. ملكية المستندات',
    'portfolio_documents',
    ('إجمالي المستندات: ' || count(*)::text
      || '  ·  صاحبها حساب طفل: '
      || count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM public.child_profiles c
            WHERE c.account_profile_id::text = d.student_id::text))::text
      || '  ·  صاحبها ولي أمر/مشتري: '
      || count(*) FILTER (WHERE NOT EXISTS (
           SELECT 1 FROM public.child_profiles c
            WHERE c.account_profile_id::text = d.student_id::text)
         AND EXISTS (
           SELECT 1 FROM public.user_profiles up
            WHERE up.id::text = d.student_id::text))::text)::text,
    CASE WHEN count(*) = 0 THEN 'ℹ️ مفيش مستندات لسه' ELSE 'للمراجعة' END
  FROM public.portfolio_documents d

  UNION ALL

  -- ══ ٣) الاشتراكات التابعة — قلب المشكلة ══════════════════
  --
  -- كل اشتراك لطفل: هل رقم المشتري يساوي رقم حساب الطفل؟ لو لأ —
  -- وده الطبيعي — يبقى المدرب بيسأل بالرقم الغلط.
  SELECT
    '3. الاشتراكات التابعة',
    'course_subscriptions',
    ('اشتراكات باسم طفل: ' || count(*)::text
      || '  ·  منها الطفل له حساب دخول: '
      || count(*) FILTER (WHERE NULLIF(btrim(coalesce(c.account_profile_id,'')),'') IS NOT NULL)::text
      || '  ·  ومنها المشتري = حساب الطفل: '
      || count(*) FILTER (WHERE c.account_profile_id::text = cs.user_id::text)::text)::text,
    CASE
      WHEN count(*) FILTER (WHERE NULLIF(btrim(coalesce(c.account_profile_id,'')),'') IS NOT NULL) > 0
       AND count(*) FILTER (WHERE c.account_profile_id::text = cs.user_id::text) = 0
        THEN '⚠️ المدرب بيسأل بالرقم الغلط'
      ELSE 'للمراجعة'
    END
  FROM public.course_subscriptions cs
  JOIN public.child_profiles c ON c.id::text = cs.child_id::text
  WHERE cs.child_id IS NOT NULL

  UNION ALL

  -- ══ ٤) صلاحيات معرض الأعمال ══════════════════════════════
  --
  -- مين يقدر يقرا `portfolio_documents` دلوقتي؟ ولي الأمر محتاج
  -- يشوف شغل ابنه، والسؤال هو: سياسة ولا دالة؟
  --
  -- ⚠️ بنقرا `qual` **و**`with_check` الاتنين (قاعدة «ن»): سياسة
  --    الإدراج شرطها في `with_check` و`qual` بتبقى NULL دايمًا.
  SELECT
    '4. صلاحيات المعرض',
    p.policyname::text,
    (p.cmd || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  USING: ' || COALESCE(p.qual, '—')
      || '  ·  WITH CHECK: ' || COALESCE(p.with_check, '—'))::text,
    CASE
      WHEN p.cmd = 'SELECT'
       AND btrim(lower(coalesce(p.qual,''))) IN ('true','(true)')
        THEN '⚠️ قراءة مفتوحة'
      ELSE 'للمراجعة'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'portfolio_documents'

  UNION ALL

  -- ══ ٥) هل RLS مفعّلة على الجدول أصلًا ════════════════════
  SELECT
    '5. حماية الجدول',
    'portfolio_documents',
    CASE WHEN t.rowsecurity THEN 'RLS مفعّلة' ELSE 'RLS متوقفة' END,
    CASE WHEN t.rowsecurity THEN '✓ سليم' ELSE '✗ خطر' END
  FROM pg_tables t
  WHERE t.schemaname = 'public' AND t.tablename = 'portfolio_documents'

  UNION ALL

  -- ══ ٦) الدالة اللي هتتعدّل — تعريفها الحالي ══════════════
  --
  -- ⚠️ القاعدة هي مصدر الحقيقة لا ملفات المشروع. لو `instructor_students`
  --    مش راجعة `child_ref`، يبقى حد عدّلها من لوحة Supabase بعد ملف 70
  --    وملف التعديل الجاي **متكتبوش** من ملف 70.
  SELECT
    '6. الدالة الحالية',
    p.proname::text,
    ('بترجّع child_ref: '
      || CASE WHEN pg_get_function_result(p.oid) LIKE '%child_ref%' THEN 'نعم' ELSE 'لأ' END
      || '  ·  بتذكر account_profile_id: '
      || CASE WHEN pg_get_functiondef(p.oid) LIKE '%account_profile_id%' THEN 'نعم' ELSE 'لأ' END
      || '  ·  SECURITY DEFINER: '
      || CASE WHEN p.prosecdef THEN 'نعم' ELSE 'لأ' END)::text,
    CASE
      WHEN pg_get_function_result(p.oid) LIKE '%child_ref%'
       AND pg_get_functiondef(p.oid) NOT LIKE '%account_profile_id%'
        THEN '⚠️ زي ملف 70 — محتاجة تتوسّع'
      ELSE 'للمراجعة'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'instructor_students'

  UNION ALL

  -- ══ ٧) تقارير المدرب — فين بتتخزّن؟ ══════════════════════
  --
  -- «تقارير مدربه» اللي ولي الأمر عايز يشوفها: هي ملاحظات على
  -- المستندات، ولا في أعمدة على الجلسات كمان؟
  SELECT
    '7. تقارير المدرب',
    c.table_name::text || '.' || c.column_name::text,
    c.data_type::text,
    'للمراجعة'
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND (
      (c.table_name = 'portfolio_documents' AND c.column_name = 'instructor_feedback')
      OR (c.table_name = 'sessions'
          AND c.column_name ~* 'note|report|feedback|summary|comment')
    )

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
