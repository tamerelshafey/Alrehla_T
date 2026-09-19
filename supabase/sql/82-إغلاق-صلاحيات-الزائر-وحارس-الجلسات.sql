-- ============================================================
-- 82 — إغلاق: دوال الزائر · حارس أعمدة الجلسات · طلبات الدعم
-- ============================================================
--
-- ⚠️ **الملف ده بيغيّر القاعدة.** اقرا الشرح قبل ما تشغّله.
-- التراجع مكتوب معلَّقًا في آخر الملف.
--
-- مبنيّ على نتيجة ملفات 79 و80 و81 على القاعدة الحقيقية — مش على قراءة
-- الكود.
--
-- ============================================================
-- ١) الزائر يقدر ينفّذ دوال مش من حقه
-- ============================================================
--
-- ملف 81 أظهر إن `anon` (الزائر غير المسجَّل) ممنوح `EXECUTE` على
-- دوال `SECURITY DEFINER` — يعني دوال **بتتخطى كل قواعد الحماية**
-- بحكم تعريفها.
--
-- ودي نفس مصيدة ملف 70 بالظبط: Supabase بيمنح `anon` تنفيذ أي دالة
-- جديدة **تلقائيًا** عبر ALTER DEFAULT PRIVILEGES، و`REVOKE FROM public`
-- مبيشيلوش. اتصلحت في ملف 71 لدوال المدرب وبس — والباقي فضل مفتوح.
--
-- ⚠️ **مش هنسحب كل الدوال — وده قرار مقصود:**
--
--   الدوال المُسنِدة (`is_admin`, `is_super_admin`, `is_instructor`,
--   `can_see_profile`, `can_access_service_order`, `instructor_teaches`,
--   `owns_instructor`) **بتتنادى جوّه سياسات RLS نفسها**. وسياسة RLS
--   بتتقيّم بصلاحيات المستخدم الحالي — يعني لو سحبنا `is_admin` من
--   `anon`، أي سياسة بتناديها هتتحوّل من «ترجع false» إلى
--   **خطأ permission denied** لأي زائر. صفحات عامة ممكن تقع.
--
--   والمكسب من سحبها ~صفر: كلها قراءة فقط وبترجّع false للزائر أصلًا.
--   فالمقايضة واضحة: خطر كسر حقيقي مقابل مكسب أمني معدوم. بتفضل.
--
--   اللي بيتسحب هو **الدوال اللي بتعمل حاجة**: بتكتب في القاعدة أو
--   بتبعت إشعارات أو بتحرق تسلسل. دي مفيش سبب واحد يخلّي زائر غير
--   مسجَّل يناديها.
--
-- التطبيق بينادي الدوال دي بدور `authenticated` (المستخدم مسجّل دخوله
-- وقت الشراء والحجز)، فالسحب من `anon` **مبيكسرش أي مسار شغّال**.
--
-- ============================================================
-- ٢) `sessions` الجدول الوحيد بلا حارس أعمدة
-- ============================================================
--
-- ملف 81 أظهر إن كل الجداول الحسّاسة عليها محفّظ `guard_*_trg` ما عدا
-- أربعة — تلاتة منهم مش محتاجين:
--
--   • `withdrawal_requests` · `instructor_payouts` — سياسة الكتابة
--     عليهم `is_super_admin()` وبس، مفيش مسار كتابة للمستخدم
--   • `order_items` — سياستها `is_admin()`
--   • `reviews` — الإدراج بس، وبشرط ضيّق، ومفيش سياسة UPDATE للمستخدم
--
-- والرابع **محتاج فعلًا**: `sessions`.
--
--   سياستها: `UPDATE USING (المدرب صاحب الجلسة OR is_admin())` وبلا
--   `WITH CHECK`، يعني بترجع لنفس شرط `USING`.
--
--   وقاعدة (ب): الصلاحيات بتحمي الصفوف لا الأعمدة. فالمدرب اللي من حقه
--   يعدّل جلسته يقدر يعدّل **أي عمود فيها** — بما فيها
--   `course_subscription_id`. يعني نظريًا يقدر **ينقل جلسة من اشتراك
--   طالب لاشتراك طالب تاني**، أو يغيّر `session_number` فيلخبط ترتيب
--   الباقة وحساب التقدّم.
--
--   المدرب محتاج يعدّل: الموعد (`scheduled_at`)، الحالة (`status`)،
--   ورابط اللقاء (`meeting_url`). مش محتاج يلمس حاجة تانية.
--
-- ⚠️ ده **احتمال مش عطل واقع** — مفيش دليل إنه حصل. بنقفله لأن تكلفة
--    القفل سطرين وتكلفة وقوعه إعادة بناء سجل جلسات.
--
-- ============================================================
-- ٣) طلبات الدعم — تضييق لا إقفال
-- ============================================================
--
-- سياسة `support_session_requests · INSERT` شرطها `true` حرفيًا.
--
-- ⚠️ **وده مقصود، مش عطل.** `submitSupportSessionRequest` في
--    `src/actions/support.ts` بتكتب `user_id: user?.id ?? null` — يعني
--    نموذج الدعم في صفحة `/support` **مفتوح للزائر بالتصميم**، عشان
--    حد لسه ما سجّلش يقدر يسأل. إقفاله يكسر الصفحة.
--
-- بس `true` بتسمح بحاجتين مش مقصودتين:
--   • زائر يكتب طلبًا منسوبًا **لمستخدم تاني** (`user_id` بتاعه)
--   • زائر يدرج الطلب بحالة `resolved` فما يظهرش لحد في المراجعة
--
-- فالتضييق: `user_id` لازم يبقى NULL أو صاحب الطلب نفسه، والحالة لازم
-- تبدأ `pending`. النموذج العام يفضل شغّال زي ما هو.
--
-- (الإغراق — زائر يدرج ألف صف — مش بيتحل من هنا؛ ده مكانه حد معدّل
--  على مستوى التطبيق. الجدول دلوقتي فيه **صفر صفوف**، فمفيش استعجال.)
--
-- ============================================================
-- ما الذي **لا** يغيّره هذا الملف
-- ============================================================
--
--   • قراءة `instructors` العامة (`approved_price` و`requested_price`
--     مكشوفان لأي زائر) — دي محتاجة تعديل في الكود كمان، فليها ملفها
--   • سقف مبلغ طلب السحب — الجدول فاضي والاعتماد بشري، فمش مستعجل
--   • أي سياسة قراءة قايمة
-- ============================================================

