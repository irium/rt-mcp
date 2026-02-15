import { useEffect, useState, useMemo } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Layout } from './components/layout/Layout'
import { SearchForm } from './components/search/SearchForm'
import { FilterPanel } from './components/search/FilterPanel'
import { ResultsTable } from './components/results/ResultsTable'
import { DetailsModal } from './components/modals/DetailsModal'
import { useThemeStore } from './store/themeStore'
import { useFilterStore } from './store/filterStore'
import { rutrackerService } from './services/rutracker'
import type { SearchResult } from './types/rutracker'
import './App.css'

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme)
  const hdVideoOnly = useFilterStore((state) => state.hdVideoOnly)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedTorrent, setSelectedTorrent] = useState<SearchResult | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  const handleSearchSuccess = (searchResults: SearchResult[]) => {
    setResults(searchResults)
    setHasSearched(true)
  }

  // Filter results based on HD Video setting
  const filteredResults = useMemo(() => {
    if (!hdVideoOnly) return results
    return results.filter(
      (r) => r.forum.includes('HD Video') || r.forum.includes('HD Видео')
    )
  }, [results, hdVideoOnly])

  const handleMagnetClick = async (id: string) => {
    try {
      const { magnetLink } = await rutrackerService.getMagnetLink(id)
      await navigator.clipboard.writeText(magnetLink)
      toast.success('Magnet link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy magnet link')
    }
  }

  const handleDetailsClick = async (id: string) => {
    const torrent = results.find((r) => r.id === id)
    if (torrent) {
      setSelectedTorrent(torrent)
      setIsDetailsModalOpen(true)
    }
  }

  const handleDownloadClick = async (id: string, name: string) => {
    try {
      const response = await rutrackerService.downloadTorrent(id)
      toast.success(`Downloading: ${name}`)
      console.log('Download response:', response)
    } catch (error) {
      toast.error('Failed to download torrent')
    }
  }

  return (
    <Layout isConnected={true}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Search RuTracker
          </h2>
          
          <SearchForm onSearchSuccess={handleSearchSuccess} />

          <div className="mt-8">
            <FilterPanel
              totalResults={results.length}
              filteredResults={filteredResults.length}
            />
          </div>

          <div className="mt-4">
            <ResultsTable
              results={filteredResults}
              hasSearched={hasSearched}
              onMagnetClick={handleMagnetClick}
              onDetailsClick={handleDetailsClick}
              onDownloadClick={handleDownloadClick}
            />
          </div>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Phase 5 Complete ✓
            </h3>
            <ul className="list-disc list-inside text-green-800 dark:text-green-200 space-y-1">
              <li>FilterPanel component with HD Video toggle</li>
              <li>Filter store with Zustand (persisted to localStorage)</li>
              <li>Filter applied to results based on forum category</li>
              <li>Shows filtered/total count when HD filter is active</li>
            </ul>
          </div>
        </div>
      </div>

      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        torrent={selectedTorrent}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Layout>
  )
}

export default App
