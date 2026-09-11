# منصة الرحلة — مخطط قاعدة البيانات (نسخة ٢) — مُستخرَج من الكود الفعلي

**تاريخ الإعداد:** ١٠ سبتمبر ٢٠٢٦
**المصدر:** `src/types/index.ts` الحالي مباشرة (بعد تنظيف كل التكرارات)، وليس مستند يدوي قديم. هذا المستند **يحل محل** ERD v1 السابق ويُعتمد كمرجع وحيد لبناء قاعدة بيانات Supabase في المرحلة ١٣.

## مبادئ التصميم المُطبَّقة (قرارات سابقة محسومة، مُنفَّذة هنا حرفيًا)
1. نمط "المشارك المرجعي": عمودان حقيقيان `dependent_participant_id` / `independent_participant_id` + قيد CHECK، وليس عمودًا واحدًا متعدد الشكل.
2. `has_detail_page` على المنتجات **لا يُخزَّن** — يُشتق من `owner_type` وقت الاستعلام.
3. مستحقات المدربين والناشرين جدولان منفصلان تمامًا، لا جدول موحّد.
4. أنواع الطلبات: `orders` (إنها لك) و`service_orders` (بداية الرحلة) منفصلان تمامًا، ولا يوجد جدول طلبات موحّد.
5. أنواع الاشتراكات: `box_subscriptions` و`course_subscriptions` منفصلان تمامًا.
6. **قرار جديد في هذه النسخة**: نموذج الأدوار مبسّط عن ERD v1 — عمود `role` واحد مباشر على `profiles` (وليس جدول `user_roles` منفصل)، لأن التطبيق الفعلي المبني بالكامل يستخدم دورًا واحدًا لكل حساب بلا استثناء. صلاحيات الإدارة المُجزّأة (`AdminPermission`) تُخزَّن كمصفوفة نصية بسيطة (`text[]`) على نفس السجل، لا جدول Join منفصل — أبسط ويطابق الاستخدام الفعلي تمامًا.
7. **`PublisherOrder` ليست جدولًا** — تُبنى كـ View محسوبة من `orders`+`order_items`+`personalized_products` (كما صححنا في الكود بالفعل)، وليست بيانات مخزَّنة مستقلة.
8. RLS خارج نطاق هذا المستند عمدًا — مرحلة مستقلة بعد إنشاء الجداول.

---

## ١. الهوية والعائلات

```sql
profiles
├── id (PK, uuid)
├── clerk_user_id (unique, text)
├── full_name, email, phone
├── role (enum: visitor | customer | student | instructor | publisher | general_supervisor | super_admin)
├── is_guardian (bool, يُحدَّث تلقائيًا عند إضافة أول child_profile)
├── permissions (text[], يُستخدم فقط لأدوار general_supervisor/super_admin)
├── avatar_url, created_at

child_profiles
├── id (PK)
├── guardian_profile_id (FK → profiles.id)
├── full_name
├── birth_date  -- تحسين عن الكود الحالي: يُخزَّن تاريخ ميلاد لا عمر ثابت (العمر رقم متغيّر، لا يُخزَّن كقيمة جامدة)
├── avatar_url, created_at
```

---

## ٢. المدربون: الملف، الجدولة، التسعير، الاعتماد

