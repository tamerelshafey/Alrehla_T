-- قراءة فقط — مفيش أي تغيير في القاعدة.
--
-- ============================================================
-- 59 — تشخيص: الطلب ALR-000010-55 ظهر للإدارة ومظهرش للطالب والمدرب
-- ============================================================
--
-- الاستعلام بيدوّر على الرقم المرجعي في التلات جداول اللي بتستخدمه،
-- وبيطلّع لكل صف: صاحبه، وحالته، والمدرب المربوط بيه، و**عدد الجلسات
-- المتولّدة منه**.
--
-- العمود الأخير هو المهم. لو طلع صفر، تبقى دي المشكلة: الاشتراك اتأكد
-- ومفيش ولا جلسة اتعملت، ولوحة الطالب ولوحة المدرب الاتنين بيقروا من
-- جدول الجلسات — فمفيش حاجة تظهر عند أي حد منهم.
-- ============================================================

SELECT
  'باقة كتابة'                       AS النوع,
  cs.payment_reference               AS الرقم_المرجعي,
  cs.status                          AS الحالة,
  up.full_name                       AS المشتري,
  coalesce(ch.name, '— المشترك هو المشتري') AS الطفل,
  coalesce(i.name, '— مفيش مدرب مربوط ✗')   AS المدرب,
  p.name                             AS الباقة,
  p.sessions_count                   AS جلسات_الباقة,
  (SELECT count(*) FROM sessions s WHERE s.course_subscription_id = cs.id)
                                     AS الجلسات_المتولّدة
FROM course_subscriptions cs
LEFT JOIN user_profiles    up ON up.id::text = cs.user_id::text
LEFT JOIN child_profiles   ch ON ch.id::text = cs.child_id::text
LEFT JOIN instructors      i  ON i.id        = cs.preferred_instructor_id
LEFT JOIN creative_writing_packages p ON p.id = cs.package_id
WHERE cs.payment_reference = 'ALR-000010-55'

UNION ALL

SELECT
  'طلب منتج',
  o.payment_reference,
  o.status::text,
  up.full_name,
  '—', '—', '—', NULL, NULL
FROM orders o
LEFT JOIN user_profiles up ON up.id::text = o.user_id::text
WHERE o.payment_reference = 'ALR-000010-55'

UNION ALL

SELECT
  'طلب خدمة',
  so.payment_reference,
  so.status::text,
  up.full_name,
  '—',
  coalesce(i.name, '— مفيش مدرب ✗'),
  '—', NULL, NULL
FROM service_orders so
LEFT JOIN user_profiles up ON up.id::text = so.buyer_profile_id
LEFT JOIN instructors   i  ON i.id = so.instructor_id
WHERE so.payment_reference = 'ALR-000010-55';
