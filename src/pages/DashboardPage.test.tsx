import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCampaignStore } from '../stores/useCampaignStore'
import DashboardPage from './DashboardPage'

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    useCampaignStore.setState({ search: '', sortBy: 'name', sortDirection: 'asc' })
  })

  it('lists campaigns once loaded', async () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Loading campaigns…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Homepage Hero Banner')).toBeInTheDocument()
    })
  })

  it('filters the list when searching', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Homepage Hero Banner')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Search campaigns'), 'Loyalty')

    expect(screen.getByText('Loyalty Points Reminder')).toBeInTheDocument()
    expect(screen.queryByText('Homepage Hero Banner')).not.toBeInTheDocument()
  })
})
