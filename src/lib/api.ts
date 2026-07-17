import { mockCampaigns } from './mockCampaigns'
import type { Campaign } from './types'

const NETWORK_DELAY_MS = 400

export function fetchCampaigns(): Promise<Campaign[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCampaigns), NETWORK_DELAY_MS)
  })
}

export function fetchCampaignById(id: string): Promise<Campaign | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCampaigns.find((campaign) => campaign.id === id) ?? null)
    }, NETWORK_DELAY_MS)
  })
}
