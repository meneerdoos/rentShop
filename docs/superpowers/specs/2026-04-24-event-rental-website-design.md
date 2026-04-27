# Event Rental Website — Design Spec
**Date:** 2026-04-24
**Status:** Approved

## Overview

A bilingual (Dutch/English) event rental website where customers can browse articles such as tables, cutlery, and other event supplies, select a rental period, and pay online. The site is visually bold and beautiful — high contrast, strong typography, red accent color. A full admin panel lets the owner manage inventory, categories, and orders.

---

## Visual Style

- **Direction:** Bold & Graphic — high contrast black/white with a red (`#ff3b30`) accent color
- **Typography:** Heavy, punchy headings; clean sans-serif body text
- **Admin panel:** Light mode — white cards on light grey background; red accent for brand mark and key actions
- **Customer site:** Bold, eye-catching, visually striking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & API routes | Next.js (App Router) |
| Database & Auth | Supabase (PostgreSQL) |
| Payments | Stripe |
| Hosting | Vercel |
| Multilingual | next-intl |
| Transactional email | Resend |

---

## Architecture

```
Customer Browser
    ↓
Next.js on Vercel (frontend + API routes)
    ↓                    ↓
Supabase (DB + Auth)   Stripe (payments + webhooks)
```

- The Next.js app serves both the public customer site and the protected admin panel (`/admin`)
- API routes handle availability checks, order creation, and Stripe webhook processing
- Supabase Auth gates the admin panel — only the owner can log in
- Stripe webhooks confirm payment and finalize bookings server-side

---

## Data Model

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name_nl | text | Dutch label |
| name_en | text | English label |
| slug | text unique | URL-safe identifier |
| sort_order | integer | Display order |

### `articles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| category_id | uuid FK | → categories |
| name_nl | text | |
| name_en | text | |
| description_nl | text | |
| description_en | text | |
| price_per_day | numeric | In euros |
| stock_quantity | integer | Total units owned |
| image_url | text | Stored in Supabase Storage |
| active | boolean | Hidden from catalog when false |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_name | text | |
| customer_email | text | |
| customer_phone | text | |
| start_date | date | Rental start (inclusive) |
| end_date | date | Rental end (inclusive) |
| status | enum | `pending_payment` · `confirmed` · `cancelled` |
| total_price | numeric | Calculated at order creation |
| stripe_payment_id | text | Payment Intent ID |
| created_at | timestamptz | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | → orders |
| article_id | uuid FK | → articles |
| quantity | integer | |
| price_per_day | numeric | Snapshotted at order time |

**Key design decisions:**
- `price_per_day` is snapshotted in `order_items` so future price changes do not affect existing bookings
- All items in one order share the same rental period (start/end date on the order)
- Availability = `stock_quantity` − SUM of `quantity` across `order_items` for confirmed orders whose date ranges overlap the requested period

---

## Customer-Facing Pages

All pages are available in Dutch (`/nl/...`) and English (`/en/...`).

The root `/` redirects to `/nl` by default (configurable). Users can switch to `/en` via the language toggle.

### 1. Homepage (`/nl`, `/en`)
- Hero section with tagline and primary CTA
- Category grid linking to filtered catalog
- "How it works" section (3 steps: browse → pick dates → pay)
- Featured / popular articles
- Language toggle (NL / EN)

### 2. Catalog (`/nl/verhuur`, `/en/rental`)
- Article cards with photo, name, and price per day
- Filter by category
- "Pick dates" prompt to check live availability

### 3. Article Detail (`/nl/verhuur/[slug]`, `/en/rental/[slug]`)
- Large photo, name, description, price per day
- Date range picker
- Quantity selector (capped at available stock for chosen dates)
- Live subtotal (days × quantity × price)
- "Add to cart" button

### 4. Cart (`/nl/winkelwagen`, `/en/cart`)
Cart state is stored client-side in `localStorage` (no login required). It holds article IDs, quantities, and the selected rental period.

- List of items with quantities and rental period
- Total price breakdown
- Option to remove items
- "Proceed to checkout" CTA

### 5. Checkout
- Customer details form: name, email, phone
- Order summary sidebar
- Stripe Payment Element (credit card, etc.)
- No customer account required — guest checkout only

### 6. Confirmation
- Booking confirmed message with order reference number
- Full order summary
- Confirmation email sent to customer
- CTA back to catalog

---

## Admin Panel (`/admin`)

Protected by Supabase Auth (owner login only). Light-mode UI.

### Dashboard
- Stats: orders today, upcoming bookings, monthly revenue, active articles
- Recent orders table with status and quick-view link

### Articles
- List all articles with status (active/inactive)
- Create / edit: name (NL+EN), description (NL+EN), price per day, stock quantity, category, photo upload
- Deactivate (hides from catalog without deleting)

### Categories
- List, create, rename, reorder categories
- NL + EN label per category

### Orders
- Full order list with filters (date range, status)
- Order detail view: customer info, items, rental period, total, Stripe payment ID
- Manual cancellation (releases stock, does not automatically refund via Stripe)

---

## Availability & Overbooking Prevention

1. When a customer selects dates and a quantity, the API checks live availability from the database.
2. The quantity selector on the article detail page is capped at the available amount.
3. When checkout begins, a `pending_payment` order is created in the database — stock is tentatively reserved.
4. Payment is only confirmed once Stripe sends a successful webhook event.
5. If payment is not confirmed within 30 minutes, a cleanup job cancels the order and releases the reserved stock.
6. A daily cleanup job catches any missed webhooks and cancels orphaned pending orders.

---

## Multilingual

- Routing via `next-intl`: `/nl/...` for Dutch, `/en/...` for English
- All UI strings stored in locale JSON files (`messages/nl.json`, `messages/en.json`)
- Article and category content stored bilingual in the database (`name_nl`, `name_en`, etc.)
- Language toggle visible in the site header on all pages

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Stock runs out between cart and checkout | Customer sees a clear message; sent back to cart to adjust |
| Stripe payment fails | Order stays `pending_payment`; customer can retry; expires after 30 min |
| Stripe webhook missed | Daily cleanup job cancels orphaned pending orders |
| Admin tries to delete article with active bookings | Blocked with explanation; deactivate instead |

---

## Testing

- **End-to-end:** Full booking flow (browse → pay → confirm) using Stripe test mode
- **Unit tests:** Availability calculation logic — the most critical business rule
- **Smoke tests:** Admin panel login, article creation, order list
