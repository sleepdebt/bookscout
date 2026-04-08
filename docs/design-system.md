# BookScout Design System

Clean, card-based UI. Gray-50 background, white surfaces, blue accents. Two distinct experiences: a mobile-first intake wizard for students, and a desktop-primary dashboard for the buyer.

---

## Color Palette

| Role | Tailwind | Hex |
|---|---|---|
| Page background | `bg-gray-50` | #f9fafb |
| Surface (cards) | `bg-white` | #ffffff |
| Border (cards) | `border-gray-200` | #e5e7eb |
| Divider (rows) | `border-gray-100` | #f3f4f6 |
| Text primary | `text-gray-900` | #111827 |
| Text secondary | `text-gray-500` | #6b7280 |
| Text muted | `text-gray-400` | #9ca3af |
| Text empty/placeholder | `text-gray-300` | #d1d5db |

### Accent colors

| Use | Background | Icon/Text |
|---|---|---|
| Primary / total metrics / links / table headers | `bg-blue-50` | `text-blue-500` / `text-blue-600` |
| Needs action / warnings | `bg-amber-50` | `text-amber-500` |
| Communication / offers / batch rows | `bg-indigo-50` | `text-indigo-500` |
| Success / accepted / positive delta | `bg-emerald-50` | `text-emerald-500` / `text-emerald-600` |

---

## Layout

```
min-h-screen bg-gray-50
  header (bg-white border-b border-gray-200)
  main (max-w-6xl mx-auto px-6 py-8 space-y-6)
    analytics grid
    console card
```

- **Container:** `max-w-6xl mx-auto px-6 py-8`
- **Section spacing:** `space-y-6`
- **Responsive grid (analytics):** `grid grid-cols-2 lg:grid-cols-4 gap-4`

---

## Cards

```html
<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
```

- Comfortable padding: `p-6`
- Compact padding: `p-5`

---

## Analytics Stat Cards

```html
<div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
  <div class="flex items-start justify-between mb-4">
    <p class="text-sm font-medium text-gray-500">Label</p>
    <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
      <!-- SVG icon, text-blue-500 -->
    </div>
  </div>
  <p class="text-3xl font-bold text-gray-900">42</p>
  <p class="text-xs text-gray-400 mt-2">
    <span class="text-emerald-600 font-semibold">+3</span> today
  </p>
</div>
```

Icon badge colors: blue / amber / indigo / emerald (in order: total, action-needed, comms, success).

---

## Table (Submissions Console)

```html
<div class="overflow-x-auto">
  <table class="w-full text-sm min-w-[700px]">
    <thead>
      <tr class="border-b border-gray-100">
        <th class="text-left px-6 py-3.5 text-xs font-semibold text-blue-600 uppercase tracking-wide">
          Column
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4 font-mono text-xs text-gray-400">REF123</td>
        <td class="px-4 py-4 text-gray-800 font-medium">Book title</td>
      </tr>
    </tbody>
  </table>
</div>
```

- **Column headers:** `text-blue-600 font-semibold text-xs uppercase tracking-wide`
- **First column padding:** `px-6` — all others `px-4`
- **Row padding:** `py-4`
- **Action link:** `text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors`
- **Batch row:** `hover:bg-blue-50/50`
- **Batch child rows:** `bg-indigo-50/40 border-l-4 border-indigo-200 hover:bg-indigo-50`

---

## Filter Pills (Status Tabs)

```html
<div class="overflow-x-auto pb-0.5">
  <div class="flex gap-1 min-w-max">
    <a class="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white whitespace-nowrap">
      Active
    </a>
    <a class="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap">
      Inactive
    </a>
  </div>
</div>
```

---

## Status Badges

```html
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
  Pending
</span>
```

| Status | Classes |
|---|---|
| pending_review | `bg-yellow-100 text-yellow-800` |
| isbn_required | `bg-orange-100 text-orange-800` |
| unidentifiable | `bg-red-100 text-red-700` |
| offer_sent | `bg-blue-100 text-blue-800` |
| pass_sent | `bg-gray-100 text-gray-600` |
| accepted | `bg-green-100 text-green-800` |
| declined | `bg-gray-100 text-gray-500` |

---

## Buttons

```html
<!-- Primary dark (dashboard) -->
<button class="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
  Save
</button>

<!-- Primary blue (intake wizard) -->
<button class="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl text-base disabled:opacity-50">
  Continue
</button>

<!-- Secondary outline (intake wizard) -->
<button class="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl text-base">
  Back
</button>

<!-- Outline accent (add book) -->
<button class="w-full py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl text-base hover:bg-blue-50 transition-colors">
  + Add this book
</button>
```

---

## Form Inputs

```html
<!-- Dashboard (compact) -->
<input class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />

<!-- Intake wizard (roomy, mobile-first) -->
<input class="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900
              focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

---

## Typography

| Role | Classes |
|---|---|
| Page title / header | `text-base font-semibold text-gray-900` |
| Card/section title | `font-semibold text-gray-900` |
| Intake step title | `text-2xl font-bold text-gray-900` |
| Field label | `text-sm font-medium text-gray-700` |
| Helper text | `text-xs text-gray-400` |
| Reference numbers / ISBNs | `font-mono text-xs text-gray-400` |

---

## Intake Wizard (Student Side)

- Full-page: `min-h-screen bg-white`
- Centered + constrained on desktop: `max-w-lg mx-auto`
- Progress bar: `h-1 rounded-full` — fill: `bg-blue-600`, empty: `bg-gray-200`
- Primary accent: blue-600 throughout
- Photo upload zone: `border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors`
- Input radius: `rounded-xl` (rounder than dashboard's `rounded-lg`)

---

## Dashboard Header Logo Mark

```html
<div class="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
  <!-- white book SVG icon, w-4 h-4 -->
</div>
<span class="text-base font-semibold text-gray-900">BookScout</span>
```
