import { api } from './api'
import type {
  SearchParams,
  SearchResult,
  TorrentDetails,
  DownloadResponse,
  StatusResponse,
  MagnetLinkResponse,
} from '../types/rutracker'

/**
 * RuTracker API service
 */
export const rutrackerService = {
  /**
   * Search for torrents
   */
  search: async (params: SearchParams): Promise<SearchResult[]> => {
    return api.post<SearchResult[]>('/search', params)
  },

  /**
   * Get torrent details
   */
  getDetails: async (torrentId: string): Promise<TorrentDetails> => {
    return api.get<TorrentDetails>(`/details/${torrentId}`)
  },

  /**
   * Get magnet link for a torrent
   */
  getMagnetLink: async (torrentId: string): Promise<MagnetLinkResponse> => {
    return api.get<MagnetLinkResponse>(`/magnet/${torrentId}`)
  },

  /**
   * Download torrent file to server (requires admin)
   */
  downloadTorrent: async (torrentId: string): Promise<DownloadResponse> => {
    return api.post<DownloadResponse>(`/download/${torrentId}`)
  },

  /**
   * Download torrent file directly to browser (for all authenticated users)
   */
  downloadTorrentFile: async (torrentId: string): Promise<void> => {
    const blob = await api.getBlob(`/download-content/${torrentId}`)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${torrentId}.torrent`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  /**
   * Get RuTracker login status
   */
  getStatus: async (): Promise<StatusResponse> => {
    return api.get<StatusResponse>('/status')
  },
}
