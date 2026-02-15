interface ResultsHeaderProps {
  count: number
}

export function ResultsHeader({ count }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Search Results
        {count > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({count} {count === 1 ? 'result' : 'results'})
          </span>
        )}
      </h2>
    </div>
  )
}
