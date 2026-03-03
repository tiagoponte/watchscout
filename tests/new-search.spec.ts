import { test, expect } from '@playwright/test'

test.describe('New Search form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/searches/new')
  })

  test('should display the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Search' })).toBeVisible()
  })

  test('should show the Model Name field', async ({ page }) => {
    await expect(page.getByLabel(/model name/i)).toBeVisible()
  })

  test('should show the Reference Number field', async ({ page }) => {
    await expect(page.getByLabel(/reference number/i)).toBeVisible()
  })

  test('should show Budget Minimum and Maximum fields', async ({ page }) => {
    // Labels say "Minimum" / "Maximum" linked via htmlFor="budget-min" / "budget-max"
    await expect(page.locator('#budget-min')).toBeVisible()
    await expect(page.locator('#budget-max')).toBeVisible()
  })

  test('should show the Currency label', async ({ page }) => {
    // Currency <Label> is not linked to the Select via htmlFor — assert on visible text
    await expect(page.getByText('Currency', { exact: true })).toBeVisible()
  })

  test('should show the Create Search submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create search/i })).toBeVisible()
  })

  test('should show a Cancel link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Cancel' })).toBeVisible()
  })

  test('should show a back link to dashboard', async ({ page }) => {
    await expect(page.getByRole('link', { name: /back to dashboard/i })).toBeVisible()
  })

  test('should accept text input into the Model Name field', async ({ page }) => {
    const input = page.getByLabel(/model name/i)
    await input.fill('Omega Speedmaster Date')
    await expect(input).toHaveValue('Omega Speedmaster Date')
  })

  test('should accept numeric input into Budget Minimum', async ({ page }) => {
    const input = page.locator('#budget-min')
    await input.fill('3000')
    await expect(input).toHaveValue('3000')
  })

  test('should be reachable via New Search button on dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: /new search/i }).first().click()
    await expect(page).toHaveURL('/searches/new')
  })
})
