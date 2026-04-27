# Handoff: Kerkhofs deco & rent — Full Website

## Overview
A rental e-commerce website for **Kerkhofs deco & rent**, an event decoration rental company based in Antwerp, Belgium. Customers can browse and rent décor, furniture, tableware, lighting and floral items for weddings, galas, corporate events and private parties.

The site includes a shoppable customer stories/lookbook section where real event photos are tagged with the items used, allowing visitors to shop directly from the photo.

## About the Design Files
The files in this bundle (`Kerkhofs deco & rent.html` + `tweaks-panel.jsx`) are **high-fidelity design prototypes created in HTML/React**. They are working references showing intended look, layout, typography, color, and interaction behavior.

**Your task is to recreate these designs in your existing codebase** using its established framework, component library, routing system, and data layer — not to ship the HTML directly. Read the prototype in a browser alongside this README while implementing.

## Fidelity
**High-fidelity.** The prototype uses final colors, typography, spacing, and interactions. Recreate the UI pixel-accurately using your codebase's existing libraries and patterns.

---

## Design Tokens

### Color Themes
Three switchable themes are implemented. Implement as a theme context/provider.

#### Dark Luxury (default)
| Token | Value |
|---|---|
| `bg` | `#0d0b09` |
| `bgCard` | `#181410` |
| `bgSubtle` | `#141210` |
| `bgInput` | `#1e1a15` |
| `border` | `rgba(245,237,220,0.08)` |
| `text` | `#f4ecd8` |
| `textMuted` | `rgba(244,236,216,0.45)` |
| `accent` | `oklch(72% 0.11 72)` ≈ `#c8a97e` |
| `accentText` | `#1a1100` |

#### Light Crisp
| Token | Value |
|---|---|
| `bg` | `#f6f4f0` |
| `bgCard` | `#ffffff` |
| `bgSubtle` | `#ede9e3` |
| `bgInput` | `#ffffff` |
| `border` | `rgba(20,17,12,0.1)` |
| `text` | `#18150f` |
| `textMuted` | `rgba(20,17,12,0.42)` |
| `accent` | `oklch(56% 0.18 28)` ≈ `#c05a30` |
| `accentText` | `#ffffff` |

#### Warm Earthy
| Token | Value |
|---|---|
| `bg` | `#f0e8d8` |
| `bgCard` | `#f8f2e6` |
| `bgSubtle` | `#e6dcc8` |
| `bgInput` | `#f8f2e6` |
| `border` | `rgba(44,28,8,0.12)` |
| `text` | `#2c1c08` |
| `textMuted` | `rgba(44,28,8,0.42)` |
| `accent` | `oklch(53% 0.14 42)` ≈ `#a0572a` |
| `accentText` | `#fff8f0` |

### Typography
| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Display / headings | Cormorant Garamond | 44–82px | 300–600 | Italic variant used for sub-labels |
| Body / UI | Outfit | 12–15px | 300–600 | |
| Category labels | Outfit | 10–11px | 600 | `letter-spacing: 0.12–0.2em`, `text-transform: uppercase` |
| Price | Cormorant Garamond | 22–30px | 400–500 | |

