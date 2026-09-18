-- ============================================================
-- 71 — منع الزوار من دوال المدرب
-- ============================================================
--
-- استعلام التأكيد في ملف 70 طلّع:
--
--     instructor_sessions  →  ⚠️ مفتوحة للزوار
--     instructor_students  →  ⚠️ مفتوحة للزوار
--
-- **السبب، وهو خطأ مني في ملف 70:**
--
--   كتبت `REVOKE ALL ... FROM public` وافترضت إن ده بيشيل `anon`.
--   مش صح. Supabase بيحط صلاحيات افتراضية على المخطط:
--
--     ALTER DEFAULT PRIVILEGES IN SCHEMA public
--       GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
--
--   يعني أي دالة جديدة بتتولد ومعاها EXECUTE لـ`anon` **بشكل مستقل**
--   عن `public`. فالـREVOKE مشيّش حاجة من `anon`.
--
-- **هل كان فيه تسريب فعلي؟ لأ.**
--
--   الدالتين بيفلتروا على `i.user_id = auth.uid()`، والزائر غير المسجّل
--   `auth.uid()` بتاعته فاضية — فالـJOIN بيدي صفر صفوف مهما حصل.
--
--   بس ده حماية بالصدفة مش بالتصميم: أي تعديل مستقبلي على الدالة ينسى
--   الشرط ده بيبقى مكشوف للإنترنت كله فورًا. الصلاحية تتقفل صراحةً.
--
-- **مفيش صف بيتغيّر ومفيش دالة بتتعدّل.** سحب صلاحية تنفيذ بس.
-- ============================================================

BEGIN;

REVOKE EXECUTE ON FUNCTION public.instructor_sessions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.instructor_students() FROM anon;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
--
-- المتوقع: «الزوار ممنوعين ✓» في السطرين.
-- ============================================================
SELECT
  p.proname                                        AS الدالة,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✓'
       ELSE '✗ INVOKER — غلط' END                  AS الوضع,
  CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
       THEN 'authenticated ✓' ELSE '✗ ناقصة — المدرب مش هيشوف حاجة' END
                                                   AS صلاحية_التنفيذ,
  CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE')
       THEN '⚠️ لسه مفتوحة للزوار' ELSE 'الزوار ممنوعين ✓' END
                                                   AS الزوار,
  CASE WHEN pg_get_functiondef(p.oid) ILIKE '%payment_%'
         OR pg_get_functiondef(p.oid) ILIKE '%amount%'
       THEN '✗ بتلمس بيانات دفع — بلّغني'
       ELSE 'مفيش بيانات دفع ✓' END                AS بيانات_الدفع
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('instructor_sessions', 'instructor_students')
ORDER BY p.proname;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
-- ============================================================
-- BEGIN;
-- GRANT EXECUTE ON FUNCTION public.instructor_sessions() TO anon;
-- GRANT EXECUTE ON FUNCTION public.instructor_students() TO anon;
-- COMMIT;
