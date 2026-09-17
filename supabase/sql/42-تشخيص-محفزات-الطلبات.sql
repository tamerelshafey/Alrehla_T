-- قراءة فقط — مفيش أي تغيير في القاعدة.
-- استعلام واحد. شغّل الملف وابعت النتيجة (نص الدوال مهم بالكامل).
--
-- ============================================================
-- 42 — إيه اللي بيحمي جدول الطلبات دلوقتي؟
-- ============================================================
-- على `orders` فيه محفّزين شغّالين: guard_order_fields و
-- guard_order_insert. اتعملوا في ملفات مش محفوظة عندنا، ومش معروف
-- بيعملوا إيه بالظبط.
--
-- السؤال اللي محتاج إجابة قبل ما نصلّح التسعير:
--   هل فيه حاجة في القاعدة بتتحقق من `total_amount` و`shipping_fee`
--   و`unit_price`، ولا الأرقام بتتكتب زي ما وصلت من المتصفح؟
--
-- لو فيه تحقق، بنبني عليه. لو مفيش، بنعمله من الأول.
-- ============================================================

SELECT
  c.relname AS الجدول,
  t.tgname  AS المحفّز,
  CASE t.tgtype::int & 4 WHEN 4 THEN 'INSERT ' ELSE '' END ||
  CASE t.tgtype::int & 16 WHEN 16 THEN 'UPDATE' ELSE '' END AS العملية,
  pg_get_functiondef(p.oid) AS نص_الدالة
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc  p ON p.oid = t.tgfoid
WHERE c.relname IN ('orders', 'order_items')
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
