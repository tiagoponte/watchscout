import { test, expect } from '@playwright/test'

const LISTING_URL = '/searches/srch_speedmaster_01/listings/lst_speed_01'

test.describe('Listing intelligence card — lst_speed_01 (UhrenWelt München)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LISTING_URL)
  })

  // ── Page structure ──────────────────────────────────────────────────────────

  test('should display the watch name as heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Omega Speedmaster Date' })).toBeVisible()
  })

  test('should display the seller name below the heading', async ({ page }) => {
    await expect(page.getByText('UhrenWelt München').first()).toBeVisible()
  })

  test('should show the Chrono24 platform badge', async ({ page }) => {
    await expect(page.getByText('Chrono24').first()).toBeVisible()
  })

  test('should display the asking price', async ({ page }) => {
    await expect(page.getByText(/€2,890/)).toBeVisible()
  })

  test('should display the all-in price', async ({ page }) => {
    // All-in: €2,905
    await expect(page.getByText(/€2,905/)).toBeVisible()
  })

  test('should show the composite score', async ({ page }) => {
    await expect(page.getByText('81').first()).toBeVisible()
  })

  test('should show the risk score', async ({ page }) => {
    await expect(page.getByText('38').first()).toBeVisible()
  })

  // ── Sections ─────────────────────────────────────────────────────────────────

  test('should render the Overview section', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible()
  })

  test('should render the Photos section', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Photos', exact: true })).toBeVisible()
  })

  test('should render the Condition & Accessories section', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Condition & Accessories', exact: true })).toBeVisible()
  })

  test('should render the Service History section', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Service History', exact: true })).toBeVisible()
  })

  test('should render the Seller Details section', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Seller Details', exact: true })).toBeVisible()
  })

  test('should render the Scoring Breakdown section', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Scoring Breakdown', exact: true })).toBeVisible()
  })

  test('should render the Questionnaire section', async ({ page }) => {
    // Use exact: true to avoid matching the "Generate Questionnaire" button inside the panel
    await expect(page.getByRole('button', { name: 'Questionnaire', exact: true })).toBeVisible()
  })

  // ── Photos ───────────────────────────────────────────────────────────────────

  test('should show at least one photo thumbnail', async ({ page }) => {
    // Photo buttons have class cursor-zoom-in — confirmed by the lightbox test
    const photos = page.locator('button.cursor-zoom-in')
    const count = await photos.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should show star thumbnail-select button on photo hover', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hover-reveal is desktop-only; touch devices use tap interactions')
    const firstPhoto = page.locator('button.cursor-zoom-in').first()
    await firstPhoto.hover()
    // Star button is sibling of the lightbox button inside the photo wrapper
    const starBtn = firstPhoto.locator('..').getByRole('button', { name: /thumbnail/i })
    await expect(starBtn).toBeVisible()
  })

  test('should open lightbox when photo is clicked', async ({ page }) => {
    const firstPhotoButton = page.locator('button.cursor-zoom-in').first()
    await firstPhotoButton.click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should close lightbox when dialog is dismissed', async ({ page }) => {
    await page.locator('button.cursor-zoom-in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  // ── Seller details ────────────────────────────────────────────────────────────

  test('should show seller rating', async ({ page }) => {
    await expect(page.getByText(/4\.8/)).toBeVisible()
  })

  test('should show review count', async ({ page }) => {
    await expect(page.getByText(/847/)).toBeVisible()
  })

  // ── Navigation ───────────────────────────────────────────────────────────────

  test('should have a back link to the search page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /back to listings/i })).toBeVisible()
  })

  test('should navigate back to search page via back link', async ({ page }) => {
    await page.getByRole('link', { name: /back to listings/i }).click()
    await expect(page).toHaveURL('/searches/srch_speedmaster_01')
  })

  test('should return 404 for unknown listing id', async ({ page }) => {
    const response = await page.goto('/searches/srch_speedmaster_01/listings/not_a_real_id')
    expect(response?.status()).toBe(404)
  })
})
