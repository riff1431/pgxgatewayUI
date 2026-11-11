import { useState, useRef, useCallback } from 'react'
import {
  UploadCloud,
  Check,
  User,
  Loader2,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AVATAR_PRESETS, type AvatarPreset } from '@/lib/avatarPresets'

interface AvatarUploaderProps {
  className?: string
  onAvatarChanged?: (url: string) => void
}

export default function AvatarUploader({ className = '', onAvatarChanged }: AvatarUploaderProps) {
  const { merchant, uploadAvatar, setAvatarUrl, addToast } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentAvatar = merchant?.avatarUrl || ''

  // Determine if current avatar matches one of the presets
  const matchedPreset = AVATAR_PRESETS.find(
    (p) => p.url === currentAvatar || (currentAvatar && currentAvatar.includes(p.id))
  )

  const handleProcessFile = useCallback(
    async (file: File) => {
      setPreviewError(null)

      // Validate MIME type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
        setPreviewError('Please drop or select a valid image file (JPG, PNG, WEBP, GIF, or SVG).')
        addToast('Invalid Format', 'Only image files are allowed.', 'error')
        return
      }

      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setPreviewError('File size exceeds the 10MB limit.')
        addToast('File Too Large', 'Maximum avatar size is 10MB.', 'error')
        return
      }

      setUploading(true)
      try {
        const newUrl = await uploadAvatar(file)
        if (onAvatarChanged) onAvatarChanged(newUrl)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setPreviewError(msg)
      } finally {
        setUploading(false)
      }
    },
    [uploadAvatar, addToast, onAvatarChanged]
  )

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      void handleProcessFile(file)
      e.dataTransfer.clearData()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      void handleProcessFile(file)
      // reset value so re-uploading same filename fires change
      e.target.value = ''
    }
  }

  const handleSelectPreset = async (preset: AvatarPreset) => {
    setUploading(true)
    setPreviewError(null)
    try {
      await setAvatarUrl(preset.url)
      if (onAvatarChanged) onAvatarChanged(preset.url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to set preset avatar'
      setPreviewError(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setUploading(true)
    setPreviewError(null)
    try {
      await setAvatarUrl('')
      if (onAvatarChanged) onAvatarChanged('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove avatar'
      setPreviewError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Current Avatar Summary */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-[#070e28]/80 border border-cyan-500/30 backdrop-blur-md">
        {/* Large Glowing Avatar Display */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#050a1d] flex items-center justify-center relative">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={merchant?.fullName || 'User Avatar'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-cyan-950/40 flex items-center justify-center text-cyan-300">
                  <User className="h-12 w-12" />
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-300 gap-1.5">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-[10px] font-bold">Syncing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Active online indicator */}
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#060b20] shadow-[0_0_8px_rgba(16,185,129,0.9)] flex items-center justify-center text-slate-950" title="Active Account">
            <Zap className="h-2.5 w-2.5 fill-current" />
          </span>
        </div>

        {/* User Info & Quick Controls */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                Merchant Identity
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                {merchant?.fullName || 'PGX Merchant'}
              </h4>
            </div>

            {currentAvatar && (
              <button
                type="button"
                disabled={uploading}
                onClick={handleRemoveAvatar}
                className="self-center sm:self-auto px-3 py-1 rounded-full text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove Avatar</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md">
            Personalize your underwriter presence. Upload your custom photo via drag-and-drop or select one of our futuristic cyber presets.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/40">
              <ShieldCheck className="h-3 w-3" />
              {matchedPreset ? `Preset: ${matchedPreset.name}` : currentAvatar ? 'Custom CDN Upload' : 'Default Monogram'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Synced across Top Navbar & Messages</span>
          </div>
        </div>
      </div>

      {previewError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          <span>{previewError}</span>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <UploadCloud className="h-4 w-4 text-cyan-400" />
          <span>Drag & Drop Avatar Image Upload</span>
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 backdrop-blur-md ${
            isDragging
              ? 'border-cyan-300 bg-cyan-500/20 shadow-[0_0_30px_rgba(0,240,255,0.6)] scale-[1.01]'
              : 'border-cyan-500/40 hover:border-cyan-400/80 bg-[#060c24]/90 hover:bg-[#071033] shadow-[inset_0_0_15px_rgba(0,240,255,0.06)]'
          }`}
        >
          {/* Hidden HTML input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.9)] scale-110'
                : 'bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 group-hover:scale-105 group-hover:border-cyan-400'
            }`}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            ) : isDragging ? (
              <ImageIcon className="h-6 w-6" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-bold text-white">
              {isDragging ? (
                <span className="text-cyan-300">Drop image here to instantly set avatar</span>
              ) : uploading ? (
                <span className="text-cyan-300 animate-pulse">Streaming image to Cloudinary CDN...</span>
              ) : (
                <>
                  <span className="text-cyan-300 underline underline-offset-4 decoration-cyan-400/60">
                    Click to browse
                  </span>{' '}
                  or drag & drop your avatar image
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Supports PNG, JPG, WEBP, GIF, or SVG • Maximum file size 10MB
            </div>
          </div>
        </div>
      </div>

      {/* PRE-MADE CYBER AVATARS GALLERY */}
      <div className="space-y-3 pt-2 border-t border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <ImageIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-white">
                Pre-Made PGX Cyber Avatars
              </h5>
              <p className="text-[11px] text-slate-400">
                Instant 1-click selection from our curated fintech persona collection.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider hidden sm:inline-block">
            {AVATAR_PRESETS.length} Presets Available
          </span>
        </div>

        {/* Responsive Grid of Pre-Made Avatars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected =
              currentAvatar === preset.url || (currentAvatar && currentAvatar.includes(preset.id))

            return (
              <button
                key={preset.id}
                type="button"
                disabled={uploading}
                onClick={() => handleSelectPreset(preset)}
                className={`group relative p-3 rounded-2xl transition-all duration-300 flex flex-col items-center text-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#0b1c44] to-[#060c24] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.45)] scale-[1.02]'
                    : 'bg-[#060c24]/80 hover:bg-[#09153a] border-cyan-500/25 hover:border-cyan-400/60 shadow-[inset_0_0_10px_rgba(0,240,255,0.03)]'
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,1)]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}

                {/* Avatar SVG Preview Circle */}
                <div
                  className={`w-14 h-14 rounded-full p-0.5 transition-transform duration-300 group-hover:scale-110 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                      : 'bg-slate-700/60 group-hover:bg-cyan-500/40'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#040714] flex items-center justify-center">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Preset Info */}
                <div className="w-full min-w-0">
                  <div className="font-bold text-white text-xs truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {preset.role}
                  </div>
                </div>

                {/* Selection state pill */}
                <div className="pt-0.5 w-full">
                  <span
                    className={`block w-full py-0.5 text-[9px] font-bold rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
                        : 'bg-slate-800/40 text-slate-400 border-transparent group-hover:text-cyan-300 group-hover:border-cyan-500/30'
                    }`}
                  >
                    {isSelected ? 'Active Avatar' : 'Select'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
