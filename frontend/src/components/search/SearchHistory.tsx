import { X } from 'lucide-react'
import { useSearchHistory, type SearchHistoryItem } from '../../hooks/useSearchHistory'
import { Button } from '../ui/Button'

interface SearchHistoryProps {
  onSelect: (item: SearchHistoryItem) => void
}

export function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { items, removeFromHistory, clearHistory } = useSearchHistory()

  if (items.length === 0) {
    return null
  }

  const formatDisplayText = (item: SearchHistoryItem): string => {
    const parts = [item.query]
    if (item.year) {
      parts.push(`(${item.year})`)
    }
    if (item.season) {
      parts.push(`S${item.season}`)
    }
    return parts.join(' ')
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all search history?')) {
      clearHistory()
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recent Searches
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            onClick={() => onSelect(item)}
          >
            <span>{formatDisplayText(item)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFromHistory(item.id)
              }}
              className="ml-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400 transition-opacity"
              aria-label="Remove from history"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
