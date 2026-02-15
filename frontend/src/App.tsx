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
import { copyToClipboard } from './utils/copyToClipboard'
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
      await copyToClipboard(magnetLink)
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
