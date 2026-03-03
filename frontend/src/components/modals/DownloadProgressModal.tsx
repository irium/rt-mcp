import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'

interface DownloadProgressModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  isOpen,
  onClose,
  title,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Please wait while dowloading..."
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        </div>
      </div>
    </Modal>
  )
}