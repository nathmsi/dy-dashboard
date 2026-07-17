import { expect, test } from '@playwright/test'

test('search for a campaign, open its detail, and go back', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Campaigns' })).toBeVisible()

  await page.getByLabel('Search campaigns').fill('Cart Abandonment')

  const row = page.getByRole('row', { name: /Cart Abandonment Popup/ })
  await expect(row).toBeVisible()
  await row.click()

  await expect(page).toHaveURL(/\/campaigns\/camp-002/)
  await expect(page.getByRole('heading', { name: 'Cart Abandonment Popup' })).toBeVisible()
  await expect(page.getByText('12.3%')).toBeVisible()

  await page.getByRole('button', { name: /Back to campaigns/ }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Campaigns' })).toBeVisible()
})
