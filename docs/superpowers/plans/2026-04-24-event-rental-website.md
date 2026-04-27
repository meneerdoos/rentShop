# Event Rental Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (NL/EN) event rental website with online booking, real-time availability, Stripe payments, and a light-mode admin panel for inventory management.

**Architecture:** Next.js App Router serves both the public catalog and `/admin`. Supabase provides PostgreSQL (availability queries, orders) and Auth (admin login). Stripe handles payment via Payment Intents + webhooks. Cart lives in localStorage — no customer account needed.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase JS v2 (`@supabase/ssr`), Stripe, next-intl v3, Resend, Vitest, Playwright

---

## File Map

```
src/
  app/
    [locale]/
      layout.tsx              # NextIntlClientProvider + header
      page.tsx                # Homepage
      verhuur/page.tsx        # Catalog (NL) — EN: /rental/page.tsx via rewrite
      verhuur/[slug]/page.tsx # Article detail
      winkelwagen/page.tsx    # Cart (NL) — EN: /cart
      afrekenen/page.tsx      # Checkout (NL) — EN: /checkout
      bevestiging/page.tsx    # Confirmation (NL) — EN: /confirmation
    admin/
      layout.tsx              # Auth guard + admin nav
      page.tsx                # Dashboard
      artikelen/page.tsx      # Article list
      artikelen/nieuw/page.tsx
      artikelen/[id]/page.tsx
      categorieen/page.tsx
      bestellingen/page.tsx
      bestellingen/[id]/page.tsx
    api/
      availability/route.ts
      orders/route.ts
      webhooks/stripe/route.ts
      cleanup/route.ts
  lib/
    supabase/client.ts        # Browser client
    supabase/server.ts        # Server + service-role clients
    supabase/types.ts         # DB type interfaces
    availability.ts           # Pure availability calc (unit tested)
    cart.ts                   # localStorage helpers (unit tested)
    stripe.ts                 # Stripe singleton
    resend.ts                 # Confirmation email helper
  components/
    ui/Button.tsx
    ui/Input.tsx
    ui/Badge.tsx
    catalog/ArticleCard.tsx
    catalog/CategoryFilter.tsx
    catalog/DateRangePicker.tsx
    catalog/QuantitySelector.tsx
    cart/CartItem.tsx
    admin/NavBar.tsx
    admin/StatsCard.tsx
    admin/ArticleForm.tsx
    admin/CategoryForm.tsx
  i18n/routing.ts
  i18n/request.ts
  messages/nl.json
  messages/en.json
middleware.ts
supabase/migrations/001_initial_schema.sql
tailwind.config.ts
vitest.config.ts
playwright.config.ts
.env.local.example
```

---

## Task 1: Initialize project

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.local.example`, `vitest.config.ts`, `playwright.config.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
```
Expected: project files created in current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js next-intl stripe @stripe/stripe-js @stripe/react-stripe-js resend react-day-picker date-fns
npm install -D vitest @vitejs/plugin-react @vitest/ui jsdom @types/node playwright @playwright/test
```

- [ ] **Step 3: Write `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Copy to `.env.local` and fill in real values.

- [ ] **Step 4: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
```

- [ ] **Step 5: Write `playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

- [ ] **Step 6: Commit**

```bash
git init && git add -A && git commit -m "feat: initialize Next.js project with dependencies"
```

---

## Task 2: Design tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#ff3b30',
        'brand-hover': '#e02d22',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      fontWeight: {
        black: '900',
      },
    },
  },
}
export default config
```

- [ ] **Step 2: Update `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-black;
  }
  h1, h2, h3 {
    @apply font-black tracking-tight;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add design tokens and global styles"
```

---

## Task 3: Supabase types and clients

**Files:**
- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Write `src/lib/supabase/types.ts`**

```typescript
export interface Category {
  id: string
  name_nl: string
  name_en: string
  slug: string
  sort_order: number
}

export interface Article {
  id: string
  category_id: string
  name_nl: string
  name_en: string
  description_nl: string
  description_en: string
  price_per_day: number
  stock_quantity: number
  image_url: string
  active: boolean
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  status: 'pending_payment' | 'confirmed' | 'cancelled'
  total_price: number
  stripe_payment_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  article_id: string
  quantity: number
  price_per_day: number
}
```

- [ ] **Step 2: Write `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Write `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
```

- [ ] **Step 4: Write `src/lib/stripe.ts`**

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})
```

- [ ] **Step 5: Write `src/lib/resend.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendBookingConfirmation({
  to,
  customerName,
  orderId,
  startDate,
  endDate,
  totalPrice,
  locale,
}: {
  to: string
  customerName: string
  orderId: string
  startDate: string
  endDate: string
  totalPrice: number
  locale: string
}) {
  const ref = orderId.slice(0, 8).toUpperCase()
  const isNl = locale === 'nl'
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: isNl ? `Bevestiging boeking #${ref}` : `Booking confirmation #${ref}`,
    html: isNl
      ? `<p>Beste ${customerName},</p><p>Uw boeking is bevestigd. Referentie: <strong>${ref}</strong></p><p>Huurperiode: ${startDate} t/m ${endDate}</p><p>Totaal: <strong>€${totalPrice.toFixed(2)}</strong></p>`
      : `<p>Dear ${customerName},</p><p>Your booking is confirmed. Reference: <strong>${ref}</strong></p><p>Rental period: ${startDate} to ${endDate}</p><p>Total: <strong>€${totalPrice.toFixed(2)}</strong></p>`,
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Supabase clients, Stripe, Resend helpers"
```

---

## Task 4: next-intl routing and middleware

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `middleware.ts`
- Create: `src/messages/nl.json`
- Create: `src/messages/en.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Write `src/i18n/routing.ts`**

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  pathnames: {
    '/': '/',
    '/verhuur': { nl: '/verhuur', en: '/rental' },
    '/verhuur/[slug]': { nl: '/verhuur/[slug]', en: '/rental/[slug]' },
    '/winkelwagen': { nl: '/winkelwagen', en: '/cart' },
    '/afrekenen': { nl: '/afrekenen', en: '/checkout' },
    '/bevestiging': { nl: '/bevestiging', en: '/confirmation' },
  },
})
```

- [ ] **Step 2: Write `src/i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'nl' | 'en')) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Write `middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}
```

- [ ] **Step 4: Write `src/messages/nl.json`**

