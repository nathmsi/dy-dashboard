export type CampaignStatus = 'active' | 'paused' | 'ended'

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  channel: string
  conversionRate: number
  visitors: number
  startDate: string
}

export type CampaignSortKey = 'name' | 'status' | 'conversionRate' | 'visitors' | 'startDate'
export type SortDirection = 'asc' | 'desc'
