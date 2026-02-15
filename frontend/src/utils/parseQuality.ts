/**
 * Video quality types
 */
export type VideoQuality = 
  | '4K' 
  | '2160p' 
  | '1080p' 
  | '720p' 
  | '480p' 
  | 'SD'
  | null

/**
 * Quality badge configuration
 */
export interface QualityBadge {
  text: string
  color: string
}

/**
 * Parse video quality from torrent name
 * Looks for common quality indicators like 4K, 2160p, 1080p, 720p, 480p
 */
export function parseQuality(name: string): VideoQuality {
  const upperName = name.toUpperCase()
  
  // Check for 4K or UHD
  if (upperName.includes('4K') || upperName.includes('UHD')) {
    return '4K'
  }
  
  // Check for specific resolutions
  if (upperName.includes('2160P')) {
    return '2160p'
  }
  
  if (upperName.includes('1080P')) {
    return '1080p'
  }
  
  if (upperName.includes('720P')) {
    return '720p'
  }
  
  if (upperName.includes('480P')) {
    return '480p'
  }
  
  // Check for SD indicators
  if (upperName.includes('DVDRIP') || upperName.includes('DVD-RIP') || 
      upperName.includes('TVRIP') || upperName.includes('TV-RIP')) {
    return 'SD'
  }
  
  return null
}

/**
 * Get badge configuration for a quality level
 */
export function getQualityBadge(quality: VideoQuality): QualityBadge | null {
  if (!quality) return null
  
  const badges: Record<NonNullable<VideoQuality>, QualityBadge> = {
    '4K': {
      text: '4K',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    '2160p': {
      text: '2160p',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    '1080p': {
      text: '1080p',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    '720p': {
      text: '720p',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    '480p': {
      text: '480p',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    'SD': {
      text: 'SD',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  return badges[quality]
}
