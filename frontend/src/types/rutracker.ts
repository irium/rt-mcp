/**
 * Search parameters for RuTracker API
 */
export interface SearchParams {
  title: string
  year?: string
  season?: string
}

/**
 * Search result from RuTracker API
 */
export interface SearchResult {
  id: string
  name: string
  size: number // Size in megabytes
  etaInMinutes: number // Estimated time to download in minutes
  seeders: number
  leechers: number
  pubDate: string // ISO date string
  forum: string
  downloadLink: string
}

/**
 * Torrent details from RuTracker API
 */
export interface TorrentDetails {
  id: string
  title?: string
  magnetLink?: string
  downloadLink: string
  content: string
}

/**
 * Download response from RuTracker API
 */
export interface DownloadResponse {
  success: boolean
  filePath: string
  message: string
}

/**
 * Status response from RuTracker API
 */
export interface StatusResponse {
  isLoggedIn: boolean
}

/**
 * Magnet link response from RuTracker API
 */
export interface MagnetLinkResponse {
  magnetLink: string
}
