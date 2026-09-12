# Al-Rehla Database Architecture Reference

This file serves as the **OFFICIAL ARCHITECTURE REFERENCE** for the Al-Rehla project.

---

## 1. PLATFORM MODEL

Al-Rehla is one platform with **ONE** generic user account and **TWO** independent business domains:

### A. "إنها لك"
Personalized products and personalized books.

### B. "بداية الرحلة"
Creative-writing training programs/courses and related services.

The two domains are independent in their business logic but share the same user account and identity system. 

> **Note:** No AI is part of V1.

---

## 2. ACCOUNT / IDENTITY MODEL

* **Authentication:** Supabase Auth (`auth.users`)
* **Active application identity:** `user_profiles`

**Rule:** `user_profiles.id = auth.users.id`

A user account is **NOT** inherently a Parent. A user may:
- Purchase for themselves
- Enroll for themselves
- Manage children
- Purchase for one or multiple children
- Enroll one or multiple children

**Children under 12:**
- Are child profiles.
- Are **NOT** independent auth users.
- Are managed by the parent/guardian account.

**Important Distinctions:**
* Buyer != Recipient
* Buyer != Participant

---

## 3. IDENTITY TABLES

### `user_profiles`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key (matches `auth.users.id`) |
| `full_name` | TEXT | |
| `role` | TEXT | |
| `is_guardian` | BOOLEAN | |
| `avatar_url` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `child_profiles`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `user_profile_id` | UUID | Foreign Key -> `user_profiles.id` |
| `name` | TEXT | |
| `age` | INTEGER | |
| `created_at` | TIMESTAMPTZ | |

**Relationship:** `user_profiles` (1) -> (N) `child_profiles`

**Legacy Notice:**
`public.profiles` exists only as legacy development data and is **NOT** used by the application. Do not build new functionality around `public.profiles`.

---

## 4. "إنها لك"

**Business definition:**
"إنها لك" is the personalized product/book domain. It contains:
- Al-Rehla-owned products
- Publisher-owned products
- Publisher products may also be personalized

**Core entities:**
* `publishers`
* `personalized_products`
* `orders`
* `order_items`

**Publisher:** A publisher is a product/content provider.
**Product:** Keep the existing database table name: `personalized_products`.
**Product ownership:** `platform` or `publisher`. A publisher product may still be personalizable.

---

## 5. ORDER MODEL

`orders` represents the purchase transaction.

### `orders`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `user_profiles.id` |
| `total_amount` | NUMERIC | |
| `status` | TEXT | |
| `transaction_reference`| TEXT | Nullable |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

> **IMPORTANT:** The order itself has **NO** recipient. 

`order_items` represents each purchased product. Recipient belongs to the individual order item.

### `order_items`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key -> `orders.id` |
| `product_id` | TEXT | |
| `quantity` | INTEGER | |
| `unit_price` | NUMERIC | |
| `customization_data` | JSONB | Contains recipient and customization details |
| `created_at` | TIMESTAMPTZ | |

### Current V1 `customization_data` contract:
```json
{
  "recipientType": "self" | "child",
  "childId": "string | undefined",
  "childName": "string",
  "childPhotoFile": "string | undefined",
  "heroDescription": "string",
  "storyGoal": "string",
  "familyMemberNames": "string | undefined",
  "selectedAddonIds": ["string"]
}
```

* **When `recipientType = child`:**
  * `childId` is the authoritative identity.
  * `childId` must belong to the current user's `child_profiles`.
* **When `recipientType = self`:**
  * No `childId` is required.

This design supports one order containing items for different children and/or the buyer.

---

## 6. "بداية الرحلة"

**Business definition:**
"بداية الرحلة" is the creative-writing education domain. The core product is the training package/program. Instructors provide the sessions.

**Current V1 entities:**
* `creative_writing_packages`
* `course_subscriptions`
* `instructors`
* `sessions`
* `bookings`
* `session_messages`
* `session_attachments`

> **Do NOT create a separate programs table in V1.**

---

## 7. COURSE SUBSCRIPTIONS = ENROLLMENT

`course_subscriptions` represents the complete enrollment.

