import type { Campaign } from './types'

// Base URL of the backend. Empty in dev, where Vite proxies `/api` to the
// local API server; set VITE_API_URL to the deployed API origin in production.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch(`${API_BASE}/api/campaigns`)
  if (!response.ok) {
    throw new Error(`Failed to fetch campaigns: ${response.status}`)
  }
  return response.json() as Promise<Campaign[]>
}

export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  const response = await fetch(`${API_BASE}/api/campaigns/${id}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch campaign ${id}: ${response.status}`)
  }
  return response.json() as Promise<Campaign>
}