BEGIN;

-- ── ١) سحب تنفيذ الدوال الفاعلة من الزائر ──────────────────

-- إشعارات: زائر مجهول ما ينفعش يبعت إشعار لمستخدم ولا لكل المنصة.
REVOKE EXECUTE ON FUNCTION public.notify_user(text, text, text, text)
  FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.notify_admins(text, text, text)
  FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.notify_broadcast(text, text, text, text)
  FROM anon, public;

-- إنشاء الطلبات والحجوزات: مسار الشراء كله للمستخدم المسجَّل.
REVOKE EXECUTE ON FUNCTION public.create_customer_order(jsonb, jsonb)
  FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_course_booking(text, text, text, text)
  FROM anon, public;

-- تسلسل الأرقام المرجعية: بتتنادى **جوّه** create_customer_order
-- (وهي SECURITY DEFINER فبتشتغل بصلاحيات المالك)، فمحدش محتاج
-- يناديها من بره. سحبها من الدورين يمنع حرق التسلسل.
REVOKE EXECUTE ON FUNCTION public.next_payment_reference()
  FROM anon, authenticated, public;

-- دالة صيانة داخلية — مالهاش أي سبب تتنادى من التطبيق.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM anon, authenticated, public;

-- والتأكيد إن المستخدم المسجَّل لسه معاه اللي يحتاجه.
GRANT EXECUTE ON FUNCTION public.notify_user(text, text, text, text)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_admins(text, text, text)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_broadcast(text, text, text, text)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_customer_order(jsonb, jsonb)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_course_booking(text, text, text, text)
  TO authenticated;

-- ── ٢) حارس أعمدة الجلسات ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.guard_session_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- `auth.uid() IS NULL` معناها إن التعديل جاي من الخادم بمفتاح الخدمة
  -- (المهمة اليومية مثلًا). والزائر المجهول بترفضه RLS قبل ما يوصل هنا
  -- أصلًا. والإدارة ليها حق التعديل الكامل.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- المدرب بيعدّل الموعد والحالة ورابط اللقاء وبس. الباقي بيترجّع
  -- لقيمته القديمة بصمت — مش بنرمي خطأ، عشان تعديل عادي فيه عمود
  -- محمي ما يفشلش كله.
  NEW.id                     := OLD.id;
  NEW.course_subscription_id := OLD.course_subscription_id;
  NEW.instructor_id          := OLD.instructor_id;
  NEW.session_number         := OLD.session_number;
  NEW.created_at             := OLD.created_at;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_session_fields() FROM public, anon;

DROP TRIGGER IF EXISTS guard_session_fields_trg ON public.sessions;

CREATE TRIGGER guard_session_fields_trg
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_session_fields();

-- ── ٣) تضييق إدراج طلبات الدعم ─────────────────────────────

