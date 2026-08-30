import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCampaignById, fetchCampaigns } from './api'
import { mockCampaigns } from './mockCampaigns'

function mockFetchOnce(body: unknown, status = 200) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchCampaigns', () => {
  it('resolves with the campaign list from the API', async () => {
    mockFetchOnce(mockCampaigns)
    const result = await fetchCampaigns()
    expect(result).toEqual(mockCampaigns)
    expect(fetch).toHaveBeenCalledWith('/api/campaigns')
  })

  it('throws when the API responds with an error status', async () => {
    mockFetchOnce({ error: 'boom' }, 500)
    await expect(fetchCampaigns()).rejects.toThrow('Failed to fetch campaigns: 500')
  })
})

describe('fetchCampaignById', () => {
  it('resolves with the matching campaign', async () => {
    mockFetchOnce(mockCampaigns[1])
    const result = await fetchCampaignById('camp-002')
    expect(result?.name).toBe('Cart Abandonment Popup')
    expect(fetch).toHaveBeenCalledWith('/api/campaigns/camp-002')
  })

  it('resolves with null when the campaign does not exist', async () => {
    mockFetchOnce({ error: 'Campaign not found' }, 404)
    const result = await fetchCampaignById('does-not-exist')
    expect(result).toBeNull()
  })
})
