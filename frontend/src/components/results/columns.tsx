import type { ColumnDef } from '@tanstack/react-table'
import type { SearchResult } from '@/types/rutracker'
import { ArrowUpDown, Magnet, Info, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Format size in MB to human-readable format
 */
const formatSize = (sizeInMB: number): string => {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(2)} GB`
  }
  return `${sizeInMB.toFixed(2)} MB`
}

/**
 * Format ETA in minutes to human-readable format
 */
const formatETA = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Column definitions for the results table
 */
export const columns: ColumnDef<SearchResult>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-2 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className="max-w-md">
          <div className="font-medium text-sm truncate" title={name}>
            {name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.forum}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-2 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Size
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const size = row.getValue('size') as number
      return <div className="font-mono text-sm">{formatSize(size)}</div>
    },
  },
  {
    accessorKey: 'etaInMinutes',
    header: 'ETA',
    cell: ({ row }) => {
      const eta = row.getValue('etaInMinutes') as number
      return (
        <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {formatETA(eta)}
        </div>
      )
    },
  },
  {
    accessorKey: 'seeders',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-2 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Seeders
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const seeders = row.getValue('seeders') as number
      return (
        <div
          className={`font-mono text-sm font-medium ${
            seeders > 10
              ? 'text-green-600 dark:text-green-400'
              : seeders > 5
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
          }`}
        >
          {seeders}
        </div>
      )
    },
  },
  {
    accessorKey: 'leechers',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-2 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Leechers
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const leechers = row.getValue('leechers') as number
      return <div className="font-mono text-sm">{leechers}</div>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const result = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('magnet-click', {
                detail: { id: result.id },
              })
              window.dispatchEvent(event)
            }}
            title="Copy Magnet Link"
          >
            <Magnet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('details-click', {
                detail: { id: result.id },
              })
              window.dispatchEvent(event)
            }}
            title="View Details"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('download-click', {
                detail: { id: result.id, name: result.name },
              })
              window.dispatchEvent(event)
            }}
            title="Download Torrent"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