DROP POLICY IF EXISTS "Anyone can create support session requests"
  ON public.support_session_requests;

CREATE POLICY "Anyone can create support session requests"
  ON public.support_session_requests
  FOR INSERT
  WITH CHECK (
    -- الزائر بيسيب `user_id` فاضي؛ المسجَّل بيحطّ بتاعه هو وبس.
    (user_id IS NULL OR user_id = auth.uid())
    -- وكل طلب بيبدأ في قايمة المراجعة.
    AND status = 'pending'
  );

COMMIT;

-- ============================================================
-- استعلام التأكيد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الدوال الفاعلة: المفروض مفيش ولا واحدة لـ anon
  SELECT
    '1. دوال فاعلة للزائر'::text AS القسم,
    p.proname::text               AS البند,
    'anon لسه ينفّذها'::text      AS التفاصيل,
    '✗ لسه مفتوحة'::text          AS الحالة
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'notify_user', 'notify_admins', 'notify_broadcast',
      'create_customer_order', 'create_course_booking',
      'next_payment_reference', 'rls_auto_enable'
    )
    AND has_function_privilege('anon', p.oid, 'EXECUTE')

  UNION ALL

  SELECT
    '1. دوال فاعلة للزائر', 'الدوال السبعة',
    'مفيش ولا واحدة ممنوحة لـ anon', '✓ اتقفلت'
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'notify_user', 'notify_admins', 'notify_broadcast',
        'create_customer_order', 'create_course_booking',
        'next_payment_reference', 'rls_auto_enable'
      )
      AND has_function_privilege('anon', p.oid, 'EXECUTE')
  )

  UNION ALL

  -- ٢) المستخدم المسجَّل لسه بيشتري ويحجز (ما كسرناش حاجة)
  SELECT
    '2. المسجَّل لسه شغّال',
    p.proname::text,
    'authenticated ينفّذها',
    '✓ سليم'
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('create_customer_order', 'create_course_booking',
                      'notify_user', 'notify_admins')
    AND has_function_privilege('authenticated', p.oid, 'EXECUTE')

  UNION ALL

  -- ٣) حارس الجلسات
  SELECT
    '3. حارس الجلسات',
    COALESCE(tg.tgname, 'guard_session_fields_trg')::text,
    CASE WHEN tg.oid IS NULL
         THEN 'مش مربوط بالجدول'
         ELSE 'BEFORE UPDATE على sessions' END,
    CASE WHEN tg.oid IS NULL THEN '✗ مش موجود' ELSE '✓ اتركّب' END
  FROM (SELECT 1) x
  LEFT JOIN pg_trigger tg
    ON tg.tgrelid = 'public.sessions'::regclass
   AND tg.tgname = 'guard_session_fields_trg'
   AND NOT tg.tgisinternal

  UNION ALL

  -- ٤) سياسة طلبات الدعم
  SELECT
    '4. طلبات الدعم',
    p.policyname::text,
    COALESCE(p.with_check, '(بلا شرط)'),
    CASE
      WHEN COALESCE(p.with_check, '') ~* 'auth\.uid'
           AND COALESCE(p.with_check, '') ~* 'pending'
        THEN '✓ اتضيّقت'
      ELSE '✗ لسه مفتوحة'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'support_session_requests'
    AND p.cmd = 'INSERT'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع — لو حاجة وقعت، شغّل ده
-- ============================================================
--
-- BEGIN;
--
-- -- إرجاع منح الزائر (مش مستحسن — ده رجوع للحالة المكشوفة)
-- GRANT EXECUTE ON FUNCTION public.notify_user(text, text, text, text) TO anon;
-- GRANT EXECUTE ON FUNCTION public.notify_admins(text, text, text) TO anon;
-- GRANT EXECUTE ON FUNCTION public.notify_broadcast(text, text, text, text) TO anon;
-- GRANT EXECUTE ON FUNCTION public.create_customer_order(jsonb, jsonb) TO anon;
-- GRANT EXECUTE ON FUNCTION public.create_course_booking(text, text, text, text) TO anon;
-- GRANT EXECUTE ON FUNCTION public.next_payment_reference() TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO anon, authenticated;
--
-- -- إزالة حارس الجلسات
-- DROP TRIGGER IF EXISTS guard_session_fields_trg ON public.sessions;
-- DROP FUNCTION IF EXISTS public.guard_session_fields();
--
-- -- إرجاع سياسة الدعم المفتوحة
-- DROP POLICY IF EXISTS "Anyone can create support session requests"
--   ON public.support_session_requests;
-- CREATE POLICY "Anyone can create support session requests"
--   ON public.support_session_requests FOR INSERT WITH CHECK (true);
--
-- COMMIT;
-- ============================================================
