import { expect, test } from '@playwright/test'
import { mockCampaignsApi } from './mockApi'

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await mockCampaignsApi(page)
  })

  test('dashboard page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Campaigns' })).toBeVisible()
    await expect(page.getByText('Homepage Hero Banner')).toBeVisible()
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true })
  })

  test('campaign detail page', async ({ page }) => {
    await page.goto('/campaigns/camp-002')
    await expect(page.getByRole('heading', { name: 'Cart Abandonment Popup' })).toBeVisible()
    await expect(page).toHaveScreenshot('campaign-detail.png', { fullPage: true })
  })
})