Import: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Outfit:wght@300;400;500;600`

### Spacing
- Page horizontal padding: `80px` (desktop)
- Max content width: `1320px` (centered)
- Card gap: `22px`
- Section top padding: `56px`
- Nav height: `64px`, `padding: 0 56px`

### Borders & Radius
- Cards: `border-radius: 2px` (nearly square — intentional)
- Buttons: `border-radius: 1px`
- Input fields: `border-radius: 1px`

### Shadows
- Card hover: `box-shadow: 0 16px 40px rgba(0,0,0,0.18)`
- Pin popover: `box-shadow: 0 8px 32px rgba(0,0,0,0.2)`

---

## Screens / Views

### 1. Navigation Bar
**Sticky**, `height: 64px`, `z-index: 200`, `backdrop-filter: blur(8px)`.

Left: Logo — `KERKHOFS` (Cormorant Garamond 600, 20px) + ` deco & rent` in italic accent color.

Right nav links (Outfit 13px, muted → full text on hover): **Browse**, **Stories**, **How it works**, **Contact**

Cart button: bordered pill, shows item count badge (accent background, 17×17px circle) when cart > 0. On hover: fills with accent color.

---

### 2. Homepage
**Hero section** — 2-column grid (`1fr 1fr`), `padding: 88px 80px`:
- Left: eyebrow label (Outfit 11px, accent, uppercase, `letter-spacing: 0.22em`) → Display headline (Cormorant Garamond, `clamp(50px,5.5vw,82px)`, weight 600, `line-height: 1.04`) with italic word → body copy (Outfit 15px, weight 300, muted, `line-height: 1.85`) → two buttons side by side
- Right: tall image placeholder (height 500px)

**Browse by Category** — horizontal `repeat(6,1fr)` grid of category tiles. Each tile: image area (110px tall) + name label. Hover: `translateY(-3px)`.

**Customer Stories teaser** — 2-column grid showing 2 event cards. Link to full Stories page.

**Featured Items** — `repeat(4,1fr)` grid of item cards.

**How it works** — `bgSubtle` background, `repeat(4,1fr)`, large number in accent color (Cormorant 56px weight 300), step title (Outfit 14px 600), description (Outfit 13px 300 muted).

**Footer** — logo left, `© 2026 · Antwerp, Belgium` right.

---

### 3. Browse / Catalog Page
Header: eyebrow + H1 "All Items".

Filter bar: category pill buttons (`repeat` of `CATS` array) + search input (right-aligned, 200px wide). Active category: accent background + border.

Item grid: `repeat(4,1fr)`, gap 22px.

**Item Card:**
- Image area: 220px tall with optional tag badge (top-left, accent bg)
- Padding `16px 18px 20px`
- Category (Outfit 10px accent uppercase)
- Name (Cormorant Garamond 21px weight 500)
- Price line: "From €X / unit"
- Hover: `translateY(-5px)` + shadow

Categories: `All`, `Lighting`, `Tableware`, `Floral`, `Furniture`, `Linens`, `Decor`

---

### 4. Item Detail Page
2-column grid: `1fr 460px`, gap 72px.

**Left — Images:**
- Main image: 460px tall
- Thumbnail row: `repeat(4,1fr)`, height 86px

**Right — Sticky panel** (`top: 80px`):
- Category label → H1 (Cormorant 44px) → Price (Cormorant 30px + "/ unit" in Outfit muted)
- Description (Outfit 13px 300, muted, `line-height: 1.85`)
- Date pickers: 2-column grid (start / end date)
- Quantity stepper: `−` / number / `+` inline, bordered
- Subtotal preview (when dates selected): `bgSubtle` row with days × qty on left, total on right (Cormorant 28px)
- "Add to Cart" button: full width, accent, uppercase. Changes to `✓ Added to Cart` for 2.2s after click.
- Delivery note (Outfit 11px centered muted)

Below: "More in {category}" — `repeat(3,1fr)` related items.

---

### 5. Cart Page
2-column grid: `1fr 320px`.

**Left — Line items:**
Each row: thumbnail (90×72px) | category + name + qty/dates | price + remove button.

**Right — Summary panel** (sticky):
- Itemised list of line items with subtotals
- Total (Cormorant 26px)
- "Proceed to Checkout" CTA
- Delivery note

Empty state: centered message + "Browse Catalog" CTA.

---

### 6. Checkout — 2-step form

Step indicator: 3 tabs (`01 Contact`, `02 Delivery`, `03 Confirm`) with accent underline on active.

**Step 1 — Contact:** Name, Email, Phone inputs → "Continue →"

**Step 2 — Delivery:** Address, City, Event date, Notes (textarea) → "Confirm Booking →"

**Step 3 — Confirmation screen:**
- Centered layout
- Circular checkmark (accent border, `✓` in accent)
- "Booking Confirmed" headline
- Personalised message with customer name + email
- "Back to Home" CTA → clears cart + navigates home

---

### 7. Customer Stories Page
Header: eyebrow + H1 "Customer Stories" + description paragraph.

Event cards grid: `repeat(2,1fr)`. **First card spans 2 columns** (featured layout).

**Event Card (featured):**
- 2-column inner grid: image (380px) | content area
- Content: type badge (accent) + date badge (bordered) → customer name (Cormorant 32px) → location (Outfit 12px muted) → truncated quote (italic Cormorant 18px) → item tag pills

**Event Card (standard):**
- Stacked: image (260px) | content with same structure, smaller type

Hover: `translateY(-4px)` + shadow.

---

### 8. Event Detail Page (Shoppable Lookbook)

2-column grid: `1fr 340px`.

**Left — Shoppable photo:**
- Instruction text above photo ("Tap the pins to explore items used")
- Photo container: `aspect-ratio: 4/3`, `position: relative`
- **Hotspot pins** absolutely positioned at `{x}%`, `{y}%`:
  - 30×30px circle, accent border, white/accent bg
  - `+` icon (13px bold)
  - Inactive: pulsing ring animation (`@keyframes pulse`)
  - Active: filled accent, opens popover

**Popover** (appears above pin, `width: 220px`):
- Category label → item name (Cormorant 17px) → price
- Two buttons: `View` (bordered) + `+ Cart` (accent) — side by side
- Arrow indicator at bottom center
- Click outside to close

Below photo: customer quote in `<blockquote>` with 3px left accent border.

**Right — "Shop this event" sidebar** (sticky):
- H2 + item count
- List of item cards: thumbnail (52×52px) | category + name + price + View/Add buttons
- Add button changes to `✓` for 2s after click

---

### 9. Admin Panel
Access: via Tweaks panel → "Manage Events" button (internal tool, not in main nav).

**Add New Event form:**
- Grid inputs: Customer name, Event type (select), Date, Location
- Photo URL input
- Customer quote textarea
- Checkbox grid of all catalog items (3-column grid) — checked items highlighted with accent border + tinted background
- "Add Event" button → creates event with auto-generated hotspot positions

**Events list:** flat rows showing type + name + date/location + item count + Remove button.

---

## Interactions & Behavior

| Interaction | Behavior |
|---|---|
| Nav logo click | Navigate to Homepage |
| Category filter | Filters item grid client-side, no reload |
| Search input | Live filters by name + category |
| Add to Cart | Appends item to cart array; button shows `✓ Added` for 2.2s |
| Cart badge | Shows count, appears only when cart > 0 |
| Hotspot pin click | Toggles popover; click outside closes |
| Quantity stepper | Min 1, no max |
| Date range | Subtotal auto-calculates: `price × qty × days` |
| Checkout confirm | Clears cart, shows confirmation screen |
| Admin add event | Prepends to events list; hotspots auto-placed at `{x: 20+i*20, y: 30+i*15}` |
| Screen change | Scroll container resets to top |

### Animations
- Card hover: `transform: translateY(-5px)`, `box-shadow`, `transition: 0.22s`
- Button hover: `background`, `color`, `border-color`, `transition: 0.18s`
- Add to Cart success: `transition: all 0.3s`, reverts after 2200ms
- Hotspot pulse ring: `@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.4);opacity:0.1} }`, `2s ease-in-out infinite`
- Theme switch: `transition: background 0.4s` on root

---

## Data Model

### Item
```ts
{
  id: number;
  name: string;
  cat: 'Lighting' | 'Tableware' | 'Floral' | 'Furniture' | 'Linens' | 'Decor';
  price: number;
  unit: 'day' | 'event' | 'piece' | 'set';
  tag: 'Popular' | 'New' | '';
  desc: string;
}
```

### CartItem (extends Item)
```ts
{
  qty: number;
  start: string;   // ISO date string
  end: string;     // ISO date string
  days: number;    // calculated
}
```

### Event (Customer Story)
```ts
{
  id: number;
  customer: string;
  type: string;
  date: string;
  location: string;
  quote: string;
  imageUrl?: string;
  itemIds: number[];
  hotspots: Array<{ x: number; y: number; itemId: number }>;
}
```

---

## Assets
- **Fonts:** Google Fonts — Cormorant Garamond + Outfit (see import URL above)
- **Images:** No real images in prototype — all placeholders (striped pattern). Replace with real event photos and product photography. Image for events: use `imageUrl` field on Event object.
- **Icons:** None — UI uses text symbols (`+`, `✓`, `←`, `→`)

---

## Files in This Package
| File | Purpose |
|---|---|
| `Kerkhofs deco & rent.html` | Full hi-fi prototype — open in browser to reference |
| `tweaks-panel.jsx` | Tweaks panel helper (prototype-only, not needed in production) |
| `README.md` | This document |

---

## Notes for Implementation
1. **Routing:** The prototype uses a simple `screen` state string. Replace with your router (React Router, Next.js pages/app, etc.)
2. **State:** Cart is local React state. In production, persist to localStorage or a backend.
3. **Events data:** Hardcoded in prototype. Connect to a CMS or database. Recommended: a headless CMS (Contentful, Sanity) for the admin panel.
4. **Hotspot placement:** Auto-placed in prototype. Ideally implement a drag-and-drop editor in the admin panel so Kerkhofs staff can place pins precisely on the actual photo.
5. **Image upload:** Prototype accepts image URLs. Production admin should use file upload with a CDN (Cloudinary, S3, etc.)
6. **Theme:** Three themes are implemented. Recommend exposing this as a site-wide setting in the CMS or a cookie preference.
