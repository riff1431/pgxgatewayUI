import { useState, useEffect } from 'react'
import {
  Palette,
  Globe,
  Building2,
  ShieldCheck,
  UploadCloud,
  Loader2,
  Check,
  Mail,
  Phone,
  Image as ImageIcon,
} from 'lucide-react'
import { adminApi, type SystemConfigData } from '@/lib/adminApi'
import { useBranding } from '@/context/BrandingContext'

interface BrandingTabProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'error') => void
}

export default function BrandingTab({ onShowToast }: BrandingTabProps) {
  const { updateLocalBranding } = useBranding()
  const [brandingForm, setBrandingForm] = useState<SystemConfigData>({
    siteName: 'PGX Gateway',
    logoUrl: '',
    faviconUrl: '/favicon.svg',
    supportEmail: 'support@pgxgateway.com',
    supportPhone: '+1 (437) 577-8785',
    supportTelegram: '@pgxsupport',
    supportWhatsapp: '+1 (437) 577-8785',
  })
  const [brandingSaving, setBrandingSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [faviconUploading, setFaviconUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true)
      try {
        const res = await adminApi.getSystemConfig()
        if (res.data) {
          setBrandingForm(res.data)
        }
      } catch {
        // Fallback to defaults
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault()
    setBrandingSaving(true)
    try {
      const res = await adminApi.updateSystemConfig(brandingForm)
      if (res.data) {
        setBrandingForm(res.data)
        updateLocalBranding(res.data)
        onShowToast('Branding Published', 'Platform branding parameters updated in real-time across the entire system.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save branding settings'
      onShowToast('Error', msg, 'error')
    } finally {
      setBrandingSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('File Too Large', 'Please upload a logo image smaller than 10MB.', 'error')
      return
    }

    setLogoUploading(true)
    try {
      const res = await adminApi.uploadBrandingAsset(file, 'pgxgateway/branding/logos')
      if (res.data?.url) {
        setBrandingForm((prev) => ({ ...prev, logoUrl: res.data!.url }))
        onShowToast('Logo Uploaded', 'Stored securely on Cloudinary. Click "Save Settings" to publish.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed'
      onShowToast('Upload Error', msg, 'error')
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('File Too Large', 'Please upload a favicon smaller than 5MB.', 'error')
      return
    }

    setFaviconUploading(true)
    try {
      const res = await adminApi.uploadBrandingAsset(file, 'pgxgateway/branding/favicons')
      if (res.data?.url) {
        setBrandingForm((prev) => ({ ...prev, faviconUrl: res.data!.url }))
        onShowToast('Favicon Uploaded', 'Stored on Cloudinary. Click "Save Settings" to publish.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Favicon upload failed'
      onShowToast('Upload Error', msg, 'error')
    } finally {
      setFaviconUploading(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400 mb-2" />
        <span>Loading system branding configuration...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-amber-500/20">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/80 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">White-Label & System Branding Settings</h2>
            <p className="text-xs text-slate-400">
              Customize root platform name, global SVG/PNG logo, browser favicon, and official compliance contacts in real-time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 w-full max-w-full min-w-0">
          {/* Form Fields (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 w-full max-w-full min-w-0">
            {/* Website / Platform Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Platform Brand Name / Website Title</span>
                <span className="text-[10px] text-amber-400 font-mono">Dynamic Header & Titlebar</span>
              </label>
              <div className="flex rounded-xl border border-amber-500/40 bg-[#060c24] overflow-hidden focus-within:border-amber-400 focus-within:shadow-[0_0_12px_rgba(251,191,36,0.4)] transition-all">
                <div className="w-10 bg-[#091332] border-r border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={brandingForm.siteName}
                  onChange={(e) => setBrandingForm({ ...brandingForm, siteName: e.target.value })}
                  placeholder="e.g. PGX Gateway or Your Brand Name"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Logo Image with Cloudinary Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>Platform Logo Image</span>
                </label>
                <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Cloudinary Secure Storage
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-amber-500/35 bg-[#060c24] space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-amber-400/40 bg-[#040817] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-[0_0_12px_rgba(251,191,36,0.2)]">
                      {brandingForm.logoUrl ? (
                        <img
                          src={brandingForm.logoUrl}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white">
                        {brandingForm.logoUrl ? 'Custom Cloudinary Logo' : 'Default SVG Logo'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, WebP, SVG (Max 10MB)
                      </p>
                    </div>
                  </div>

                  <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all shrink-0">
                    <UploadCloud className="h-4 w-4 text-black stroke-[2.5]" />
                    <span>{logoUploading ? 'Uploading...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={brandingForm.logoUrl || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    placeholder="Direct Cloudinary URL will appear here or paste custom URL"
                    className="w-full bg-[#040817] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Custom Browser Tab Favicon */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Browser Tab Favicon</span>
                <span className="text-[10px] text-slate-400 font-mono">.ico / .svg / .png</span>
              </label>

              <div className="p-3.5 rounded-2xl border border-amber-500/35 bg-[#060c24] space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-amber-400/40 bg-[#040817] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                      {brandingForm.faviconUrl ? (
                        <img src={brandingForm.faviconUrl} alt="Favicon Preview" className="w-6 h-6 object-contain" />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-300 truncate max-w-[200px]">
                        {brandingForm.faviconUrl || '/favicon.svg'}
                      </p>
                      <p className="text-[10px] text-slate-500">Accepted: .ico, .svg, .png (Max 5MB)</p>
                    </div>
                  </div>

                  <label className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-fuchsia-400 text-fuchsia-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>{faviconUploading ? 'Uploading...' : 'Upload Favicon'}</span>
                    <input
                      type="file"
                      accept=".ico,image/svg+xml,image/png,image/x-icon"
                      onChange={handleFaviconUpload}
                      disabled={faviconUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={brandingForm.faviconUrl || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                  placeholder="/favicon.svg"
                  className="w-full bg-[#040817] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Compliance & Support Contact Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Support Email</label>
                <div className="flex rounded-xl border border-slate-700 bg-[#060c24] overflow-hidden focus-within:border-amber-400">
                  <div className="w-9 bg-[#091332] border-r border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={brandingForm.supportEmail || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, supportEmail: e.target.value })}
                    placeholder="support@pgxgateway.com"
                    className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Support Phone / Hot Line</label>
                <div className="flex rounded-xl border border-slate-700 bg-[#060c24] overflow-hidden focus-within:border-amber-400">
                  <div className="w-9 bg-[#091332] border-r border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    value={brandingForm.supportPhone || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, supportPhone: e.target.value })}
                    placeholder="+1 (437) 577-8785"
                    className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Official Telegram Handle</label>
                <input
                  type="text"
                  value={brandingForm.supportTelegram || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportTelegram: e.target.value })}
                  placeholder="@pgxsupport"
                  className="w-full bg-[#060c24] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Official WhatsApp Contact</label>
                <input
                  type="text"
                  value={brandingForm.supportWhatsapp || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportWhatsapp: e.target.value })}
                  placeholder="+1 (437) 577-8785"
                  className="w-full bg-[#060c24] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={brandingSaving}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {brandingSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Publishing Changes...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-black stroke-[3]" />
                  <span>Publish System Branding</span>
                </>
              )}
            </button>
          </div>

          {/* WYSIWYG Real-Time Preview Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 w-full max-w-full min-w-0">
            <div className="p-4 rounded-2xl bg-[#040819] border border-amber-500/30 space-y-3 sticky top-6">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span>LIVE REAL-TIME BRAND PREVIEW</span>
                <span className="text-amber-400 font-mono">WYSIWYG</span>
              </div>

              {/* Interactive Browser Preview Header */}
              <div className="rounded-xl border border-slate-800 bg-[#070e28] p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <div className="ml-2 text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate">
                    {brandingForm.faviconUrl ? (
                      <img src={brandingForm.faviconUrl} alt="Favicon" className="w-3.5 h-3.5 object-contain" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 text-amber-400" />
                    )}
                    <span>{brandingForm.siteName || 'PGX Gateway'}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  {brandingForm.logoUrl ? (
                    <img
                      src={brandingForm.logoUrl}
                      alt={brandingForm.siteName}
                      className="h-7 w-auto object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="text-sm font-black italic tracking-wide text-white">
                      <span>{brandingForm.siteName?.split(' ')[0] || 'PGX'}</span>
                      <span className="text-amber-400">/</span>
                      <div className="text-[8px] font-bold tracking-[0.2em] text-yellow-300 uppercase -mt-0.5">
                        {brandingForm.siteName?.split(' ').slice(1).join(' ') || 'GATEWAY'}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono">
                    {brandingForm.supportEmail || 'support@pgxgateway.com'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">Active Contacts Preview</div>
                <div>Hotline: <span className="text-white font-mono">{brandingForm.supportPhone || 'N/A'}</span></div>
                <div>Telegram: <span className="text-cyan-300 font-mono">{brandingForm.supportTelegram || 'N/A'}</span></div>
                <div>WhatsApp: <span className="text-emerald-300 font-mono">{brandingForm.supportWhatsapp || 'N/A'}</span></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