```sql
instructors
├── id (PK)
├── profile_id (FK → profiles.id, unique)
├── display_name, bio, specialties (text[]), avatar_url, years_experience
├── status (enum: pending_training | pending_approval | active | suspended)
├── training_passed (bool)
├── work_model (enum: per_session | monthly)
├── requested_price, approved_price (numeric, nullable)
├── selected_pricing_option_id (FK → instructor_pricing_options.id, nullable)
├── monthly_hours_committed (int, nullable — إلزامي منطقيًا فقط عند work_model='monthly'، حد أدنى ٦٠)
├── created_at

instructor_weekly_slots  -- تطبيع لمصفوفة weeklySchedule المُضمَّنة حاليًا (تحسين: جدول حقيقي بدل JSON، يتيح استعلام "من المتاح الساعة كذا" مباشرة)
├── id (PK)
├── instructor_id (FK → instructors.id)
├── day_of_week (enum: saturday..friday)
├── time (time)
├── is_booked (bool)
├── commitment_type (enum: ongoing | fixed_term)
├── commitment_months (int, nullable)
├── commitment_ends_at (timestamptz, nullable)
├── is_pending_change (bool, default false)  -- بديل بسيط عن pendingSchedule المنفصلة في الكود الحالي

profile_update_requests
├── id (PK)
├── instructor_id (FK → instructors.id)
├── requested_changes (jsonb)
├── status (enum: pending | approved | rejected)
├── admin_feedback, created_at

reviews
├── id (PK)
├── dependent_participant_id, independent_participant_id (نمط المشارك المرجعي + CHECK)
├── instructor_id (FK → instructors.id)
├── rating (int, 1-5), comment
├── booking_id (FK → bookings.id, nullable)
├── created_at

instructor_pricing_options
├── id (PK)
├── label, base_price_per_session (numeric)
├── is_active (bool)

pricing_formula_settings  -- سجل واحد فقط (singleton)
├── id (PK, قيمة ثابتة 'default')
├── platform_multiplier (numeric)
├── fixed_admin_fee (numeric)
├── updated_at

instructor_compensation_profiles
├── id (PK)
├── instructor_id (FK → instructors.id)
├── billing_model (enum: monthly | per_session)
├── selected_pricing_option_id (FK → instructor_pricing_options.id)
├── monthly_minimum_hours (int, افتراضي ٦٠)
├── overtime_rate_per_hour (numeric, nullable)
├── approval_status (enum: proposed | under_discussion | approved | rejected)
├── admin_notes, reviewed_by_profile_id (FK → profiles.id, nullable)
├── created_at, updated_at

instructor_certifications
├── id (PK)
├── instructor_id (FK → instructors.id)
├── training_completed_at, training_meeting_link
├── exam_passed (bool), exam_score (int, nullable)
├── certified_at

instructor_payouts
├── id (PK)
├── instructor_id (FK → instructors.id)
├── period, amount (numeric)
├── status (enum: pending | paid)
```

---

## ٣. الناشرون والمنتجات

```sql
publisher_profiles
├── id (PK)
├── profile_id (FK → profiles.id, unique)
├── slug, name, logo_url, bio
├── status (enum: pending | active | suspended)

personalized_products
├── id (PK)
├── slug, name
├── category (enum: library | custom | subscription)
├── price, electronic_price (numeric, nullable)
├── short_description, cover_image_url
├── publisher_id (FK → publisher_profiles.id, nullable)
├── owner_type (enum: platform | publisher)  -- has_detail_page يُشتق: (owner_type = 'platform')
├── features (text[], nullable)

publisher_payouts
├── id (PK)
├── publisher_id (FK → publisher_profiles.id)
├── period, amount (numeric)
├── status (enum: pending | paid)

-- VIEW وليست جدولًا: publisher_orders_view
-- تُبنى من JOIN بين order_items وorders وpersonalized_products،
-- مفلترة بمنتجات كل ناشر، مع حساب publisher_share كنسبة من unit_price*quantity
```

---

## ٤. باقات الكتابة والحجوزات والجلسات

```sql
creative_writing_packages
├── id (PK)
├── slug, name
├── age_group (enum: under_12 | 12_plus)
├── price (numeric), duration_text, sessions_count (int)
├── session_duration (text, nullable)
├── target_audience, prerequisite_note (nullable)
├── prerequisite_package_id (FK → creative_writing_packages.id, self, nullable)
├── short_description, full_description, is_active (bool)

standalone_services
├── id (PK)
├── name, price (numeric), description

service_orders
├── id (PK)
├── buyer_profile_id (FK → profiles.id)
├── package_id (FK → creative_writing_packages.id, nullable)
├── standalone_service_id (FK → standalone_services.id, nullable)
├── CHECK: بالضبط واحد من الاثنين غير NULL
├── status (enum: pending | awaiting_verification | paid | refunded)
├── amount (numeric), transaction_reference (text, nullable)
├── created_at

course_subscriptions
├── id (PK)
├── package_id (FK → creative_writing_packages.id)
├── guardian_profile_id (FK → profiles.id, nullable)
├── dependent_participant_id, independent_participant_id (نمط المشارك المرجعي + CHECK)
├── status (enum: active | completed | cancelled)
├── started_at, created_at

bookings
├── id (PK)
├── dependent_participant_id, independent_participant_id (نمط المشارك المرجعي + CHECK)
├── package_id (FK → creative_writing_packages.id)
├── instructor_id (FK → instructors.id, nullable)
├── course_subscription_id (FK → course_subscriptions.id, nullable)
├── status (enum: pending | confirmed | completed | cancelled)
├── scheduled_at, created_at

-- ملاحظة تبسيط عن ERD v1: لا يوجد جدول scheduled_sessions منفصل في
-- التطبيق الفعلي — كل booking يمثّل جلسة واحدة مباشرة. الرسائل والمرفقات
-- ترتبط بـbooking_id مباشرة.

session_messages
├── id (PK)
├── booking_id (FK → bookings.id)
├── sender_profile_id (FK → profiles.id)  -- تحسين: FK حقيقي بدل sender_name نصي في الكود الحالي
├── message, created_at

session_attachments
├── id (PK)
├── booking_id (FK → bookings.id)
├── file_name, file_url

portfolio_documents
├── id (PK)
├── dependent_participant_id, independent_participant_id (نمط المشارك المرجعي + CHECK)
├── title, content
├── status (enum: draft | submitted | reviewed)
├── instructor_feedback (nullable)
├── updated_at

study_materials
├── id (PK)
├── title, description
├── package_id (FK → creative_writing_packages.id)  -- تحسين: FK بدل packageName نصي في الكود الحالي

-- ملاحظة: InstructorStudent في الكود الحالي بيانات محسوبة (View) من
-- bookings المرتبطة بمدرب معيّن، وليست جدولًا مخزَّنًا مستقلًا.
```

