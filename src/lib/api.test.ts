import { describe, expect, it } from 'vitest'
import { fetchCampaignById, fetchCampaigns } from './api'
import { mockCampaigns } from './mockCampaigns'

describe('fetchCampaigns', () => {
  it('resolves with the mock campaign list', async () => {
    const result = await fetchCampaigns()
    expect(result).toEqual(mockCampaigns)
  })
})

describe('fetchCampaignById', () => {
  it('resolves with the matching campaign', async () => {
    const result = await fetchCampaignById('camp-002')
    expect(result?.name).toBe('Cart Abandonment Popup')
  })

  it('resolves with null when no campaign matches', async () => {
    const result = await fetchCampaignById('does-not-exist')
    expect(result).toBeNull()
  })
})
