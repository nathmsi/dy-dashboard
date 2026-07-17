import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
}

export default meta
type Story = StoryObj<typeof Badge>

export const Active: Story = { args: { status: 'active' } }
export const Paused: Story = { args: { status: 'paused' } }
export const Ended: Story = { args: { status: 'ended' } }
