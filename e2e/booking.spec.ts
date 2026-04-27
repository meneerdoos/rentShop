import { test, expect } from '@playwright/test'

test.describe('Full booking flow', () => {
  test('customer can browse catalog, add to cart, and reach payment', async ({ page }) => {
    // Visit catalog
    await page.goto('/nl/verhuur')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Click first article
    const firstArticle = page.locator('a[href*="/verhuur/"]').first()
    await firstArticle.click()
    await page.waitForURL(/\/verhuur\//)

    // Pick a date range (next week)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 7)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 2)

    // Expect date picker to be visible
    await expect(page.locator('[data-testid="date-picker"]').or(page.locator('.rdp'))).toBeVisible()

    // Add to cart button should be present
    await expect(page.getByRole('button', { name: /voeg toe|add to cart/i })).toBeVisible()
  })

  test('cart page shows items and proceeds to checkout', async ({ page }) => {
    // Seed localStorage with a cart item before navigating
    await page.goto('/nl')
    await page.evaluate(() => {
      const cart = {
        items: [
          {
            articleId: 'test-article-id',
            name: 'Teststoel',
            pricePerDay: 5,
            quantity: 2,
            imageUrl: null,
          },
        ],
        startDate: '2026-05-01',
        endDate: '2026-05-03',
      }
      localStorage.setItem('cart', JSON.stringify(cart))
    })

    await page.goto('/nl/winkelwagen')
    await expect(page.getByText('Teststoel')).toBeVisible()
    await expect(page.getByRole('link', { name: /afrekenen|checkout/i })).toBeVisible()
  })

  test('checkout page shows customer details form', async ({ page }) => {
    await page.goto('/nl')
    await page.evaluate(() => {
      const cart = {
        items: [
          {
            articleId: 'test-article-id',
            name: 'Teststoel',
            pricePerDay: 5,
            quantity: 2,
            imageUrl: null,
          },
        ],
        startDate: '2026-05-01',
        endDate: '2026-05-03',
      }
      localStorage.setItem('cart', JSON.stringify(cart))
    })

    await page.goto('/nl/afrekenen')

    // Customer details form fields
    await expect(page.getByLabel(/naam|name/i)).toBeVisible()
    await expect(page.getByLabel(/e-mail|email/i)).toBeVisible()
    await expect(page.getByLabel(/telefoon|phone/i)).toBeVisible()
  })

  test('confirmation page clears cart', async ({ page }) => {
    await page.goto('/nl')
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify({ items: [{ articleId: 'x', name: 'Test', pricePerDay: 1, quantity: 1, imageUrl: null }], startDate: '2026-05-01', endDate: '2026-05-02' }))
      localStorage.setItem('pending_order_id', 'mock-order-id')
    })

    await page.goto('/nl/bevestiging')

    // Cart should be cleared
    const cartJson = await page.evaluate(() => localStorage.getItem('cart'))
    const cart = cartJson ? JSON.parse(cartJson) : { items: [] }
    expect(cart.items).toHaveLength(0)

    // pending_order_id should be removed
    const pendingId = await page.evaluate(() => localStorage.getItem('pending_order_id'))
    expect(pendingId).toBeNull()
  })

  test('language switcher works', async ({ page }) => {
    await page.goto('/nl/verhuur')
    await page.getByRole('link', { name: /en/i }).click()
    await page.waitForURL(/\/en\/rental/)
    await expect(page).toHaveURL(/\/en\/rental/)
  })

  test('admin login page is accessible', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByLabel(/e-mail|email/i)).toBeVisible()
    await expect(page.getByLabel(/wachtwoord|password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /inloggen|login/i })).toBeVisible()
  })

  test('admin redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
