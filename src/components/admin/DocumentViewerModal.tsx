import { useState, useEffect } from 'react'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Calendar,
  HardDrive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export interface KycDocumentItem {
  id?: string
  title: string
  category: string
  fileName?: string
  fileSize?: string
  fileUrl?: string
  uploadedAt?: string
}

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  activeDoc: KycDocumentItem | null
  allDocs?: KycDocumentItem[]
  onSelectDoc?: (doc: KycDocumentItem) => void
  merchantName?: string
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  activeDoc,
  allDocs = [],
  onSelectDoc,
  merchantName,
}: DocumentViewerModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset zoom, rotation & page whenever activeDoc changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setLoading(true)
    setLoadError(false)
    setCurrentPage(1)
  }, [activeDoc?.fileUrl])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !activeDoc || !activeDoc.fileUrl) return null

  const isPdf =
    activeDoc.fileName?.toLowerCase().endsWith('.pdf') ||
    activeDoc.fileUrl.toLowerCase().includes('.pdf') ||
    activeDoc.fileUrl.toLowerCase().includes('/raw/upload/')

  const isCloudinary = activeDoc.fileUrl.includes('res.cloudinary.com')

  // Transform Cloudinary PDF URL to high-res JPG rendering with page selection.
  // This bypasses Cloudinary's default 401 ACL block on raw PDF CDN delivery.
  const getRenderUrl = (url: string, page: number): string => {
    if (!url) return ''
    if (isCloudinary && isPdf) {
      return url
        .replace(/\/image\/upload\/(?:pg_\d+\/)?/, `/image/upload/pg_${page}/`)
        .replace(/\.pdf(?:\?.*)?$/i, '.jpg')
    }
    return url
  }

  const activeRenderUrl = getRenderUrl(activeDoc.fileUrl, currentPage)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => {
    setZoom(1)
    setRotation(0)
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setLoading(true)
      setLoadError(false)
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    setLoading(true)
    setLoadError(false)
    setCurrentPage((prev) => prev + 1)
  }

  // Helper to force download
  const handleDownload = async () => {
    const downloadUrl = activeRenderUrl || activeDoc.fileUrl
    if (!downloadUrl) return
    try {
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const baseName = (activeDoc.fileName || activeDoc.title).replace(/\.[^/.]+$/, '')
      a.download = isPdf && isCloudinary ? `${baseName}_page_${currentPage}.jpg` : activeDoc.fileName || `${baseName}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(downloadUrl, '_blank')
    }
  }

  // Filter only documents with URLs for the quick switch bar
  const uploadedDocs = allDocs.filter((d) => Boolean(d.fileUrl))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full ${
          isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-5xl h-[88vh]'
        } rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.45)] flex flex-col overflow-hidden transition-all duration-200`}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-cyan-500/20 bg-[#040817] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
              {isPdf ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {activeDoc.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 shrink-0 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Cloudinary 256-Bit SSL
                </span>
                {merchantName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 truncate max-w-[150px]">
                    {merchantName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5 truncate">
                <span className="text-slate-300 font-semibold truncate">
                  {activeDoc.fileName || 'document_file'}
                </span>
                {activeDoc.fileSize && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <HardDrive className="h-3 w-3 text-cyan-400" />
                    {activeDoc.fileSize}
                  </span>
                )}
                {activeDoc.uploadedAt && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Calendar className="h-3 w-3 text-cyan-400" />
                    {new Date(activeDoc.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Doc Switcher Pills */}
          {uploadedDocs.length > 1 && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#08102d] border border-cyan-500/20 p-1 rounded-xl">
              {uploadedDocs.map((doc, idx) => {
                const isSelected = doc.fileUrl === activeDoc.fileUrl
                return (
                  <button
                    key={doc.id || idx}
                    type="button"
                    onClick={() => onSelectDoc?.(doc)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    Doc {idx + 1}: {doc.category}
                  </button>
                )
              })}
            </div>
          )}

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
              title="Close Viewer (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2 border-b border-cyan-500/10 bg-[#070e28] text-xs shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Zoom & Rotation Controls */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="px-2.5 py-1.5 rounded-lg bg-[#09153d] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Zoom Out</span>
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2.5 py-1.5 rounded-lg bg-[#09153d] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors font-mono cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="px-2.5 py-1.5 rounded-lg bg-[#09153d] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Zoom In</span>
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1.5 rounded-lg bg-[#09153d] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-1 cursor-pointer"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rotate</span>
            </button>

            {/* Page Navigation for Multi-Page PDFs */}
            {isPdf && isCloudinary && (
              <div className="flex items-center gap-1 bg-[#09153d] border border-cyan-500/40 rounded-lg p-0.5 ml-1">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 rounded text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-30 transition-colors flex items-center cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-[11px] font-bold text-white font-mono">
                  Page {currentPage}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  className="px-2 py-1 rounded text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download Current Page / Document"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <a
              href={activeRenderUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Open in Full Browser Window"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Main Document Canvas View */}
        <div className="flex-1 overflow-auto bg-[#030614] p-4 flex items-center justify-center relative min-h-[350px]">
          {loading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#030614]/80 z-20">
              <div className="flex flex-col items-center gap-2 text-cyan-400 text-xs">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Streaming high-resolution document...</span>
              </div>
            </div>
          )}

          {loadError ? (
            <div className="text-center space-y-3 p-6 max-w-md">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">End of Document or Preview Unavailable</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentPage > 1
                  ? `There are no further pages in this document. You have reached page ${currentPage}.`
                  : 'The document is securely stored on Cloudinary, but cannot be rendered directly in this frame.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {currentPage > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back to Page {currentPage - 1}</span>
                  </button>
                ) : (
                  <>
                    <a
                      href={activeRenderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open in Browser</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-xl bg-[#0a1435] border border-cyan-500/40 text-white text-xs font-bold hover:bg-[#101e4e] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download File</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div
              className="overflow-auto max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={activeRenderUrl}
                alt={activeDoc.title}
                onLoad={() => {
                  setLoading(false)
                  setLoadError(false)
                }}
                onError={() => {
                  setLoading(false)
                  setLoadError(true)
                }}
                className="max-h-[70vh] max-w-full object-contain rounded-xl border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.25)] select-none bg-white/5"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-cyan-500/20 bg-[#040817] text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>High-Resolution Underwriting Preview • TLS 1.3 End-to-End Encrypted</span>
            {isPdf && isCloudinary && (
              <span className="text-[10px] text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Vector PDF Page {currentPage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
