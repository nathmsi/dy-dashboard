import { useMemo, useState } from 'react'
import { SearchInput } from '../components/ui/SearchInput/SearchInput'
import { CampaignTable } from '../features/campaigns/CampaignTable'
import type { CampaignSortKey } from '../features/campaigns/CampaignTable'
import type { SortDirection } from '../components/ui/Table/Table'
import { mockCampaigns } from '../lib/mockCampaigns'
import type { Campaign } from '../lib/types'
import styles from './DashboardPage.module.css'

interface DashboardPageProps {
  onSelectCampaign: (campaign: Campaign) => void
}

export function DashboardPage({ onSelectCampaign }: DashboardPageProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CampaignSortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const visibleCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? mockCampaigns.filter((campaign) => campaign.name.toLowerCase().includes(query))
      : mockCampaigns

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue))
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [search, sortBy, sortDirection])

  const handleSort = (key: CampaignSortKey) => {
    if (key === sortBy) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  return (
    <div>
      <h1>Campaigns</h1>
      <div className={styles.toolbar}>
        <SearchInput
          id="campaign-search"
          label="Search campaigns"
          placeholder="Search by name…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <CampaignTable
        campaigns={visibleCampaigns}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onSelectCampaign={onSelectCampaign}
      />
    </div>
  )
}
