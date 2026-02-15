import { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import type { SearchResult } from '@/types/rutracker'
import { columns } from './columns'
import { ResultsHeader } from './ResultsHeader'
import { EmptyState } from './EmptyState'

interface ResultsTableProps {
  results: SearchResult[]
  hasSearched: boolean
  onMagnetClick: (id: string) => void
  onDetailsClick: (id: string) => void
  onDownloadClick: (id: string, name: string) => void
}

export function ResultsTable({
  results,
  hasSearched,
  onMagnetClick,
  onDetailsClick,
  onDownloadClick,
}: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Set up event listeners for custom events from column actions
  useEffect(() => {
    const handleMagnetClick = (e: Event) => {
      const customEvent = e as CustomEvent
      onMagnetClick(customEvent.detail.id)
    }

    const handleDetailsClick = (e: Event) => {
      const customEvent = e as CustomEvent
      onDetailsClick(customEvent.detail.id)
    }

    const handleDownloadClick = (e: Event) => {
      const customEvent = e as CustomEvent
      onDownloadClick(customEvent.detail.id, customEvent.detail.name)
    }

    window.addEventListener('magnet-click', handleMagnetClick)
    window.addEventListener('details-click', handleDetailsClick)
    window.addEventListener('download-click', handleDownloadClick)

    return () => {
      window.removeEventListener('magnet-click', handleMagnetClick)
      window.removeEventListener('details-click', handleDetailsClick)
      window.removeEventListener('download-click', handleDownloadClick)
    }
  }, [onMagnetClick, onDetailsClick, onDownloadClick])

  const table = useReactTable({
    data: results,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (results.length === 0) {
    return <EmptyState hasSearched={hasSearched} />
  }

  return (
    <div className="space-y-4">
      <ResultsHeader count={results.length} />

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