```json
{
  "nav": {
    "catalog": "Verhuur",
    "cart": "Winkelwagen",
    "lang": "EN"
  },
  "home": {
    "hero": "Verhuur voor elk evenement",
    "heroCta": "Bekijk het aanbod",
    "howTitle": "Hoe werkt het?",
    "step1": "Blader door ons aanbod",
    "step2": "Kies uw huurperiode",
    "step3": "Betaal veilig online"
  },
  "catalog": {
    "title": "Verhuur",
    "all": "Alles",
    "pickDates": "Kies datums"
  },
  "detail": {
    "perDay": "/ dag",
    "addToCart": "In winkelwagen",
    "subtotal": "Subtotaal",
    "available": "Beschikbaar"
  },
  "cart": {
    "title": "Winkelwagen",
    "empty": "Uw winkelwagen is leeg.",
    "remove": "Verwijderen",
    "total": "Totaal",
    "checkout": "Afrekenen",
    "period": "Huurperiode",
    "days": "dagen"
  },
  "checkout": {
    "title": "Afrekenen",
    "name": "Naam",
    "email": "E-mailadres",
    "phone": "Telefoonnummer",
    "pay": "Betalen",
    "summary": "Overzicht"
  },
  "confirmation": {
    "title": "Boeking bevestigd!",
    "ref": "Referentie",
    "email": "U ontvangt een bevestiging per e-mail.",
    "back": "Terug naar het aanbod"
  },
  "errors": {
    "outOfStock": "Niet genoeg voorraad beschikbaar voor de gekozen periode. Pas uw winkelwagen aan."
  }
}
```

- [ ] **Step 5: Write `src/messages/en.json`**

```json
{
  "nav": {
    "catalog": "Rental",
    "cart": "Cart",
    "lang": "NL"
  },
  "home": {
    "hero": "Rental for every event",
    "heroCta": "Browse our catalog",
    "howTitle": "How does it work?",
    "step1": "Browse our catalog",
    "step2": "Choose your rental period",
    "step3": "Pay securely online"
  },
  "catalog": {
    "title": "Rental",
    "all": "All",
    "pickDates": "Pick dates"
  },
  "detail": {
    "perDay": "/ day",
    "addToCart": "Add to cart",
    "subtotal": "Subtotal",
    "available": "Available"
  },
  "cart": {
    "title": "Cart",
    "empty": "Your cart is empty.",
    "remove": "Remove",
    "total": "Total",
    "checkout": "Checkout",
    "period": "Rental period",
    "days": "days"
  },
  "checkout": {
    "title": "Checkout",
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "pay": "Pay now",
    "summary": "Order summary"
  },
  "confirmation": {
    "title": "Booking confirmed!",
    "ref": "Reference",
    "email": "A confirmation has been sent to your email.",
    "back": "Back to catalog"
  },
  "errors": {
    "outOfStock": "Not enough stock available for the selected period. Please update your cart."
  }
}
```

- [ ] **Step 6: Update `next.config.ts`**

```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {}
export default withNextIntl(nextConfig)
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: configure next-intl routing for NL/EN"
```

---

## Task 5: Database schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_nl text NOT NULL,
  name_en text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES categories(id),
  name_nl text NOT NULL,
  name_en text NOT NULL,
  description_nl text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  price_per_day numeric(10,2) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'confirmed', 'cancelled')),
  total_price numeric(10,2) NOT NULL,
  stripe_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id),
  quantity integer NOT NULL,
  price_per_day numeric(10,2) NOT NULL
);

-- Availability stored function
CREATE OR REPLACE FUNCTION get_available_quantity(
  p_article_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS integer AS $$
DECLARE
  v_stock integer;
  v_booked integer;
BEGIN
  SELECT stock_quantity INTO v_stock FROM articles WHERE id = p_article_id;
  SELECT COALESCE(SUM(oi.quantity), 0) INTO v_booked
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE oi.article_id = p_article_id
    AND o.status = 'confirmed'
    AND o.start_date <= p_end_date
    AND o.end_date >= p_start_date;
  RETURN GREATEST(0, v_stock - v_booked);
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_articles" ON articles FOR SELECT TO anon USING (active = true);
CREATE POLICY "admin_all_categories" ON categories TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_articles" ON articles TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_orders" ON orders TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_order_items" ON order_items TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for article images
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);
CREATE POLICY "public_read_images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'article-images');
CREATE POLICY "admin_upload_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images');
CREATE POLICY "admin_delete_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images');
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to Supabase Dashboard → SQL Editor → paste the migration → Run.

Verify tables exist: Dashboard → Table Editor → confirm `categories`, `articles`, `orders`, `order_items` are visible.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add database schema migration"
```

---

## Task 6: Availability logic (TDD)

**Files:**
- Create: `src/lib/availability.ts`
- Create: `src/lib/__tests__/availability.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/__tests__/availability.test.ts
import { describe, it, expect } from 'vitest'
import { calculateAvailable, calculateDays } from '../availability'

describe('calculateDays', () => {
  it('counts both start and end day', () => {
    expect(calculateDays('2025-05-10', '2025-05-12')).toBe(3)
  })
  it('returns 1 for same-day rental', () => {
    expect(calculateDays('2025-05-10', '2025-05-10')).toBe(1)
  })
})

