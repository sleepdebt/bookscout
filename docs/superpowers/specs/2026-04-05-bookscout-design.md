# BookScout — Design Spec
**Date:** 2026-04-05  
**Author:** Jordan Welker  
**Status:** Approved — ready for implementation planning  
**Phase:** 1 of 2 (Student Intake)

---

## 1. Overview

BookScout is a two-sided textbook acquisition tool for OSU students. A reseller (the Seller) posts QR code flyers on campus; students scan, submit a photo of their book, and receive an offer or pass within 4 hours via SMS or email.

**Phase 1** covers the student-facing intake surface: QR code entry, photo submission form, confirmation screen, and the shared database foundation for both phases.

**Phase 2** (separate spec) covers: seller dashboard, AI vision pipeline (Claude API), Keepa/Amazon pricing lookup, offer calculation engine, and offer/pass dispatch.

---

## 2. Build Approach

**Option B — Shared foundation first, then intake surface.**

Define the complete Supabase schema (covering both phases) and scaffold the Next.js project before building any UI. This prevents data model rework when the dashboard is built. Intake surface is built on top of the solid foundation.

**Build order:**
1. Supabase schema + migrations (both phases)
2. Next.js project scaffold + Supabase client
3. Student intake wizard (Phase 1 UI)
4. Seller dashboard + AI pipeline (Phase 2, separate plan)

---

## 3. Architecture

**Stack:** Next.js (App Router) on Vercel, Supabase (Postgres + Storage + Edge Functions), Twilio (SMS), Resend (email), React Hook Form (validation).

**Routes (Phase 1):**
- `/sell` — QR code landing page, student submission wizard
- `/sell/confirmation` — shown after successful submit
- `/dashboard` — scaffold only in Phase 1, built in Phase 2

**Data flow (Phase 1):**
1. Student scans QR → `/sell` loads (no auth, no cookies required)
2. Student completes 3-step wizard
3. On submit: photos → Supabase Storage, form data → `submissions` table
4. Supabase Edge Function triggers → email notification to Seller (includes reference number, condition, contact method, and link to dashboard)
5. Student sees confirmation screen with reference number
6. Seller responds manually (Phase 2) via SMS/email

**Infrastructure accounts needed before build:**
- Vercel ✅
- Supabase ✅
- Twilio (SMS) — needs setup
- Resend (email) — needs setup
- Keepa API — Phase 2, needs setup
- Rainforest API — Phase 2, needs setup

---

## 4. Data Model

### `submissions` table

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `reference_number` | text | Last 6 chars of UUID — shown to student |
| `status` | enum | `pending_review`, `isbn_required`, `unidentifiable`, `offer_sent`, `pass_sent`, `accepted`, `declined` |
| `photo_urls` | text[] | Up to 3 Supabase Storage paths |
| `contact_preference` | enum | `sms` / `email` |
| `contact_value` | text | Phone number or email address |
| `condition` | enum | `like_new`, `good`, `acceptable`, `poor` |
| `isbn` | text | Optional — student-provided |
| `notes` | text | Optional, 200 char max |
| `created_at` | timestamptz | Auto |
| `isbn_extracted` | text | Phase 2 — from Claude vision |
| `isbn_confidence` | enum | Phase 2 — `low`, `medium`, `high` |
| `title` | text | Phase 2 — from Claude |
| `author` | text | Phase 2 — from Claude |
| `edition` | text | Phase 2 — from Claude |
| `publisher` | text | Phase 2 — from Claude |
| `asin` | text | Phase 2 — from Amazon lookup |
| `claude_response` | jsonb | Phase 2 — raw Claude API response |
| `keepa_data` | jsonb | Phase 2 — full Keepa response |
| `amazon_data` | jsonb | Phase 2 — full Rainforest response |
| `recommended_offer` | numeric | Phase 2 — engine output |
| `confidence_level` | text | Phase 2 — engine output |
| `flags` | text[] | Phase 2 — e.g. `slow_mover`, `amazon_present`, `isbn_unverified` |
| `final_offer` | numeric | Phase 2 — Seller decision |
| `seller_notes` | text | Phase 2 — internal only |
| `responded_at` | timestamptz | Phase 2 — when offer/pass sent |

