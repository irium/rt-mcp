import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { rutrackerService } from '../../services/rutracker'
import { useSearchHistory } from '../../hooks/useSearchHistory'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { SearchHistory } from './SearchHistory'
import type { SearchParams, SearchResult } from '../../types/rutracker'
import type { SearchHistoryItem } from '../../hooks/useSearchHistory'

interface SearchFormProps {
  onSearchSuccess?: (results: SearchResult[]) => void
}

export function SearchForm({ onSearchSuccess }: SearchFormProps) {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [season, setSeason] = useState('')

  const { addToHistory } = useSearchHistory()

  const searchMutation = useMutation({
    mutationFn: (params: SearchParams) => rutrackerService.search(params),
    onSuccess: (data) => {
      toast.success(`Found ${data.length} results`)
      onSearchSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    const searchParams = {
      title: title.trim(),
      year: year.trim() || undefined,
      season: season.trim() || undefined,
    }

    // Add to search history
    addToHistory(
      searchParams.title,
      searchParams.year ? parseInt(searchParams.year, 10) : undefined,
      searchParams.season ? parseInt(searchParams.season, 10) : undefined
    )

    searchMutation.mutate(searchParams)
  }

  const handleHistorySelect = (item: SearchHistoryItem) => {
    setTitle(item.query)
    setYear(item.year?.toString() || '')
    setSeason(item.season?.toString() || '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title *"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Титаник, Titanic"
        labelAlign="left"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Year (optional)"
          name="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g., 2023"
          labelAlign="left"
        />

        <Input
          label="Season (optional)"
          name="season"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          placeholder="e.g., 1, 2"
          labelAlign="left"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={searchMutation.isPending}
      >
        Search
      </Button>

      <SearchHistory onSelect={handleHistorySelect} />
    </form>
  )
}
