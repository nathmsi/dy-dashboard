import { useQuery } from '@tanstack/react-query'
import { fetchCampaignById, fetchCampaigns } from '../../lib/api'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchCampaignById(id!),
    enabled: Boolean(id),
  })
}
