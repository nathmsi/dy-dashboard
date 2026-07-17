import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchInput } from '../components/ui/SearchInput/SearchInput'
import { CampaignTable } from '../features/campaigns/CampaignTable'
import { useCampaigns } from '../features/campaigns/useCampaigns'
import { useCampaignStore } from '../stores/useCampaignStore'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const search = useCampaignStore((state) => state.search)
  const setSearch = useCampaignStore((state) => state.setSearch)
  const sortBy = useCampaignStore((state) => state.sortBy)
  const sortDirection = useCampaignStore((state) => state.sortDirection)
  const toggleSort = useCampaignStore((state) => state.toggleSort)

  const { data: campaigns, isLoading, isError } = useCampaigns()
  const navigate = useNavigate()

  const visibleCampaigns = useMemo(() => {
    if (!campaigns) return []

    const query = search.trim().toLowerCase()
    const filtered = query
      ? campaigns.filter((campaign) => campaign.name.toLowerCase().includes(query))
      : campaigns

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [campaigns, search, sortBy, sortDirection])

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
      {isLoading && <p>Loading campaigns…</p>}
      {isError && <p role="alert">Something went wrong loading campaigns.</p>}
      {!isLoading && !isError && (
        <CampaignTable
          campaigns={visibleCampaigns}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={toggleSort}
          onSelectCampaign={(campaign) => navigate(`/campaigns/${campaign.id}`)}
        />
      )}
    </div>
  )
}
