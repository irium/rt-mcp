/**
 * Format size in MB to human-readable format
 */
export const formatSize = (sizeInMB: number): string => {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(2)} GB`
  }
  return `${sizeInMB.toFixed(2)} MB`
}

/**
 * Format ETA in minutes to human-readable format
 */
export const formatETA = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}