import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Loader2,
  AlertCircle,
  Building2,
  DollarSign,
    Sparkles,
        Receipt,
    } from 'lucide-react'
import {
  adminApi,
  getStoredSuperAdminToken,
  setStoredSuperAdminToken,
  removeStoredSuperAdminToken,
  type SuperAdminAnalytics,
} from '@/lib/adminApi'
import Logo from '@/components/brand/Logo'
import SuperAdminAnalyticsBar from '@/components/admin/SuperAdminAnalyticsBar'
import TransactionsTab from '@/components/admin/TransactionsTab'

export default function SuperAdminPage() {
  const [token, setToken] = useState<string | null>(() => getStoredSuperAdminToken())
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'resellers' | 'transactions'>('overview')

  // Super Admin Login Form State
  const [loginEmail, setLoginEmail] = useState('superadmin@pgxgateway.com')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)

  const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, desc, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchSuperAdminData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await adminApi.getSuperAdminAnalytics()
      if (res.data) {
        setAnalytics(res.data)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch Super Admin analytics'
      showToast('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchSuperAdminData()
  }, [fetchSuperAdminData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)

    try {
      const res = await adminApi.superAdminLogin({
        email: loginEmail,
        password: loginPassword,
      })

      if (res.token) {
        setToken(res.token)
        setStoredSuperAdminToken(res.token)
        showToast('Authenticated', 'Welcome back, Super Administrator.', 'success')
      } else {
        setLoginError('Authentication failed: No access token issued.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid Super Admin credentials'
      setLoginError(msg)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    removeStoredSuperAdminToken()
    setToken(null)
    showToast('Signed Out', 'Super Admin session terminated securely.', 'success')
  }

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#060b20]/95 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)] backdrop-blur-2xl relative animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-amber-500/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 mx-auto flex items-center justify-center text-black shadow-[0_0_25px_rgba(251,191,36,0.6)]">
              <ShieldCheck className="h-9 w-9 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Root Platform Control
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Super Admin Access Gate
              </h1>
            </div>
            <p className="text-xs text-slate-300">
              Master authorization for platform owner. Oversight of all resellers, merchants, and hardwired 9% fee revenue.
            </p>
          </div>

          {loginError && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mt-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Super Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Master Secret Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter Super Admin password"
                className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-black font-black text-xs shadow-[0_0_25px_rgba(251,191,36,0.6)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Verifying Master Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Authenticate Root Command Center</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-amber-500/15 text-center flex justify-between text-xs text-slate-400">
            <Link to="/" className="hover:text-amber-300 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Homepage
            </Link>
            <Link to="/admin" className="text-cyan-400 hover:underline">
              Switch to Reseller Portal
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // AUTHENTICATED COMMAND CENTER VIEW
  return (
    <div className="min-h-[calc(100vh-4.5rem)] max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#060c24]/95 border border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] backdrop-blur-xl animate-fade-in flex items-start gap-3 text-white text-xs max-w-sm">
          <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-sm text-amber-300">{toastMessage.title}</div>
            <div className="text-slate-300 text-xs mt-0.5">{toastMessage.desc}</div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="text-slate-600 font-light">/</span>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Super Admin Root Desk
              </div>
              <span className="text-xs text-slate-400">• Platform Master Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Multi-Tenant Oversight & 9% Platform Revenue
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="px-3.5 py-1.5 rounded-full border border-cyan-500/50 bg-[#070f28] text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title="Switch to Reseller Admin View"
          >
            <span>View Reseller Portal</span>
          </Link>

          <button
            type="button"
            onClick={fetchSuperAdminData}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full border border-amber-400/50 bg-[#0a1226] text-xs font-bold text-amber-300 hover:bg-amber-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
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

      {/* Top Super Admin Analytics Chamber */}
      <SuperAdminAnalyticsBar onRefresh={fetchSuperAdminData} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-amber-500/20 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.85)] border border-amber-300 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Platform 9% Revenue Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resellers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'resellers'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.85)] border border-amber-300 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Connected Resellers & Tenants</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-white">
            {analytics?.resellers?.length || 1}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.85)] border border-amber-300 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Global Master Ledger</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & 9% AUDIT */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Revenue Forecast Matrix */}
          <div className="p-6 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Super Admin Commission Matrix (Hardwired 9.0%)
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-300 bg-amber-950/70 border border-amber-500/40 px-3 py-1 rounded-full font-bold">
                Platform Cut: 9.0% Exact
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Your 9% platform commission is automatically calculated on every transaction routed through your resellers' Stripe gateways. Below is your projected gross income at various monthly volume thresholds:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { volume: 100000, label: '$100,000 Volume' },
                { volume: 250000, label: '$250,000 Volume' },
                { volume: 500000, label: '$500,000 Volume' },
                { volume: 750000, label: '$750,000 Client Goal', highlight: true },
              ].map((tier) => {
                const superAdminEarnings = tier.volume * 0.09
                const resellerEarnings = tier.volume * 0.03 // based on 12% - 9%

                return (
                  <div
                    key={tier.volume}
                    className={`p-4 rounded-2xl border ${
                      tier.highlight
                        ? 'bg-gradient-to-b from-amber-950/60 to-[#07102e] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                        : 'bg-[#060c24] border-slate-700/60'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase text-slate-400 flex justify-between">
                      <span>{tier.label}</span>
                      {tier.highlight && <span className="text-amber-300">★ Target</span>}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
                      ${superAdminEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Your 9% Cut / Month
                    </div>
                    <div className="text-[10px] text-fuchsia-300 font-semibold border-t border-slate-700/60 pt-1.5 mt-2">
                      Reseller Profit: ${resellerEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONNECTED RESELLERS */}
      {activeTab === 'resellers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tenant Resellers & Connected Stripe Accounts
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-300">
                1 Active Tenant Managed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-[#09153d]/50 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Tenant / Reseller ID</th>
                    <th className="p-4">Stripe Gateway State</th>
                    <th className="p-4">Merchant Fee Rate</th>
                    <th className="p-4 text-amber-300">Super Admin Cut</th>
                    <th className="p-4 text-fuchsia-300">Reseller Margin</th>
                    <th className="p-4 text-right">Volume Processed</th>
                    <th className="p-4 text-right text-amber-300">Platform Fees Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/15">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      admin_root (Client Gateway)
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80">
                        Linked & Active
                      </span>
                    </td>
                    <td className="p-4 font-bold text-cyan-300 font-mono">
                      12.0%
                    </td>
                    <td className="p-4 font-bold text-amber-300 font-mono">
                      9.0% (Hardwired)
                    </td>
                    <td className="p-4 font-bold text-fuchsia-300 font-mono">
                      3.0% Spread
                    </td>
                    <td className="p-4 text-right font-black text-white font-mono">
                      ${analytics?.totalGrossVolume.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4 text-right font-black text-amber-300 font-mono">
                      ${analytics?.totalPlatformFees.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL MASTER TRANSACTION LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-fade-in">
          <TransactionsTab onShowToast={showToast} />
        </div>
      )}
    </div>
  )
}
