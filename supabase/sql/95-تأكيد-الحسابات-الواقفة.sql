-- ============================================================
-- 95 — تأكيد الحسابات اللي وقفت على تأكيد البريد
-- ============================================================
--
-- ── اللي التشخيص (ملف 94) أثبته ─────────────────────────────
--
-- إعداد `Confirm email` كان **مفتوح** في لوحة Supabase، واتقفل دلوقتي.
-- بس قفله بيشتغل على **التسجيلات الجديدة وبس** — الحسابات اللي اتعملت
-- وهو مفتوح لسه `email_confirmed_at` بتاعها فاضي، وهتفضل كده للأبد.
--
-- وتلات حسابات واقفة كده:
--
--     shimaafouad422@gmail.com   ·  11 سبتمبر  ·  ولا مرة دخل
--     layan-saeid@gmail.com      ·  23 سبتمبر  ·  ولا مرة دخل
--     adam-mohamad@gmail.com     ·  23 سبتمبر  ·  ولا مرة دخل
--
-- ⚠️ ودول **محدّش بلّغ عنهم**. البلاغ اللي جالك كان على
--    `nour-taher@gmail.com`، وده طلع أكّد بريده ودخل فعلًا في نفس
--    اليوم. يعني التلاتة دول كانوا هيفضلوا واقفين بلا ما نعرف.
--
-- ── اللي الملف ده بيعمله ────────────────────────────────────
--
-- بيحط `email_confirmed_at` للحسابات اللي `email_confirmed_at` بتاعها
-- فاضي — بتاريخ **إنشاء الحساب** لا تاريخ النهارده، عشان السجل يفضل
-- صادق.
--
-- ⚠️ **ده تعديل على `auth.users` — جدول المصادقة بتاع Supabase نفسه،
--    مش جداولنا.** وده استثناء مقصود ومحدود:
--
--      • عمود **واحد**: `email_confirmed_at`
--      • الصفوف اللي العمود ده فاضي فيها وبس
--      • **مفيش لمس لكلمات السر** — مفيش قراءة ولا كتابة ليها. كل
--        واحد فيهم هيدخل بنفس الكلمة اللي هو كتبها وقت التسجيل،
--        وإحنا مش شايفينها ولا محتاجينها.
--      • مفيش لمس للبريد ولا للأدوار ولا لأي حاجة تانية
--
-- ⚠️ **وليه مش بنكتب في `confirmed_at`؟** العمود ده في النسخ الحديثة
--    من Supabase **محسوب** من `email_confirmed_at` و`phone_confirmed_at`
--    (generated column) — الكتابة فيه بترمي خطأ. بنكتب في المصدر وهو
--    بيتحدّث لوحده.
--
-- ── البديل اللي ممكن تعمله بإيدك بدل الملف ده ───────────────
--
-- لوحة Supabase ← Authentication ← Users ← اضغط على الحساب ← زرار
-- `Confirm email`. تلات حسابات = تلات ضغطات. النتيجة واحدة بالظبط.
-- الملف ده موجود عشان يعملها مرة واحدة ويسيب أثرًا مكتوبًا.
-- ============================================================

BEGIN;

UPDATE auth.users
   SET email_confirmed_at = created_at
 WHERE email_confirmed_at IS NULL;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الحسابات التلاتة بقت إيه؟
  SELECT
    '1. الحسابات المتأثرة'::text AS القسم,
    u.email::text                 AS البند,
    ('اتعمل: ' || to_char(u.created_at, 'YYYY-MM-DD HH24:MI')
      || '  ·  تأكيد البريد: '
      || COALESCE(to_char(u.email_confirmed_at, 'YYYY-MM-DD HH24:MI'), '(لسه فاضي)'))::text
      AS التفاصيل,
    CASE WHEN u.email_confirmed_at IS NOT NULL
         THEN '✓ يقدر يدخل دلوقتي' ELSE '✗ لسه واقف' END AS الحالة
  FROM auth.users u
  WHERE u.email IN (
    'shimaafouad422@gmail.com',
    'layan-saeid@gmail.com',
    'adam-mohamad@gmail.com'
  )

  UNION ALL

  -- ٢) مفيش حد فاضل واقف
  SELECT
    '2. الصورة العامة',
    'تأكيد البريد',
    'مؤكَّد: ' || (SELECT count(*)::text FROM auth.users WHERE email_confirmed_at IS NOT NULL)
      || '  ·  غير مؤكَّد: ' || (SELECT count(*)::text FROM auth.users WHERE email_confirmed_at IS NULL),
    CASE WHEN (SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NULL) = 0
         THEN '✓ مفيش حساب واقف' ELSE '✗ لسه فيه' END

  UNION ALL

  -- ٣) كلمات السر ما اتلمستش
  --
  -- بنعدّ الحسابات اللي ليها كلمة سر مخزّنة. الرقم ده المفروض يفضل زي
  -- ما هو بالظبط — لأن الملف ده معندوش أي علاقة بالعمود ده.
  SELECT
    '3. كلمات السر',
    'encrypted_password',
    'حسابات ليها كلمة سر: '
      || (SELECT count(*)::text FROM auth.users
           WHERE encrypted_password IS NOT NULL AND encrypted_password <> ''),
    '✓ الملف ما لمسهاش'

  UNION ALL

  -- ٤) الملفات لسه مكانها
  SELECT
    '4. ملفات المستخدمين',
    'auth.users ↔ user_profiles',
    'إجمالي الحسابات: ' || (SELECT count(*)::text FROM auth.users)
      || '  ·  منها بلا ملف: '
      || (SELECT count(*)::text FROM auth.users u
           WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p
                              WHERE p.id::text = u.id::text)),
    CASE WHEN (SELECT count(*) FROM auth.users u
                WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p
                                   WHERE p.id::text = u.id::text)) = 0
         THEN '✓ كل حساب ليه ملف' ELSE '✗ فيه ناقص' END

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ التراجع هنا معناه **إنك تقفل الحسابات دي تاني** — يعني ترجّع
--    العطل بإيدك. مكتوب للاكتمال بس، ومفيش سبب معقول يخلّيك تشغّله.
--
-- BEGIN;
-- UPDATE auth.users SET email_confirmed_at = NULL
--  WHERE email IN ('shimaafouad422@gmail.com',
--                  'layan-saeid@gmail.com',
--                  'adam-mohamad@gmail.com');
-- COMMIT;
-- ============================================================
