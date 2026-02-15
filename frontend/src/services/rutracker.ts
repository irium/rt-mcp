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
   * Download torrent file
   */
  downloadTorrent: async (torrentId: string): Promise<DownloadResponse> => {
    return api.post<DownloadResponse>(`/download/${torrentId}`)
  },

  /**
   * Get RuTracker login status
   */
  getStatus: async (): Promise<StatusResponse> => {
    return api.get<StatusResponse>('/status')
  },
}
