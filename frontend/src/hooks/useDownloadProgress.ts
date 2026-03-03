import { useState } from 'react'

interface DownloadProgress {
  id: string
  name: string
  isDownloading: boolean
}

export const useDownloadProgress = () => {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const startDownload = (id: string, name: string) => {
    setDownloadProgress({
      id,
      name,
      isDownloading: true
    })
    setIsModalOpen(true)
  }

  const endDownload = () => {
    setDownloadProgress(null)
    setIsModalOpen(false)
  }

  const isDownloading = downloadProgress?.isDownloading || false

  return {
    downloadProgress,
    isModalOpen,
    isDownloading,
    startDownload,
    endDownload,
    DownloadProgressModalProps: {
      isOpen: isModalOpen,
      onClose: endDownload,
      title: downloadProgress?.name || 'Downloading',
    }
  }
}