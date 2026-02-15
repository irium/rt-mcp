import { useQuery } from '@tanstack/react-query'
import { Loader2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { rutrackerService } from '../../services/rutracker'
import { parseDetails } from '../../utils/parseDetails'
import { formatSize, formatETA } from '../../utils/format'
import type { SearchResult } from '../../types/rutracker'
import { copyToClipboard } from '@/utils/copyToClipboard'

interface DetailsModalProps {
  isOpen: boolean
  onClose: () => void
  torrent: SearchResult | null
}

export function DetailsModal({ isOpen, onClose, torrent }: DetailsModalProps) {
  const [copied, setCopied] = useState(false)

  // Fetch torrent details
  const { data: details, isLoading } = useQuery({
    queryKey: ['torrent-details', torrent?.id],
    queryFn: () => rutrackerService.getDetails(torrent!.id),
    enabled: isOpen && !!torrent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleCopyMagnet = async () => {
    if (details?.magnetLink) {
      try {
        await copyToClipboard(details.magnetLink)
        toast.success('Magnet link copied to clipboard!')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy magnet link')
      }
    }
  }

  if (!torrent) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Torrent Details"
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Title
              </h3>
              <p className="text-base text-gray-900 dark:text-white">
                {details?.title || torrent.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Size
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {formatSize(torrent.size)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Forum
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {torrent.forum}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Seeders
                </h3>
                <p className="text-base text-green-600 dark:text-green-400 font-medium">
                  {torrent.seeders}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Leechers
                </h3>
                <p className="text-base text-orange-600 dark:text-orange-400 font-medium">
                  {torrent.leechers}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Published
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(torrent.pubDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  ETA
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {formatETA(torrent.etaInMinutes)}
                </p>
              </div>
            </div>
          </div>

          {/* Magnet Link */}
          {details?.magnetLink && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Magnet Link
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={details.magnetLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono"
                />
                <Button
                  onClick={handleCopyMagnet}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Content/Description */}
          {details?.content && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Description
              </h3>
              <div
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto text-gray-900 dark:text-gray-100 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseDetails(details.content) }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                window.open(`https://rutracker.org/forum/viewtopic.php?t=${torrent.id}`, '_blank')
              }}
            >
              Open on RuTracker
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
