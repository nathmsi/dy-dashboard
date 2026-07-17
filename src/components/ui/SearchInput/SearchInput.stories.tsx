import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchInput } from './SearchInput'

const meta: Meta<typeof SearchInput> = {
  title: 'UI/SearchInput',
  component: SearchInput,
  args: {
    id: 'search',
    label: 'Search campaigns',
    placeholder: 'Search by name…',
  },
}

export default meta
type Story = StoryObj<typeof SearchInput>

export const Empty: Story = {}

export const WithValue: Story = {
  args: { defaultValue: 'Cart Abandonment' },
}