### `pricing_rules` table (single row — Seller config)

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `target_roi_min` | numeric | Default 0.50 (50%) |
| `max_buy_price` | numeric | Hard ceiling per book |
| `slow_mover_rank_threshold` | integer | Sales rank above which = avoid |
| `avoid_amazon_present` | boolean | Skip if Amazon selling new near used price |
| `category_overrides` | jsonb | Per-category rule tweaks |
| `updated_at` | timestamptz | Auto |

---

## 5. Student Intake Form — UI Design

**Pattern:** 3-step wizard with progress bar at top.

### Step 1 — Photos
- Upload zone: camera or gallery, up to 3 photos
- Accepted formats: JPEG, PNG, HEIC — max 10MB each
- Hint text: "Start with the back cover — that's where the barcode is"
- Requires at least 1 photo to advance
- Photo thumbnails shown inline after upload

### Step 2 — Contact + Condition
- SMS / Email toggle (radio, prominent)
- Conditional field: phone number (10-digit US) if SMS, email address if Email
- Condition dropdown: Like New / Good / Acceptable / Poor (required)

### Step 3 — Review + Submit
- Photo thumbnail row (summary)
- Contact method + condition summary
- Optional fields: ISBN (10 or 13 digits), Notes (200 char max)
- Submit button
- Client-side validation via React Hook Form before any network call

### Validation Rules
| Field | Rule |
|---|---|
| Photos | Min 1 required. File type + size validated client-side before upload. |
| Contact preference | Required. Drives conditional field display. |
| Phone | If SMS: 10-digit US format. |
| Email | Standard email format. |
| Condition | Required dropdown. |
| ISBN | Optional. If entered: 10 or 13 digits, numeric only. |

---

## 6. Confirmation Screen

**Style:** Minimal/clean white.

**Content:**
- Green checkmark icon in light green circle
- "We got it!" heading, "Your book is in the queue." subtext
- Reference number displayed prominently (last 6 chars of UUID, e.g. `A3F9C1`)
- "We'll text/email you within 4 hours (Mon–Sat, 9am–6pm)"
- Brief explanation of offer/pass flow
- No "submit another" prompt

---

## 7. Error Handling

| Scenario | Behavior |
|---|---|
| Photo upload failure | Inline error on upload zone. "Try again." Other fields preserved. |
| Submit failure | Banner error at top of Step 3. Form state preserved. Don't reset. |
| Network timeout | Auto-retry once, then surface error with "Try again" button. |
| Validation errors | Client-side only via React Hook Form. No server round-trip for field errors. |

---

## 8. Project Structure

```
bookscout/
├── src/
│   ├── app/
│   │   ├── sell/
│   │   │   ├── page.tsx              # Wizard entry point
│   │   │   └── confirmation/
│   │   │       └── page.tsx          # Confirmation screen
│   │   └── dashboard/                # Phase 2 scaffold only
│   ├── components/
│   │   └── intake/
│   │       ├── WizardShell.tsx       # Step nav + progress bar
│   │       ├── StepPhotos.tsx
│   │       ├── StepContact.tsx
│   │       └── StepReview.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts
│       │   └── types.ts              # Generated from schema
│       └── validations.ts
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql    # Full schema, both phases
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Mobile page load | < 3 seconds on 4G |
| Form submission | < 5 seconds including photo upload |
| Browser support | iOS Safari 16+, Android Chrome 110+ |
| Accessibility | WCAG 2.1 AA — high contrast, large tap targets |
| Photo storage | 90-day retention, then auto-deleted |
| PII | Phone/email encrypted at rest, not shared |
| Uptime | > 99% during active deployment windows |

---

## 10. Out of Scope (Phase 1)

- Automated pricing or offer dispatch
- Seller dashboard UI
- AI vision pipeline
- Keepa / Amazon API integrations
- Student accounts or submission history
- Multiple campuses or sellers
- In-app payment or offer acceptance
- Automated tests (manual QA on iOS Safari + Android Chrome for v1)
