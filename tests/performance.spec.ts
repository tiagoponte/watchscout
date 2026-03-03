import { test, expect } from '@playwright/test'

// Performance budgets
const BUDGETS = {
  ttfb: 500,        // Time to First Byte — ms
  domLoad: 1500,    // DOMContentLoaded — ms
  fullLoad: 3000,   // load event — ms
  cls: 0.1,         // Cumulative Layout Shift (acceptable threshold)
}

interface NavigationMetrics {
  ttfb: number
  domLoad: number
  fullLoad: number
}

async function getNavigationMetrics(page: Parameters<typeof test>[1] extends infer P ? (P extends { page: infer Q } ? Q : never) : never): Promise<NavigationMetrics> {
  return page.evaluate(() => {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    return {
      ttfb: entry.responseStart - entry.requestStart,
      domLoad: entry.domContentLoadedEventEnd - entry.startTime,
      fullLoad: entry.loadEventEnd - entry.startTime,
    }
  })
}

async function getCLS(page: Parameters<typeof test>[1] extends infer P ? (P extends { page: infer Q } ? Q : never) : never): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let cls = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
          if (!layoutShift.hadRecentInput) cls += layoutShift.value
        }
      })
      observer.observe({ type: 'layout-shift', buffered: true })
      // Give existing entries time to flush
      setTimeout(() => {
        observer.disconnect()
        resolve(cls)
      }, 500)
    })
  })
}

test.describe('Performance — Dashboard', () => {
  test('should meet TTFB and load time budgets', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'load' })
    const metrics = await getNavigationMetrics(page)

    expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGETS.ttfb}ms budget`).toBeLessThan(BUDGETS.ttfb)
    expect(metrics.domLoad, `DOMContentLoaded ${metrics.domLoad}ms exceeds ${BUDGETS.domLoad}ms budget`).toBeLessThan(BUDGETS.domLoad)
    expect(metrics.fullLoad, `Load ${metrics.fullLoad}ms exceeds ${BUDGETS.fullLoad}ms budget`).toBeLessThan(BUDGETS.fullLoad)
  })

  test('should have low cumulative layout shift', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'load' })
    const cls = await getCLS(page)
    expect(cls, `CLS ${cls.toFixed(3)} exceeds budget of ${BUDGETS.cls}`).toBeLessThan(BUDGETS.cls)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    // pageerror catches uncaught JS exceptions only — not resource loading failures
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/dashboard', { waitUntil: 'load' })
    expect(errors).toHaveLength(0)
  })
})

test.describe('Performance — Search page', () => {
  test('should meet TTFB and load time budgets', async ({ page }) => {
    await page.goto('/searches/srch_speedmaster_01', { waitUntil: 'load' })
    const metrics = await getNavigationMetrics(page)

    expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGETS.ttfb}ms budget`).toBeLessThan(BUDGETS.ttfb)
    expect(metrics.domLoad, `DOMContentLoaded ${metrics.domLoad}ms exceeds ${BUDGETS.domLoad}ms budget`).toBeLessThan(BUDGETS.domLoad)
    expect(metrics.fullLoad, `Load ${metrics.fullLoad}ms exceeds ${BUDGETS.fullLoad}ms budget`).toBeLessThan(BUDGETS.fullLoad)
  })

  test('should have low cumulative layout shift', async ({ page }) => {
    await page.goto('/searches/srch_speedmaster_01', { waitUntil: 'load' })
    const cls = await getCLS(page)
    expect(cls, `CLS ${cls.toFixed(3)} exceeds budget of ${BUDGETS.cls}`).toBeLessThan(BUDGETS.cls)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    // pageerror catches uncaught JS exceptions only — not resource loading failures
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/searches/srch_speedmaster_01', { waitUntil: 'load' })
    expect(errors).toHaveLength(0)
  })
})

test.describe('Performance — Listing intelligence card', () => {
  test('should meet TTFB and load time budgets', async ({ page }) => {
    await page.goto('/searches/srch_speedmaster_01/listings/lst_speed_01', { waitUntil: 'load' })
    const metrics = await getNavigationMetrics(page)

    expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGETS.ttfb}ms budget`).toBeLessThan(BUDGETS.ttfb)
    expect(metrics.domLoad, `DOMContentLoaded ${metrics.domLoad}ms exceeds ${BUDGETS.domLoad}ms budget`).toBeLessThan(BUDGETS.domLoad)
    expect(metrics.fullLoad, `Load ${metrics.fullLoad}ms exceeds ${BUDGETS.fullLoad}ms budget`).toBeLessThan(BUDGETS.fullLoad)
  })

  test('should have low cumulative layout shift', async ({ page }) => {
    await page.goto('/searches/srch_speedmaster_01/listings/lst_speed_01', { waitUntil: 'load' })
    const cls = await getCLS(page)
    expect(cls, `CLS ${cls.toFixed(3)} exceeds budget of ${BUDGETS.cls}`).toBeLessThan(BUDGETS.cls)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    // pageerror catches uncaught JS exceptions only — not resource loading failures
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/searches/srch_speedmaster_01/listings/lst_speed_01', { waitUntil: 'load' })
    expect(errors).toHaveLength(0)
  })
})

test.describe('Performance — New Search form', () => {
  test('should meet load time budgets', async ({ page }) => {
    await page.goto('/searches/new', { waitUntil: 'load' })
    const metrics = await getNavigationMetrics(page)

    expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds ${BUDGETS.ttfb}ms budget`).toBeLessThan(BUDGETS.ttfb)
    expect(metrics.fullLoad, `Load ${metrics.fullLoad}ms exceeds ${BUDGETS.fullLoad}ms budget`).toBeLessThan(BUDGETS.fullLoad)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    // pageerror catches uncaught JS exceptions only — not resource loading failures
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/searches/new', { waitUntil: 'load' })
    expect(errors).toHaveLength(0)
  })
})
