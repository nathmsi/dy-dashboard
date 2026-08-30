import type { Page } from '@playwright/test'
import { mockCampaigns } from '../src/lib/mockCampaigns'

// Stub the campaigns API so e2e runs are hermetic (no backend required).
// Reuses the same fixtures the app previously bundled, so visual snapshots
// keep matching.
export async function mockCampaignsApi(page: Page): Promise<void> {
  await page.route('**/api/campaigns', async (route) => {
    await route.fulfill({ json: mockCampaigns })
  })

  await page.route('**/api/campaigns/*', async (route) => {
    const id = new URL(route.request().url()).pathname.split('/').pop()
    const campaign = mockCampaigns.find((item) => item.id === id)
    if (campaign) {
      await route.fulfill({ json: campaign })
    } else {
      await route.fulfill({ status: 404, json: { error: 'Campaign not found' } })
    }
  })
}
