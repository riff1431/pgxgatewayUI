import { useState, useEffect, useCallback } from 'react'
import {
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
  AlertCircle
} from 'lucide-react'
import {
  adminApi,
  getStoredAdminToken,
  removeStoredAdminToken,
  type AdminStats,
  type ApplicationItem,
} from '@/lib/adminApi'
import Logo from '@/components/brand/Logo'

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

  // If not authenticated as Admin, show login screen
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 relative">
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
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
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

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => openReviewModal(app)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_12px_rgba(217,70,239,0.6)] hover:shadow-[0_0_18px_rgba(217,70,239,0.85)] cursor-pointer transition-all"
                        >
                          Review & Decision
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
            <div className="space-y-2 pt-2 border-t border-cyan-500/20">
              <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-4 w-4" />
                <span>Customize Processing Offer Terms</span>
              </span>

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
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleDecision('rejected')}
                className="px-5 py-2.5 rounded-full border border-red-500/70 bg-red-500/10 text-red-300 font-bold text-xs hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
              >
                Decline Application
              </button>

              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleDecision('approved')}
                className="px-7 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:shadow-[0_0_28px_rgba(16,185,129,0.9)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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

    </div>
  )
}
