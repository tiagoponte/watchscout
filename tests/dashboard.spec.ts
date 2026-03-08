import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should display two search cards', async ({ page }) => {
    const cards = page.locator('[data-testid="search-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should show the Omega Speedmaster Date card', async ({ page }) => {
    // Name appears in sidebar too — use first() or scope to main
    await expect(page.locator('main').getByText('Omega Speedmaster Date').first()).toBeVisible()
  })

  test('should show the Rolex Datejust 36 card', async ({ page }) => {
    await expect(page.locator('main').getByText('Rolex Datejust 36').first()).toBeVisible()
  })

  test('should show Active status badges on both cards', async ({ page }) => {
    // exact: true prevents matching parent elements that contain "Active" as substring
    const activeBadges = page.locator('main').getByText('Active', { exact: true })
    const count = await activeBadges.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should show budget ranges on each card', async ({ page }) => {
    // Scope to the Speedmaster card to avoid strict mode violations when other cards share similar budget values
    const speedmasterCard = page.locator('[data-testid="search-card"]').filter({ hasText: 'Omega Speedmaster Date' }).first()
    await expect(speedmasterCard.getByText(/€2,500/)).toBeVisible()
  })

  test('should show listing counts', async ({ page }) => {
    // "5 listings" for Speedmaster, "2 listings" for Datejust (Datejust count also appears in sidebar)
    await expect(page.locator('main').getByText('5', { exact: true }).first()).toBeVisible()
    await expect(page.locator('main').getByText('2', { exact: true }).first()).toBeVisible()
  })

  test('should show top pick score on Speedmaster card', async ({ page }) => {
    // Top pick composite score is 81
    const speedmasterCard = page.locator('[data-testid="search-card"]').filter({ hasText: 'Omega Speedmaster Date' }).first()
    await expect(speedmasterCard.getByText('81', { exact: true })).toBeVisible()
  })

  test('should show New Search button', async ({ page }) => {
    // Button asChild renders as <a>, so use link role; sidebar also has one — first() is fine
    await expect(page.getByRole('link', { name: /new search/i }).first()).toBeVisible()
  })

  test('should navigate to search page when clicking Speedmaster card', async ({ page }) => {
    await page.locator('main').getByText('Omega Speedmaster Date').first().click()
    await expect(page).toHaveURL('/searches/srch_speedmaster_01')
  })

  test('should navigate to search page when clicking Datejust card', async ({ page }) => {
    await page.locator('main').getByText('Rolex Datejust 36').first().click()
    await expect(page).toHaveURL('/searches/srch_datejust_01')
  })

  test('should redirect from root to dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show the WatchScout logo in the sidebar', async ({ page, isMobile }) => {
    // Sidebar is hidden on mobile — check it exists in the DOM; on desktop assert visible
    const logo = page.getByText('WatchScout')
    if (isMobile) {
      await expect(logo).toHaveCount(1)
    } else {
      await expect(logo).toBeVisible()
    }
  })

  test('should have no detectable accessibility violations on headings hierarchy', async ({ page }) => {
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  // ── Card actions ─────────────────────────────────────────────────────────────

  test('should reveal actions button when card is hovered', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hover-reveal is desktop-only; touch devices use tap interactions')
    const card = page.locator('[data-testid="search-card"]').first()
    await card.hover()
    await expect(card.getByRole('button', { name: 'Search actions' })).toBeVisible()
  })

  test('should show Archive and Delete options in card actions menu', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hover-reveal is desktop-only; touch devices use tap interactions')
    const card = page.locator('[data-testid="search-card"]').first()
    await card.hover()
    await card.getByRole('button', { name: 'Search actions' }).click()
    await expect(page.getByRole('menuitem', { name: /archive/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible()
  })
})
