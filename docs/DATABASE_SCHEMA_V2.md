# منصة الرحلة — الرسم الهندسي لقاعدة البيانات (ERD) - الإصدار المحدث

هذا المستند يمثل الهيكل النهائي والمحدث لقاعدة البيانات بناءً على الملف الهندسي القديم وتحديثات النماذج (Types) الحالية في المنصة (بما في ذلك التسعير، المحافظ المالية، مستندات الكتابة، ومستحقات المدربين). تم تصميم هذا الهيكل ليكون متوافقاً تماماً مع `Drizzle ORM` و `PostgreSQL`.

---

## ١. مبادئ التصميم الحاكمة (المحدثة)

1. **جدول هوية واحد (`profiles`)**: لكل شخص يمتلك حساب دخول. يُحدد الدور بجدول `user_roles`.
2. **المشارك التابع (`child_profiles`)**: لا يملك حساب دخول، بل يتبع لولي أمر.
3. **مرجعية المشارك الصارمة**: استخدام `dependent_participant_id` و `independent_participant_id` مع قيد `CHECK` في قاعدة البيانات لضمان عدم وجود تضارب.
4. **أنظمة طلبات واشتراكات مستقلة**: فصل `orders` (إنها لك) عن `service_orders` (بداية الرحلة). وفصل `box_subscriptions` عن `course_subscriptions`.
5. **النزاهة المالية وسجلات التدقيق**: استخدام `audit_logs` لجميع العمليات الحساسة، وجداول مفصلة للمستحقات `payouts` وطلبات السحب `withdrawal_requests`.

---

## ٢. الهوية، الأدوار، والصلاحيات

```text
profiles
├── id (PK) - UUID
├── clerk_user_id (unique) - للمصادقة الخارجية
├── full_name, email, phone
├── is_guardian (bool)
├── promoted_from_child_profile_id (FK → child_profiles.id, nullable)
├── created_at, updated_at

user_roles
├── id (PK)
├── profile_id (FK → profiles.id)
├── role (enum: customer | student | instructor | publisher | admin)

admin_permissions
├── id (PK)
├── profile_id (FK → profiles.id)
├── can_manage_users, can_manage_finance, can_view_audit_logs... (Booleans)

child_profiles
├── id (PK)
├── guardian_profile_id (FK → profiles.id)
├── full_name, birth_date, avatar_url
```

---

## ٣. المدربون، الناشرون، والتعاقدات

```text
instructors
├── id (PK)
├── profile_id (FK → profiles.id, unique)
├── bio, video_url
├── status (enum: pending | active | suspended)
├── rating (float)

instructor_certifications
├── id (PK)
├── instructor_id (FK → instructors.id)
├── exam_passed (bool), exam_score (int)
├── training_completed_at, certified_at

instructor_compensation_profiles
├── id (PK)
├── instructor_id (FK → instructors.id)
├── billing_model (enum: monthly | per_session)
├── monthly_minimum_hours, overtime_rate_per_hour
├── approval_status (enum: proposed | under_discussion | approved | rejected)

publisher_profiles
├── id (PK)
├── profile_id (FK → profiles.id, unique)
├── slug, brand_name, logo_url, bio
├── is_sample (bool), status
```

---

## ٤. "إنها لك" — المنتجات، الطلبات، وصندوق الرحلة

```text
personalized_products
├── id (PK)
├── owner_type (enum: platform | publisher)
├── publisher_id (FK → publisher_profiles.id, nullable)
├── title, slug, short_description, category
├── base_price, cover_image_url

orders
├── id (PK)
├── customer_profile_id (FK → profiles.id)
├── dependent_participant_id, independent_participant_id (CHECK Constraint)
├── status (enum: pending | paid | refunded | failed)
├── total_amount, transaction_reference

order_items
├── id (PK)
├── order_id (FK → orders.id)
├── product_id (FK → personalized_products.id)
├── quantity, unit_price
├── customization_data (JSONB)

box_subscriptions
├── id (PK)
├── customer_profile_id (FK → profiles.id)
├── plan_name, status (active | paused | cancelled)
├── next_shipment_date
```

---

## ٥. "بداية الرحلة" — الباقات، الجلسات، والمستندات (Portfolio)

```text
creative_writing_packages
├── id (PK)
├── title, slug, price, sessions_count, level

course_subscriptions
├── id (PK)
├── package_id (FK → creative_writing_packages.id)
├── guardian_profile_id (FK → profiles.id, nullable)
├── dependent_participant_id, independent_participant_id (CHECK Constraint)
├── status (enum: active | completed | cancelled)

service_orders
├── id (PK)
├── buyer_profile_id (FK → profiles.id)
├── package_id (FK → creative_writing_packages.id, nullable)
├── status, amount, transaction_reference

bookings
├── id (PK)
├── service_order_id (FK → service_orders.id)
├── course_subscription_id (FK → course_subscriptions.id, nullable)
├── instructor_id (FK → instructors.id)
├── dependent_participant_id, independent_participant_id (CHECK Constraint)
├── status, scheduled_at

portfolio_documents (كتابات ومسودات الطلاب)
├── id (PK)
├── student_profile_id / child_profile_id (تحديد الكاتب)
├── title, content (text)
├── instructor_feedback (text)
├── status (enum: draft | submitted | reviewed)
```

---

## ٦. الدعم الفني والإشعارات

```text
support_tickets
├── id (PK)
├── requester_profile_id (FK → profiles.id)
├── subject, category, status (open | answered | closed)

support_ticket_messages
├── id (PK)
├── ticket_id (FK → support_tickets.id)
├── sender_profile_id (FK → profiles.id)
├── message (text)

support_session_requests (طلبات مساعدة الحجز)
├── id (PK)
├── contact_name, contact_phone, message, status

notifications
├── id (PK)
├── recipient_profile_id (FK → profiles.id)
├── title, message, is_read
```

---

## ٧. الشؤون المالية، المستحقات، والتدقيق (Finance & Audit)

```text
pricing_formula_settings (Singleton)
├── id (PK) - دائماً 'default'
├── platform_multiplier (float)
├── fixed_admin_fee (float)

instructor_payouts
├── id (PK)
├── instructor_id (FK → instructors.id)
├── period, amount, status (pending | paid)

publisher_payouts
├── id (PK)
├── publisher_id (FK → publisher_profiles.id)
├── period, amount, status (pending | paid)

withdrawal_requests (طلبات السحب)
├── id (PK)
├── instructor_id (FK → instructors.id)
├── amount, method (bank | wallet)
├── status (pending | processed)

audit_logs
├── id (PK)
├── actor_profile_id (FK → profiles.id, nullable)
├── action, entity_type, entity_id
├── metadata (JSONB)
