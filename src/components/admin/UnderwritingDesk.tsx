import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  Clock,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Search,
  Check,
  Tag,
  Copy,
  Mail,
  FileCheck,
  FileText,
  Activity,
  Terminal,
  Zap,
  Boxes,
  Fingerprint,
  MessageSquare,
  Trash2,
  AlertTriangle,
  X,
  Send,
  Loader2,
} from 'lucide-react'
import {
  adminApi,
  type ApplicationItem,
  type AdminStats,
  type MerchantMessageItem,
} from '@/lib/adminApi'
import ApplicationReviewModal from './ApplicationReviewModal'
import DocumentViewerModal, { type KycDocumentItem } from './DocumentViewerModal'

interface UnderwritingDeskProps {
  isSuperAdmin?: boolean
  onShowToast?: (title: string, message: string, type: 'success' | 'error' | 'info') => void
  onStatsChange?: (stats: AdminStats) => void
}

export default function UnderwritingDesk({
  isSuperAdmin = false,
  onShowToast,
  onStatsChange,
}: UnderwritingDeskProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalMerchants: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  })

  const [statusFilter, setStatusFilter] = useState<'all' | 'under_review' | 'approved' | 'rejected'>('all')
  const [tenantFilter, setTenantFilter] = useState<'all' | 'admin_root' | 'ARXO'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected Application for Review Drawer
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)
  const [reviewInitialTab, setReviewInitialTab] = useState<'dossier' | 'documents' | 'offer'>('dossier')
  const [reviewLoading, setReviewLoading] = useState(false)

  // Custom Interchange Offer Form State
  const [offerRate, setOfferRate] = useState('')
  const [offerVolume, setOfferVolume] = useState('')
  const [offerSettlement, setOfferSettlement] = useState('')
  const [offerReserve, setOfferReserve] = useState('')
  const [offerSetupFee, setOfferSetupFee] = useState('')
  const [offerMonthlyFee, setOfferMonthlyFee] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')

  // Document Viewer Modal State
  const [previewKycDoc, setPreviewKycDoc] = useState<KycDocumentItem | null>(null)

  // Direct Messaging Modal State
  const [messagingApp, setMessagingApp] = useState<ApplicationItem | null>(null)
  const [messageHistory, setMessageHistory] = useState<MerchantMessageItem[]>([])
  const [newMessageText, setNewMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Delete Confirmation Modal State
  const [deletingApp, setDeletingApp] = useState<ApplicationItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // UI Helpers
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null)

  const showToast = useCallback(
    (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
      if (onShowToast) {
        onShowToast(title, message, type)
      }
    },
    [onShowToast]
  )

  const getInitials = (name?: string, fallback = 'PG'): string => {
    if (!name || !name.trim()) return fallback
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  const handleCopyRefId = (e: React.MouseEvent, refId: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(refId)
    setCopiedRefId(refId)
    showToast('Copied Reference ID', refId, 'success')
    setTimeout(() => setCopiedRefId(null), 2000)
  }

  // Fetch Applications & Stats
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [appsRes, statsRes] = await Promise.all([
        adminApi.getApplications({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
          resellerId: tenantFilter !== 'all' ? tenantFilter : undefined,
        }),
        adminApi.getStats({
          resellerId: tenantFilter !== 'all' ? tenantFilter : undefined,
        }),
      ])

      const fetchedApps = appsRes.data || []
      setApplications(fetchedApps)

      if (statsRes.data) {
        setStats(statsRes.data)
        if (onStatsChange) {
          onStatsChange(statsRes.data)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch applications'
      showToast('Data Retrieval Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, tenantFilter, showToast, onStatsChange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Open Review Drawer
  const openReviewModal = (app: ApplicationItem, tab: 'dossier' | 'documents' | 'offer' = 'dossier') => {
    setSelectedApp(app)
    setReviewInitialTab(tab)
    const tier = app.tier || (app.offer?.rate?.includes('15') || app.offer?.setupFee?.includes('2500') ? 2 : 1)

    if (tier === 2) {
      setOfferRate(app.offer?.rate || '15.0% + $0.30')
      setOfferVolume(app.offer?.volume || 'Up to $250,000')
      setOfferSettlement(app.offer?.settlement || 'Bi-Weekly (45 Days Hold)')
      setOfferReserve(app.offer?.reserve || '20% (90 Days)')
      setOfferSetupFee(app.offer?.setupFee || '$2,500')
      setOfferMonthlyFee(app.offer?.monthlyFee || '$499 / month')
    } else {
      setOfferRate(app.offer?.rate || '9.0% + $0.30')
      setOfferVolume(app.offer?.volume || 'Up to $250,000')
      setOfferSettlement(app.offer?.settlement || 'Weekly (14 Days Hold)')
      setOfferReserve(app.offer?.reserve || '10% (60 Days)')
      setOfferSetupFee(app.offer?.setupFee || '$1,499')
      setOfferMonthlyFee(app.offer?.monthlyFee || '$499 / month')
    }
    setReviewNotes('')
  }

  // Execute Review Decision (Approve or Reject with 24h Trial vs Direct Live)
  const handleDecision = async (status: 'approved' | 'rejected', approveMode: 'trial' | 'live' = 'trial') => {
    if (!selectedApp) return
    setReviewLoading(true)
    try {
      await adminApi.reviewApplication(selectedApp._id, {
        status,
        approveMode,
        trialHours: 24,
        offer: {
          rate: offerRate,
          volume: offerVolume,
          settlement: offerSettlement,
          reserve: offerReserve,
          setupFee: offerSetupFee,
          monthlyFee: offerMonthlyFee,
          isAvailable: status === 'approved' ? true : Boolean(selectedApp.offer?.isAvailable),
        },
        notes: reviewNotes,
      })

      showToast(
        status === 'approved'
          ? (approveMode === 'trial' ? '24h Integration Trial Activated! ⏳' : 'Application Approved (Live Active)! 🎉')
          : 'Application Declined',
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

  // Extend Merchant Trial (+24h)
  const handleExtendTrial = async (id: string, hours = 24) => {
    setReviewLoading(true)
    try {
      await adminApi.extendMerchantTrial(id, hours)
      showToast('Trial Extended! ⏳', `Extended by ${hours} hours successfully.`, 'success')
      setSelectedApp(null)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extend trial'
      showToast('Extension Failed', msg, 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  // Convert Merchant Directly to Live Processing
  const handleConvertToLive = async (id: string) => {
    setReviewLoading(true)
    try {
      await adminApi.convertMerchantToLive(id)
      showToast('Converted to Live! 🚀', 'Merchant is now permanently active for live processing.', 'success')
      setSelectedApp(null)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to convert to live'
      showToast('Conversion Failed', msg, 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  // Submit Processing Offer to Merchant
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
          setupFee: offerSetupFee,
          monthlyFee: offerMonthlyFee,
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

  // Handle Permanent Application Deletion
  const handleConfirmDelete = async () => {
    if (!deletingApp) return
    setIsDeleting(true)
    try {
      const res = await adminApi.deleteApplication(deletingApp._id)
      if (res.success) {
        showToast('Application Deleted', res.message || 'Merchant application permanently deleted.', 'success')
        setApplications((prev) => prev.filter((app) => app._id !== deletingApp._id))
        setDeletingApp(null)
        fetchData()
      } else {
        showToast('Delete Failed', res.message || 'Failed to delete merchant application.', 'error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting merchant application'
      showToast('Delete Failed', msg, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Open Message Modal
  const openMessageModal = async (app: ApplicationItem, defaultMsg?: string) => {
    setMessagingApp(app)
    setNewMessageText(defaultMsg || '')
    setLoadingMessages(true)
    try {
      const res = await adminApi.getMerchantMessages(app._id)
      if (res.success && res.data) {
        setMessageHistory(res.data)
      } else {
        setMessageHistory([])
      }
    } catch {
      setMessageHistory([])
    } finally {
      setLoadingMessages(false)
    }
  }

  // Send Message
  const handleSendMessage = async () => {
    if (!messagingApp || !newMessageText.trim() || sendingMessage) return
    setSendingMessage(true)
    try {
      const res = await adminApi.sendMessageToMerchant(messagingApp._id, { title: 'Underwriting Note', content: newMessageText.trim(), type: 'general' })
      if (res.success) {
        showToast('Message Sent', 'Dispatched to merchant notification panel.', 'success')
        setNewMessageText('')
        // Refresh message list
        const updated = await adminApi.getMerchantMessages(messagingApp._id)
        if (updated.success && updated.data) {
          setMessageHistory(updated.data)
        }
      } else {
        showToast('Message Failed', res.message || 'Failed to dispatch message.', 'error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch message'
      showToast('Message Failed', msg, 'error')
    } finally {
      setSendingMessage(false)
    }
  }

  const borderAccent = isSuperAdmin ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.25)]' : 'border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)]'

  return (
    <div className="space-y-5 w-full max-w-full min-w-0">
      {/* SECTION 1: STATS KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
        {/* Total Merchants */}
        <div className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#060b20]/90 border ${isSuperAdmin ? 'border-amber-500/40' : 'border-cyan-500/40'} flex items-center justify-between gap-2 min-w-0`}>
          <div className="min-w-0">
            <div className={`text-[9px] sm:text-xs font-semibold ${isSuperAdmin ? 'text-amber-300' : 'text-cyan-300'} uppercase tracking-wider truncate`}>
              Total Merchants
            </div>
            <div className="text-lg sm:text-3xl font-black text-white mt-0.5 sm:mt-1 truncate">{stats.totalMerchants}</div>
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${isSuperAdmin ? 'bg-amber-500/10 border-amber-400/60 text-amber-300' : 'bg-cyan-500/10 border-cyan-400/60 text-cyan-300'} border flex items-center justify-center shrink-0`}>
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#060b20]/90 border border-amber-400/60 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="text-[9px] sm:text-xs font-semibold text-amber-300 uppercase tracking-wider truncate">
              Under Review
            </div>
            <div className="text-lg sm:text-3xl font-black text-amber-300 mt-0.5 sm:mt-1 truncate">{stats.pendingReview}</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Approved Active */}
        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#060b20]/90 border border-emerald-400/60 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="text-[9px] sm:text-xs font-semibold text-emerald-300 uppercase tracking-wider truncate">
              Approved
            </div>
            <div className="text-lg sm:text-3xl font-black text-emerald-300 mt-0.5 sm:mt-1 truncate">{stats.approved}</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shrink-0">
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Declined */}
        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#060b20]/90 border border-red-400/60 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="text-[9px] sm:text-xs font-semibold text-red-400 uppercase tracking-wider truncate">
              Declined
            </div>
            <div className="text-lg sm:text-3xl font-black text-red-400 mt-0.5 sm:mt-1 truncate">{stats.rejected}</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 border border-red-400/60 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* SECTION 2: PORTFOLIO SELECTOR FILTER BAR */}
      <div className={`p-3.5 rounded-2xl bg-[#060b20]/90 border ${isSuperAdmin ? 'border-amber-500/30' : 'border-cyan-500/30'} backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <Building2 className={`h-4 w-4 ${isSuperAdmin ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Partner Portfolio:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Portfolios (Direct + Partners)' },
            { id: 'admin_root', label: 'Direct PGX (admin_root)' },
            { id: 'ARXO', label: 'Arxopay Partner (ARXO)' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTenantFilter(t.id as 'all' | 'admin_root' | 'ARXO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tenantFilter === t.id
                  ? isSuperAdmin
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-[#091332] text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: FILTER TABS & SEARCH BAR */}
      <div className="w-full max-w-full min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Status Tabs */}
        <div className="w-full sm:w-auto max-w-full min-w-0 overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 pb-1">
          {[
            { id: 'all', label: `All Applications (${stats.totalMerchants})`, icon: Boxes },
            { id: 'under_review', label: `Pending Review (${stats.pendingReview})`, icon: Clock },
            { id: 'approved', label: `Approved (${stats.approved})`, icon: ShieldCheck },
            { id: 'rejected', label: `Declined (${stats.rejected})`, icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)] border border-fuchsia-400'
                    : 'bg-[#08102a] text-slate-400 hover:text-white border border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0 min-w-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, email, name..."
            className="w-full rounded-xl border border-slate-700/60 bg-[#060c24] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* SECTION 4: APPLICATIONS DATA VIEW */}

      {/* DESKTOP TABLE VIEW (>= 1024px) */}
      <div className={`hidden lg:block rounded-3xl bg-[#060b20]/90 border-[1.5px] ${borderAccent} overflow-hidden backdrop-blur-xl`}>
        <div className="overflow-x-auto table-scrollbar">
          <table className="w-full text-left text-xs min-w-[890px]">
            <thead className="bg-[#091332] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap min-w-[170px]">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                    Company
                  </span>
                </th>
                <th className="px-3 py-3 whitespace-nowrap min-w-[150px]">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <Fingerprint className="h-3.5 w-3.5 text-cyan-400" />
                    Contact
                  </span>
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap min-w-[105px]">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <Zap className="h-3.5 w-3.5 text-cyan-400" />
                    Volume
                  </span>
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap min-w-[110px]">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                    KYC Docs
                  </span>
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap min-w-[105px]">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" />
                    Status
                  </span>
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap min-w-[115px]">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <FileText className="h-3.5 w-3.5 text-fuchsia-400" />
                    Offer
                  </span>
                </th>
                <th className="px-3 py-3 whitespace-nowrap text-right min-w-[135px] sticky right-0 z-20 bg-[#091332] shadow-[-10px_0_15px_rgba(4,8,26,0.95)] border-l border-slate-700/60">
                  <span className="flex items-center justify-end gap-1.5 text-cyan-300/90">
                    <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
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
                    <tr key={app._id} className="group hover:bg-[#0c1538]/70 border-b border-slate-800/60 transition-all">
                      {/* Company Name */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => openReviewModal(app, 'dossier')}
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-950 via-[#0b183f] to-purple-950/80 border border-cyan-400/40 flex items-center justify-center font-black text-[11px] text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)] shrink-0 transition-all cursor-pointer"
                            title="Open Dossier"
                          >
                            {getInitials(app.legalName)}
                          </button>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openReviewModal(app, 'dossier')}
                              className="text-left group/name block cursor-pointer"
                              title="Click to view full merchant dossier"
                            >
                              <div className="font-bold text-white text-xs group-hover/name:text-cyan-300 transition-colors truncate max-w-[130px]">
                                {app.legalName || 'Unnamed Entity'}
                              </div>
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {app.refId && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyRefId(e, app.refId!)}
                                  className="font-mono text-[9px] text-cyan-300/90 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 px-1 py-0.2 rounded flex items-center gap-1 cursor-pointer"
                                  title="Click to copy Reference ID"
                                >
                                  <span>{app.refId}</span>
                                  {copiedRefId === app.refId ? (
                                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-2.5 w-2.5 opacity-60 hover:opacity-100" />
                                  )}
                                </button>
                              )}
                              <span className="text-[10px] text-slate-400 capitalize truncate max-w-[80px]">
                                {app.industry?.replace('-', ' ') || 'General'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-200 text-xs truncate max-w-[140px]">{app.fullName || 'Unknown Contact'}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-2.5 w-2.5 text-cyan-400/70 shrink-0" />
                          <span className="truncate max-w-[130px]" title={app.businessEmail}>{app.businessEmail}</span>
                        </div>
                        {app.phone && (
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{app.phone}</div>
                        )}
                      </td>

                      {/* Volume */}
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-white font-bold text-[11px]">
                          {app.monthlyVolume === 'under-10k' ? '< $10k' : (app.monthlyVolume?.replace('-', ' ') || 'Not Specified')}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[100px]">
                          <span className="text-slate-500">Proc:</span> {app.currentProcessor || 'None'}
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        {uploadedDocsCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => openReviewModal(app, 'documents')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/50 hover:bg-emerald-500/25 cursor-pointer transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            title="Inspect KYC documents"
                          >
                            <FileCheck className="h-3 w-3 text-emerald-400" />
                            <span>{uploadedDocsCount}/3 Verified</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openReviewModal(app, 'documents')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-300/90 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition-all"
                            title="Pending Documents"
                          >
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span>Pending Docs</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        {isUnderReview && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/70 shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Under Review</span>
                          </span>
                        )}
                        {isApproved && app.accountMode === 'trial' && app.trial?.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/70 shadow-[0_0_8px_rgba(0,240,255,0.25)]">
                            <Clock className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
                            <span>24h Trial</span>
                          </span>
                        )}
                        {isApproved && app.accountMode === 'trial' && app.trial?.status === 'expired' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/70">
                            <Clock className="h-2.5 w-2.5 text-amber-400" />
                            <span>Trial Expired</span>
                          </span>
                        )}
                        {isApproved && (app.accountMode === 'live' || !app.accountMode || app.trial?.status === 'converted') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/70 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                            <span>Live Active</span>
                          </span>
                        )}
                        {app.applicationStatus === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-300 bg-rose-500/15 border border-rose-400/70">
                            <X className="h-2.5 w-2.5 stroke-[2.5]" />
                            <span>Declined</span>
                          </span>
                        )}
                        {(app.applicationStatus === 'draft' || !app.applicationStatus) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-400/40">
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Offer Status */}
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        {app.offer?.isAvailable ? (
                          app.offer.accepted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                              <span>Accepted ({app.offer.rate || 'Live'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-400/50 shadow-[0_0_8px_rgba(217,70,239,0.2)]">
                              <Tag className="h-2.5 w-2.5" />
                              <span>Offer Sent</span>
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60">
                            <Clock className="h-2.5 w-2.5 text-amber-400/70" />
                            <span>No Offer</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right whitespace-nowrap sticky right-0 z-10 bg-[#060b20] group-hover:bg-[#0c1538] shadow-[-10px_0_15px_rgba(4,8,26,0.95)] border-l border-slate-700/60 transition-colors">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openMessageModal(app)}
                            className="p-1.5 rounded-lg bg-[#081335] hover:bg-[#0e2158] border border-cyan-400/50 text-cyan-300 hover:text-white cursor-pointer transition-all"
                            title="Direct Message"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openReviewModal(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:brightness-110 text-white font-bold text-xs shadow-[0_0_12px_rgba(217,70,239,0.5)] cursor-pointer transition-all inline-flex items-center gap-1"
                            title="Review Dossier & Send Offer"
                          >
                            <FileText className="h-3 w-3 text-fuchsia-200" />
                            <span>Review</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingApp(app)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-white cursor-pointer transition-all"
                            title="Delete Merchant"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE & TABLET CARDS (< 1024px) */}
      <div className="block lg:hidden w-full max-w-full min-w-0 space-y-3.5">
        {applications.length === 0 ? (
          <div className="rounded-3xl bg-[#060b20]/90 border border-slate-700/60 p-8 text-center text-slate-400 text-xs w-full min-w-0">
            {loading ? 'Loading applications from database...' : 'No merchant applications found.'}
          </div>
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
              <div
                key={`mobile-${app._id}`}
                className="w-full min-w-0 overflow-hidden rounded-2xl bg-[#060b20]/95 border border-slate-700/80 p-3.5 sm:p-5 shadow-[0_0_15px_rgba(0,0,0,0.4)] space-y-3.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 via-[#0b183f] to-purple-950/80 border border-cyan-400/50 flex items-center justify-center font-black text-sm text-cyan-300 shrink-0">
                      {getInitials(app.legalName)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">
                        {app.legalName || 'Unnamed Entity'}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {app.refId && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyRefId(e, app.refId!)}
                            className="font-mono text-[9px] text-cyan-300/90 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <span>{app.refId}</span>
                            {copiedRefId === app.refId ? (
                              <Check className="h-2.5 w-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 opacity-60" />
                            )}
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400 capitalize">
                          {app.industry?.replace('-', ' ') || 'General Business'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {isUnderReview && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Under Review</span>
                      </span>
                    )}
                    {isApproved && app.accountMode === 'trial' && app.trial?.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/70">
                        <Clock className="h-3 w-3 text-cyan-400 animate-pulse" />
                        <span>24h Trial</span>
                      </span>
                    )}
                    {isApproved && app.accountMode === 'trial' && app.trial?.status === 'expired' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/70">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>Trial Expired</span>
                      </span>
                    )}
                    {isApproved && (app.accountMode === 'live' || !app.accountMode || app.trial?.status === 'converted') && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/70">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Live Active</span>
                      </span>
                    )}
                    {app.applicationStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-rose-300 bg-rose-500/15 border border-rose-400/70">
                        <X className="h-3 w-3 stroke-[2.5]" />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#091332]/60 border border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Contact</div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">{app.fullName || 'N/A'}</div>
                    <div className="text-[11px] text-cyan-400/80 truncate mt-0.5">{app.businessEmail}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Volume</div>
                    <div className="font-bold text-white mt-0.5">
                      {app.monthlyVolume === 'under-10k' ? '< $10k / mo' : (app.monthlyVolume?.replace('-', ' ') || 'Not Specified')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">KYC Verification</div>
                    <div className="mt-1">
                      {uploadedDocsCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(app, 'documents')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/50"
                        >
                          <FileCheck className="h-3 w-3 text-emerald-400" />
                          <span>{uploadedDocsCount}/3 Verified</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openReviewModal(app, 'documents')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-300/90 bg-amber-500/10 border border-amber-500/30"
                        >
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>Pending Docs</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Offer Status</div>
                    <div className="mt-1">
                      {app.offer?.isAvailable ? (
                        app.offer.accepted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/50">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                            <span>Accepted</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-400/50">
                            <Tag className="h-2.5 w-2.5" />
                            <span>Offer Sent</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400">No Offer Sent</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Actions Toolbar */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openMessageModal(app)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#09153a] hover:bg-[#0f215c] border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openReviewModal(app)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(217,70,239,0.5)]"
                  >
                    <FileText className="h-3.5 w-3.5 text-fuchsia-200" />
                    <span>Review & Offer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingApp(app)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-white cursor-pointer transition-all"
                    title="Delete Merchant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Review Modal */}
      <ApplicationReviewModal
        isOpen={Boolean(selectedApp)}
        app={selectedApp}
        initialTab={reviewInitialTab}
        onClose={() => setSelectedApp(null)}
        onOpenDocViewer={(doc) => setPreviewKycDoc(doc)}
        onOpenMessageModal={(app, defaultMsg) => openMessageModal(app, defaultMsg)}
        onDecision={handleDecision}
        onExtendTrial={handleExtendTrial}
        onConvertToLive={handleConvertToLive}
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
        offerSetupFee={offerSetupFee}
        setOfferSetupFee={setOfferSetupFee}
        offerMonthlyFee={offerMonthlyFee}
        setOfferMonthlyFee={setOfferMonthlyFee}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(previewKycDoc)}
        activeDoc={previewKycDoc}
        allDocs={previewKycDoc ? [previewKycDoc] : []}
        onClose={() => setPreviewKycDoc(null)}
      />

      {/* Real-Time Message Modal */}
      {messagingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#060b20] border border-cyan-400/50 shadow-[0_0_30px_rgba(0,240,255,0.25)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Message: {messagingApp.legalName || messagingApp.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMessagingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="h-48 overflow-y-auto space-y-2 p-3 rounded-2xl bg-[#030614] border border-cyan-500/10 text-xs">
              {loadingMessages ? (
                <div className="text-center text-slate-500 py-10 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Loading message thread...</span>
                </div>
              ) : messageHistory.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  No prior messages. Send a message to initiate communication.
                </div>
              ) : (
                messageHistory.map((m) => (
                  <div
                    key={m._id}
                    className={`p-2.5 rounded-xl max-w-[85%] ${
                      m.senderRole === 'admin' || m.senderRole === 'system'
                        ? 'ml-auto bg-purple-900/40 border border-purple-500/30 text-white'
                        : 'mr-auto bg-slate-800/60 border border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="text-[9px] font-mono opacity-70 mb-1">
                      {m.senderName || (m.senderRole === 'admin' ? 'Underwriter' : 'Merchant')}
                    </div>
                    <div>{m.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* Input & Send */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                placeholder="Type real-time message to merchant..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessageText.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#060b20] border border-rose-500/40 p-6 space-y-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Permanently Delete Merchant?</h3>
                <p className="text-[11px] text-slate-400">
                  This action is irreversible. All test data and settings will be permanently wiped.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">{deletingApp.legalName || deletingApp.fullName}</div>
              <div className="text-slate-400 font-mono text-[10px]">{deletingApp.businessEmail}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