### `course_subscriptions`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `package_id` | TEXT | Foreign Key -> `creative_writing_packages.id` |
| `user_id` | UUID | Foreign Key -> `user_profiles.id` |
| `participant_type` | TEXT | `self` | `child` |
| `child_id` | TEXT | Nullable, Foreign Key -> `child_profiles.id` |
| `status` | TEXT | |
| `started_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

**Rules:**
* `participant_type = self` => `child_id` must be null.
* `participant_type = child` => `child_id` is required.

The `user_id` identifies the buyer/account owner. The participant may be the user or one of their children.

---

## 8. INSTRUCTORS

`instructors` is the provider entity. Existing structure is retained.

**Important distinction:**
* Instructor != Program
* Instructor != Enrollment
* Instructor != Session

An instructor delivers sessions.

---

## 9. SESSIONS

`sessions` represents the actual individual lessons.

### `sessions`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `course_subscription_id`| TEXT | Foreign Key -> `course_subscriptions.id` |
| `instructor_id` | TEXT | Nullable, Foreign Key -> `instructors.id` |
| `session_number` | INTEGER | |
| `scheduled_at` | TIMESTAMPTZ | |
| `status` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Nullable |

**Relationship:** `course_subscriptions` (1) -> (N) `sessions`
Each session belongs to exactly one enrollment.

---

## 10. BOOKINGS

`bookings` is only a scheduling/booking record. It must NOT represent the student's full enrollment.

### `bookings` (Target V1 Structure)
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `session_id` | TEXT | Foreign Key -> `sessions.id` |
| `status` | TEXT | |
| `booked_at` | TIMESTAMPTZ | |

**The enrollment relationship is:**
`course_subscriptions` -> `sessions`
*(NOT `course_subscriptions` -> `bookings`)*

---

## 11. SESSION COMMUNICATION

All session communication is linked to `session_id`. Do not link session messages/attachments to `booking_id`.

### `session_messages`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `session_id` | TEXT | Foreign Key -> `sessions.id` |
| `sender_name` | TEXT | |
| `message` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

### `session_attachments`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `session_id` | TEXT | Foreign Key -> `sessions.id` |
| `file_name` | TEXT | |
| `file_url` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

## 12. RELATED SERVICES

"بداية الرحلة" may also offer standalone creative services.

**Existing entities:**
* `standalone_services`
* `service_orders`

These remain separate from the core course enrollment model.

---

## 13. SUPPORTING TABLES

Existing supporting/operational tables include:
* `blog_posts`, `testimonials`, `site_settings`
* `instructor_certifications`, `instructor_compensation_profiles`, `instructor_pricing_options`, `instructor_weekly_slots`, `instructor_payouts`
* `publisher_profiles`, `publisher_payouts`
* `reviews`, `study_materials`, `portfolio_documents`
* `notifications`, `support_tickets`, `support_ticket_messages`, `support_session_requests`
* `audit_logs`, `join_requests`, `profile_update_requests`

These are supporting systems and must not be unnecessarily redesigned.

---

## 14. FUTURE ROADMAP

Do not implement these in V1 unless a real requirement appears.

* **Commerce:** payments, refunds, coupons, addresses, shipments, fulfillment, settlements.
* **Learning:** curriculum_modules, assignments, submissions, attendance, progress, certificates.
* **Scheduling:** availability, recurring_sessions, rescheduling workflow, attendance.
* **Platform:** favorites, wishlist, advanced reviews, richer notifications.
* **AI:** explicitly NOT part of current V1.
* **Daily.co:** future integration for live sessions.
* **Cloudinary:** future media-storage integration.

---

## 15. SECURITY PRINCIPLES

1. Application identity is `user_profiles`.
2. RLS must be applied to private/transactional data.
3. Users must only access:
   - their own profile data
   - their own child profiles
   - their own orders
   - their own order items
   - their own course enrollments
   - their own sessions
4. Child ownership must always be validated through `child_profiles.user_profile_id`.
5. Do not trust client-supplied child IDs without ownership validation.
6. Never use service-role credentials in browser/client code.

---

## 16. ARCHITECTURAL DECISIONS

* **Decision 1:** One account for the entire platform.
* **Decision 2:** A user is not automatically a parent.
* **Decision 3:** Children under 12 are child profiles, not auth users.
* **Decision 4:** Buyer and recipient/participant are different concepts.
* **Decision 5:** Order recipient belongs to `order_items`.
* **Decision 6:** `course_subscriptions` is the V1 enrollment entity.
* **Decision 7:** `sessions` represent real lessons.
* **Decision 8:** `bookings` are scheduling records only.
* **Decision 9:** session messages and attachments belong to sessions.
* **Decision 10:** Customization remains JSONB inside `order_items` for V1.
* **Decision 11:** Do not create Program entity in V1.
* **Decision 12:** Do not create a separate customization table in V1.
* **Decision 13:** Do not add AI to V1.
* **Decision 14:** Do not redesign the stack.
* **Decision 15:** `user_profiles` is the active identity model. `profiles` is legacy.

---

## 17. CURRENT IMPLEMENTATION STATUS

Based on the current repository:

**Implemented:**
- Supabase Auth
- `user_profiles` synchronization
- generic account model
- initial V1 core refactor
- TypeScript strict checking
- successful production build

**In progress:**
- Supabase schema alignment
- real child profile persistence
- real creative-writing enrollment/session persistence

**Not implemented:**
- Daily.co
- Cloudinary migration
- AI
- advanced payment gateway
- advanced scheduling
- advanced learning progress

**Legacy/technical debt:**
- `public.profiles` table
- legacy mock transactional data where still present
- duplicated ENUM naming where still present
- any legacy booking participant fields that are no longer part of the target V1 model

---

## 18. V1 ERD

```text
auth.users
    |
    1:1
user_profiles
    |
    1:N
child_profiles


publishers
    |
    1:N
personalized_products
    |
    1:N
order_items
    |
    N:1
orders
    |
    N:1
user_profiles


user_profiles
    |
    1:N
course_subscriptions
    |
    N:1
creative_writing_packages


course_subscriptions
    |
    1:N
sessions
    |
    N:1
instructors


sessions
    |
    1:N
session_messages


sessions
    |
    1:N
session_attachments


sessions
    |
    1:0..1
bookings
```

---

## 19. RULE BEFORE FUTURE CHANGES

Before adding a new table or changing an existing core relationship:

1. Check this document.
2. Confirm the actual business requirement.
3. Prefer extending an existing entity over creating a duplicate entity.
4. Do not introduce speculative abstractions.
5. Update this document when an architectural decision changes.
