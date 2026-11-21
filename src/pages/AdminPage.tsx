import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Menu,
} from 'lucide-react'
import {
  adminApi,
  getStoredAdminToken,
  removeStoredAdminToken,
  getStoredAdminUser,
  type AdminUserInfo,
  type AdminStats,
  type ApplicationItem,
} from '@/lib/adminApi'
import Logo from '@/components/brand/Logo'
import ResellerAffiliateTab from '@/components/admin/ResellerAffiliateTab'
import ResellerSidebar, { type ResellerSectionId } from '@/components/admin/ResellerSidebar'
import TransactionsTab from '@/components/admin/TransactionsTab'
import UnderwritingDesk from '@/components/admin/UnderwritingDesk'
import ReviewsModerationTab from '@/components/admin/ReviewsModerationTab'

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

  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(() => getStoredAdminUser())
  const [adminSection, setAdminSection] = useState<ResellerSectionId>(() => {
    const path = window.location.pathname.toLowerCase()
    if (path.includes('transaction')) return 'transactions'
    if (path.includes('stripe')) return 'stripe'
    return 'applications'
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0)

  const isSuperAdminUser =
    adminUser?.role === 'super_admin' ||
    getStoredAdminUser()?.role === 'super_admin' ||
    adminUser?.resellerId === 'admin_root' ||
    getStoredAdminUser()?.resellerId === 'admin_root'
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
        adminApi.getApplications(),
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin data'
      showToast('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    let isSubscribed = true
    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const [statsRes, appsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getApplications(),
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
  }, [token])

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
            <span>Back to Gateway</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <span className="text-[11px] font-mono text-cyan-300 tracking-wider uppercase font-bold">Reseller Portal</span>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-md rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.35)] p-8 backdrop-blur-2xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <ShieldCheck className="h-8 w-8 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Partner Underwriting Desk</h1>
              <p className="text-xs text-slate-400 mt-1">Sign in with your admin credentials to access your merchant portfolio.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@pgxgateway.com"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-400 py-3 text-xs font-black text-slate-950 uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-slate-950" />
                  <span>Access Underwriting Desk</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030614] text-white p-3 sm:p-5 lg:p-7 relative select-none">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl ${
              toastMessage.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : 'bg-[#060b20]/90 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(0,240,255,0.4)]'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            ) : (
              <Check className="h-5 w-5 text-cyan-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold text-white">{toastMessage.title}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{toastMessage.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Session Top Banner */}
      {isSuperAdminUser && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#0d163a] to-amber-950/80 border border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 tracking-wide">
                Super Administrator Session • Root Underwriting Desk
              </div>
              <div className="text-[10px] text-slate-400">
                Logged in under Master Controller permissions. Full access to direct PGX & partner merchants.
              </div>
            </div>
          </div>
          <Link
            to="/super-admin"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(251,191,36,0.4)] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Super Admin Tower</span>
          </Link>
        </div>
      )}

      {/* Mobile Header Bar */}
      <div className="block lg:hidden mb-4">
        <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo className="h-6 w-auto" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Underwriting Desk</div>
              <div className="text-[10px] font-mono text-cyan-300 truncate">
                {adminUser?.email || 'admin_root'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-4">
          <ResellerSidebar
            activeSection={adminSection}
            onSectionChange={setAdminSection}
            adminUser={adminUser}
            resellerId={resellerId}
            pendingCount={stats.pendingReview}
            totalMerchants={stats.totalMerchants}
            pendingReviewsCount={pendingReviewsCount}
            referralLink={referralLink}
            copiedReferral={copiedReferral}
            onCopyReferral={handleCopyReferralLink}
            onRefresh={fetchData}
            onLogout={handleLogout}
            isRefreshing={loading}
            mobileOpen={mobileSidebarOpen}
            onMobileOpenChange={setMobileSidebarOpen}
          />
        </div>

        {/* Content Workspace */}
        <div className="flex-1 w-full max-w-full min-w-0 space-y-5">
          {/* Referral Banner */}
          <div className="p-3.5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <LinkIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white">Your Gateway Referral Link</div>
                <div className="text-[10px] font-mono text-cyan-400 truncate">{referralLink}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyReferralLink}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all shrink-0"
            >
              {copiedReferral ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedReferral ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* SECTION 1: APPLICATIONS & UNDERWRITING */}
          {adminSection === 'applications' && (
            <UnderwritingDesk
              isSuperAdmin={isSuperAdminUser}
              onShowToast={showToast}
              onStatsChange={(newStats) => setStats(newStats)}
            />
          )}

          {/* SECTION 2: AFFILIATE & COMMISSIONS PROGRAM */}
          {adminSection === 'stripe' && (
            <ResellerAffiliateTab
              resellerId={resellerId}
              applications={applications}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 3: REAL-TIME TRANSACTION LEDGER */}
          {adminSection === 'transactions' && (
            <TransactionsTab onShowToast={showToast} isSuperAdmin={false} />
          )}

          {/* SECTION 4: MERCHANT REVIEWS & TESTIMONIAL MODERATION */}
          {adminSection === 'reviews' && (
            <ReviewsModerationTab
              onPendingCountChange={setPendingReviewsCount}
              showToast={showToast}
            />
          )}
        </div>
      </div>
    </div>
  )
}
