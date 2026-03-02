import type { SearchResult } from '@/types/rutracker'
import { Magnet, Info, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatSize, formatETA } from '@/utils/format'
import { parseQuality, getQualityBadge } from '@/utils/parseQuality'
import { cn } from '@/utils/cn'
import { RoleGuard } from '@/components/auth/RoleGuard'

interface ResultCardProps {
  result: SearchResult
  onMagnetClick: (id: string) => void
  onDetailsClick: (id: string) => void
  onDownloadClick: (id: string, name: string) => void
}

export function ResultCard({
  result,
  onMagnetClick,
  onDetailsClick,
  onDownloadClick,
}: ResultCardProps) {
  const quality = parseQuality(result.name)
  const badge = getQualityBadge(quality)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Title and Quality Badge */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
            {result.name}
          </h3>
          {badge && (
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0',
                badge.color
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {result.forum}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Size
          </div>
          <div className="font-mono font-medium text-gray-900 dark:text-gray-100">
            {formatSize(result.size)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            ETA
          </div>
          <div className="font-mono text-gray-600 dark:text-gray-400">
            {formatETA(result.etaInMinutes)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Seeders
          </div>
          <div
            className={cn(
              'font-mono font-medium',
              result.seeders > 10
                ? 'text-green-600 dark:text-green-400'
                : result.seeders > 5
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
            )}
          >
            {result.seeders}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Leechers
          </div>
          <div className="font-mono text-gray-900 dark:text-gray-100">
            {result.leechers}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 p-2 rounded-lg transition-colors duration-200',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'focus:outline-none'
          )}
          onClick={() => onMagnetClick(result.id)}
          title="Copy Magnet Link"
        >
          <Magnet className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 p-2 rounded-lg transition-colors duration-200',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'focus:outline-none'
          )}
          onClick={() => onDetailsClick(result.id)}
          title="View Details"
        >
          <Info className="h-4 w-4" />
        </Button>
        <RoleGuard requireAdmin>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex-1 p-2 rounded-lg transition-colors duration-200',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'focus:outline-none'
            )}
            onClick={() => onDownloadClick(result.id, result.name)}
            title="Download Torrent"
          >
            <Download className="h-4 w-4" />
          </Button>
        </RoleGuard>
      </div>
    </div>
  )
}
