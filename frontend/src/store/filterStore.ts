import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
  hdVideoOnly: boolean
  toggleHDFilter: () => void
  setHDFilter: (value: boolean) => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      hdVideoOnly: false,
      toggleHDFilter: () => set((state) => ({ hdVideoOnly: !state.hdVideoOnly })),
      setHDFilter: (value: boolean) => set({ hdVideoOnly: value }),
    }),
    {
      name: 'filter-storage',
    }
  )
)
