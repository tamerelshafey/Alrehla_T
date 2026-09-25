-- ============================================================
-- 94 — تشخيص: حساب جديد مش بيدخل  (قراءة فقط)
-- ============================================================
--
-- ✅ **قراءة فقط.** مفيش تعديل ولا إنشاء ولا سياسة بتتغيّر.
--
-- ── البلاغ ──────────────────────────────────────────────────
--
-- مستخدم جديد سجّل، وبيحاول يدخل فبيجيله:
--
--     Invalid login credentials
--
-- والمفروض إن تأكيد البريد **مقفول** على المشروع.
--
-- ── احتمالان، والتشخيص بيفصل بينهم ──────────────────────────
--
-- **الاحتمال الأول: تأكيد البريد شغّال فعلًا.**
--
-- لو `Confirm email` مفتوح في إعدادات Supabase، `signUp` بترجّع
-- مستخدمًا **بلا جلسة**. والمستخدم مايقدرش يدخل لحد ما يأكّد بريده.
-- القسم ١ بيفصل ده: `email_confirmed_at` فاضي ولا لأ.
--
-- **الاحتمال التاني: الحساب اتعمل وملف المستخدم لأ.**
--
-- الكود في `actions/auth.ts` بيعمل كده:
--
--     const { error, data } = await supabase.auth.signUp({...});
--     if (error) return { error: error.message };
--     if (data.user) {
--       await supabase.from('user_profiles').insert({...});   // ← بلا فحص
--     }
--     redirect('/dashboard');
--
-- ⚠️ **الإدراج ده مالوش أي فحص** (قاعدة «و»). ولو تأكيد البريد
--    مفتوح، مفيش جلسة لحظتها — فالصلاحيات بترفض الإدراج **بصمت**،
--    والكود بيكمّل للـ`redirect` كأن كل حاجة تمام.
--
--    والنتيجة حساب في `auth.users` **بلا صف في `user_profiles`** —
--    وده بيكسر أي شاشة بتقرا الدور أو الاسم.
--
-- القسم ٢ بيعدّ الحسابات دي.
--
-- ⚠️ **ملاحظة:** إعداد `Confirm email` نفسه **مش في القاعدة** — هو في
--    لوحة Supabase: Authentication ← Sign In / Providers ← Email.
--    الاستعلام ده بيقيس **أثره** على الحسابات الموجودة، مش قيمته.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) آخر الحسابات: مؤكَّدة ولا لأ؟ ═════════════════════
  SELECT
    '1. آخر الحسابات'::text AS القسم,
    u.email::text            AS البند,
    ('اتعمل: ' || to_char(u.created_at, 'YYYY-MM-DD HH24:MI')
      || '  ·  تأكيد البريد: '
      || CASE WHEN u.email_confirmed_at IS NULL
              THEN 'مش مؤكَّد'
              ELSE to_char(u.email_confirmed_at, 'YYYY-MM-DD HH24:MI') END
      || '  ·  آخر دخول: '
      || COALESCE(to_char(u.last_sign_in_at, 'YYYY-MM-DD HH24:MI'), 'ولا مرة'))::text
      AS التفاصيل,
    CASE
      WHEN u.email_confirmed_at IS NULL
        THEN '🔴 مش هيقدر يدخل — تأكيد البريد شغّال'
      WHEN u.last_sign_in_at IS NULL THEN '⚠️ مؤكَّد وما دخلش لسه'
      ELSE '✓ دخل عادي'
    END AS الحالة
  FROM auth.users u
  WHERE u.created_at > now() - interval '30 days'

  UNION ALL

  -- ══ ٢) حسابات بلا ملف مستخدم ════════════════════════════
  --
  -- ده أثر الإدراج اللي بيترفض بصمت.
  SELECT
    '2. حسابات بلا ملف',
    'auth.users ↔ user_profiles',
    'إجمالي الحسابات: ' || (SELECT count(*)::text FROM auth.users)
      || '  ·  منها بلا صف في user_profiles: '
      || (SELECT count(*)::text FROM auth.users u
           WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p
                              WHERE p.id::text = u.id::text)),
    CASE WHEN (SELECT count(*) FROM auth.users u
                WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p
                                   WHERE p.id::text = u.id::text)) > 0
         THEN '🔴 فيه حسابات ناقصة ملفها'
         ELSE '✓ كل حساب ليه ملف' END

  UNION ALL

  -- ══ ٣) نسبة غير المؤكَّدين ══════════════════════════════
  --
  -- لو الأغلبية غير مؤكَّدة، يبقى الإعداد اتفتح في وقت ما.
  SELECT
    '3. الصورة العامة',
    'تأكيد البريد',
    'مؤكَّد: ' || (SELECT count(*)::text FROM auth.users WHERE email_confirmed_at IS NOT NULL)
      || '  ·  غير مؤكَّد: ' || (SELECT count(*)::text FROM auth.users WHERE email_confirmed_at IS NULL),
    CASE WHEN (SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NULL) > 0
         THEN '⚠️ فيه غير مؤكَّدين' ELSE '✓ الكل مؤكَّد' END

  UNION ALL

  -- ══ ٤) سياسة إنشاء الملف ════════════════════════════════
  --
  -- الإدراج في `user_profiles` وقت التسجيل بيمر على السياسة دي.
  -- لو شرطها `auth.uid() = id` ومفيش جلسة، بيترفض.
  SELECT
    '4. سياسة إنشاء الملف',
    p.policyname::text,
    (p.cmd || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  WITH CHECK: ' || COALESCE(p.with_check, '—'))::text,
    'للمراجعة'
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'user_profiles'
    AND p.cmd IN ('INSERT', 'ALL')

  UNION ALL

  -- ══ ٥) هل في محفّز بيعمل الملف تلقائيًا؟ ═════════════════
  --
  -- الطريقة المعتادة في Supabase: محفّز على `auth.users` بيعمل صف
  -- في `user_profiles`. لو موجود، الإدراج من الكود زيادة أصلًا.
  SELECT
    '5. محفّز الإنشاء',
    COALESCE(t.tgname, '(مفيش محفّز على auth.users)')::text,
    COALESCE(p.proname, '—')::text,
    CASE WHEN t.tgname IS NULL
         THEN '⚠️ الملف بيتعمل من الكود وحده'
         ELSE '✓ فيه محفّز' END
  FROM (SELECT 1) one
  LEFT JOIN pg_trigger t
    ON t.tgrelid = 'auth.users'::regclass AND NOT t.tgisinternal
  LEFT JOIN pg_proc p ON p.oid = t.tgfoid

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
