import { Search } from 'lucide-react'

interface EmptyStateProps {
  hasSearched: boolean
}

export function EmptyState({ hasSearched }: EmptyStateProps) {
  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Start Your Search
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Enter a title to search for torrents on RuTracker. You can also filter
          by year and season.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No Results Found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        Try adjusting your search criteria or removing filters to see more
        results.
      </p>
    </div>
  )
}
