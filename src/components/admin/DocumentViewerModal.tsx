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

  // Reset zoom & rotation whenever activeDoc changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setLoading(true)
    setLoadError(false)
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

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => {
    setZoom(1)
    setRotation(0)
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  // Helper to force download if Cloudinary or cross-origin
  const handleDownload = async () => {
    if (!activeDoc.fileUrl) return
    try {
      const response = await fetch(activeDoc.fileUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = activeDoc.fileName || `${activeDoc.title.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback direct link
      window.open(activeDoc.fileUrl, '_blank')
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
          <div className="flex items-center gap-1.5">
            {!isPdf && (
              <>
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
              </>
            )}
            {isPdf && (
              <span className="text-[11px] text-cyan-400 font-semibold px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/30">
                PDF Document Reader Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <a
              href={activeDoc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Open Raw File in New Window"
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
                <span>Streaming document from Cloudinary vault...</span>
              </div>
            </div>
          )}

          {loadError ? (
            <div className="text-center space-y-3 p-6 max-w-md">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Preview Rendering Unavailable</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The document is securely stored on Cloudinary, but cannot be rendered directly in this preview frame. You can open it in a separate tab or download it directly.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <a
                  href={activeDoc.fileUrl}
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
              </div>
            </div>
          ) : isPdf ? (
            <iframe
              src={`${activeDoc.fileUrl}#toolbar=1`}
              title={activeDoc.title}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false)
                setLoadError(true)
              }}
              className="w-full h-full min-h-[500px] rounded-2xl border border-cyan-500/30 bg-white"
            />
          ) : (
            <div
              className="overflow-auto max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={activeDoc.fileUrl}
                alt={activeDoc.title}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false)
                  setLoadError(true)
                }}
                className="max-h-[70vh] max-w-full object-contain rounded-xl border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.25)] select-none"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-cyan-500/20 bg-[#040817] text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>High-Resolution Underwriting Preview • TLS 1.3 End-to-End Encrypted</span>
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
