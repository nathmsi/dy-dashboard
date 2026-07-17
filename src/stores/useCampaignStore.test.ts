import { beforeEach, describe, expect, it } from 'vitest'
import { useCampaignStore } from './useCampaignStore'

describe('useCampaignStore', () => {
  beforeEach(() => {
    useCampaignStore.setState({ search: '', sortBy: 'name', sortDirection: 'asc' })
  })

  it('updates search', () => {
    useCampaignStore.getState().setSearch('mobile')
    expect(useCampaignStore.getState().search).toBe('mobile')
  })

  it('toggles direction when sorting the same column twice', () => {
    useCampaignStore.getState().toggleSort('name')
    expect(useCampaignStore.getState()).toMatchObject({ sortBy: 'name', sortDirection: 'desc' })

    useCampaignStore.getState().toggleSort('name')
    expect(useCampaignStore.getState()).toMatchObject({ sortBy: 'name', sortDirection: 'asc' })
  })

  it('resets to ascending when sorting a new column', () => {
    useCampaignStore.getState().toggleSort('name')
    useCampaignStore.getState().toggleSort('visitors')
    expect(useCampaignStore.getState()).toMatchObject({ sortBy: 'visitors', sortDirection: 'asc' })
  })
})
