import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SearchHistoryItem {
  id: string
  query: string
  year?: number
  season?: number
  timestamp: number
}

interface SearchHistoryState {
  items: SearchHistoryItem[]
  addToHistory: (query: string, year?: number, season?: number) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  getHistory: () => SearchHistoryItem[]
}

const MAX_HISTORY_ITEMS = 10

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      items: [],

      addToHistory: (query: string, year?: number, season?: number) => {
        const history = get().items

        // Create new history item
        const item: SearchHistoryItem = {
          id: Date.now().toString(),
          query,
          year,
          season,
          timestamp: Date.now(),
        }

        // Remove duplicates (same query+year+season)
        const filtered = history.filter(
          (h) =>
            !(
              h.query === item.query &&
              h.year === item.year &&
              h.season === item.season
            )
        )

        // Add new item at the beginning
        const updated = [item, ...filtered]

        // Keep only MAX_HISTORY_ITEMS
        const trimmed = updated.slice(0, MAX_HISTORY_ITEMS)

        set({ items: trimmed })
      },

      removeFromHistory: (id: string) => {
        const history = get().items
        const filtered = history.filter((item) => item.id !== id)
        set({ items: filtered })
      },

      clearHistory: () => {
        set({ items: [] })
      },

      getHistory: () => {
        return get().items
      },
    }),
    {
      name: 'searchHistory',
    }
  )
)
