-- ============================================================
-- 41 — إغلاق اللي كشفه تشخيص ملف 39
-- ============================================================
--
-- خمس مشاكل، كل واحدة مشروحة فوق جزئها. مفيش صف بيانات بيتعدّل في
-- الملف كله: سياسات ومحفّزات بس.
--
-- ⚠️ نمط متكرر لاحظته في التشخيص: سياسة قديمة واسعة قاعدة جنب سياسة
-- جديدة مضبوطة. والسياسات بتتجمع بـ«أو» — يعني الواسعة بتلغي أثر
-- المضبوطة تمامًا. حصل في `reviews`، وحاصل في `user_profiles`.
--
-- لو حصل خطأ في أي جزء، المعاملة بترجع بالكامل.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) المراجعات المخفية لسه ظاهرة للجميع
-- ------------------------------------------------------------
-- فيه سياستين قراءة:
--     "Visible reviews are public"     USING (is_hidden = false)   ← الصح
--     "Reviews are viewable by everyone" USING (true)              ← بتلغي اللي فوقها
-- يعني زرار «إخفاء المراجعة» في لوحة الإدارة بيغيّر العمود، والمراجعة
-- بتفضل مقروءة لأي حد بيسأل القاعدة. بنشيل الواسعة بس.
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

-- نفس الجدول: سياستين إدارة متطابقتين بالاسم مختلف — واحدة تكفي.
DROP POLICY IF EXISTS "Admin manages reviews" ON public.reviews;


-- ------------------------------------------------------------
-- 2) أي مستخدم مسجّل يقدر يكتب في تذكرة دعم مش بتاعته
-- ------------------------------------------------------------
-- السياسة الحالية شرط قراءتها سليم (صاحب التذكرة أو الإدارة)، لكن شرط
-- الكتابة فيها:  (is_admin() OR auth.uid() IS NOT NULL)
-- يعني «أي حد مسجّل دخوله» — فيقدر يضيف ردًا في تذكرة أي حد تاني،
-- وباسم أي مُرسِل.
-- بنعيد بناء نفس السياسة بشرط كتابة = صاحب التذكرة أو الإدارة،
-- وبنلزم إن المُرسِل يكون نفسه صاحب الحساب.
DROP POLICY IF EXISTS "Ticket owner or admin can view/reply" ON public.support_ticket_messages;

CREATE POLICY "Ticket owner or admin can view/reply"
  ON public.support_ticket_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id::text = support_ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR (
      sender_profile_id = (auth.uid())::text
      AND EXISTS (
        SELECT 1 FROM support_tickets t
        WHERE t.id::text = support_ticket_messages.ticket_id
          AND t.user_id = auth.uid()
      )
    )
  );


-- ------------------------------------------------------------
-- 3) أي مستخدم مسجّل يقدر يكتب في سجل التدقيق
-- ------------------------------------------------------------
-- شرط الإضافة الحالي: (auth.uid() IS NOT NULL)
-- يعني حد يقدر يضيف سطور باسم أي فاعل ويلوّث السجل — والسجل ده هو
-- اللي بنرجعله لو حصلت مشكلة ونسأل «مين عمل كده». قيمته في إنه
-- مش قابل للتلفيق.
-- الشرط الجديد: السطر لازم يكون باسم صاحب الحساب نفسه، أو من الإدارة.
DROP POLICY IF EXISTS "Authenticated users can write audit logs" ON public.audit_logs;

CREATE POLICY "Users write audit logs as themselves"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR actor_profile_id = (auth.uid())::text
  );


-- ------------------------------------------------------------
-- 4) المشترك يقدر يفعّل اشتراكه بنفسه
-- ------------------------------------------------------------
-- سياسة `course_subscriptions` بتدي المستخدم تحكّم كامل في صفه
-- (USING و WITH CHECK = auth.uid() = user_id). والصف فيه `status`.
-- يعني اشتراك حالته «بانتظار الدفع» ممكن يتحط عليه «نشط» من غير دفع.
--
-- الموقع بيعمل حاجتين بس: المستخدم بيحوّل الحالة لـ«بانتظار تأكيد
-- الدفع» بعد ما يرفع الإثبات، والإدارة بتحطها «نشط». فالمحفّز ده
-- بيسمح بالأولى ويمنع الباقي — من غير ما يكسر أي شاشة.
CREATE OR REPLACE FUNCTION public.guard_course_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- الملكية والباقة والمشارك ما بيتغيروش بعد الإنشاء.
  NEW.user_id          := OLD.user_id;
  NEW.package_id       := OLD.package_id;
  NEW.child_id         := OLD.child_id;
  NEW.participant_type := OLD.participant_type;
  NEW.started_at       := OLD.started_at;

  -- الحالة: الانتقال الوحيد المسموح للمستخدم هو إعلان إنه دفع.
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status <> 'awaiting_verification' THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS guard_course_subscription_fields_trg ON public.course_subscriptions;
CREATE TRIGGER guard_course_subscription_fields_trg
  BEFORE UPDATE ON public.course_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.guard_course_subscription_fields();


