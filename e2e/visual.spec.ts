import { expect, test } from '@playwright/test'

test.describe('visual regression', () => {
  test('dashboard page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Campaigns' })).toBeVisible()
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true })
  })

  test('campaign detail page', async ({ page }) => {
    await page.goto('/campaigns/camp-002')
    await expect(page.getByRole('heading', { name: 'Cart Abandonment Popup' })).toBeVisible()
    await expect(page).toHaveScreenshot('campaign-detail.png', { fullPage: true })
  })
})
