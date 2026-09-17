-- ============================================================
-- 36 — تشخيص: هل البريد اللي بتحاول تضيفه موجود؟
-- ============================================================
--
-- ملف قراءة فقط. ما بيغيّرش حاجة.
--
-- شاشة إضافة مقدّم الخدمة بتربط بحساب **موجود بالفعل** عن طريق بريده.
-- لو البريد مش في جدول `user_emails`، الإضافة بتترفض.
--
-- ⚠️ غيّر السطر اللي تحت وحطّ البريد اللي بتحاول تضيفه مكان
--    aaa@bbb.com — وسيب علامات التنصيص المفردة زي ما هي.
-- ============================================================

WITH target AS (
  SELECT lower(trim('aaa@bbb.com')) AS email     -- ← غيّر البريد هنا
)

SELECT 1 AS n, 'البريد المطلوب' AS البند, t.email AS القيمة
FROM target t

UNION ALL
SELECT 2, 'هل له حساب؟',
       CASE WHEN EXISTS (
              SELECT 1
              FROM user_emails ue
              JOIN target t ON ue.email = t.email
            )
            THEN 'نعم ✓'
            ELSE 'لأ ✗ — لازم يسجّل بنفسه أولاً، أو تضيفه من شاشة المستخدمين' END

UNION ALL
SELECT 3, 'هل هو مدرب بالفعل؟',
       CASE WHEN EXISTS (
              SELECT 1
              FROM user_emails ue
              JOIN target t      ON ue.email = t.email
              JOIN instructors i ON i.user_id::text = ue.user_id::text
            )
            THEN 'نعم — له صف مقدّم جاهز، عدّل عروضه بدل ما تضيفه'
            ELSE 'لأ' END

UNION ALL
SELECT 4, 'هل هو مضاف كمقدّم بالفعل؟',
       CASE WHEN EXISTS (
              SELECT 1
              FROM user_emails ue
              JOIN target t             ON ue.email = t.email
              JOIN service_providers sp ON sp.user_id::text = ue.user_id::text
            )
            THEN 'نعم' ELSE 'لأ' END

UNION ALL
-- لو الإدارة ما تقدرش تقرا جدول البريد أصلًا، الشاشة هتقول «مفيش حساب»
-- وهي في الحقيقة مش شايفة. الرقم ده بيفرّق بين الحالتين: صفر معناه
-- مشكلة صلاحيات، مش بريد غلط.
SELECT 5, 'عدد الحسابات اللي بتشوفها في جدول البريد', COUNT(*)::text
FROM user_emails

UNION ALL
-- غلطة إملائية صغيرة في البريد بتدي نفس رسالة «مفيش حساب».
SELECT 6, 'أقرب بريد شبيه',
       COALESCE(
         (SELECT string_agg(ue.email, '، ')
          FROM user_emails ue
          JOIN target t ON (
               ue.email LIKE '%' || split_part(t.email, '@', 1) || '%'
            OR ue.email LIKE '%' || split_part(t.email, '@', 2)
          )),
         '—')

ORDER BY n;