-- ------------------------------------------------------------
-- 5) الطالب يقدر يكتب ملاحظات المدرب على نصّه ويحطه «تمت المراجعة»
-- ------------------------------------------------------------
-- سياسة `portfolio_documents` بتخلي الطالب يعدّل صف نصّه، والصف فيه
-- `instructor_feedback` و`status`. يعني يقدر يكتب لنفسه ملاحظة مدرب
-- ويقفل النص على إنه «تمت مراجعته».
--
-- الموقع: الطالب بيحفظ مسودة أو يسلّم، والمدرب بيكتب الملاحظة ويحط
-- «تمت المراجعة». المحفّز بيثبّت التقسيم ده.
CREATE OR REPLACE FUNCTION public.guard_portfolio_document_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- المدرب والإدارة ومفتاح الخدمة: مسموح لهم بالكامل (التصحيح شغلهم).
  IF auth.uid() IS NULL OR public.is_admin() OR public.is_instructor() THEN
    RETURN NEW;
  END IF;

  NEW.student_id          := OLD.student_id;
  NEW.instructor_feedback := OLD.instructor_feedback;

  -- الطالب بيحفظ مسودة أو يسلّم — مش بيراجع نفسه.
  IF NEW.status NOT IN ('draft', 'submitted') THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS guard_portfolio_document_fields_trg ON public.portfolio_documents;
CREATE TRIGGER guard_portfolio_document_fields_trg
  BEFORE UPDATE ON public.portfolio_documents
  FOR EACH ROW EXECUTE FUNCTION public.guard_portfolio_document_fields();


-- ------------------------------------------------------------
-- 6) تنظيف: سياسات مكررة في الإشعارات
-- ------------------------------------------------------------
-- "Admin manages notifications" و"Admins manage notifications" متطابقتين،
-- و"Users see their own notifications" و"Users read their own notifications"
-- كمان. التكرار مش ثغرة، بس هو بالظبط اللي بيخلي حد يقرا سياسة ويفتكرها
-- الوحيدة الشغّالة.
DROP POLICY IF EXISTS "Admin manages notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users see their own notifications" ON public.notifications;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT 'المراجعات المخفية' AS البند,
       CASE WHEN EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
                         WHERE c.relname='reviews' AND p.polname='Reviews are viewable by everyone')
            THEN 'لسه مكشوفة ✗' ELSE 'اتقفلت ✓' END AS النتيجة
UNION ALL
SELECT 'ردود تذاكر الدعم',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
                         WHERE c.relname='support_ticket_messages'
                           AND pg_get_expr(p.polwithcheck,p.polrelid) LIKE '%sender_profile_id%')
            THEN 'اتقفلت ✓' ELSE 'لسه مفتوحة ✗' END
UNION ALL
SELECT 'سجل التدقيق',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
                         WHERE c.relname='audit_logs'
                           AND pg_get_expr(p.polwithcheck,p.polrelid) LIKE '%actor_profile_id%')
            THEN 'اتقفل ✓' ELSE 'لسه مفتوح ✗' END
UNION ALL
SELECT 'محفّز الاشتراكات',
       CASE WHEN EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
                         WHERE c.relname='course_subscriptions'
                           AND t.tgname='guard_course_subscription_fields_trg')
            THEN 'شغّال ✓' ELSE 'مش موجود ✗' END
UNION ALL
SELECT 'محفّز نصوص الطلاب',
       CASE WHEN EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
                         WHERE c.relname='portfolio_documents'
                           AND t.tgname='guard_portfolio_document_fields_trg')
            THEN 'شغّال ✓' ELSE 'مش موجود ✗' END;
