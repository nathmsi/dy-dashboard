import type { Meta, StoryObj } from '@storybook/react-vite'
import { mockCampaigns } from '../../lib/mockCampaigns'
import { CampaignTable } from './CampaignTable'

const meta: Meta<typeof CampaignTable> = {
  title: 'Features/CampaignTable',
  component: CampaignTable,
  args: {
    campaigns: mockCampaigns,
    sortBy: 'name',
    sortDirection: 'asc',
    onSort: () => {},
    onSelectCampaign: () => {},
  },
}

export default meta
type Story = StoryObj<typeof CampaignTable>

export const Default: Story = {}

export const Empty: Story = {
  args: { campaigns: [] },
}
