import { Badge } from '../../components/ui/Badge/Badge'
import { Table } from '../../components/ui/Table/Table'
import type { Column, SortDirection } from '../../components/ui/Table/Table'
import type { Campaign } from '../../lib/types'

export type CampaignSortKey = 'name' | 'status' | 'conversionRate' | 'visitors' | 'startDate'

interface CampaignTableProps {
  campaigns: Campaign[]
  sortBy: CampaignSortKey
  sortDirection: SortDirection
  onSort: (key: CampaignSortKey) => void
  onSelectCampaign: (campaign: Campaign) => void
}

const columns: Column<Campaign>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (row) => row.name,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => <Badge status={row.status} />,
  },
  {
    key: 'channel',
    header: 'Channel',
    render: (row) => row.channel,
  },
  {
    key: 'conversionRate',
    header: 'Conversion',
    sortable: true,
    render: (row) => `${row.conversionRate.toFixed(1)}%`,
  },
  {
    key: 'visitors',
    header: 'Visitors',
    sortable: true,
    render: (row) => row.visitors.toLocaleString('en-US'),
  },
  {
    key: 'startDate',
    header: 'Start date',
    sortable: true,
    render: (row) => new Date(row.startDate).toLocaleDateString('en-US'),
  },
]

export function CampaignTable({
  campaigns,
  sortBy,
  sortDirection,
  onSort,
  onSelectCampaign,
}: CampaignTableProps) {
  return (
    <Table
      caption="Campaigns"
      columns={columns}
      rows={campaigns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={(key) => onSort(key as CampaignSortKey)}
      onRowActivate={onSelectCampaign}
    />
  )
}
