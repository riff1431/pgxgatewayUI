import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Lock,
  LogOut,
  RefreshCw,
  Loader2,
  Building2,
  Mail,
  Coins,
  FileText,
  X,
  AlertCircle,
  MessageSquare,
  Palette,
  Send,
  Phone,
  Globe,
  Check,
  Tag,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import {
  adminApi,
  getStoredAdminToken,
  removeStoredAdminToken,
  type AdminStats,
  type ApplicationItem,
  type SystemConfigData,
  type MerchantMessageItem,
} from '@/lib/adminApi'
import Logo from '@/components/brand/Logo'
import { useBranding } from '@/context/BrandingContext'

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => getStoredAdminToken())
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalMerchants: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  })
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'under_review' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { updateLocalBranding } = useBranding()
  const [adminSection, setAdminSection] = useState<'applications' | 'branding'>('applications')

  // White-Label & Branding Form State
  const [brandingForm, setBrandingForm] = useState<SystemConfigData>({
    siteName: 'PGX Gateway',
    logoUrl: '',
    faviconUrl: '/favicon.svg',
    supportEmail: 'support@pgxgateway.com',
    supportPhone: '+1 (800) 749-4283',
    supportTelegram: '@pgxsupport',
    supportWhatsapp: '+1 (800) 749-4283',
  })
  const [brandingSaving, setBrandingSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [faviconUploading, setFaviconUploading] = useState(false)

  // Direct Merchant Messaging State
  const [messagingApp, setMessagingApp] = useState<ApplicationItem | null>(null)
  const [messageTitle, setMessageTitle] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [messageType, setMessageType] = useState<'general' | 'document' | 'offer' | 'system'>('general')
  const [messagePriority, setMessagePriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [messageLabels, setMessageLabels] = useState<string>('Underwriting')
  const [messageSending, setMessageSending] = useState(false)
  const [merchantHistory, setMerchantHistory] = useState<MerchantMessageItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)
  const [offerRate, setOfferRate] = useState('2.9% + $0.30')
  const [offerVolume, setOfferVolume] = useState('Up to $250,000')
  const [offerSettlement, setOfferSettlement] = useState('Daily (Next Day)')
  const [offerReserve, setOfferReserve] = useState('5% (90 Days)')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@pgxgateway.com')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)

  const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, desc, type })
    setTimeout(() => setToastMessage(null), 4500)
  }

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [statsRes, appsRes, configRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getApplications({ status: statusFilter, search: searchQuery }),
        adminApi.getSystemConfig(),
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      if (configRes.data) setBrandingForm(configRes.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin data'
      showToast('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [token, statusFilter, searchQuery])

  useEffect(() => {
    let isSubscribed = true
    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const [statsRes, appsRes, configRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getApplications({ status: statusFilter, search: searchQuery }),
          adminApi.getSystemConfig(),
        ])
        if (isSubscribed) {
          if (statsRes.data) setStats(statsRes.data)
          if (appsRes.data) setApplications(appsRes.data)
          if (configRes.data) setBrandingForm(configRes.data)
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch admin data'
          showToast('Error', msg, 'error')
        }
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      isSubscribed = false
    }
  }, [token, statusFilter, searchQuery])

  // Save White-Label Branding Settings
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault()
    setBrandingSaving(true)
    try {
      const res = await adminApi.updateSystemConfig(brandingForm)
      if (res.data) {
        setBrandingForm(res.data)
        updateLocalBranding(res.data)
        showToast('Branding Saved', 'Logo, favicon, website name & contact details updated.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save branding settings'
      showToast('Error', msg, 'error')
    } finally {
      setBrandingSaving(false)
    }
  }

  // Handle Direct Logo Upload to Cloudinary
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload a logo image smaller than 10MB.', 'error')
      return
    }

    setLogoUploading(true)
    try {
      const res = await adminApi.uploadBrandingAsset(file, 'pgxgateway/branding/logos')
      if (res.data?.url) {
        setBrandingForm((prev) => ({ ...prev, logoUrl: res.data!.url }))
        showToast('Logo Uploaded', 'Stored on Cloudinary. Click "Save Settings" to publish.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed'
      showToast('Upload Error', msg, 'error')
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  // Handle Direct Favicon Upload to Cloudinary
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload a favicon smaller than 5MB.', 'error')
      return
    }

    setFaviconUploading(true)
    try {
      const res = await adminApi.uploadBrandingAsset(file, 'pgxgateway/branding/favicons')
      if (res.data?.url) {
        setBrandingForm((prev) => ({ ...prev, faviconUrl: res.data!.url }))
        showToast('Favicon Uploaded', 'Stored on Cloudinary. Click "Save Settings" to publish.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Favicon upload failed'
      showToast('Upload Error', msg, 'error')
    } finally {
      setFaviconUploading(false)
      e.target.value = ''
    }
  }

  // Open Direct Message Modal
  const openMessageModal = async (app: ApplicationItem) => {
    setMessagingApp(app)
    setMessageTitle(`Notice regarding application for ${app.legalName || app.fullName}`)
    setMessageContent('')
    setMessageType('general')
    setHistoryLoading(true)
    try {
      const res = await adminApi.getMerchantMessages(app._id)
      if (res.data) setMerchantHistory(res.data)
    } catch {
      setMerchantHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  // Send Direct Message to Merchant
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messagingApp || !messageContent.trim()) return

    setMessageSending(true)
    try {
      const labelsArray = messageLabels.split(',').map((l) => l.trim()).filter(Boolean)
      const res = await adminApi.sendMessageToMerchant(messagingApp._id, {
        title: messageTitle.trim() || 'Notice from Underwriting Desk',
        content: messageContent.trim(),
        type: messageType,
        priority: messagePriority,
        labels: labelsArray.length > 0 ? labelsArray : ['Underwriting'],
      })
      if (res.data) {
        setMerchantHistory((prev) => [res.data, ...prev])
        showToast('Message Dispatched', `Delivered in real-time to ${messagingApp.fullName}`, 'success')
        setMessageContent('')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deliver message'
      showToast('Error', msg, 'error')
    } finally {
      setMessageSending(false)
    }
  }

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const res = await adminApi.login({ email: loginEmail, password: loginPassword })
      if (res.token) {
        setToken(res.token)
        showToast('Admin Authenticated', 'Welcome to the Underwriting Desk', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setLoginError(msg)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    removeStoredAdminToken()
    setToken(null)
    showToast('Signed Out', 'Admin session terminated', 'success')
  }

  // Open Review Drawer
  const openReviewModal = (app: ApplicationItem) => {
    setSelectedApp(app)
    setOfferRate(app.offer?.rate || '2.9% + $0.30')
    setOfferVolume(app.offer?.volume || 'Up to $250,000')
    setOfferSettlement(app.offer?.settlement || 'Daily (Next Day)')
    setOfferReserve(app.offer?.reserve || '5% (90 Days)')
    setReviewNotes('')
  }

  // Execute Review Decision (Approve or Reject)
  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedApp) return
    setReviewLoading(true)
    try {
      await adminApi.reviewApplication(selectedApp._id, {
        status,
        offer: {
          rate: offerRate,
          volume: offerVolume,
          settlement: offerSettlement,
          reserve: offerReserve,
          isAvailable: status === 'approved' ? true : Boolean(selectedApp.offer?.isAvailable),
        },
        notes: reviewNotes,
      })

      showToast(
        status === 'approved' ? 'Application Approved! 🎉' : 'Application Declined',
        `Merchant ${selectedApp.legalName || selectedApp.fullName} has been updated in real time via WebSockets.`,
        'success'
      )
      setSelectedApp(null)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit underwriting review'
      showToast('Action Failed', msg, 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  // Submit Processing Offer to Merchant (makes offer show up on merchant dashboard)
  const handleSubmitOffer = async () => {
    if (!selectedApp) return
    setReviewLoading(true)
    try {
      await adminApi.submitOffer(
        selectedApp._id,
        {
          rate: offerRate,
          volume: offerVolume,
          settlement: offerSettlement,
          reserve: offerReserve,
          isAvailable: true,
        },
        reviewNotes || 'Your customized processing offer is now available. Please review and accept to proceed.'
      )

      showToast(
        'Processing Offer Submitted! 📋',
        `Offer dispatched to ${selectedApp.fullName}. Merchant dashboard updated in real time.`,
        'success'
      )
      setSelectedApp(null)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit processing offer'
      showToast('Offer Dispatch Failed', msg, 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  // Reset/Revoke Offer to Blank/Pending
  const handleRevokeOffer = async () => {
    if (!selectedApp) return
    setReviewLoading(true)
    try {
      await adminApi.reviewApplication(selectedApp._id, {
        status: selectedApp.applicationStatus === 'approved' ? 'approved' : 'under_review',
        offer: {
          rate: '',
          volume: '',
          settlement: '',
          reserve: '',
          isAvailable: false,
          accepted: false,
        },
        notes: 'Processing offer retracted for underwriting re-assessment.',
      })

      showToast('Offer Reset', 'Merchant dashboard offer reset to blank state.', 'success')
      setSelectedApp(null)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset offer'
      showToast('Reset Failed', msg, 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  // If not authenticated as Admin, show login screen
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center p-4 relative">
        {/* Top Floating Back to Website Navigation */}
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/40 bg-[#060c24]/90 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/10 text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Website</span>
          </Link>
          <Logo size="sm" />
        </div>

        <div className="w-full max-w-md rounded-3xl bg-[#060b20]/95 border-[1.5px] border-cyan-400 p-8 shadow-[0_0_35px_rgba(0,240,255,0.4)] backdrop-blur-xl relative">
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-cyan-500/20">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PGX Underwriting Desk
            </h1>
            <p className="text-xs text-slate-400">
              Administrative portal for merchant compliance, KYC review & rate approvals.
            </p>
          </div>

          {loginError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Admin Email</label>
              <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
                <div className="w-10 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@pgxgateway.com"
                  className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Admin Password</label>
              <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
                <div className="w-10 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:shadow-[0_0_28px_rgba(0,240,255,0.85)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Underwriting Portal</span>
              )}
            </button>
          </form>

          {/* Footer Back to Home Link */}
          <div className="mt-6 pt-4 border-t border-cyan-500/15 text-center">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Return to Public Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#060c24]/95 border border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.5)] backdrop-blur-xl animate-fade-in flex items-start gap-3 text-white text-xs max-w-sm">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-sm text-cyan-300">{toastMessage.title}</div>
            <div className="text-slate-300 text-xs mt-0.5">{toastMessage.desc}</div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="text-slate-600 font-light">/</span>
          <div>
            <div className="text-[11px] font-black tracking-widest text-cyan-400 uppercase">
              Underwriting Desk
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Merchant Applications & Approvals
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-full border border-slate-700 hover:border-cyan-400/60 bg-[#070f28] text-xs font-semibold text-slate-300 hover:text-cyan-200 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,0,0,0.3)] cursor-pointer"
            title="View Public Website"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Public Home</span>
          </Link>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-[#091332] text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-full border border-red-500/50 bg-red-500/10 text-xs font-bold text-red-300 hover:bg-red-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Section Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-3">
        <button
          type="button"
          onClick={() => setAdminSection('applications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            adminSection === 'applications'
              ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_18px_rgba(217,70,239,0.85)] border border-fuchsia-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Merchant Applications</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
            {applications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('branding')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            adminSection === 'branding'
              ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_18px_rgba(217,70,239,0.85)] border border-fuchsia-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>White-Label & Branding</span>
        </button>
      </div>

      {/* SECTION 1: APPLICATIONS & UNDERWRITING */}
      {adminSection === 'applications' && (
        <div className="space-y-6">
          {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Merchants */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.totalMerchants}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.3)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">{stats.pendingReview}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/60 flex items-center justify-center text-amber-300">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Approved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.3)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Approved Active</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{stats.approved}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Rejected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Declined</div>
            <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{stats.rejected}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-400/60 flex items-center justify-center text-red-400">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'under_review', label: `Pending Review (${stats.pendingReview})` },
            { id: 'approved', label: `Approved (${stats.approved})` },
            { id: 'rejected', label: `Declined (${stats.rejected})` },
          ].map((tab) => {
            const isActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)] border border-fuchsia-400'
                    : 'bg-[#08102a] text-slate-400 hover:text-white border border-cyan-500/20 hover:border-cyan-400/40'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, email, name..."
            className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091332] border-b border-cyan-500/20 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Company & Legal Name</th>
                <th className="p-4">Merchant Contact</th>
                <th className="p-4">Est. Volume</th>
                <th className="p-4">KYC Docs</th>
                <th className="p-4">Status</th>
                <th className="p-4">Offer</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    {loading ? 'Loading applications from database...' : 'No merchant applications found.'}
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const hasDocs = Boolean(app.businessRegDoc?.url || app.directorIdDoc?.url)
                  const isUnderReview = app.applicationStatus === 'under_review'
                  const isApproved = app.applicationStatus === 'approved'

                  return (
                    <tr key={app._id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Company Name */}
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">
                          {app.legalName || 'Unnamed Entity'}
                        </div>
                        <div className="text-[11px] text-cyan-300 capitalize">
                          {app.industry?.replace('-', ' ') || 'General Business'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{app.fullName}</div>
                        <div className="text-[11px] text-slate-400">{app.businessEmail}</div>
                        <div className="text-[10px] text-slate-500">{app.phone}</div>
                      </td>

                      {/* Volume */}
                      <td className="p-4">
                        <div className="font-bold text-white">
                          {app.monthlyVolume || 'Not Specified'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Current: {app.currentProcessor || 'None'}
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="p-4">
                        {hasDocs ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/50">
                            <CheckCircle2 className="h-3 w-3" /> Cloudinary KYC
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Pending Upload</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isUnderReview && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                            Under Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                            Approved
                          </span>
                        )}
                        {app.applicationStatus === 'rejected' && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold text-red-300 bg-red-500/10 border border-red-400/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                            Declined
                          </span>
                        )}
                      </td>

                      {/* Offer Status */}
                      <td className="p-4">
                        {app.offer?.isAvailable ? (
                          app.offer.accepted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.25)]">
                              <Check className="h-3 w-3 stroke-[3]" /> Accepted ({app.offer.rate || 'Live'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-400/50 shadow-[0_0_8px_rgba(217,70,239,0.25)]">
                              <Tag className="h-3 w-3" /> Offer Sent ({app.offer.rate || 'Custom'})
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60">
                            <Clock className="h-3 w-3 text-amber-400" /> Blank (Not Sent)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openMessageModal(app)}
                          className="px-3 py-1.5 rounded-full bg-[#09153a] hover:bg-[#0f215c] border border-cyan-400/60 text-cyan-300 font-bold text-xs shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer transition-all inline-flex items-center gap-1.5"
                          title="Send Direct Real-Time Message to Merchant"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Message</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openReviewModal(app)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_12px_rgba(217,70,239,0.6)] hover:shadow-[0_0_18px_rgba(217,70,239,0.85)] cursor-pointer transition-all inline-flex items-center gap-1.5"
                        >
                          <Tag className="h-3 w-3" />
                          <span>Review & Offer</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* SECTION 2: WHITE-LABEL & BRANDING CONFIGURATION */}
  {adminSection === 'branding' && (
    <div className="space-y-6 animate-fade-in">
      <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.5)]">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">White-Label & System Branding Settings</h2>
            <p className="text-xs text-slate-400">
              Customize your platform name, logo image, browser favicon, and compliance contact details in real-time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Fields (8 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Website / Platform Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Platform Brand Name / Website Title</span>
                <span className="text-[10px] text-cyan-400 font-mono">Dynamic Header & Titlebar</span>
              </label>
              <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
                <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
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
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span>Platform Logo Image</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Cloudinary Storage
                </span>
              </div>

              {/* Upload Drop / Action Area */}
              <div className="p-3.5 rounded-2xl border border-cyan-500/35 bg-[#060c24] space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail preview */}
                    <div className="w-14 h-14 rounded-xl border border-cyan-400/40 bg-[#040817] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-[0_0_12px_rgba(0,240,255,0.2)]">
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

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="file"
                      id="logo-upload-input"
                      className="hidden"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                    />

                    <label
                      htmlFor="logo-upload-input"
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        logoUploading
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white shadow-[0_0_16px_rgba(0,240,255,0.45)] hover:shadow-[0_0_22px_rgba(0,240,255,0.7)] hover:scale-[1.02]'
                      }`}
                    >
                      {logoUploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
                          <span>Upload Logo</span>
                        </>
                      )}
                    </label>

                    {brandingForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setBrandingForm({ ...brandingForm, logoUrl: '' })}
                        className="px-3 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Reset to default logo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct URL input fallback */}
                <div className="flex rounded-xl border border-cyan-500/30 bg-[#040817] overflow-hidden focus-within:border-cyan-400 transition-all">
                  <div className="w-9 bg-[#081230] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="url"
                    value={brandingForm.logoUrl || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    placeholder="Direct Cloudinary URL will appear here or paste custom URL"
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Custom Favicon with Cloudinary Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Browser Tab Favicon</span>
                </label>
                <span className="text-[10px] text-slate-400">.ico / .svg / .png (Browser tab icon)</span>
              </div>

              <div className="p-3.5 rounded-2xl border border-cyan-500/35 bg-[#060c24] space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Favicon preview */}
                    <div className="w-12 h-12 rounded-xl border border-cyan-400/40 bg-[#040817] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                      {brandingForm.faviconUrl ? (
                        <img
                          src={brandingForm.faviconUrl}
                          alt="Favicon Preview"
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white truncate max-w-[200px]">
                        {brandingForm.faviconUrl || '/favicon.svg'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Accepted: .ico, .svg, .png (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="file"
                      id="favicon-upload-input"
                      className="hidden"
                      accept="image/x-icon,image/svg+xml,image/png,image/vnd.microsoft.icon"
                      onChange={handleFaviconUpload}
                      disabled={faviconUploading}
                    />

                    <label
                      htmlFor="favicon-upload-input"
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        faviconUploading
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white shadow-[0_0_16px_rgba(217,70,239,0.4)] hover:shadow-[0_0_22px_rgba(217,70,239,0.65)] hover:scale-[1.02]'
                      }`}
                    >
                      {faviconUploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
                          <span>Upload Favicon</span>
                        </>
                      )}
                    </label>

                    {brandingForm.faviconUrl && brandingForm.faviconUrl !== '/favicon.svg' && (
                      <button
                        type="button"
                        onClick={() => setBrandingForm({ ...brandingForm, faviconUrl: '/favicon.svg' })}
                        className="px-3 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Reset to default favicon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex rounded-xl border border-cyan-500/30 bg-[#040817] overflow-hidden focus-within:border-cyan-400 transition-all">
                  <div className="w-9 bg-[#081230] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    value={brandingForm.faviconUrl || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                    placeholder="/favicon.svg or Cloudinary URL"
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Support Email & Support Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Support Email</label>
                <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 transition-all">
                  <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={brandingForm.supportEmail || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, supportEmail: e.target.value })}
                    placeholder="support@yourbrand.com"
                    className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Support Phone / Hot Line</label>
                <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 transition-all">
                  <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={brandingForm.supportPhone || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, supportPhone: e.target.value })}
                    placeholder="+1 (800) 000-0000"
                    className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Telegram & WhatsApp Handles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Official Telegram Handle</label>
                <input
                  type="text"
                  value={brandingForm.supportTelegram || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportTelegram: e.target.value })}
                  placeholder="@yourbrandsupport"
                  className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Official WhatsApp Contact</label>
                <input
                  type="text"
                  value={brandingForm.supportWhatsapp || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportWhatsapp: e.target.value })}
                  placeholder="+1 (800) 000-0000"
                  className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={brandingSaving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-extrabold text-sm border border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:shadow-[0_0_30px_rgba(217,70,239,0.9)] transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {brandingSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Branding Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    <span>Save System & Branding Settings</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Real-Time Live Brand Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#030617] border border-cyan-500/40 shadow-xl space-y-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                <span>Live Real-Time Brand Preview</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WYSIWYG
                </span>
              </div>

              {/* Simulated Browser Navbar Preview */}
              <div className="p-3 rounded-xl bg-[#05091a] border border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <div className="ml-2 flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono truncate max-w-[200px]">
                    {brandingForm.faviconUrl ? (
                      <img src={brandingForm.faviconUrl} alt="Favicon" className="w-3 h-3 object-contain" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 text-cyan-400" />
                    )}
                    <span>{brandingForm.siteName || 'PGX Gateway'}</span>
                  </div>
                </div>

                {/* Navbar Visual */}
                <div className="pt-1 flex items-center justify-between">
                  {brandingForm.logoUrl ? (
                    <img
                      src={brandingForm.logoUrl}
                      alt={brandingForm.siteName}
                      className="h-7 w-auto object-contain drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                      onError={(e) => {
                        // Fallback indicator
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="text-sm font-black italic tracking-wide text-white">
                      <span>{brandingForm.siteName?.split(' ')[0] || 'PGX'}</span>
                      <span className="text-fuchsia-400">/</span>
                      <div className="text-[8px] font-bold tracking-[0.2em] text-cyan-400 uppercase -mt-0.5">
                        {brandingForm.siteName?.split(' ').slice(1).join(' ') || 'GATEWAY'}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono">
                    {brandingForm.supportEmail || 'support@pgxgateway.com'}
                  </span>
                </div>
              </div>

              {/* Favicon Box */}
              <div className="p-3 rounded-xl bg-[#05091a] border border-cyan-500/20 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Browser Tab Icon (Favicon)</div>
                  <div className="text-[10px] text-slate-400">Loaded in browser header dynamically</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                  {brandingForm.faviconUrl ? (
                    <img src={brandingForm.faviconUrl} alt="Favicon" className="w-5 h-5 object-contain" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  )}

      {/* Review & Decision Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.45)] p-6 sm:p-7 space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {selectedApp.legalName || selectedApp.fullName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Application ID: <span className="font-mono text-cyan-300">{selectedApp._id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Merchant Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Merchant Name</span>
                <span className="font-bold text-white">{selectedApp.fullName}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Business Email</span>
                <span className="font-bold text-white">{selectedApp.businessEmail}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <span className="font-bold text-white">{selectedApp.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Industry</span>
                <span className="font-bold text-white capitalize">{selectedApp.industry || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Est. Monthly Volume</span>
                <span className="font-bold text-white">{selectedApp.monthlyVolume || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Current Processor</span>
                <span className="font-bold text-white">{selectedApp.currentProcessor || 'None'}</span>
              </div>
            </div>

            {/* Switch Reason */}
            {selectedApp.switchReason && (
              <div className="p-3 rounded-xl bg-[#091332]/70 border border-cyan-500/20 text-xs">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Reason for Applying / Switching</span>
                <p className="text-slate-200 mt-0.5">{selectedApp.switchReason}</p>
              </div>
            )}

            {/* Cloudinary Documents Section */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Uploaded Verification Documents (Cloudinary)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Business Registration */}
                <div className="p-3 rounded-xl bg-[#070e28] border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Business Registration</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {selectedApp.businessRegDoc?.name || 'No file attached'}
                    </div>
                  </div>
                  {selectedApp.businessRegDoc?.url ? (
                    <a
                      href={selectedApp.businessRegDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400 text-cyan-300 font-bold text-[11px] hover:bg-cyan-500/25 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Missing</span>
                  )}
                </div>

                {/* Director ID */}
                <div className="p-3 rounded-xl bg-[#070e28] border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Director Government ID</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {selectedApp.directorIdDoc?.name || 'No file attached'}
                    </div>
                  </div>
                  {selectedApp.directorIdDoc?.url ? (
                    <a
                      href={selectedApp.directorIdDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400 text-cyan-300 font-bold text-[11px] hover:bg-cyan-500/25 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Missing</span>
                  )}
                </div>
              </div>
            </div>

            {/* Offer Terms Customizer */}
            <div className="space-y-3 pt-2 border-t border-cyan-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="h-4 w-4" />
                  <span>Customize Processing Offer Terms</span>
                </span>

                {selectedApp.offer?.isAvailable && (
                  <button
                    type="button"
                    onClick={handleRevokeOffer}
                    disabled={reviewLoading}
                    className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                  >
                    Reset to Blank
                  </button>
                )}
              </div>

              {selectedApp.offer?.isAvailable ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Offer is currently Live on Merchant Dashboard</div>
                      <div className="text-[11px] text-emerald-200/80">
                        Terms: {selectedApp.offer.rate} • {selectedApp.offer.volume} • {selectedApp.offer.settlement}
                      </div>
                    </div>
                  </div>
                  {selectedApp.offer.accepted && (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-bold shrink-0">
                      Accepted by Merchant ✓
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-200">No Offer Sent Yet (Currently Blank)</div>
                    <div className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                      Merchant dashboard currently displays: <em>"Please check back every 24hrs to see if offer is available and accept to proceed"</em> with blank rate fields.
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Interchange Rate</label>
                  <input
                    type="text"
                    value={offerRate}
                    onChange={(e) => setOfferRate(e.target.value)}
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Volume Ceiling</label>
                  <input
                    type="text"
                    value={offerVolume}
                    onChange={(e) => setOfferVolume(e.target.value)}
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Settlement</label>
                  <input
                    type="text"
                    value={offerSettlement}
                    onChange={(e) => setOfferSettlement(e.target.value)}
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Rolling Reserve</label>
                  <input
                    type="text"
                    value={offerReserve}
                    onChange={(e) => setOfferReserve(e.target.value)}
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Underwriting Notes */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block">Underwriter Note / Approval Message (Optional)</label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Approved with tier 1 pricing and 24-hr daily settlement"
                className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleDecision('rejected')}
                className="px-4 py-2.5 rounded-full border border-red-500/70 bg-red-500/10 text-red-300 font-bold text-xs hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
              >
                Decline
              </button>

              <button
                type="button"
                disabled={reviewLoading}
                onClick={handleSubmitOffer}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_18px_rgba(217,70,239,0.7)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {reviewLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Sending Offer...</span>
                  </>
                ) : (
                  <>
                    <Tag className="h-3.5 w-3.5" />
                    <span>{selectedApp.offer?.isAvailable ? 'Update Processing Offer' : 'Submit Processing Offer'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleDecision('approved')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:shadow-[0_0_28px_rgba(16,185,129,0.9)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {reviewLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Broadcasting Approval...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                    <span>Approve Application</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Direct Merchant Messaging Modal */}
      {messagingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.45)] p-6 sm:p-7 space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.5)]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Direct Message to {messagingApp.fullName}
                  </h3>
                  <div className="text-xs text-cyan-300">
                    {messagingApp.legalName || 'Merchant'} • {messagingApp.businessEmail}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMessagingApp(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Preset Templates:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMessageTitle('KYC Document Clarification Required')
                    setMessageContent(
                      'Please upload an uncropped, high-resolution copy of your business registration document and Director Government ID to complete underwriting review.'
                    )
                    setMessageType('document')
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  📄 Request KYC Re-upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessageTitle('Processing Volume Limit Raised')
                    setMessageContent(
                      'Good news! Following our risk review, your monthly processing limit has been elevated to $500,000 with next-day settlement.'
                    )
                    setMessageType('offer')
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-fuchsia-400/40 text-fuchsia-300 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  🚀 Volume Raised to $500k
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessageTitle('Underwriting & Transaction Inquiry')
                    setMessageContent(
                      'Could you please specify your expected average ticket size and primary processing currencies to help us optimize your acquiring rails?'
                    )
                    setMessageType('general')
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  💬 Inquire Details
                </button>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              
              {/* Category, Priority & Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-semibold">Message Category</label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as 'general' | 'document' | 'offer' | 'system')}
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="general">General Notice</option>
                    <option value="document">Document Request</option>
                    <option value="offer">Offer & Terms</option>
                    <option value="system">Compliance Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-semibold">Priority Level</label>
                  <select
                    value={messagePriority}
                    onChange={(e) => setMessagePriority(e.target.value as typeof messagePriority)}
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">🚨 Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-semibold">Labels (Comma-separated)</label>
                  <input
                    type="text"
                    value={messageLabels}
                    onChange={(e) => setMessageLabels(e.target.value)}
                    placeholder="e.g. Underwriting, Rates, KYC"
                    className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Title / Subject */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-semibold">Subject / Title</label>
                <input
                  type="text"
                  required
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="e.g. Underwriting Inquiry"
                  className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-semibold">Message Body</label>
                <textarea
                  required
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message to the merchant here. This will be delivered directly to their dashboard Messages tab in real-time..."
                  className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                />
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  ⚡ Pushes instant WebSocket notification to merchant
                </span>

                <button
                  type="submit"
                  disabled={messageSending}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-bold text-xs shadow-[0_0_18px_rgba(217,70,239,0.7)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {messageSending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Message to Merchant</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Conversation History */}
            <div className="pt-3 border-t border-cyan-500/20 space-y-2">
              <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                <span>Recent Message History with this Merchant</span>
                {historyLoading && <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {merchantHistory.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs">
                    {historyLoading ? 'Loading message history...' : 'No previous messages logged with this merchant.'}
                  </div>
                ) : (
                  merchantHistory.map((item) => (
                    <div
                      key={item._id}
                      className="p-2.5 rounded-xl bg-[#091332] border border-cyan-500/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{item.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{item.content}</p>
                      <div className="flex items-center gap-2 pt-0.5 text-[9px] text-slate-400 flex-wrap">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                          {item.type}
                        </span>
                        {item.priority === 'urgent' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                            🚨 Urgent
                          </span>
                        )}
                        {item.labels && item.labels.map((lbl) => (
                          <span key={lbl} className="px-1.5 py-0.5 rounded bg-slate-800 text-fuchsia-300 font-medium">
                            #{lbl}
                          </span>
                        ))}
                        <span>{item.isRead ? '✓ Read by merchant' : '• Unread'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
