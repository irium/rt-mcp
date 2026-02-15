import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout/Layout'
import { SearchForm } from './components/search/SearchForm'
import { useThemeStore } from './store/themeStore'
import './App.css'

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme)

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <Layout isConnected={true}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Search RuTracker
          </h2>
          
          <SearchForm />

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Phase 2 Complete ✓
            </h3>
            <ul className="list-disc list-inside text-green-800 dark:text-green-200 space-y-1">
              <li>Search form with title, year, and season inputs</li>
              <li>React Query integration for API calls</li>
              <li>Reusable Button and Input components</li>
              <li>Toast notifications for feedback</li>
              <li>Form validation and loading states</li>
              <li>Dark mode support</li>
            </ul>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
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
