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
  Lock,
  LogOut,
  RefreshCw,
  Loader2,
  Mail,
  X,
  AlertCircle,
  MessageSquare,
  Send,
  Check,
  Tag,
  Copy,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  adminApi,
  getStoredAdminToken,
  removeStoredAdminToken,
  getStoredAdminUser,
  type AdminUserInfo,
  type AdminStats,
  type ApplicationItem,
    type MerchantMessageItem,
} from '@/lib/adminApi'
import Logo from '@/components/brand/Logo'
import ResellerAffiliateTab from '@/components/admin/ResellerAffiliateTab'
import ResellerSidebar, { type ResellerSectionId } from '@/components/admin/ResellerSidebar'
import TransactionsTab from '@/components/admin/TransactionsTab'
import ApplicationReviewModal from '@/components/admin/ApplicationReviewModal'
import DocumentViewerModal, { type KycDocumentItem } from '@/components/admin/DocumentViewerModal'

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

  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(() => getStoredAdminUser())
  const [adminSection, setAdminSection] = useState<ResellerSectionId>('applications')
  const [copiedReferral, setCopiedReferral] = useState(false)

  const resellerId = adminUser?.resellerId || 'admin_root'
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/register?reseller=${resellerId}`
    : `https://pgxgateway.com/register?reseller=${resellerId}`

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedReferral(true)
    showToast('Referral Link Copied', 'Share this link with your merchants to auto-bind them to your gateway.', 'success')
    setTimeout(() => setCopiedReferral(false), 3000)
  }

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
  const [reviewInitialTab, setReviewInitialTab] = useState<'dossier' | 'documents' | 'offer'>('dossier')
  const [previewKycDoc, setPreviewKycDoc] = useState<KycDocumentItem | null>(null)
  const [offerRate, setOfferRate] = useState('2.9% + $0.30')
  const [offerVolume, setOfferVolume] = useState('Up to $250,000')
  const [offerSettlement, setOfferSettlement] = useState('Daily (Next Day)')
  const [offerReserve, setOfferReserve] = useState('5% (90 Days)')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  // Document list for currently selected applicant
  const selectedAppDocs: KycDocumentItem[] = selectedApp
    ? [
        {
          id: 'businessReg',
          title: 'Business Registration Document',
          category: 'Business Reg',
          fileName: selectedApp.businessRegDoc?.name,
          fileSize: selectedApp.businessRegDoc?.size,
          fileUrl: selectedApp.businessRegDoc?.url || selectedApp.businessRegDoc?.path,
          uploadedAt: selectedApp.businessRegDoc?.uploadedAt,
        },
        {
          id: 'directorId',
          title: 'Director / Owner Government ID',
          category: 'Director ID',
          fileName: selectedApp.directorIdDoc?.name,
          fileSize: selectedApp.directorIdDoc?.size,
          fileUrl: selectedApp.directorIdDoc?.url || selectedApp.directorIdDoc?.path,
          uploadedAt: selectedApp.directorIdDoc?.uploadedAt,
        },
        {
          id: 'processingStatement',
          title: 'Processing Statements (3 Months)',
          category: 'Statements',
          fileName: selectedApp.processingStatementDoc?.name,
          fileSize: selectedApp.processingStatementDoc?.size,
          fileUrl: selectedApp.processingStatementDoc?.url || selectedApp.processingStatementDoc?.path,
          uploadedAt: selectedApp.processingStatementDoc?.uploadedAt,
        },
      ]
    : []

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@pgxgateway.com')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)

  const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, desc, type })
    setTimeout(() => setToastMessage(null), 4500)
  }

  useEffect(() => {
    const handleAuthFailed = () => {
      setToken(null)
      setAdminUser(null)
      setLoginPassword('')
      showToast('Session Expired', 'Please sign in again with your credentials.', 'error')
    }
    window.addEventListener('pgx_admin_auth_failed', handleAuthFailed)
    return () => window.removeEventListener('pgx_admin_auth_failed', handleAuthFailed)
  }, [])

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [statsRes, appsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getApplications({ status: statusFilter, search: searchQuery }),
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
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
        const [statsRes, appsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getApplications({ status: statusFilter, search: searchQuery }),
        ])
        if (isSubscribed) {
          if (statsRes.data) setStats(statsRes.data)
          if (appsRes.data) setApplications(appsRes.data)
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

  // Open Direct Message Modal
  const openMessageModal = async (app: ApplicationItem, defaultMsg?: string) => {
    setMessagingApp(app)
    setMessageTitle(`Notice regarding application for ${app.legalName || app.fullName}`)
    setMessageContent(defaultMsg || '')
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
        setAdminUser(getStoredAdminUser())
        showToast('Admin Authenticated', 'Welcome to Reseller Gateway Control', 'success')
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
    setAdminUser(null)
    setLoginPassword('')
    showToast('Signed Out', 'Admin session terminated securely.', 'success')
  }

  // Open Review Drawer
  const openReviewModal = (app: ApplicationItem, tab: 'dossier' | 'documents' | 'offer' = 'dossier') => {
    setSelectedApp(app)
    setReviewInitialTab(tab)
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 bg-transparent text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center justify-center"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                RESELLER GATEWAY CONTROL
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Tenant: {resellerId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Merchant Applications & Underwriting Desk
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




      
      {/* Reseller Portal Grid: Sidebar (3 Cols) + Main Content (9 Cols) */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">
        
        {/* Left Sidebar (Col 3 on desktop) */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-4">
          <ResellerSidebar
            activeSection={adminSection}
            onSectionChange={(sec) => setAdminSection(sec)}
            adminUser={adminUser}
            resellerId={resellerId}
            pendingCount={stats.pendingReview}
            totalMerchants={stats.totalMerchants}
            referralLink={referralLink}
            copiedReferral={copiedReferral}
            onCopyReferral={handleCopyReferralLink}
            onRefresh={fetchData}
            onLogout={handleLogout}
            isRefreshing={loading}
          />
        </div>

        {/* Main Content Area (Col 9 on desktop) */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Sub-Merchant Onboarding Referral Link Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#0d1238] to-purple-950/60 border border-purple-500/40 p-4 sm:p-5 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/50">
                <LinkIcon className="h-3 w-3" />
                <span>MERCHANT ONBOARDING REFERRAL</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Assigned Tenant: <strong className="text-white">{resellerId}</strong>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Direct Your Sub-Merchants to Register Under Your Gateway
            </h3>
            <p className="text-xs text-slate-300">
              Share this unique link with clients. Any merchant registering via this link is automatically routed to your Underwriting Desk and Stripe payment gateway.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-purple-500/30 font-mono text-xs text-purple-200 select-all focus:outline-none focus:border-purple-400"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyReferralLink}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all shrink-0"
            >
              {copiedReferral ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      

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
            { id: 'all', label: `All Applications (${stats.totalMerchants})` },
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
        <div className="overflow-x-auto table-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091332] border-b border-cyan-500/20 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[170px]">Company & Legal Name</th>
                <th className="px-3 py-3.5 whitespace-nowrap min-w-[160px]">Merchant Contact</th>
                <th className="px-3 py-3.5 whitespace-nowrap min-w-[130px]">Est. Volume</th>
                <th className="px-3 py-3.5 whitespace-nowrap min-w-[120px]">KYC Docs</th>
                <th className="px-3 py-3.5 whitespace-nowrap min-w-[120px]">Status</th>
                <th className="px-3 py-3.5 whitespace-nowrap min-w-[140px]">Offer</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[210px] sticky right-0 z-20 bg-[#091332] shadow-[-12px_0_15px_rgba(4,8,26,0.95)] border-l border-cyan-500/20">Actions</th>
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
                  const uploadedDocsCount = [
                    app.businessRegDoc?.url || app.businessRegDoc?.path,
                    app.directorIdDoc?.url || app.directorIdDoc?.path,
                    app.processingStatementDoc?.url || app.processingStatementDoc?.path,
                  ].filter(Boolean).length
                  const isUnderReview = app.applicationStatus === 'under_review'
                  const isApproved = app.applicationStatus === 'approved'

                  return (
                    <tr key={app._id} className="group hover:bg-[#0c1538]/60 transition-colors">
                      {/* Company Name */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openReviewModal(app, 'dossier')}
                          className="text-left group/name block cursor-pointer"
                          title="Click to view full merchant dossier & underwriting details"
                        >
                          <div className="font-bold text-white text-sm group-hover/name:text-cyan-300 transition-colors">
                            {app.legalName || 'Unnamed Entity'}
                          </div>
                          {app.refId && (
                            <div className="mb-0.5">
                              <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold">
                                {app.refId}
                              </span>
                            </div>
                          )}
                          <div className="text-[11px] text-cyan-300/80 group-hover/name:text-cyan-200 capitalize">
                            {app.industry?.replace('-', ' ') || 'General Business'}
                          </div>
                        </button>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{app.fullName}</div>
                        <div className="text-[11px] text-slate-400">{app.businessEmail}</div>
                        <div className="text-[10px] text-slate-500">{app.phone}</div>
                      </td>

                      {/* Volume */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-white capitalize">
                          {app.monthlyVolume === 'under-10k' ? '< $10,000 / mo' : (app.monthlyVolume?.replace('-', ' ') || 'Not Specified')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Current: {app.currentProcessor || 'None'}
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {uploadedDocsCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => openReviewModal(app, 'documents')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/50 hover:bg-emerald-500/25 cursor-pointer transition-colors shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                            title="Click to inspect all uploaded KYC documents"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{uploadedDocsCount}/3 Cloudinary KYC</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openReviewModal(app, 'documents')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-amber-300/80 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition-colors"
                            title="Pending Upload - Click to inspect or request files"
                          >
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span>Pending Upload</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
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
                        {(app.applicationStatus === 'draft' || !app.applicationStatus) && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-400/40">
                            Draft Onboarding
                          </span>
                        )}
                      </td>

                      {/* Offer Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
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
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60 whitespace-nowrap">
                            <Clock className="h-3 w-3 text-amber-400/80" /> No Offer Sent
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap sticky right-0 z-10 bg-[#060b20] group-hover:bg-[#091332] shadow-[-12px_0_15px_rgba(4,8,26,0.95)] border-l border-cyan-500/20 transition-colors">
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

  {/* SECTION 2: AFFILIATE & COMMISSIONS PROGRAM */}
      {adminSection === 'stripe' && (
        <ResellerAffiliateTab
          resellerId={resellerId}
          applications={applications}
          onShowToast={showToast}
        />
      )}

      {/* SECTION 4: REAL-TIME TRANSACTION LEDGER */}
      {adminSection === 'transactions' && (
        <TransactionsTab onShowToast={showToast} isSuperAdmin={false} />
      )}

      
        </div>
      </div>

      {/* Comprehensive Merchant Review & Underwriting Dossier Modal */}
      <ApplicationReviewModal
        isOpen={Boolean(selectedApp)}
        app={selectedApp}
        initialTab={reviewInitialTab}
        onClose={() => setSelectedApp(null)}
        onOpenDocViewer={(doc) => setPreviewKycDoc(doc)}
        onOpenMessageModal={(app, defaultMsg) => openMessageModal(app, defaultMsg)}
        onDecision={handleDecision}
        onSubmitOffer={handleSubmitOffer}
        onRevokeOffer={handleRevokeOffer}
        reviewLoading={reviewLoading}
        offerRate={offerRate}
        setOfferRate={setOfferRate}
        offerVolume={offerVolume}
        setOfferVolume={setOfferVolume}
        offerSettlement={offerSettlement}
        setOfferSettlement={setOfferSettlement}
        offerReserve={offerReserve}
        setOfferReserve={setOfferReserve}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
      />

      {/* Professional Interactive Document Lightbox Viewer */}
      <DocumentViewerModal
        isOpen={Boolean(previewKycDoc)}
        activeDoc={previewKycDoc}
        allDocs={selectedAppDocs}
        onSelectDoc={(doc) => setPreviewKycDoc(doc)}
        onClose={() => setPreviewKycDoc(null)}
        merchantName={selectedApp?.legalName || selectedApp?.fullName}
      />

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