describe('calculateAvailable', () => {
  it('returns full stock when nothing is booked', () => {
    expect(calculateAvailable(20, [])).toBe(20)
  })
  it('subtracts booked quantity', () => {
    expect(calculateAvailable(20, [{ quantity: 5 }, { quantity: 3 }])).toBe(12)
  })
  it('never returns negative', () => {
    expect(calculateAvailable(5, [{ quantity: 8 }])).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npx vitest run src/lib/__tests__/availability.test.ts
```
Expected: FAIL — `calculateAvailable` and `calculateDays` not found.

- [ ] **Step 3: Write `src/lib/availability.ts`**

```typescript
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function calculateAvailable(
  stockQuantity: number,
  bookedItems: { quantity: number }[]
): number {
  const totalBooked = bookedItems.reduce((sum, item) => sum + item.quantity, 0)
  return Math.max(0, stockQuantity - totalBooked)
}

export function calculateTotal(
  items: { pricePerDay: number; quantity: number }[],
  startDate: string,
  endDate: string
): number {
  const days = calculateDays(startDate, endDate)
  return items.reduce((sum, item) => sum + item.pricePerDay * item.quantity * days, 0)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/availability.test.ts
```
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: availability calculation logic with tests"
```

---

## Task 7: Cart utilities (TDD)

**Files:**
- Create: `src/lib/cart.ts`
- Create: `src/lib/__tests__/cart.test.ts`

- [ ] **Step 1: Write `src/lib/cart.ts`**

```typescript
export interface CartItem {
  articleId: string
  slug: string
  nameNl: string
  nameEn: string
  pricePerDay: number
  quantity: number
  imageUrl: string
}

export interface Cart {
  items: CartItem[]
  startDate: string
  endDate: string
}

const CART_KEY = 'rental_cart'

export function getCart(): Cart | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(CART_KEY)
  return raw ? (JSON.parse(raw) as Cart) : null
}

export function saveCart(cart: Cart): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function addToCart(item: CartItem, startDate: string, endDate: string): void {
  const cart = getCart()
  if (!cart) {
    saveCart({ items: [item], startDate, endDate })
    return
  }
  const existing = cart.items.find(i => i.articleId === item.articleId)
  if (existing) {
    existing.quantity = item.quantity
  } else {
    cart.items.push(item)
  }
  saveCart({ ...cart, startDate, endDate })
}

export function removeFromCart(articleId: string): void {
  const cart = getCart()
  if (!cart) return
  saveCart({ ...cart, items: cart.items.filter(i => i.articleId !== articleId) })
}
```

- [ ] **Step 2: Write the tests**

```typescript
// src/lib/__tests__/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getCart, saveCart, clearCart, addToCart, removeFromCart } from '../cart'

const mockItem = {
  articleId: 'art-1',
  slug: 'ronde-tafel',
  nameNl: 'Ronde tafel',
  nameEn: 'Round table',
  pricePerDay: 12.5,
  quantity: 2,
  imageUrl: '',
}

beforeEach(() => clearCart())

describe('addToCart', () => {
  it('creates a new cart with one item', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    const cart = getCart()
    expect(cart?.items).toHaveLength(1)
    expect(cart?.items[0].articleId).toBe('art-1')
  })

  it('updates quantity when adding same article', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    addToCart({ ...mockItem, quantity: 5 }, '2025-05-10', '2025-05-12')
    expect(getCart()?.items[0].quantity).toBe(5)
  })
})

describe('removeFromCart', () => {
  it('removes item by articleId', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    removeFromCart('art-1')
    expect(getCart()?.items).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/lib/__tests__/cart.test.ts
```
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: cart localStorage utilities with tests"
```

---

## Task 8: Base UI components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Write `src/components/ui/Button.tsx`**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'font-black uppercase tracking-wide px-6 py-3 transition-colors disabled:opacity-50 cursor-pointer'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/Input.tsx`**

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-black uppercase tracking-widest">
        {label}
      </label>
      <input
        id={id}
        className={`border-2 border-black px-4 py-2 focus:outline-none focus:border-brand ${className}`}
        {...props}
      />
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/ui/Badge.tsx`**

```tsx
type BadgeVariant = 'confirmed' | 'pending_payment' | 'cancelled'

const styles: Record<BadgeVariant, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending_payment: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function Badge({ variant }: { variant: BadgeVariant }) {
  const labels: Record<BadgeVariant, string> = {
    confirmed: 'Bevestigd',
    pending_payment: 'In behandeling',
    cancelled: 'Geannuleerd',
  }
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${styles[variant]}`}>
      {labels[variant]}
    </span>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: base UI components (Button, Input, Badge)"
```

---

## Task 9: Site header + locale layout

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/layout.tsx` (root)

- [ ] **Step 1: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = { title: 'Verhuur' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Write `src/app/[locale]/layout.tsx`**

```tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()
  const t = await getTranslations('nav')

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-black tracking-tight">
            VERHUUR<span className="text-brand">/</span>
          </Link>
          <nav className="flex items-center gap-8 text-sm font-black uppercase tracking-widest">
            <Link href={`/${locale}/verhuur`} className="hover:text-brand transition-colors">
              {t('catalog')}
            </Link>
            <Link href={`/${locale}/winkelwagen`} className="hover:text-brand transition-colors">
              {t('cart')}
            </Link>
            <Link
              href={locale === 'nl' ? '/en' : '/nl'}
              className="border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
            >
              {t('lang')}
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </NextIntlClientProvider>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: locale layout with site header and language toggle"
```

---

## Task 10: Homepage

**Files:**
- Create: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Write `src/app/[locale]/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Article, Category } from '@/lib/supabase/types'

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('home')
  const supabase = createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const { data: featured } = await supabase
    .from('articles')
    .select('*')
    .eq('active', true)
    .limit(4)

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-8">
            {t('hero')}
          </h1>
          <Link
            href={catalogPath}
            className="inline-block bg-brand text-white font-black uppercase tracking-widest px-8 py-4 hover:bg-brand-hover transition-colors"
          >
            {t('heroCta')} →
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories as Category[]).map(cat => (
              <Link
                key={cat.id}
                href={`${catalogPath}?category=${cat.slug}`}
                className="border-4 border-black p-6 font-black text-lg uppercase hover:bg-black hover:text-white transition-colors"
              >
                {locale === 'nl' ? cat.name_nl : cat.name_en}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-12">{t('howTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {([t('step1'), t('step2'), t('step3')] as string[]).map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-brand text-5xl font-black leading-none">{i + 1}</span>
                <p className="text-xl font-black">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured articles */}
      {featured && featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(featured as Article[]).map(article => (
              <Link
                key={article.id}
                href={`${catalogPath}/${article.id}`}
                className="border-2 border-black hover:border-brand transition-colors"
              >
                {article.image_url && (
                  <img src={article.image_url} alt="" className="w-full aspect-square object-cover" />
                )}
                <div className="p-4">
                  <p className="font-black text-sm">{locale === 'nl' ? article.name_nl : article.name_en}</p>
                  <p className="text-brand font-black">€{article.price_per_day} / dag</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify homepage loads**

```bash
npm run dev
```
Open http://localhost:3000 — should redirect to http://localhost:3000/nl and show the homepage with hero section.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: homepage with hero, categories, how-it-works, featured articles"
```

---

## Task 11: ArticleCard + Catalog page

**Files:**
- Create: `src/components/catalog/ArticleCard.tsx`
- Create: `src/components/catalog/CategoryFilter.tsx`
- Create: `src/app/[locale]/verhuur/page.tsx`

- [ ] **Step 1: Write `src/components/catalog/ArticleCard.tsx`**

```tsx
import Link from 'next/link'
import type { Article } from '@/lib/supabase/types'

interface ArticleCardProps {
  article: Article
  locale: string
  catalogPath: string
}

export function ArticleCard({ article, locale, catalogPath }: ArticleCardProps) {
  const name = locale === 'nl' ? article.name_nl : article.name_en
  return (
    <Link
      href={`${catalogPath}/${article.id}`}
      className="group border-2 border-black hover:border-brand transition-colors"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {article.image_url ? (
          <img src={article.image_url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
      </div>
      <div className="p-4 border-t-2 border-black">
        <p className="font-black text-sm uppercase tracking-wide">{name}</p>
        <p className="text-brand font-black text-lg mt-1">€{article.price_per_day}<span className="text-gray-500 font-normal text-sm"> / dag</span></p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Write `src/components/catalog/CategoryFilter.tsx`**

```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/supabase/types'

interface CategoryFilterProps {
  categories: Category[]
  locale: string
  allLabel: string
}

export function CategoryFilter({ categories, locale, allLabel }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category')

  function select(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => select(null)}
        className={`px-4 py-2 border-2 font-black text-sm uppercase tracking-wide transition-colors ${!active ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'}`}
      >
        {allLabel}
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`px-4 py-2 border-2 font-black text-sm uppercase tracking-wide transition-colors ${active === cat.slug ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'}`}
        >
          {locale === 'nl' ? cat.name_nl : cat.name_en}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/app/[locale]/verhuur/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArticleCard } from '@/components/catalog/ArticleCard'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import type { Article, Category } from '@/lib/supabase/types'

export default async function CatalogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams: { category?: string }
}) {
  const t = await getTranslations('catalog')
  const supabase = createServerSupabaseClient()

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  let query = supabase.from('articles').select('*').eq('active', true)
  if (searchParams.category) {
    const cat = (categories as Category[])?.find(c => c.slug === searchParams.category)
    if (cat) query = query.eq('category_id', cat.id)
  }
  const { data: articles } = await query

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black mb-8">{t('title')}</h1>
      <div className="mb-8">
        <CategoryFilter
          categories={(categories as Category[]) ?? []}
          locale={locale}
          allLabel={t('all')}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {(articles as Article[] ?? []).map(article => (
          <ArticleCard key={article.id} article={article} locale={locale} catalogPath={catalogPath} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify catalog page loads at `/nl/verhuur`**

Open http://localhost:3000/nl/verhuur — category filter and article grid should render (empty if no data yet, no error).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: catalog page with category filter and article grid"
```

---

## Task 12: Availability API route

**Files:**
- Create: `src/app/api/availability/route.ts`

- [ ] **Step 1: Write `src/app/api/availability/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get('articleId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!articleId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_available_quantity', {
    p_article_id: articleId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ available: data as number })
}
```

- [ ] **Step 2: Test the route manually**

```bash
curl "http://localhost:3000/api/availability?articleId=<uuid>&startDate=2025-05-10&endDate=2025-05-12"
```
Expected: `{"available": <number>}`

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: availability API route"
```

---

## Task 13: Article detail page

**Files:**
- Create: `src/components/catalog/DateRangePicker.tsx`
- Create: `src/components/catalog/QuantitySelector.tsx`
- Create: `src/app/[locale]/verhuur/[slug]/page.tsx`

- [ ] **Step 1: Write `src/components/catalog/DateRangePicker.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'

interface DateRangePickerProps {
  onRangeChange: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>()

  function handleSelect(r: DateRange | undefined) {
    setRange(r)
    if (r?.from && r?.to) {
      onRangeChange(format(r.from, 'yyyy-MM-dd'), format(r.to, 'yyyy-MM-dd'))
    }
  }

  return (
    <div className="border-2 border-black p-4 inline-block">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        disabled={{ before: new Date() }}
        numberOfMonths={2}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/catalog/QuantitySelector.tsx`**

```tsx
'use client'

interface QuantitySelectorProps {
  value: number
  max: number
  onChange: (value: number) => void
}

export function QuantitySelector({ value, max, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-4 border-2 border-black inline-flex">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-4 py-2 font-black text-lg hover:bg-black hover:text-white transition-colors"
      >
        −
      </button>
      <span className="font-black text-xl w-8 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="px-4 py-2 font-black text-lg hover:bg-black hover:text-white transition-colors disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/app/[locale]/verhuur/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Article } from '@/lib/supabase/types'
import { ArticleDetailClient } from './ArticleDetailClient'

export default async function ArticleDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string }
}) {
  const supabase = createServerSupabaseClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', slug)
    .eq('active', true)
    .single()

  if (!article) notFound()

  const t = await getTranslations('detail')
  const name = locale === 'nl' ? article.name_nl : article.name_en
  const description = locale === 'nl' ? article.description_nl : article.description_en

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        {article.image_url ? (
          <img src={article.image_url} alt={name} className="w-full aspect-square object-cover border-4 border-black" />
        ) : (
          <div className="w-full aspect-square bg-gray-100 border-4 border-black flex items-center justify-center text-6xl">📦</div>
        )}
      </div>
      <div>
        <h1 className="text-4xl font-black mb-2">{name}</h1>
        <p className="text-3xl font-black text-brand mb-6">
          €{article.price_per_day} <span className="text-gray-400 font-normal text-lg">{t('perDay')}</span>
        </p>
        <p className="text-gray-600 mb-8">{description}</p>
        <ArticleDetailClient article={article as Article} locale={locale} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/app/[locale]/verhuur/[slug]/ArticleDetailClient.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DateRangePicker } from '@/components/catalog/DateRangePicker'
import { QuantitySelector } from '@/components/catalog/QuantitySelector'
import { Button } from '@/components/ui/Button'
import { addToCart } from '@/lib/cart'
import { calculateDays, calculateTotal } from '@/lib/availability'
import type { Article } from '@/lib/supabase/types'

export function ArticleDetailClient({ article, locale }: { article: Article; locale: string }) {
  const router = useRouter()
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [available, setAvailable] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDateChange(start: string, end: string) {
    setStartDate(start)
    setEndDate(end)
    setLoading(true)
    const res = await fetch(`/api/availability?articleId=${article.id}&startDate=${start}&endDate=${end}`)
    const data = await res.json()
    setAvailable(data.available ?? 0)
    setQuantity(1)
    setLoading(false)
  }

  function handleAddToCart() {
    if (!startDate || !endDate) return
    addToCart(
      {
        articleId: article.id,
        slug: article.id,
        nameNl: article.name_nl,
        nameEn: article.name_en,
        pricePerDay: article.price_per_day,
        quantity,
        imageUrl: article.image_url,
      },
      startDate,
      endDate
    )
    router.push(`/${locale}/winkelwagen`)
  }

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0
  const subtotal = days > 0 ? calculateTotal([{ pricePerDay: article.price_per_day, quantity }], startDate, endDate) : 0

  return (
    <div className="flex flex-col gap-6">
      <DateRangePicker onRangeChange={handleDateChange} />
      {loading && <p className="text-sm text-gray-400">Beschikbaarheid controleren…</p>}
      {available !== null && !loading && (
        <p className="text-sm font-black">
          Beschikbaar: <span className={available === 0 ? 'text-red-500' : 'text-green-600'}>{available}</span>
        </p>
      )}
      {available !== null && available > 0 && (
        <>
          <QuantitySelector value={quantity} max={available} onChange={setQuantity} />
          {days > 0 && (
            <p className="font-black text-xl">
              Subtotaal: <span className="text-brand">€{subtotal.toFixed(2)}</span>
              <span className="text-sm text-gray-400 font-normal ml-2">({days} dagen)</span>
            </p>
          )}
          <Button onClick={handleAddToCart}>In winkelwagen →</Button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify article detail page**

Add a test article via Supabase dashboard, then open `http://localhost:3000/nl/verhuur/<article-id>`. Date picker and availability check should work.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: article detail page with date picker and availability check"
```

---

## Task 14: Cart page

**Files:**
- Create: `src/app/[locale]/winkelwagen/page.tsx`
- Create: `src/components/cart/CartItem.tsx`

- [ ] **Step 1: Write `src/components/cart/CartItem.tsx`**

```tsx
'use client'
import { calculateDays } from '@/lib/availability'
import type { CartItem as CartItemType } from '@/lib/cart'

interface CartItemProps {
  item: CartItemType
  startDate: string
  endDate: string
  locale: string
  onRemove: (articleId: string) => void
}

export function CartItem({ item, startDate, endDate, locale, onRemove }: CartItemProps) {
  const days = calculateDays(startDate, endDate)
  const total = item.pricePerDay * item.quantity * days
  const name = locale === 'nl' ? item.nameNl : item.nameEn

  return (
    <div className="flex items-center gap-4 py-4 border-b-2 border-black">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={name} className="w-16 h-16 object-cover border-2 border-black" />
      )}
      <div className="flex-1">
        <p className="font-black">{name}</p>
        <p className="text-sm text-gray-500">
          {item.quantity} × €{item.pricePerDay} × {days} dagen
        </p>
      </div>
      <p className="font-black text-brand">€{total.toFixed(2)}</p>
      <button
        onClick={() => onRemove(item.articleId)}
        className="text-sm font-black uppercase text-gray-400 hover:text-red-500 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/[locale]/winkelwagen/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCart, removeFromCart } from '@/lib/cart'
import { calculateTotal } from '@/lib/availability'
import type { Cart } from '@/lib/cart'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/Button'

export default function CartPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)

  useEffect(() => {
    setCart(getCart())
  }, [])

  function handleRemove(articleId: string) {
    removeFromCart(articleId)
    setCart(getCart())
  }

  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`
  const checkoutPath = locale === 'nl' ? `/${locale}/afrekenen` : `/${locale}/checkout`

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-black mb-6">Uw winkelwagen is leeg.</p>
        <Link href={catalogPath} className="text-brand font-black underline">← Terug naar het aanbod</Link>
      </div>
    )
  }

  const total = calculateTotal(cart.items.map(i => ({ pricePerDay: i.pricePerDay, quantity: i.quantity })), cart.startDate, cart.endDate)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black mb-8">Winkelwagen</h1>
      <p className="text-sm font-black uppercase tracking-widest mb-6 text-gray-500">
        Huurperiode: {cart.startDate} t/m {cart.endDate}
      </p>
      <div>
        {cart.items.map(item => (
          <CartItem
            key={item.articleId}
            item={item}
            startDate={cart.startDate}
            endDate={cart.endDate}
            locale={locale}
            onRemove={handleRemove}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <p className="text-2xl font-black">Totaal: <span className="text-brand">€{total.toFixed(2)}</span></p>
        <Button onClick={() => router.push(checkoutPath)}>Afrekenen →</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify cart page**

Add an item to cart via the article detail page, then navigate to `/nl/winkelwagen`. Items should appear with remove button and total.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: cart page with item list and total"
```

---

## Task 15: Order creation API route

**Files:**
- Create: `src/app/api/orders/route.ts`

- [ ] **Step 1: Write `src/app/api/orders/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateDays } from '@/lib/availability'

interface OrderItem {
  articleId: string
  quantity: number
  pricePerDay: number
}

export async function POST(req: NextRequest) {
  const { customerName, customerEmail, customerPhone, items, startDate, endDate, locale } =
    await req.json() as {
      customerName: string
      customerEmail: string
      customerPhone: string
      items: OrderItem[]
      startDate: string
      endDate: string
      locale: string
    }

  const supabase = createServiceClient()

  // Verify availability for all items
  for (const item of items) {
    const { data: available } = await supabase.rpc('get_available_quantity', {
      p_article_id: item.articleId,
      p_start_date: startDate,
      p_end_date: endDate,
    })
    if ((available as number) < item.quantity) {
      return NextResponse.json({ error: 'out_of_stock' }, { status: 409 })
    }
  }

  const days = calculateDays(startDate, endDate)
  const totalPrice = items.reduce((sum, i) => sum + i.pricePerDay * i.quantity * days, 0)

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: 'eur',
    metadata: { customerEmail, locale },
  })

  // Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      stripe_payment_id: paymentIntent.id,
      status: 'pending_payment',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Create order items
  await supabase.from('order_items').insert(
    items.map(i => ({
      order_id: order.id,
      article_id: i.articleId,
      quantity: i.quantity,
      price_per_day: i.pricePerDay,
    }))
  )

  return NextResponse.json({ orderId: order.id, clientSecret: paymentIntent.client_secret })
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: order creation API route with availability check and Stripe"
```

---

## Task 16: Checkout page

**Files:**
- Create: `src/app/[locale]/afrekenen/page.tsx`
- Create: `src/components/checkout/CustomerForm.tsx`
- Create: `src/components/checkout/StripePaymentForm.tsx`

- [ ] **Step 1: Write `src/components/checkout/CustomerForm.tsx`**

```tsx
'use client'
import { Input } from '@/components/ui/Input'

interface CustomerFormProps {
  values: { name: string; email: string; phone: string }
  onChange: (field: string, value: string) => void
}

export function CustomerForm({ values, onChange }: CustomerFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Input label="Naam" id="name" value={values.name} onChange={e => onChange('name', e.target.value)} required />
      <Input label="E-mailadres" id="email" type="email" value={values.email} onChange={e => onChange('email', e.target.value)} required />
      <Input label="Telefoonnummer" id="phone" type="tel" value={values.phone} onChange={e => onChange('phone', e.target.value)} required />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/checkout/StripePaymentForm.tsx`**

```tsx
'use client'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface StripePaymentFormProps {
  returnUrl: string
}

export function StripePaymentForm({ returnUrl }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    })
    if (error) {
      setError(error.message ?? 'Betaling mislukt')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? 'Bezig…' : 'Betalen →'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Write `src/app/[locale]/afrekenen/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { getCart, clearCart } from '@/lib/cart'
import { calculateTotal } from '@/lib/availability'
import type { Cart } from '@/lib/cart'
import { CustomerForm } from '@/components/checkout/CustomerForm'
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [outOfStock, setOutOfStock] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setCart(getCart()) }, [])

  function handleCustomerChange(field: string, value: string) {
    setCustomer(prev => ({ ...prev, [field]: value }))
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!cart) return
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: cart.items.map(i => ({
          articleId: i.articleId,
          quantity: i.quantity,
          pricePerDay: i.pricePerDay,
        })),
        startDate: cart.startDate,
        endDate: cart.endDate,
        locale,
      }),
    })
    const data = await res.json()
    if (res.status === 409) {
      setOutOfStock(true)
      setLoading(false)
      return
    }
    setOrderId(data.orderId)
    localStorage.setItem('pending_order_id', data.orderId)
    setClientSecret(data.clientSecret)
    setLoading(false)
  }

  const confirmPath = locale === 'nl' ? `/${locale}/bevestiging` : `/${locale}/confirmation`
  const returnUrl = `${window.location.origin}${confirmPath}`

  if (!cart || cart.items.length === 0) {
    router.push(`/${locale}/winkelwagen`)
    return null
  }

  const total = calculateTotal(
    cart.items.map(i => ({ pricePerDay: i.pricePerDay, quantity: i.quantity })),
    cart.startDate,
    cart.endDate
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-4xl font-black mb-8">Afrekenen</h1>
        {outOfStock && (
          <p className="text-red-500 font-black mb-4 border-2 border-red-500 p-3">
            Niet genoeg voorraad voor de gekozen periode. Pas uw winkelwagen aan.
          </p>
        )}
        {!clientSecret ? (
          <form onSubmit={handleCreateOrder} className="flex flex-col gap-6">
            <CustomerForm values={customer} onChange={handleCustomerChange} />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand text-white font-black uppercase tracking-widest px-6 py-3 hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Bezig…' : 'Naar betaling →'}
            </button>
          </form>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm returnUrl={returnUrl} />
          </Elements>
        )}
      </div>
      <div className="bg-gray-50 border-2 border-black p-6">
        <h2 className="font-black text-xl mb-4 uppercase tracking-wide">Overzicht</h2>
        <p className="text-sm text-gray-500 mb-4">{cart.startDate} t/m {cart.endDate}</p>
        {cart.items.map(item => (
          <div key={item.articleId} className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span>{locale === 'nl' ? item.nameNl : item.nameEn} × {item.quantity}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between font-black text-lg">
          <span>Totaal</span>
          <span className="text-brand">€{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: checkout page with Stripe Payment Element"
```

---

## Task 17: Stripe webhook + Confirmation page

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/app/[locale]/bevestiging/page.tsx`

- [ ] **Step 1: Write `src/app/api/webhooks/stripe/route.ts`**

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const supabase = createServiceClient()

    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('stripe_payment_id', pi.id)
      .select()
      .single()

    if (order) {
      await sendBookingConfirmation({
        to: order.customer_email,
        customerName: order.customer_name,
        orderId: order.id,
        startDate: order.start_date,
        endDate: order.end_date,
        totalPrice: order.total_price,
        locale: pi.metadata.locale ?? 'nl',
      })
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 2: Write `src/app/[locale]/bevestiging/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearCart } from '@/lib/cart'

export default function ConfirmationPage({ params: { locale } }: { params: { locale: string } }) {
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('pending_order_id')
    if (id) {
      setOrderId(id)
      localStorage.removeItem('pending_order_id')
      clearCart()
    }
  }, [])

  const ref = orderId ? orderId.slice(0, 8).toUpperCase() : '—'
  const catalogPath = locale === 'nl' ? `/${locale}/verhuur` : `/${locale}/rental`

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">✓</div>
      <h1 className="text-5xl font-black mb-4">Boeking bevestigd!</h1>
      <p className="text-gray-500 mb-2">Referentie: <strong>{ref}</strong></p>
      <p className="text-gray-500 mb-8">U ontvangt een bevestiging per e-mail.</p>
      <Link
        href={catalogPath}
        className="inline-block bg-black text-white font-black uppercase tracking-widest px-8 py-4 hover:bg-brand transition-colors"
      >
        ← Terug naar het aanbod
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Set up Stripe webhook in dev**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook secret printed and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Stripe webhook handler and confirmation page"
```

---

## Task 18: Admin layout + auth guard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/components/admin/NavBar.tsx`

- [ ] **Step 1: Write `src/components/admin/NavBar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/artikelen', label: 'Artikelen' },
  { href: '/admin/categorieen', label: 'Categorieën' },
  { href: '/admin/bestellingen', label: 'Bestellingen' },
]

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-black text-lg">VERHUUR<span className="text-brand">/</span>ADMIN</span>
        <nav className="flex items-center gap-6 text-sm font-bold">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`pb-1 ${pathname === link.href ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-black'}`}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-gray-400 hover:text-black ml-4">Uitloggen</button>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NavBar } from '@/components/admin/NavBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/app/admin/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded p-8 w-full max-w-sm">
        <h1 className="text-2xl font-black mb-6">VERHUUR<span className="text-brand">/</span>ADMIN</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input label="E-mail" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Wachtwoord" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-brand text-white font-black uppercase tracking-widest py-3 hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create admin user in Supabase**

Go to Supabase Dashboard → Authentication → Users → Invite user (or Add user). Set email + password.

- [ ] **Step 5: Verify login flow**

Open http://localhost:3000/admin — should redirect to `/admin/login`. Log in → should show admin dashboard shell.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: admin auth layout, login page, nav bar"
```

---

## Task 19: Admin dashboard

**Files:**
- Create: `src/components/admin/StatsCard.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Write `src/components/admin/StatsCard.tsx`**

```tsx
interface StatsCardProps {
  label: string
  value: string | number
  accent?: boolean
}

export function StatsCard({ label, value, accent }: StatsCardProps) {
  return (
    <div className="bg-white rounded border border-gray-200 p-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-black ${accent ? 'text-brand' : 'text-black'}`}>{value}</p>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/page.tsx`**

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/StatsCard'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import type { Order } from '@/lib/supabase/types'

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: todayCount },
    { count: upcomingCount },
    { count: activeCount },
    { data: recent },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed').gte('created_at', today),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed').gte('start_date', today),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('orders').select('total_price').eq('status', 'confirmed').gte('created_at', `${today.slice(0, 7)}-01`),
  ])

  const monthRevenue = (revenueData ?? []).reduce((sum: number, o: any) => sum + Number(o.total_price), 0)

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Bestellingen vandaag" value={todayCount ?? 0} />
        <StatsCard label="Aankomend" value={upcomingCount ?? 0} />
        <StatsCard label="Omzet (maand)" value={`€ ${monthRevenue.toFixed(0)}`} accent />
        <StatsCard label="Actieve artikelen" value={activeCount ?? 0} />
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-black">Recente bestellingen</h2>
          <Link href="/admin/bestellingen" className="text-brand text-sm font-bold">Alle bestellingen →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['#', 'Klant', 'Periode', 'Totaal', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recent as Order[] ?? []).map(order => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400">{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-6 py-4 font-bold">{order.customer_name}</td>
                <td className="px-6 py-4 text-gray-500">{order.start_date} – {order.end_date}</td>
                <td className="px-6 py-4 font-bold">€ {Number(order.total_price).toFixed(2)}</td>
                <td className="px-6 py-4"><Badge variant={order.status as 'confirmed' | 'pending' | 'cancelled'} /></td>
                <td className="px-6 py-4">
                  <Link href={`/admin/bestellingen/${order.id}`} className="text-brand font-bold">Bekijk →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: admin dashboard with stats and recent orders"
```

---

## Task 20: Admin article management

**Files:**
- Create: `src/components/admin/ArticleForm.tsx`
- Create: `src/app/admin/artikelen/page.tsx`
- Create: `src/app/admin/artikelen/nieuw/page.tsx`
- Create: `src/app/admin/artikelen/[id]/page.tsx`

- [ ] **Step 1: Write `src/components/admin/ArticleForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Article, Category } from '@/lib/supabase/types'

interface ArticleFormProps {
  article?: Article
  categories: Category[]
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name_nl: article?.name_nl ?? '',
    name_en: article?.name_en ?? '',
    description_nl: article?.description_nl ?? '',
    description_en: article?.description_en ?? '',
    price_per_day: article?.price_per_day?.toString() ?? '',
    stock_quantity: article?.stock_quantity?.toString() ?? '',
    category_id: article?.category_id ?? categories[0]?.id ?? '',
    active: article?.active ?? true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    let image_url = article?.image_url ?? ''
    if (imageFile) {
      const path = `${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage.from('article-images').upload(path, imageFile)
      if (uploadError) { setError(uploadError.message); setSaving(false); return }
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path)
      image_url = publicUrl
    }

    const payload = {
      name_nl: form.name_nl,
      name_en: form.name_en,
      description_nl: form.description_nl,
      description_en: form.description_en,
      price_per_day: parseFloat(form.price_per_day),
      stock_quantity: parseInt(form.stock_quantity),
      category_id: form.category_id,
      active: form.active,
      image_url,
    }

    if (article) {
      const { error } = await supabase.from('articles').update(payload).eq('id', article.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('articles').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/artikelen')
    router.refresh()
  }

  async function handleDelete() {
    if (!article) return
    // Check for active confirmed bookings
    const { data: items } = await supabase
      .from('order_items')
      .select('id, orders!inner(status)')
      .eq('article_id', article.id)
      .eq('orders.status', 'confirmed')
      .limit(1)

    if (items && items.length > 0) {
      setError('Kan niet verwijderen: er zijn actieve boekingen. Deactiveer het artikel.')
      return
    }
    await supabase.from('articles').delete().eq('id', article.id)
    router.push('/admin/artikelen')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {error && <p className="text-red-500 border-2 border-red-500 p-3 font-bold">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Naam (NL)" id="name_nl" value={form.name_nl} onChange={e => set('name_nl', e.target.value)} required />
        <Input label="Name (EN)" id="name_en" value={form.name_en} onChange={e => set('name_en', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest">Omschrijving (NL)</label>
          <textarea className="border-2 border-black px-4 py-2 h-24 resize-none" value={form.description_nl} onChange={e => set('description_nl', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest">Description (EN)</label>
          <textarea className="border-2 border-black px-4 py-2 h-24 resize-none" value={form.description_en} onChange={e => set('description_en', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Prijs per dag (€)" id="price" type="number" step="0.01" min="0" value={form.price_per_day} onChange={e => set('price_per_day', e.target.value)} required />
        <Input label="Voorraad" id="stock" type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest">Categorie</label>
          <select className="border-2 border-black px-4 py-2" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name_nl}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-widest">Foto</label>
        {article?.image_url && <img src={article.image_url} className="w-24 h-24 object-cover border-2 border-black mb-2" alt="" />}
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="text-sm" />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="active" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4" />
        <label htmlFor="active" className="font-black text-sm uppercase tracking-wide">Actief (zichtbaar in catalogus)</label>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>{saving ? 'Opslaan…' : 'Opslaan'}</Button>
        {article && (
          <Button type="button" variant="outline" onClick={handleDelete}>Verwijderen</Button>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/artikelen/page.tsx`**

```tsx
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import type { Article } from '@/lib/supabase/types'

export default async function ArticlesPage() {
  const supabase = createServerSupabaseClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(name_nl)')
    .order('name_nl')

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Artikelen</h1>
        <Link href="/admin/artikelen/nieuw"><Button>+ Nieuw artikel</Button></Link>
      </div>
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Naam', 'Categorie', 'Prijs/dag', 'Voorraad', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(articles as any[] ?? []).map((a: any) => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{a.name_nl}</td>
                <td className="px-6 py-4 text-gray-500">{a.categories?.name_nl}</td>
                <td className="px-6 py-4">€ {a.price_per_day}</td>
                <td className="px-6 py-4">{a.stock_quantity}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {a.active ? 'Actief' : 'Inactief'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/artikelen/${a.id}`} className="text-brand font-bold">Bewerk →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/app/admin/artikelen/nieuw/page.tsx`**

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function NewArticlePage() {
  const supabase = createServerSupabaseClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')
  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Nieuw artikel</h1>
      <ArticleForm categories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 4: Write `src/app/admin/artikelen/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('sort_order'),
  ])
  if (!article) notFound()
  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Artikel bewerken</h1>
      <ArticleForm article={article} categories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 5: Test article creation**

Log in to admin, go to `/admin/artikelen/nieuw`, create an article. Verify it appears in the list and in the public catalog.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: admin article management (list, create, edit, delete)"
```

---

## Task 21: Admin category management

**Files:**
- Create: `src/components/admin/CategoryForm.tsx`
- Create: `src/app/admin/categorieen/page.tsx`

- [ ] **Step 1: Write `src/components/admin/CategoryForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/lib/supabase/types'

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name_nl: category?.name_nl ?? '',
    name_en: category?.name_en ?? '',
    slug: category?.slug ?? '',
    sort_order: category?.sort_order?.toString() ?? '0',
  })
  const [saving, setSaving] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name_nl' && !category ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { name_nl: form.name_nl, name_en: form.name_en, slug: form.slug, sort_order: parseInt(form.sort_order) }
    if (category) {
      await supabase.from('categories').update(payload).eq('id', category.id)
    } else {
      await supabase.from('categories').insert(payload)
    }
    router.refresh()
    setSaving(false)
    if (!category) setForm({ name_nl: '', name_en: '', slug: '', sort_order: '0' })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-end">
      <Input label="Naam (NL)" id={`name_nl_${category?.id}`} value={form.name_nl} onChange={e => set('name_nl', e.target.value)} required />
      <Input label="Name (EN)" id={`name_en_${category?.id}`} value={form.name_en} onChange={e => set('name_en', e.target.value)} required />
      <Input label="Slug" id={`slug_${category?.id}`} value={form.slug} onChange={e => set('slug', e.target.value)} required />
      <Input label="Volgorde" id={`order_${category?.id}`} type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
      <Button type="submit" disabled={saving}>{saving ? '…' : category ? 'Opslaan' : '+ Toevoegen'}</Button>
    </form>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/categorieen/page.tsx`**

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/CategoryForm'
import type { Category } from '@/lib/supabase/types'

export default async function CategoriesPage() {
  const supabase = createServerSupabaseClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Categorieën</h1>
      <div className="bg-white rounded border border-gray-200 p-6 mb-8">
        <h2 className="font-black mb-4">Nieuwe categorie</h2>
        <CategoryForm />
      </div>
      <div className="bg-white rounded border border-gray-200 p-6">
        <h2 className="font-black mb-6">Bestaande categorieën</h2>
        <div className="flex flex-col gap-6">
          {(categories as Category[] ?? []).map(cat => (
            <div key={cat.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <CategoryForm category={cat} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: admin category management"
```

---

## Task 22: Admin order management

**Files:**
- Create: `src/app/admin/bestellingen/page.tsx`
- Create: `src/app/admin/bestellingen/[id]/page.tsx`

- [ ] **Step 1: Write `src/app/admin/bestellingen/page.tsx`**

```tsx
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import type { Order } from '@/lib/supabase/types'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (searchParams.status) query = query.eq('status', searchParams.status)
  const { data: orders } = await query

  const statuses = ['', 'confirmed', 'pending_payment', 'cancelled']

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Bestellingen</h1>
      <div className="flex gap-2 mb-6">
        {statuses.map(s => (
          <Link
            key={s}
            href={s ? `?status=${s}` : '/admin/bestellingen'}
            className={`px-4 py-2 border-2 font-black text-sm uppercase transition-colors ${
              searchParams.status === s || (!searchParams.status && !s) ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'
            }`}
          >
            {s || 'Alle'}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['#', 'Klant', 'E-mail', 'Periode', 'Totaal', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders as Order[] ?? []).map(order => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-6 py-4 font-bold">{order.customer_name}</td>
                <td className="px-6 py-4 text-gray-500">{order.customer_email}</td>
                <td className="px-6 py-4 text-gray-500">{order.start_date} – {order.end_date}</td>
                <td className="px-6 py-4 font-bold">€ {Number(order.total_price).toFixed(2)}</td>
                <td className="px-6 py-4"><Badge variant={order.status as 'confirmed' | 'pending_payment' | 'cancelled'} /></td>
                <td className="px-6 py-4">
                  <Link href={`/admin/bestellingen/${order.id}`} className="text-brand font-bold">Bekijk →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/admin/bestellingen/[id]/page.tsx`**

```tsx
import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import type { Order, OrderItem, Article } from '@/lib/supabase/types'

async function cancelOrder(orderId: string) {
  'use server'
  const supabase = createServerSupabaseClient()
  await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
  redirect('/admin/bestellingen')
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: order } = await supabase.from('orders').select('*').eq('id', params.id).single()
  if (!order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select('*, articles(name_nl, name_en)')
    .eq('order_id', params.id)

  const o = order as Order

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-2">Bestelling #{o.id.slice(0, 8).toUpperCase()}</h1>
      <div className="mb-6"><Badge variant={o.status as any} /></div>

      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <h2 className="font-black mb-4">Klantgegevens</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-400">Naam</dt><dd className="font-bold">{o.customer_name}</dd>
          <dt className="text-gray-400">E-mail</dt><dd>{o.customer_email}</dd>
          <dt className="text-gray-400">Telefoon</dt><dd>{o.customer_phone}</dd>
          <dt className="text-gray-400">Periode</dt><dd>{o.start_date} t/m {o.end_date}</dd>
          <dt className="text-gray-400">Stripe ID</dt><dd className="font-mono text-xs break-all">{o.stripe_payment_id}</dd>
        </dl>
      </div>

      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <h2 className="font-black mb-4">Artikelen</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
            <th className="text-left py-2">Artikel</th>
            <th className="text-left py-2">Aantal</th>
            <th className="text-left py-2">Prijs/dag</th>
          </tr></thead>
          <tbody>
            {(items ?? []).map((item: any) => (
              <tr key={item.id} className="border-b border-gray-50 py-2">
                <td className="py-3">{item.articles?.name_nl}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">€ {item.price_per_day}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 font-black text-right">Totaal: €{Number(o.total_price).toFixed(2)}</p>
      </div>

      {o.status !== 'cancelled' && (
        <form action={cancelOrder.bind(null, o.id)}>
          <button
            type="submit"
            className="border-2 border-red-500 text-red-500 font-black uppercase px-6 py-3 hover:bg-red-500 hover:text-white transition-colors"
          >
            Bestelling annuleren
          </button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: admin order list and detail with cancellation"
```

---

## Task 23: Cleanup job for expired orders

**Files:**
- Create: `src/app/api/cleanup/route.ts`

- [ ] **Step 1: Write `src/app/api/cleanup/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CLEANUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cancelled: data?.length ?? 0 })
}
```

- [ ] **Step 2: Add `CLEANUP_SECRET` to `.env.local`**

```
CLEANUP_SECRET=<random-string-min-32-chars>
```

Generate one with: `openssl rand -hex 32`

- [ ] **Step 3: Set up Vercel Cron (after deploy)**

In `vercel.json` at project root:

```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```

Add `CLEANUP_SECRET` to Vercel environment variables. The cron hits the route every hour; the route cancels orders older than 30 minutes that are still `pending_payment`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: cleanup job for expired pending orders"
```

---

## Task 24: E2E test — full booking flow

**Files:**
- Create: `e2e/booking.spec.ts`

- [ ] **Step 1: Write `e2e/booking.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test('full booking flow', async ({ page }) => {
  // 1. Visit catalog
  await page.goto('/nl/verhuur')
  await expect(page.getByRole('heading', { name: /verhuur/i })).toBeVisible()

  // 2. Click first article
  const firstCard = page.locator('a[href*="/nl/verhuur/"]').first()
  await firstCard.click()
  await page.waitForURL(/\/nl\/verhuur\/.+/)

  // 3. Pick dates
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() + 7)
  const end = new Date(start)
  end.setDate(start.getDate() + 2)

  // Click start day in date picker
  await page.getByRole('button', { name: String(start.getDate()) }).first().click()
  await page.getByRole('button', { name: String(end.getDate()) }).first().click()

  // 4. Wait for availability check
  await page.waitForResponse(r => r.url().includes('/api/availability'))

  // 5. Add to cart if available
  const addBtn = page.getByRole('button', { name: /in winkelwagen/i })
  if (await addBtn.isEnabled()) {
    await addBtn.click()
    await page.waitForURL(/\/nl\/winkelwagen/)

    // 6. Proceed to checkout
    await page.getByRole('button', { name: /afrekenen/i }).click()
    await page.waitForURL(/\/nl\/afrekenen/)

    // 7. Fill in customer details
    await page.fill('#name', 'Test Klant')
    await page.fill('#email', 'test@example.com')
    await page.fill('#phone', '0612345678')
    await page.getByRole('button', { name: /naar betaling/i }).click()

    // 8. Stripe test card
    await page.waitForSelector('[data-testid="card-number"]', { timeout: 10000 })
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/26')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.getByRole('button', { name: /betalen/i }).click()

    // 9. Confirmation
    await page.waitForURL(/\/nl\/bevestiging/, { timeout: 15000 })
    await expect(page.getByText(/boeking bevestigd/i)).toBeVisible()
  }
})
```

- [ ] **Step 2: Run E2E tests (requires dev server + real Supabase + Stripe test mode)**

```bash
npx playwright test e2e/booking.spec.ts --headed
```
Expected: test navigates through full flow and reaches confirmation page.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: e2e booking flow with Playwright"
```

---

## Task 25: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-org>/<repo>.git
git push -u origin main
```

- [ ] **Step 2: Import project in Vercel**

Go to https://vercel.com → New Project → Import from GitHub → select repo.

- [ ] **Step 3: Add environment variables in Vercel**

Add all variables from `.env.local.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CLEANUP_SECRET`

- [ ] **Step 4: Set up Stripe production webhook**

Go to Stripe Dashboard → Developers → Webhooks → Add endpoint.
- URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- Event: `payment_intent.succeeded`
- Copy signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel.

- [ ] **Step 5: Verify domain and first deploy**

```bash
vercel --prod
```
Open the production URL. Test a full booking with Stripe test card `4242 4242 4242 4242`.

- [ ] **Step 6: Commit vercel.json**

```bash
git add vercel.json && git commit -m "chore: add Vercel cron config"
git push
```

---

## Plan complete

All 25 tasks implement the full spec:
- Public site: homepage, catalog, article detail, cart, checkout, confirmation
- Stripe payment flow with webhook-confirmed bookings
- Real-time availability preventing overbooking
- Admin panel: dashboard, articles, categories, orders
- Bilingual NL/EN routing via next-intl
- Cleanup job for expired orders
- E2E test with Playwright
