import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Campaign } from '../../lib/types'
import { CampaignTable } from './CampaignTable'

const campaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Homepage Hero Banner',
    status: 'active',
    channel: 'Web',
    conversionRate: 4.8,
    visitors: 128_400,
    startDate: '2026-01-12',
  },
  {
    id: 'camp-002',
    name: 'Cart Abandonment Popup',
    status: 'active',
    channel: 'Web',
    conversionRate: 12.3,
    visitors: 43_200,
    startDate: '2026-02-01',
  },
]

describe('CampaignTable', () => {
  it('renders one row per campaign with its status', () => {
    render(
      <CampaignTable
        campaigns={campaigns}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
        onSelectCampaign={vi.fn()}
      />,
    )

    expect(screen.getByText('Homepage Hero Banner')).toBeInTheDocument()
    expect(screen.getByText('Cart Abandonment Popup')).toBeInTheDocument()
    expect(screen.getAllByText('Active')).toHaveLength(2)
  })

  it('calls onSort with the column key when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()

    render(
      <CampaignTable
        campaigns={campaigns}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onSelectCampaign={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Conversion' }))

    expect(onSort).toHaveBeenCalledWith('conversionRate')
  })

  it('calls onSelectCampaign when a row is clicked', async () => {
    const user = userEvent.setup()
    const onSelectCampaign = vi.fn()

    render(
      <CampaignTable
        campaigns={campaigns}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
        onSelectCampaign={onSelectCampaign}
      />,
    )

    await user.click(screen.getByText('Cart Abandonment Popup'))

    expect(onSelectCampaign).toHaveBeenCalledWith(campaigns[1])
  })
})
