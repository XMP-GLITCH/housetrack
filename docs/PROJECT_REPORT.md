# HouseTrack — House Rental Management System
### Project Technical Report

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Features](#4-features)
5. [Pages and Routes](#5-pages-and-routes)
6. [Database Design](#6-database-design)
7. [Authentication Flow](#7-authentication-flow)
8. [Payment Flow](#8-payment-flow)
9. [Screenshots](#9-screenshots)
10. [Testing](#10-testing)
11. [Deployment](#11-deployment)
12. [Known Issues and Limitations](#12-known-issues-and-limitations)
13. [Deviations from Original Spec](#13-deviations-from-original-spec)

---

## 1. Project Overview

HouseTrack is a full-stack Progressive Web Application (PWA) for managing residential rental properties. It supports three distinct user roles: **Landlord**, **Tenant**, and **Admin**. Landlords manage properties, rooms, tenants, and payments. Tenants view their rental status, pay rent online, and submit maintenance complaints. Admins have a platform-wide view of all users and can suspend accounts.

The system supports both **online payments** (via Notchpay, a West African payment gateway) and **offline/cash payment recording** by the landlord. Receipts are auto-generated for all confirmed payments.

---

## 2. Tech Stack

### 2.1 Frontend

| Item | Detail |
|---|---|
| Framework | React 19.2.6 |
| Build Tool | Vite 8 |
| CSS | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| PWA | `vite-plugin-pwa` |
| Language | JavaScript (JSX) |

### 2.2 Backend

| Item | Detail |
|---|---|
| Runtime | Node.js |
| Framework | Express 5.2.1 |
| Database | MySQL |
| ORM | Sequelize v6 |
| MySQL Driver | mysql2 v3 |
| Auth Verification | `jsonwebtoken` (local JWT verify, no network call per request) |
| Email | Nodemailer |
| Rate Limiting | `express-rate-limit` |

### 2.3 External Services

| Service | Purpose |
|---|---|
| Supabase Auth | User identity, email/password, magic-link invites |
| Notchpay | Online rent payment gateway (XAF currency) |
| Gmail SMTP | Transactional emails via Nodemailer |
| Railway | Backend hosting + MySQL database |
| Vercel | Frontend hosting (planned, not yet deployed) |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/PWA)                     │
│              React 19  ·  Vite  ·  Tailwind CSS v4               │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS  (Axios · Bearer JWT)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND  (Railway)                            │
│              Node.js  ·  Express 5  ·  REST API                  │
│                                                                  │
│   ┌────────────────┐   ┌────────────────┐   ┌─────────────────┐ │
│   │  verifyToken   │   │  roleCheck     │   │  Rate Limiter   │ │
│   │  middleware    │   │  middleware    │   │  (express-rl)   │ │
│   └────────┬───────┘   └───────┬────────┘   └────────┬────────┘ │
│            │                   │                     │           │
│            └───────────────────┴─────────────────────┘           │
│                                │                                 │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  Controllers: auth · user · property · room · tenant    │    │
│   │               payment · receipt · complaint · report    │    │
│   └──────────────────────────┬──────────────────────────────┘    │
│                              │  Sequelize ORM                    │
└──────────────────────────────┼───────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│   MySQL  (Railway)      │       │   Supabase Auth          │
│   7 tables              │       │   (identity + sessions)  │
└─────────────────────────┘       └─────────────────────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │   Notchpay API      │
                                  │   (XAF payments)    │
                                  └─────────────────────┘
```

**Key design point:** The system uses a **dual-identity model**. Supabase holds credentials (email, password, session tokens). MySQL holds application data (role, properties, payments). Every API request verifies the Supabase JWT, then looks up the MySQL `users` row by `supabase_uid`. The two records are linked by the Supabase user ID.

---

## 4. Features

### 4.1 Feature Status

| Feature | Status | Notes |
|---|---|---|
| Landlord self-registration | ✅ Fully working | Email/password via Supabase |
| Landlord login | ✅ Fully working | JWT stored in React context |
| Tenant login | ✅ Fully working | Via invite link / magic link |
| Admin login | ✅ Fully working | Hidden URL `/ht-admin-portal` |
| Role-based routing | ✅ Fully working | `ProtectedRoute` wraps all role-specific routes |
| Add and manage properties | ✅ Fully working | CRUD, status toggle |
| Add and manage rooms | ✅ Fully working | Status: available / occupied / maintenance |
| Register tenants | ✅ Fully working | Landlord creates profile first |
| Assign tenant to room | ✅ Fully working | Previous room freed automatically |
| Vacate tenant | ✅ Fully working | Room freed, status set to `vacated` |
| Tenant invite flow | ✅ Fully working | Supabase invite email → `/set-password` |
| Manual payment recording | ✅ Fully working | Landlord enters cash amount |
| Balance calculation | ✅ Fully working | `balance = rent_amount - amount_paid` |
| Receipt auto-generation | ✅ Fully working | Created in DB transaction on payment confirm |
| Receipt view | ✅ Fully working | Styled screen receipt with full details |
| Notchpay payment initiation | ⚠️ Implemented | Requires live key + deployed `CLIENT_URL` |
| Notchpay webhook confirmation | ⚠️ Implemented | HMAC verify in place; secret is placeholder |
| Complaint submission (tenant) | ✅ Fully working | Title, description, category |
| Complaint status update (landlord) | ✅ Fully working | Pending → In Progress → Resolved |
| Reports and analytics | ✅ Fully working | Income, occupancy, overdue counts |
| PWA install | ✅ Implemented | Manifest + service worker via vite-plugin-pwa |
| Admin user management | ⚠️ Partially working | View + suspend/activate; no password reset |
| Receipt PDF download | ❌ Not implemented | Screen view only; no PDF library integrated |
| Overdue payment auto-flag | ❌ Not implemented | Enum exists; no scheduled job to set it |

---

## 5. Pages and Routes

### 5.1 Public Routes (no login required)

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Landlord / Tenant login |
| `/register` | Landlord self-registration |
| `/ht-admin-portal` | Admin login (hidden URL) |
| `/auth/callback` | Supabase OAuth / magic-link callback |
| `/set-password` | Invited tenant sets their password |
| `/payment/success` | Notchpay redirect after payment |

### 5.2 Landlord Routes (role: landlord)

| Route | Page |
|---|---|
| `/landlord/onboarding` | First-time welcome / setup guide |
| `/landlord/dashboard` | Overview: stats, quick actions, property cards |
| `/landlord/properties` | Properties list |
| `/landlord/properties/new` | Add new property form |
| `/landlord/properties/:id` | Property detail + rooms management |
| `/landlord/tenants` | Tenants list with search and filter |
| `/landlord/tenants/new` | Register new tenant |
| `/landlord/tenants/:id` | Tenant detail: info, room, payment history |
| `/landlord/payments` | All payments: filter, manual record button |
| `/landlord/complaints` | Complaints inbox with urgency badges |
| `/landlord/reports` | Summary stats: income, occupancy, overdue |
| `/landlord/settings` | Account settings (name, password) |

### 5.3 Tenant Routes (role: tenant)

| Route | Page |
|---|---|
| `/tenant/dashboard` | Room info, balance, 6-month payment streak |
| `/tenant/payments` | Payment history + online pay button |
| `/tenant/receipts/:paymentId` | Receipt view |
| `/tenant/complaints` | Complaints submitted by this tenant |
| `/tenant/complaints/new` | Submit new complaint |

### 5.4 Admin Routes (role: admin)

| Route | Page |
|---|---|
| `/admin/dashboard` | Platform-wide stats, recent registrations |
| `/admin/users` | User list: filter by role, suspend/activate |

---

## 6. Database Design

### 6.1 Tables Overview

```
users
properties
rooms
tenants
payments
complaints
receipts
```

### 6.2 Table Definitions

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| supabase_uid | VARCHAR(255) UNIQUE | Links to Supabase identity |
| full_name | VARCHAR(150) | |
| email | VARCHAR(150) UNIQUE | |
| role | ENUM('admin','landlord','tenant') | |
| status | ENUM('active','inactive') | inactive = suspended |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `properties`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| landlord_id | INT | FK → users.id |
| property_name | VARCHAR(150) | |
| location | VARCHAR(200) | |
| property_type | VARCHAR(100) | |
| description | TEXT | nullable |
| status | ENUM('active','inactive') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `rooms`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| property_id | INT | FK → properties.id |
| room_number | VARCHAR(20) | |
| room_type | VARCHAR(100) | |
| rent_amount | DECIMAL(10,2) | |
| status | ENUM('available','occupied','maintenance') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `tenants`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| user_id | INT | FK → users.id; **nullable** until tenant is invited |
| landlord_id | INT | FK → users.id |
| room_id | INT | FK → rooms.id; nullable (unassigned) |
| full_name | VARCHAR(150) | |
| phone | VARCHAR(20) | |
| email | VARCHAR(150) | nullable |
| move_in_date | DATE | |
| emergency_contact | VARCHAR(100) | nullable |
| status | ENUM('active','vacated') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `payments`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| tenant_id | INT | FK → tenants.id |
| room_id | INT | FK → rooms.id |
| landlord_id | INT | FK → users.id |
| rent_month | VARCHAR(20) | Format: `YYYY-MM` |
| rent_amount | DECIMAL(10,2) | Room's rent at time of payment |
| amount_paid | DECIMAL(10,2) | |
| balance | DECIMAL(10,2) | `rent_amount - amount_paid` |
| payment_status | ENUM('unpaid','part_payment','paid','overdue') | |
| payment_date | DATETIME | |
| notchpay_reference | VARCHAR(255) | nullable; `MANUAL-…` for cash |
| notchpay_status | VARCHAR(50) | `pending`/`complete`/`manual` |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `complaints`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| tenant_id | INT | FK → tenants.id |
| room_id | INT | FK → rooms.id |
| landlord_id | INT | FK → users.id |
| title | VARCHAR(200) | |
| description | TEXT | |
| category | VARCHAR(100) | e.g. Plumbing, Electrical |
| status | ENUM('pending','in_progress','resolved') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `receipts`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| payment_id | INT UNIQUE | FK → payments.id |
| receipt_number | VARCHAR(50) UNIQUE | Auto-generated (e.g. `RCP-20250703-0001`) |
| generated_at | DATETIME | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### 6.3 Entity Relationship Diagram

```
users ──────────────────────────────────────────────────────┐
  │ (role=landlord)                                         │
  │ landlord_id                                             │
  ├──────────────────┐                                      │
  │                  │                                      │
  ▼                  ▼                                      │
properties        tenants ──────────────────────────────────┤
  │                  │ tenant_id                            │
  │                  │                                      │
  ▼                  ▼                                      │
rooms ──────────► payments ──────────► receipts             │
  │ room_id         landlord_id ────────────────────────────┘
  │
  └──────────────► complaints
                    tenant_id → tenants
                    landlord_id → users
```

---

## 7. Authentication Flow

### 7.1 Landlord Registration

```
1. Landlord fills in name / email / password on /register
2. Frontend calls Supabase signUp() → Supabase creates auth user
3. Frontend calls POST /api/v1/auth/register with Supabase session token
4. Backend verifies token, creates users row in MySQL (role = 'landlord')
5. Landlord is redirected to /landlord/onboarding
```

### 7.2 Tenant Invite Flow

```
1. Landlord creates tenant profile (name, phone, room)
2. Landlord clicks "Send Invite"
3. Backend calls Supabase admin.generateLink (type: 'invite')
4. Supabase sends email with login link to tenant's email
5. Tenant clicks link → lands on /auth/callback
6. Frontend exchanges token → redirects to /set-password
7. Tenant sets password → MySQL users row created (role = 'tenant')
8. Tenant can now log in at /login
```

### 7.3 Request Authorization (per API call)

```
Request arrives with Authorization: Bearer <supabase_jwt>
         │
         ▼
verifyToken middleware
  → Verify JWT locally (SUPABASE_JWT_SECRET, no network call)
  → Extract supabase_uid from JWT payload
  → Look up MySQL users WHERE supabase_uid = ? AND status = 'active'
  → Attach req.user = { id, role, email, ... }
         │
         ▼
roleCheck middleware (where applicable)
  → Compare req.user.role to route's allowedRoles
  → 403 if mismatch
         │
         ▼
Controller handles request
```

---

## 8. Payment Flow

### 8.1 Online Payment (Notchpay)

```
Tenant clicks "Pay Rent" on /tenant/payments
        │
        ▼
POST /api/v1/payments/initiate
  → Validate tenant, month, amount
  → Call Notchpay API → get payment_url + reference
  → Create payments row (status: unpaid, notchpay_status: pending)
  → Return payment_url to frontend
        │
        ▼
Frontend redirects tenant to Notchpay checkout page
        │
        ▼
Tenant completes payment on Notchpay
        │
        ├── Notchpay calls POST /api/v1/payments/webhook
        │     → Verify HMAC-SHA256 signature
        │     → Find payment by notchpay_reference
        │     → Update amount_paid, balance, payment_status
        │     → Create receipts row (atomic DB transaction)
        │
        └── Notchpay redirects browser to /payment/success
```

### 8.2 Manual Payment (Cash, recorded by landlord)

```
Landlord clicks "Record Payment" on /landlord/payments
        │
        ▼
POST /api/v1/payments/manual
  → Validate tenant, room, month, amount
  → Compute balance = rent_amount - amount_paid
  → Upsert payments row (notchpay_status: 'manual')
  → Auto-create receipts row if amount_paid > 0
  → Return updated payment record
```

### 8.3 Balance Calculation

```
balance  = rent_amount - amount_paid

payment_status logic:
  if balance == 0            → 'paid'
  if amount_paid > 0         → 'part_payment'
  if amount_paid == 0        → 'unpaid'
```

Balance is **stored as a column** in the `payments` table (not computed at query time), and is recalculated and written on every payment update.

---

## 9. Screenshots

> **Note:** Take screenshots of the running application on `http://localhost:5173` (frontend dev server with XAMPP MySQL running) and save them to `docs/screenshots/`. Replace each placeholder below with the actual image.

### 9.1 Public Pages

#### Figure 1 — Landing Page
![Landing Page](screenshots/01_landing.png)

> The public-facing landing page at `/`. Describes the platform with a call-to-action for landlords to register.

---

#### Figure 2 — Landlord Registration Page
![Register Page](screenshots/02_register.png)

> `/register` — The sign-up page for new landlords. Features an inline SVG townhouse illustration on the left branding panel.

---

#### Figure 3 — Login Page
![Login Page](screenshots/03_login.png)

> `/login` — The authentication page for landlords and tenants. Features an inline SVG city skyline illustration on the left branding panel.

---

#### Figure 4 — Admin Login Page
![Admin Login](screenshots/04_admin_login.png)

> `/ht-admin-portal` — A separate, unlisted login page for platform administrators. Not linked from the main navigation.

---

### 9.2 Landlord Onboarding

#### Figure 5 — Landlord Onboarding
![Onboarding](screenshots/05_onboarding.png)

> `/landlord/onboarding` — Shown to a landlord after first registration. Guides them to add their first property.

---

### 9.3 Landlord Dashboard

#### Figure 6 — Landlord Dashboard
![Landlord Dashboard](screenshots/06_landlord_dashboard.png)

> `/landlord/dashboard` — Shows a personalized greeting, key stats (properties, rooms, tenants, monthly income), occupancy and payment rate progress bars, quick action buttons, and a "Properties at a Glance" card grid.

---

### 9.4 Properties

#### Figure 7 — Properties List
![Properties List](screenshots/07_properties.png)

> `/landlord/properties` — All properties belonging to the landlord, with room count and status badges.

---

#### Figure 8 — Add Property Form
![Add Property](screenshots/08_new_property.png)

> `/landlord/properties/new` — Form to add a new property (name, location, type, description).

---

#### Figure 9 — Property Detail with Rooms
![Property Detail](screenshots/09_property_detail.png)

> `/landlord/properties/:id` — Property info tab and rooms tab. Rooms can be added, edited, and their status changed (available / occupied / maintenance).

---

### 9.5 Tenants

#### Figure 10 — Tenants List
![Tenants List](screenshots/10_tenants.png)

> `/landlord/tenants` — All tenants with search, role filter, status badges, and room assignment indicators.

---

#### Figure 11 — Register Tenant Form
![Register Tenant](screenshots/11_new_tenant.png)

> `/landlord/tenants/new` — Form to register a new tenant (name, phone, email, move-in date, emergency contact).

---

#### Figure 12 — Tenant Detail Page
![Tenant Detail](screenshots/12_tenant_detail.png)

> `/landlord/tenants/:id` — Full tenant info, room assignment, invite button, payment history table, and vacate control.

---

### 9.6 Payments

#### Figure 13 — Payments List (Landlord)
![Payments List](screenshots/13_payments.png)

> `/landlord/payments` — All payments with summary bar (total collected, fully paid count, unpaid count), month and status filters, and "Record Payment" button.

---

#### Figure 14 — Record Manual Payment Modal
![Manual Payment](screenshots/14_manual_payment.png)

> The "Record Payment" dialog on `/landlord/payments`. Landlord selects tenant, month, and enters cash amount received.

---

### 9.7 Receipts

#### Figure 15 — Receipt View (Tenant)
![Receipt](screenshots/15_receipt.png)

> `/tenant/receipts/:paymentId` — Official payment receipt showing receipt number, tenant name, property, room, rent month, amount paid, balance, and issue date.

---

### 9.8 Complaints

#### Figure 16 — Complaints Inbox (Landlord)
![Landlord Complaints](screenshots/16_landlord_complaints.png)

> `/landlord/complaints` — Shows pending, in-progress, and resolved complaints. Urgent complaints (pending 3+ days) are highlighted with a red left border and an age badge.

---

#### Figure 17 — Submit Complaint (Tenant)
![New Complaint](screenshots/17_new_complaint.png)

> `/tenant/complaints/new` — Tenant complaint submission form with title, category dropdown, and description.

---

#### Figure 18 — Tenant Complaints List
![Tenant Complaints](screenshots/18_tenant_complaints.png)

> `/tenant/complaints` — Shows all complaints submitted by the logged-in tenant with current status badges.

---

### 9.9 Reports

#### Figure 19 — Reports Page
![Reports](screenshots/19_reports.png)

> `/landlord/reports` — Platform analytics: total properties, rooms, occupancy rate, monthly income, paid/unpaid/overdue payment counts, pending complaints.

---

### 9.10 Tenant Dashboard

#### Figure 20 — Tenant Dashboard
![Tenant Dashboard](screenshots/20_tenant_dashboard.png)

> `/tenant/dashboard` — Personalized greeting, tenancy duration, current room and balance, 6-month payment streak visualisation (green = paid, amber = partial, red = due), open complaint count, and quick action buttons.

---

#### Figure 21 — Tenant Payments
![Tenant Payments](screenshots/21_tenant_payments.png)

> `/tenant/payments` — Full payment history with status badges and "Pay Online" button for unpaid months.

---

### 9.11 Admin Pages

#### Figure 22 — Admin Dashboard
![Admin Dashboard](screenshots/22_admin_dashboard.png)

> `/admin/dashboard` — Platform-wide statistics (landlords, properties, rooms, tenants, monthly platform income), Platform Occupancy and Landlord Activity progress bars, and a Recent Registrations feed.

---

#### Figure 23 — Admin Users List
![Admin Users](screenshots/23_admin_users.png)

> `/admin/users` — All registered users with role filter, search, stat summary cards (Total / Landlords / Tenants / Admins), and per-row suspend/activate controls.

---

## 10. Testing

### 10.1 Testing Approach

All testing was performed **manually** against a local development environment (XAMPP MySQL + Vite dev server). No automated test suite (unit tests, integration tests, or end-to-end tests) was written.

### 10.2 What Was Tested and Confirmed Working

| Test Action | Outcome |
|---|---|
| Landlord registers with email/password | ✅ Pass — Supabase user created, MySQL record created, redirected to onboarding |
| Landlord logs in | ✅ Pass — Token stored in context, dashboard loads with correct data |
| Landlord adds a property | ✅ Pass — Property appears in list immediately |
| Landlord adds rooms to a property | ✅ Pass — Rooms listed under property detail |
| Landlord registers a tenant | ✅ Pass — Tenant record created with status `active` |
| Landlord assigns tenant to room | ✅ Pass — Room status changes to `occupied`, previous room freed |
| Landlord sends invite to tenant | ✅ Pass — Supabase invite link generated and returned |
| Tenant clicks invite link, sets password | ✅ Pass — Redirected through `/auth/callback` → `/set-password` → `/tenant/dashboard` |
| Landlord records manual payment | ✅ Pass — Payment row created, receipt auto-generated |
| Tenant views receipt | ✅ Pass — All payment details displayed correctly |
| Tenant submits complaint | ✅ Pass — Complaint appears in landlord's inbox as "Pending" |
| Landlord updates complaint status | ✅ Pass — Status change persisted and reflected in tenant view |
| Landlord vacates tenant | ✅ Pass — Room freed, tenant status set to `vacated`, `user_id` nulled |
| Reports page loads | ✅ Pass — All aggregate stats correct against test data |
| Role-based route guard | ✅ Pass — Navigating to `/landlord/dashboard` as a tenant redirects to `/` |
| Admin logs in via `/ht-admin-portal` | ✅ Pass — Admin dashboard loads |
| Admin suspends a user | ✅ Pass — Suspended user gets 403 on next API call |

### 10.3 What Was Not Tested

| Item | Reason |
|---|---|
| Notchpay live payment | No live transaction was made; test-mode keys were used |
| Notchpay webhook | `NOTCHPAY_SECRET_HASH` is a placeholder; webhook signature will be rejected |
| Email delivery via SMTP | Gmail credentials are placeholder values in production env vars |
| PWA install prompt | Requires HTTPS — not tested in deployed environment |
| Concurrent users | No load or stress testing performed |

---

## 11. Deployment

### 11.1 Status

| Component | Status | URL |
|---|---|---|
| Frontend | ❌ Not deployed | Local only: `http://localhost:5173` |
| Backend | ⚠️ Deployed (DB broken) | Railway (online, API responds, DB calls fail) |
| MySQL | ❌ Broken on Railway | Crash loop — see Known Issues |
| MySQL (local) | ✅ Working | XAMPP on `localhost:3306` |

### 11.2 Environment Variables

All secrets are kept outside version control. The `.env` file is listed in `.gitignore` and was never committed. Production values are entered directly in the Railway dashboard.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string (Sequelize) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (invite links, user creation) |
| `SUPABASE_JWT_SECRET` | JWT signing secret (local token verify, optional) |
| `CLIENT_URL` | Frontend URL (CORS, Notchpay callback) |
| `NOTCHPAY_PUBLIC_KEY` | Notchpay payment initiation key |
| `NOTCHPAY_SECRET_HASH` | Notchpay webhook HMAC secret |
| `SMTP_HOST / SMTP_USER / SMTP_PASS` | Gmail SMTP credentials |
| `NODE_ENV` | `production` on Railway |

### 11.3 Planned Deployment Architecture

```
                  ┌───────────────────┐
                  │    Vercel (CDN)   │
                  │  React / Vite PWA │
                  │  housetrack.vercel│
                  │       .app        │
                  └────────┬──────────┘
                           │ HTTPS API calls
                           ▼
                  ┌───────────────────┐
                  │  Railway Backend  │
                  │  Express REST API │
                  └────────┬──────────┘
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌─────────────────┐     ┌───────────────────┐
     │  Railway MySQL  │     │   Supabase Auth   │
     │  (7 tables)     │     │   (credentials)   │
     └─────────────────┘     └───────────────────┘
```

---

## 12. Known Issues and Limitations

### 12.1 Railway MySQL Crash Loop

The Railway MySQL container is stuck in a crash loop with the error:

```
/bin/bash: line 1: docker-entrypoint.sh: command not found
```

This is a Railway platform issue with the provisioned MySQL container, not a code defect. The MySQL service needs to be deleted and re-provisioned from the Railway dashboard. Until then, the deployed backend starts without a database and all API calls requiring DB access return errors.

**Fix:** Railway dashboard → MySQL service → Delete → Add Database → MySQL → copy new URL → update `DATABASE_URL` in backend service vars.

### 12.2 No Receipt PDF Download

The receipt is rendered as a styled screen page only. There is no "Download PDF" button. To implement this, `react-to-print` (for print-to-PDF) or `jspdf` + `html2canvas` (for client-side generation) would need to be added to the frontend. This was not included in the current build.

### 12.3 Notchpay Webhook Not Configured

The `NOTCHPAY_SECRET_HASH` environment variable in Railway is currently set to the placeholder value `your_notchpay_secret_hash`. The `verifyWebhookSignature()` function explicitly checks for this placeholder and returns `false`, so all incoming Notchpay webhook events will be rejected with HTTP 401. The correct value must be obtained from the Notchpay merchant dashboard and set in Railway before online payments can be confirmed.

### 12.4 `overdue` Payment Status Not Auto-Set

The `payment_status` column includes an `overdue` enum value. However, no scheduled background job exists to scan past-due unpaid payments and update their status. Payments from previous months remain as `unpaid` indefinitely unless the landlord manually records a payment. A cron job (Node.js `node-cron`, or a Railway cron service) running nightly would be needed to implement this.

### 12.5 Admin Actions Are Limited

Admins can view all users and suspend/activate accounts. They cannot:
- Reset a user's password (requires Supabase admin API)
- Delete a user (both Supabase and MySQL records)
- Create a landlord account directly

### 12.6 No Automated Test Suite

There are no unit tests, integration tests, or end-to-end tests. All validation was performed manually against a local development environment.

### 12.7 PWA Icons May Be Missing

`vite.config.js` references `pwa-192x192.png` and `pwa-512x512.png` in `frontend/public/`. If these files are absent, the PWA manifest will be invalid and the browser install prompt will not appear in production.

---

## 13. Deviations from Original Spec

| Spec Item | What Was Built Instead | Reason |
|---|---|---|
| Receipt PDF download | Screen view only — no PDF export | `jspdf` / `react-to-print` not integrated |
| Tenant self-registration | Landlord-initiated invite flow only | Prevents unverified users claiming tenancy |
| Standard `/admin` login | Hidden URL `/ht-admin-portal` | Security — reduces admin panel exposure |
| Overdue status auto-detection | `overdue` enum exists but never auto-set | No cron job implemented |
| Balance computed at query time | Balance stored as a DB column | Simpler queries; recalculated on every update |
| Single payment path | Two paths: Notchpay (online) + manual (cash) | Practical — many landlords collect cash |
| Standard registration only | Registration + onboarding page for landlords | Better UX for first-time users |

---

*Document generated: July 2025*
*Project: HouseTrack — House Rental Management System*
*Stack: React 19 · Express 5 · MySQL · Supabase · Notchpay*
