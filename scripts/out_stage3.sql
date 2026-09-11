-- ==========================================
-- المرحلة 3: الطلبات، الاشتراكات، والدعم
-- ==========================================

INSERT INTO orders (id, customer_profile_id, independent_participant_id, total_amount, status, transaction_reference, created_at) VALUES
('ord-1', 'usr-1', 'usr-1', 21350, 'paid', NULL, '2026-09-09T12:51:31.943Z'),
('ord-2', 'usr-1', 'usr-1', 400, 'pending', NULL, '2026-09-10T12:51:31.943Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, customization_data) VALUES
('item-ord-1-1', 'ord-1', 'prod-lib-1', 1, 350, NULL),
('item-ord-1-2', 'ord-1', 'prod-custom-2', 1, 21000, NULL),
('item-ord-2-1', 'ord-2', 'prod-lib-2', 1, 400, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO box_subscription_plans (id, name, price_total, price_monthly, duration_months, savings_note) VALUES
('plan-1', 'باقة 3 شهور', 1050, 350, 3, 'وفر 50 ج.م'),
('plan-2', 'باقة 6 شهور', 1950, 325, 6, 'وفر 150 ج.م'),
('plan-3', 'باقة سنوية', 3600, 300, 12, 'وفر 600 ج.م')
ON CONFLICT (id) DO NOTHING;

INSERT INTO box_subscriptions (id, customer_profile_id, plan_id, status, next_shipment_date) VALUES
('sub-1', 'usr-1', 'plan-1', 'active', NULL),
('sub-2', 'usr-1', 'plan-2', 'paused', NULL),
('sub-3', 'usr-1', 'plan-3', 'active', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO support_tickets (id, requester_profile_id, subject, category, status, created_at) VALUES
('tkt-1', 'usr-1', 'مشكلة في الدفع', 'billing', 'open', '2023-10-25T00:00:00Z'),
('tkt-2', 'usr-1', 'استفسار عن باقة', 'general', 'answered', '2023-10-26T00:00:00Z'),
('tkt-3', 'usr-1', 'تأخر الشحنة', 'shipping', 'closed', '2023-10-20T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

