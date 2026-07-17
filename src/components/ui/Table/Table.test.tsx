import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Table } from './Table'
import type { Column } from './Table'

interface Row {
  id: string
  name: string
}

const rows: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
]

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', sortable: true, render: (row) => row.name },
]

describe('Table', () => {
  it('marks the active sort column with the correct aria-sort value', () => {
    render(
      <Table
        caption="Rows"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        sortBy="name"
        sortDirection="desc"
        onSort={vi.fn()}
      />,
    )

    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
  })

  it('activates a row via the Enter key', async () => {
    const user = userEvent.setup()
    const onRowActivate = vi.fn()

    render(
      <Table
        caption="Rows"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        onRowActivate={onRowActivate}
      />,
    )

    const row = screen.getByText('Alpha').closest('tr')!
    row.focus()
    await user.keyboard('{Enter}')

    expect(onRowActivate).toHaveBeenCalledWith(rows[0])
  })

  it('shows an empty state when there are no rows', () => {
    render(
      <Table
        caption="Rows"
        columns={columns}
        rows={[]}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
      />,
    )

    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })
})
