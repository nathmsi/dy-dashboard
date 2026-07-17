import type { KeyboardEvent, ReactNode } from 'react'
import styles from './Table.module.css'

export type SortDirection = 'asc' | 'desc'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  caption: string
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  getRowLabel: (row: T) => string
  sortBy?: string
  sortDirection?: SortDirection
  onSort?: (key: string) => void
  onRowActivate?: (row: T) => void
}

export function Table<T>({
  caption,
  columns,
  rows,
  getRowId,
  getRowLabel,
  sortBy,
  sortDirection,
  onSort,
  onRowActivate,
}: TableProps<T>) {
  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (event.key === 'Enter' && onRowActivate) {
      onRowActivate(row)
    }
  }

  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => {
            const isSorted = column.key === sortBy
            const ariaSort = column.sortable
              ? isSorted
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
              : undefined

            return (
              <th key={column.key} scope="col" aria-sort={ariaSort}>
                {column.sortable ? (
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => onSort?.(column.key)}
                  >
                    {column.header}
                    <span className={styles.sortIcon} aria-hidden="true">
                      {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={getRowId(row)}
            tabIndex={onRowActivate ? 0 : undefined}
            className={onRowActivate ? styles.clickableRow : undefined}
            onClick={() => onRowActivate?.(row)}
            onKeyDown={(event) => handleRowKeyDown(event, row)}
            aria-label={onRowActivate ? `View details for ${getRowLabel(row)}` : undefined}
          >
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className={styles.emptyState}>
              No results found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
