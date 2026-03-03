import { test, expect } from '@playwright/test'

test.describe('Search page — Speedmaster (5 listings)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/searches/srch_speedmaster_01')
  })

  test('should display the search name as heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Omega Speedmaster Date' })).toBeVisible()
  })

  test('should show Active badge', async ({ page }) => {
    await expect(page.getByText('Active').first()).toBeVisible()
  })

  test('should show the reference number', async ({ page }) => {
    // Ref appears in page header and all 5 listing rows — first() is sufficient
    await expect(page.getByText(/Ref\. 3210\.50/).first()).toBeVisible()
  })

  test('should show the budget range', async ({ page }) => {
    await expect(page.getByText(/€2,500/)).toBeVisible()
    await expect(page.getByText(/€3,500/)).toBeVisible()
  })

  test('should show listing count in header', async ({ page }) => {
    await expect(page.getByText('5 listings')).toBeVisible()
  })

  test('should show must-have criteria pills', async ({ page }) => {
    await expect(page.getByText(/Box or papers/)).toBeVisible()
    await expect(page.getByText(/Unpolished case/)).toBeVisible()
  })

  test('should show deal-breaker criteria pills', async ({ page }) => {
    await expect(page.getByText(/Heavily polished/)).toBeVisible()
  })

  test('should render five listing rows', async ({ page }) => {
    const rows = page.locator('[data-testid="listing-row"]')
    await expect(rows).toHaveCount(5)
  })

  test('should show rank badges 1 through 5', async ({ page }) => {
    // Target the circular rank badge spans specifically to avoid matching sidebar nav counts
    for (const rank of [1, 2, 3, 4, 5]) {
      const badge = page.locator('span.rounded-full').filter({ hasText: new RegExp(`^${rank}$`) }).first()
      await expect(badge).toBeVisible()
    }
  })

  test('should show the top-ranked seller name', async ({ page }) => {
    await expect(page.getByText('UhrenWelt München')).toBeVisible()
  })

  test('should show inline Score label on desktop', async ({ page, isMobile }) => {
    // Inline row labels are only visible on md+ (hidden sm:block)
    test.skip(isMobile, 'Desktop-only: score bars are hidden below md breakpoint')
    await expect(page.getByText('Score').first()).toBeVisible()
  })

  test('should show Add Listing button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add listing/i })).toBeVisible()
  })

  test('should open Add Listing dialog when button clicked', async ({ page }) => {
    await page.getByRole('button', { name: /add listing/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should navigate to listing detail when row clicked', async ({ page }) => {
    await page.locator('[data-testid="listing-row"]').first().click()
    await expect(page).toHaveURL(/\/listings\//)
  })

  test('should have a back link to dashboard', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
  })

  test('should navigate back to dashboard via back link', async ({ page }) => {
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should return 404 for unknown search id', async ({ page }) => {
    const response = await page.goto('/searches/not_a_real_id')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Search page — Datejust (2 listings)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/searches/srch_datejust_01')
  })

  test('should display the search name as heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Rolex Datejust 36' })).toBeVisible()
  })

  test('should render two listing rows', async ({ page }) => {
    const rows = page.locator('[data-testid="listing-row"]')
    await expect(rows).toHaveCount(2)
  })

  test('should show Dealer preference pill', async ({ page }) => {
    await expect(page.getByText(/Box and papers/)).toBeVisible()
  })
})
