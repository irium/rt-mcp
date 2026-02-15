import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to RuTracker Search
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The search interface will be implemented in the next phase.
          </p>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Phase 1 Complete ✓
            </h3>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
              <li>Layout component with responsive design</li>
              <li>Header with logo and status indicator</li>
              <li>Theme toggle (light/dark mode)</li>
              <li>Theme persistence with localStorage</li>
              <li>System preference detection</li>
              <li>Tailwind CSS styling</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
