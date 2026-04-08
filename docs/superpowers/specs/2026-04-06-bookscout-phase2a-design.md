# BookScout Phase 2A — AI Vision + Pricing Pipeline Design Spec

**Date:** 2026-04-06
**Author:** Jordan Welker
**Status:** Approved — ready for implementation planning
**Phase:** 2A of 2 (AI Vision + Pricing Pipeline)

---

## 1. Overview

Phase 2A adds an automated backend pipeline that fires every time a student submits a book. The pipeline extracts book metadata from photos using Claude Vision, looks up live Amazon pricing via Rainforest API, and calculates a recommended offer. No UI is involved — the seller reviews and approves offers in Phase 2B.

**What Phase 2A does NOT include:**
- Seller dashboard UI (Phase 2B)
- Offer/pass dispatch to student (Phase 2B)
- Keepa sales rank data (stubbed — to be added when Keepa key is obtained)
- Automated offer sending (requires seller approval first)

---

## 2. Architecture

**Single Edge Function: `analyze-submission`**

Triggered by a Supabase DB webhook on INSERT to the `submissions` table. Runs synchronously — all steps (Claude + Rainforest + DB update) happen in one function call. Failure at any step leaves the row in its original `pending_review` status so it can be retried from the dashboard (Phase 2B).

**Pipeline flow:**

```
New submission INSERT
        ↓
analyze-submission Edge Function
        ↓
Fetch photo URLs from Supabase Storage
        ↓
Call Claude Vision (claude-sonnet-4-5)
        ↓
    Identified?
   /           \
 YES            NO
  ↓              ↓
Call Rainforest  Set status = isbn_required
  ↓              Send seller notification email
Calculate offer  (manual follow-up required)
  ↓
Set status = pending_review
Update submission record
```

**Environment variables (already added to Supabase secrets):**
- `ANTHROPIC_API_KEY`
- `RAINFOREST_API_KEY`
- `SUPABASE_URL` (auto-injected by Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase)
- `RESEND_API_KEY` (already set)
- `SELLER_EMAIL` (already set)

---

## 3. Claude Vision Integration

**Model:** `claude-sonnet-4-5` (best accuracy for structured extraction from images)

**Input:** All photo URLs from `submissions.photo_urls`, fetched from Supabase Storage and passed as base64-encoded images in a single API call.

**Prompt strategy:** System prompt instructs Claude to act as a book identification assistant. User message asks for structured JSON extraction. Prompt prioritizes the barcode/back cover photo for ISBN reading.

**Expected response (identified):**
```json
{
  "identified": true,
  "isbn": "9780134685991",
  "title": "Effective Java",
  "author": "Joshua Bloch",
  "edition": "3rd Edition",
  "publisher": "Addison-Wesley",
  "confidence": "high"
}
```

**Expected response (not identified):**
```json
{
  "identified": false
}
```

**Confidence levels:**
- `high` — ISBN clearly visible and readable from barcode or printed text
- `medium` — ISBN inferred from title/author match, barcode partially visible
- `low` — Title/author extracted but ISBN uncertain or missing

Raw Claude response stored in `claude_response` (jsonb) for debugging.

---

## 4. Rainforest API Integration

Called only when Claude returns `identified: true`.

**Endpoint:** `GET https://api.rainforestapi.com/request?api_key=...&type=product&isbn=...`

**Fields extracted from response:**
- `asin` → `submissions.asin`
- Full response → `submissions.amazon_data` (jsonb)
- `lowest_used_price` → used for offer calculation (extracted from `buybox_winner.used_price.value` or `used_product_summary.lowest_price.value`)

**Failure cases:**
- No Amazon listing found for ISBN → set status = `unidentifiable`, send seller notification email
- Rainforest API error → throw, leave status as `pending_review` (retry later)
- No used price available → set status = `unidentifiable`, send seller notification email

---

## 5. Offer Calculation

```
recommended_offer = min(max_buy_price, floor(lowest_used_price × buy_percentage × 100) / 100)
```

Rounded down to nearest cent.

**Pricing rules** (stored in `pricing_rules` table, single row):

| Column | Default | Description |
|--------|---------|-------------|
| `buy_percentage` | `0.40` | Fraction of lowest used Amazon price to offer |
| `max_buy_price` | `50.00` | Hard ceiling per book regardless of formula |

**Examples:**
- Lowest used = $25.00 → offer = $10.00 (40%)
- Lowest used = $150.00 → offer = $50.00 (capped at max)
- Lowest used = $5.00 → offer = $2.00 (40%)

Calculated offer stored in `submissions.recommended_offer`.

---

## 6. Status Transitions

| Condition | Status set | Action |
|-----------|-----------|--------|
| Claude identifies book + Rainforest succeeds | `pending_review` | Awaits seller approval in dashboard |
| Claude cannot identify book | `isbn_required` | Seller notification email sent |
| Rainforest finds no listing or no used price | `unidentifiable` | Seller notification email sent |
| Any unexpected error | unchanged (`pending_review`) | Retry manually from dashboard |

---

## 7. Seller Notification Email (isbn_required / unidentifiable)

Sent via Resend to `SELLER_EMAIL`. Same pattern as the existing `notify-seller` function.

**Subject:** `Action needed: submission [REFERENCE] — [isbn_required|unidentifiable]`

**Body:**
```
Submission [REF] needs manual follow-up.

Status: ISBN Required / Unidentifiable
Contact: [Text/Email] — [contact_value]
Condition: [condition]
Submitted at: [timestamp]

Please follow up with the student directly.
```

---

## 8. Schema Changes

The existing schema covers all needed columns. One migration is required:

**`002_phase2a_pricing_rules.sql`:**
- Add `buy_percentage numeric not null default 0.40` to `pricing_rules`
- Insert default pricing_rules row if none exists

Note: `target_roi_min` column already exists in `pricing_rules` from Phase 1 schema. `buy_percentage` is added as a separate, simpler control. `target_roi_min` can be used in Phase 2B when more sophisticated pricing controls are built.

---

## 9. New Files

```
supabase/
  functions/
    analyze-submission/
      index.ts          ← new Edge Function
  migrations/
    002_phase2a_pricing_rules.sql   ← add buy_percentage, insert default row
```

No changes to Next.js app code in Phase 2A.

---

## 10. Out of Scope (Phase 2A)

- Seller dashboard UI
- Offer/pass dispatch to student
- Keepa integration (stub column exists, add later)
- Re-analysis trigger from dashboard
- Category-level pricing overrides
- `avoid_amazon_present` flag logic (column exists, not enforced yet)
