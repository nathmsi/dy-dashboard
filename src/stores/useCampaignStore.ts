import { create } from 'zustand'
import type { CampaignSortKey, SortDirection } from '../lib/types'

interface CampaignStoreState {
  search: string
  sortBy: CampaignSortKey
  sortDirection: SortDirection
  setSearch: (search: string) => void
  toggleSort: (key: CampaignSortKey) => void
}

export const useCampaignStore = create<CampaignStoreState>((set) => ({
  search: '',
  sortBy: 'name',
  sortDirection: 'asc',
  setSearch: (search) => set({ search }),
  toggleSort: (key) =>
    set((state) =>
      state.sortBy === key
        ? { sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' }
        : { sortBy: key, sortDirection: 'asc' },
    ),
}))
