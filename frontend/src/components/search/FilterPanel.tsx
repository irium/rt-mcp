import { useFilterStore } from '@/store/filterStore'
import { cn } from '@/utils/cn'

interface FilterPanelProps {
  totalResults: number
  filteredResults: number
}

export function FilterPanel({ totalResults, filteredResults }: FilterPanelProps) {
  const hdVideoOnly = useFilterStore((state) => state.hdVideoOnly)
  const toggleHDFilter = useFilterStore((state) => state.toggleHDFilter)

  const showFilterInfo = totalResults > 0 && hdVideoOnly

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleHDFilter}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium',
            'transition-colors duration-200',
            'border',
            hdVideoOnly
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          <span
            className={cn(
              'w-4 h-4 flex items-center justify-center rounded text-xs',
              hdVideoOnly ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
            )}
          >
            {hdVideoOnly && '✓'}
          </span>
          <span>HD Video Only</span>
        </button>
      </div>

      {showFilterInfo && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredResults === 0 ? (
            <span>No HD Video results ({totalResults} total)</span>
          ) : (
            <span>
              {filteredResults} of {totalResults} results (HD Video only)
            </span>
          )}
        </div>
      )}
    </div>
  )
}
