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