---

## ٥. طلبات "إنها لك"

```sql
orders
├── id (PK)
├── customer_profile_id (FK → profiles.id)
├── dependent_participant_id, independent_participant_id (نمط المشارك المرجعي، الاثنان NULL جائز — الطلب قد يكون بلا مشارك محدد)
├── total_amount (numeric)
├── status (enum: pending | awaiting_verification | paid | failed | refunded)
├── transaction_reference (text, nullable)
├── created_at

order_items
├── id (PK)
├── order_id (FK → orders.id)
├── product_id (FK → personalized_products.id)
├── quantity (int), unit_price (numeric)
├── customization_data (jsonb — child_name, child_photo_url, cover_choice, notes)
```

---

## ٦. الاشتراكات

```sql
box_subscription_plans
├── id (PK)
├── name, price_total, price_monthly (numeric)
├── duration_months (int), savings_note (nullable)

box_subscriptions
├── id (PK)
├── customer_profile_id (FK → profiles.id)  -- تحسين: FK بدل customer_name نصي في الكود الحالي
├── plan_id (FK → box_subscription_plans.id)
├── status (enum: active | paused | cancelled)
├── next_shipment_date
```

---

## ٧. الدعم والتوظيف

```sql
support_tickets
├── id (PK)
├── requester_profile_id (FK → profiles.id)
├── subject, category
├── status (enum: open | answered | closed)
├── created_at

support_ticket_messages
├── id (PK)
├── ticket_id (FK → support_tickets.id)
├── sender_profile_id (FK → profiles.id)
├── message, created_at

support_session_requests
├── id (PK)
├── contact_name, contact_phone, message
├── status (enum: pending | contacted | closed)
├── created_at

join_requests
├── id (PK)
├── applicant_name
├── requested_role (enum: instructor | publisher)
├── status (enum: pending | approved | rejected)
├── created_at
```

---

## ٨. المحتوى والإشعارات

```sql
blog_posts
├── id (PK), slug, title, excerpt, content, cover_image_url
├── author_name, published_at

testimonials
├── id (PK), author_name, author_role, content

site_settings  -- singleton عام، تغذّي صفحة /dashboard/admin/content/settings
├── id (PK), key (unique), value (jsonb)

notifications
├── id (PK)
├── recipient_profile_id (FK → profiles.id)
├── title, message, is_read (bool)
├── created_at
```

---

## ٩. المالية والتدقيق

```sql
audit_logs
├── id (PK)
├── actor_profile_id (FK → profiles.id, nullable)
├── action, entity_type, entity_id (nullable)
├── metadata (jsonb)
├── created_at
```

---

## ملاحظة على بوابة الدفع
`payment_method` (enum: credit_card | fawry | wallet) معرَّف في الكود الحالي كتحضير مستقبلي فقط — غير مستخدَم فعليًا بعد لأن InstaPay (المرحلة الحالية) تُدار عبر `transaction_reference` النصي + تأكيد إداري يدوي، لا بوابة برمجية. يُفعَّل هذا العمود فعليًا عند ربط بوابة خارجية لاحقًا.

## تحسينات مقترحة في هذه النسخة (تحتاج تأكيدك قبل التنفيذ)
1. تطبيع الجدولة الأسبوعية لجدول حقيقي (`instructor_weekly_slots`) بدل مصفوفة مُضمَّنة — يتيح استعلامات توفّر حقيقية.
2. `child_profiles.birth_date` بدل عمر ثابت مخزَّن.
3. `session_messages.sender_profile_id` وربط حقيقي بدل اسم نصي.
4. `study_materials.package_id` وربط حقيقي بدل اسم باقة نصي.
5. `box_subscriptions.customer_profile_id` FK حقيقي بدل اسم نصي.
6. نموذج الأدوار المبسّط (عمود واحد + صلاحيات كمصفوفة) بدل جدول user_roles منفصل من ERD v1.
