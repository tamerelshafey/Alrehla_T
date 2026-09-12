# الرحلة (Al-Rehla)

Al-Rehla is a comprehensive platform designed to enrich the educational and creative journeys of its users. It unifies two distinct offerings into a single seamless experience:
1. **"إنها لك" (It's Yours)** — A marketplace for personalized books and creative products.
2. **"بداية الرحلة" (The Journey Begins)** — Specialized creative writing education and training programs.

## Platform Concept

Al-Rehla uses **one unified user account** across independent but connected domains. 
* A user may use either domain directly (e.g., just buying a book, or just enrolling in a course).
* A user is **not** required to be a parent to use the platform.
* A parent or guardian may create and manage child profiles.
* Children under 12 are managed as **dependent profiles** within the parent's account; they are not independent authentication accounts.
* **Buyer and recipient/participant are distinct concepts:** A user can purchase products or enroll in courses for themselves, or for one or more of their children.

## Core Domains

### إنها لك (Personalized Products & Books)
* Offers personalized products and books.
* Contains both Al-Rehla exclusive products and independent Publisher products.
* Publisher products may also support deep personalization.
* The main transaction concept is **Orders**.
* One buyer may purchase for themselves and/or multiple children in a single transaction.
* Per-item recipient and customization data belong strictly to the **order item**, not the parent order.

### بداية الرحلة (Creative Writing Education)
* Offers creative writing programs and courses.
* Facilitated by specialized **Instructors**.
* The enrollment relationship is represented by `course_subscriptions`.
* The actual delivered lessons are represented by `sessions`.
* The scheduling aspect is represented by `bookings`.
* All communication (session messages) and files (session attachments) belong directly to the `sessions`.

## Current Architecture

Al-Rehla is built on modern web capabilities and strict data models:
* **Next.js App Router**: Serving both dynamic pages and API routes.
* **TypeScript (Strict Mode)**: Enforcing strong contracts across the codebase.
* **Server-first components**: Prioritizing SSR and minimizing client-side bundles.
* **Supabase Auth**: The authoritative identity provider.
* **`user_profiles`**: The active application identity table. (Note: `profiles` is legacy and should not be used by new application code).
* **`child_profiles`**: A real relational table for dependent users.
* **Strict Transactional Models**: Orders + order_items structure, and Course subscriptions + sessions structure.
* **Security**: Enforced through PostgreSQL Row Level Security (RLS) and server-side data access patterns.

Reference the official architecture document: `/docs/architecture/AL-REHLA-DATABASE.md`

## Technology Stack

**Current Stack:**
* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* GitHub
* Vercel

**Future / Planned Infrastructure:**
* *Cloudinary* (for media storage)
* *Daily.co* (for live sessions)
*(Note: These services are planned but not currently integrated in V1).*

## Repository Structure

* `src/app` — Next.js App Router pages, layouts, and API routes.
* `src/components` — Reusable UI components (Tailwind CSS).
* `src/lib` — Core utility functions and Supabase clients.
* `src/types` — TypeScript definitions and shared types.
* `src/data` — Data access layer and mock data fallbacks for UI presentation.
* `supabase/migrations` — Database schema history, enums, tables, and policies.
* `docs/architecture` — Official architecture documentation.

## Database & Architecture

The database design is documented separately to maintain clarity. The official architecture reference is located at:
`docs/architecture/AL-REHLA-DATABASE.md`

All structural database changes and history are maintained under:
`supabase/migrations/`

## Development Status

This project is currently in **active development**.

**Current Foundations (Implemented):**
* Authentication
* User profiles
* Child profiles
* Product/order foundation
* Creative writing package foundation
* Instructor foundation
* Subscription/session architecture
* Database migration foundation
* Official architecture documentation

**Planned / Future (Not Yet Implemented):**
* Cloudinary migration
* Daily.co live sessions
* Advanced scheduling/availability
* AI functionality
* Advanced progress tracking
* Payment gateway / production payment flows

## Development Setup

### Requirements
* Node.js 18+
* npm / yarn / pnpm

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```
Then visit: http://localhost:3000

### Validation
To ensure codebase health before pushing changes:
```bash
npx tsc --noEmit
npm run build
```

## Engineering Principles

1. **Server-first by default.** Leverage server components and server actions.
2. **Strict TypeScript.** Type-check everything; no implicit any.
3. **Minimal `use client`.** Restrict client components to interactive leaves.
4. **RTL-first Arabic UX.** Designed natively for right-to-left orientation.
5. **Relational modeling** instead of unnecessary JSON blobs (except for flexible product customizations).
6. **Clear separation** between business domains.
7. **Database architecture is documented** before major schema changes.
8. **Do not introduce AI** until explicitly planned and required.

## Security & Data Principles

* **Supabase Auth** is the authentication authority.
* User identity is linked through `user_profiles`.
* Child profiles belong exclusively to their guardian.
* Order access must be scoped securely to the authenticated buyer.
* Enrollment and session data must respect participant ownership and instructor assignment.
* Row Level Security (RLS) is a fundamental part of the data security model.

## Roadmap

### 1. Foundation
Current architecture, auth, profiles, products, orders, courses, and core database schemas.

### 2. Platform Completion
Payments, media infrastructure, scheduling refinement, live sessions, and operational workflows.

### 3. Future Intelligence
AI-assisted experiences, personalization intelligence, analytics, and recommendations.

## Important Documentation

* `/docs/architecture/AL-REHLA-DATABASE.md`

> **Note:** This document is the authoritative reference for the current database/business architecture.

*Al-Rehla is being built as a scalable platform, with architecture and operating rules designed to evolve without creating unnecessary coupling between its domains.*
