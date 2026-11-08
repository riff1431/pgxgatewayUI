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
  Landmark,
  Receipt,
  UserPlus,
  Copy,
  Check,
  Ban,
  KeyRound,
  X,
  CheckCircle2,
  Palette,
  Users,
  Search,
  ArrowRightLeft,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  adminApi,
  getStoredSuperAdminToken,
  setStoredSuperAdminToken,
  removeStoredSuperAdminToken,
  type SuperAdminAnalytics,
  type ResellerTenant,
  type ApplicationItem,
} from '@/lib/adminApi'
import BrandingTab from '@/components/admin/BrandingTab'
import Logo from '@/components/brand/Logo'
import SuperAdminAnalyticsBar from '@/components/admin/SuperAdminAnalyticsBar'
import TransactionsTab from '@/components/admin/TransactionsTab'

export default function SuperAdminPage() {
  const [token, setToken] = useState<string | null>(() => getStoredSuperAdminToken())
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'resellers' | 'merchants' | 'branding' | 'transactions'>('overview')

  // Super Admin Merchant Routing State
  const [superMerchants, setSuperMerchants] = useState<ApplicationItem[]>([])
  const [superMerchantsLoading, setSuperMerchantsLoading] = useState(false)
  const [reassigningMerchantId, setReassigningMerchantId] = useState<string | null>(null)
  const [selectedTargetResellers, setSelectedTargetResellers] = useState<Record<string, string>>({})
  const [merchantSearch, setMerchantSearch] = useState('')

  // Resellers Management State
  const [resellersList, setResellersList] = useState<ResellerTenant[]>([])
  const [resellersLoading, setResellersLoading] = useState(false)
  const [showProvisionModal, setShowProvisionModal] = useState(false)

  // Provision Form State
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formFeeRate, setFormFeeRate] = useState(12.0)
  const [formPayoutTerms, setFormPayoutTerms] = useState('Weekly Wire / Crypto Transfer')
  const [provisionLoading, setProvisionLoading] = useState(false)
  const [provisionError, setProvisionError] = useState<string | null>(null)

  // Newly Provisioned / Reset Credentials Card Banner
  const [provisionedReceipt, setProvisionedReceipt] = useState<{
    name: string
    email: string
    password: string
    resellerId: string
    feeRate: number
    title?: string
  } | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // View Credentials / Access Vault Modal State
  const [viewAccessReseller, setViewAccessReseller] = useState<ResellerTenant | null>(null)

  // Reset Password Modal State
  const [resetModalReseller, setResetModalReseller] = useState<ResellerTenant | null>(null)
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // Super Admin Login Form State
  const [loginEmail, setLoginEmail] = useState('superadmin@pgxgateway.com')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)

  const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, desc, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  useEffect(() => {
    const handleAuthFailed = () => {
      setToken(null)
      setAnalytics(null)
      setLoginPassword('')
      showToast('Session Expired', 'Super Admin session expired. Please sign in again.', 'error')
    }
    window.addEventListener('pgx_superadmin_auth_failed', handleAuthFailed)
    return () => window.removeEventListener('pgx_superadmin_auth_failed', handleAuthFailed)
  }, [])

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

  const fetchResellers = useCallback(async () => {
    if (!token) return
    setResellersLoading(true)
    try {
      const res = await adminApi.getSuperAdminResellersList()
      if (res.data) {
        setResellersList(res.data)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load resellers list'
      showToast('Error', msg, 'error')
    } finally {
      setResellersLoading(false)
    }
  }, [token])

  const fetchSuperMerchants = useCallback(async () => {
    setSuperMerchantsLoading(true)
    try {
      const res = await adminApi.getApplications()
      if (res.data) setSuperMerchants(res.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch merchants'
      showToast('Error', msg, 'error')
    } finally {
      setSuperMerchantsLoading(false)
    }
  }, [])

  const handleReassignMerchant = async (merchantId: string) => {
    const targetResellerId = selectedTargetResellers[merchantId]
    if (!targetResellerId) {
      showToast('Select Reseller', 'Please select a destination reseller tenant.', 'error')
      return
    }
    setReassigningMerchantId(merchantId)
    try {
      await adminApi.reassignMerchantReseller(merchantId, targetResellerId)
      showToast(
        'Merchant Reassigned',
        `Merchant transferred to ${targetResellerId === 'admin_root' ? 'Primary Root Gateway' : targetResellerId}`,
        'success'
      )
      await fetchSuperMerchants()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reassignment failed'
      showToast('Transfer Error', msg, 'error')
    } finally {
      setReassigningMerchantId(null)
    }
  }

  useEffect(() => {
    fetchSuperAdminData()
    if (activeTab === 'resellers') {
      fetchResellers()
    }
    if (activeTab === 'merchants') {
      fetchSuperMerchants()
      fetchResellers()
    }
  }, [fetchSuperAdminData, fetchResellers, fetchSuperMerchants, activeTab])

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
    setAnalytics(null)
    setLoginPassword('')
    showToast('Signed Out', 'Super Admin session terminated securely.', 'success')
  }

  // Password generator helper
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pwd
  }

  const handleOpenProvisionModal = () => {
    setFormName('')
    setFormEmail('')
    setFormPassword(generateStrongPassword())
    setFormFeeRate(12.0)
    setFormPayoutTerms('Weekly Wire / Crypto Transfer')
    setProvisionError(null)
    setShowProvisionModal(true)
  }

  const handleProvisionReseller = async (e: React.FormEvent) => {
    e.preventDefault()
    setProvisionError(null)

    if (formFeeRate < 9.0) {
      setProvisionError('Merchant fee rate cannot be set lower than 9.0% Super Admin base fee.')
      return
    }

    setProvisionLoading(true)
    try {
      const res = await adminApi.createResellerTenant({
        name: formName,
        email: formEmail,
        password: formPassword,
        merchantFeeRate: formFeeRate,
        payoutTerms: formPayoutTerms,
      })

      if (res.data) {
        setProvisionedReceipt({
          name: formName,
          email: formEmail,
          password: formPassword,
          resellerId: res.data.resellerId,
          feeRate: formFeeRate,
          title: 'New Reseller Provisioned Successfully!',
        })
        setShowProvisionModal(false)
        fetchResellers()
        fetchSuperAdminData()
        showToast('Reseller Provisioned', `${formName} tenant created successfully.`, 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to provision reseller tenant'
      setProvisionError(msg)
    } finally {
      setProvisionLoading(false)
    }
  }

  const handleToggleStatus = async (reseller: ResellerTenant) => {
    const newStatus = reseller.status === 'active' ? 'suspended' : 'active'
    try {
      await adminApi.updateResellerStatus(reseller.resellerId, newStatus)
      showToast(
        'Status Updated',
        `Reseller ${reseller.name} is now ${newStatus}.`,
        newStatus === 'active' ? 'success' : 'error'
      )
      fetchResellers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update reseller status'
      showToast('Error', msg, 'error')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModalReseller || !resetNewPassword) return

    setResetLoading(true)
    try {
      await adminApi.resetResellerPassword(resetModalReseller.resellerId, resetNewPassword)
      
      // Update top banner receipt so Super Admin can immediately copy the new credentials
      setProvisionedReceipt({
        name: resetModalReseller.name,
        email: resetModalReseller.email,
        password: resetNewPassword,
        resellerId: resetModalReseller.resellerId,
        feeRate: resetModalReseller.feeSettings?.merchantFeeRate || 12.0,
        title: `Password Reset for ${resetModalReseller.name}`,
      })

      showToast(
        'Password Reset',
        `Password updated for ${resetModalReseller.name}. Credentials card updated above.`,
        'success'
      )
      setResetModalReseller(null)
      setResetNewPassword('')
      if (viewAccessReseller) {
        setViewAccessReseller(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password'
      showToast('Error', msg, 'error')
    } finally {
      setResetLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
    showToast('Copied', 'Copied to clipboard.', 'success')
  }

  // Copy Complete Client Invite Text
  const handleCopyResellerInvite = (reseller: ResellerTenant) => {
    const rate = reseller.feeSettings?.merchantFeeRate || 12.0
    const msg = `PGX Gateway Reseller Portal Credentials:
Portal URL: ${window.location.origin}/admin
Company / Partner: ${reseller.name}
Login Email: ${reseller.email}
Reseller ID: ${reseller.resellerId}
Assigned Fee Rate: ${rate}%
Status: ${reseller.status.toUpperCase()}`

    copyToClipboard(msg, `invite_${reseller.resellerId}`)
    showToast('Copied', `Login invite details for ${reseller.name} copied!`, 'success')
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
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl pl-3.5 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Verifying Master Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-black stroke-[2.5]" />
                  <span>Authorize Super Admin Session</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              to="/admin"
              className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Looking for Reseller Portal? Go to /admin</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // AUTHENTICATED SUPER ADMIN COMMAND CENTER
  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 pt-4 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-slide-up text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <div>
            <div className="font-bold">{toastMessage.title}</div>
            <div className="text-[11px] opacity-80">{toastMessage.desc}</div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#060b20]/90 border border-amber-400/40 backdrop-blur-2xl shadow-[0_0_30px_rgba(251,191,36,0.15)]">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="h-8 w-px bg-amber-500/20" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/80 text-amber-300 text-xs font-mono font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>SUPER ADMIN COMMAND CENTER</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchSuperAdminData()
              if (activeTab === 'resellers') fetchResellers()
              if (activeTab === 'merchants') {
                fetchSuperMerchants()
                fetchResellers()
              }
              showToast('Refreshed', 'Telemetry synced.', 'success')
            }}
            disabled={loading || resellersLoading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`h-4 w-4 ${loading || resellersLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </header>

      {/* Super Admin Platform Telemetry Hero Bar */}
      <SuperAdminAnalyticsBar
        onRefresh={() => {
          fetchSuperAdminData()
          fetchResellers()
        }}
      />

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
            {resellersList.length || analytics?.resellers?.length || 1}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('merchants')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'merchants'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.85)] border border-amber-300 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Merchant Routing & Tenants</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-white">
            {superMerchants.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.85)] border border-amber-300 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>White-Label & System Branding</span>
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
                <Landmark className="h-5 w-5 text-amber-400" />
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
                const resellerEarnings = tier.volume * 0.03

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
          {/* Credentials Card Banner (Appears on Provisioning or Password Reset) */}
          {provisionedReceipt && (
            <div className="p-6 rounded-3xl bg-emerald-950/50 border-2 border-emerald-400/90 shadow-[0_0_35px_rgba(52,211,153,0.35)] backdrop-blur-xl space-y-4 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {provisionedReceipt.title || 'Client Administrative Credentials Ready'}
                    </h3>
                    <p className="text-[11px] text-emerald-300">
                      Copy and forward these access credentials to your reseller client.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProvisionedReceipt(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/30">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Company / Partner</div>
                  <div className="font-bold text-white font-mono mt-0.5 truncate">{provisionedReceipt.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{provisionedReceipt.resellerId}</div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/30">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Login Email</div>
                  <div className="font-bold text-emerald-300 font-mono mt-0.5 truncate">{provisionedReceipt.email}</div>
                  <div className="text-[10px] text-slate-400">Portal: /admin</div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/30">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Password</div>
                  <div className="font-bold text-amber-300 font-mono mt-0.5 truncate">{provisionedReceipt.password}</div>
                  <div className="text-[10px] text-slate-400">Client can change in /admin</div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/30 flex flex-col justify-center">
                  <button
                    onClick={() => {
                      const msg = `PGX Gateway Reseller Portal Credentials:\nPortal URL: ${window.location.origin}/admin\nCompany: ${provisionedReceipt.name}\nLogin Email: ${provisionedReceipt.email}\nInitial Password: ${provisionedReceipt.password}\nAssigned Fee Rate: ${provisionedReceipt.feeRate}%`
                      copyToClipboard(msg, 'receipt_full')
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all text-xs"
                  >
                    {copiedKey === 'receipt_full' ? (
                      <>
                        <Check className="h-4 w-4 text-black" />
                        <span>Copied All Details!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-black" />
                        <span>Copy Client Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resellers Table Container */}
          <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Provisioned Reseller Tenants & Connected Stripe Accounts
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Each reseller operates their isolated Stripe gateway with independent sub-merchants. Scroll horizontally if needed.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenProvisionModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs shadow-[0_0_20px_rgba(251,191,36,0.6)] cursor-pointer transition-all"
              >
                <UserPlus className="h-4 w-4 stroke-[2.5]" />
                <span>Provision New Reseller</span>
              </button>
            </div>

            {/* Responsive Table Wrapper with Horizontal Scrollbar */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
              <table className="w-full text-left text-xs border-collapse min-w-[1150px]">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-[#09153d]/70 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Partner / Company</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Login Email</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Stripe Gateway</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px]">Merchant Fee Rate</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px] text-amber-300">Super Admin (9%)</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[120px] text-fuchsia-300">Reseller Margin</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px] text-right">Volume</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[120px] text-right text-amber-300">9% Fees Earned</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[100px] text-center">Status</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/15">
                  {resellersList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">
                        {resellersLoading ? 'Loading provisioned resellers...' : 'No resellers found.'}
                      </td>
                    </tr>
                  ) : (
                    resellersList.map((reseller) => {
                      const rate = reseller.feeSettings?.merchantFeeRate || 12.0
                      const margin = (rate - 9.0).toFixed(1)
                      const isRoot = reseller.resellerId === 'admin_root'

                      return (
                        <tr key={reseller.resellerId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-white">
                            <div className="font-sans font-bold">{reseller.name || 'Unnamed Partner'}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">{reseller.resellerId}</div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-300">
                            {reseller.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {reseller.stripe?.isConfigured ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-sm whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <span>Linked ({reseller.stripe.mode?.toUpperCase() || 'TEST'})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-400/60 shadow-sm whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>Pending Keys</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-bold text-cyan-300 font-mono">
                            {rate.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-bold text-amber-300 font-mono">
                            9.0% <span className="text-[10px] text-amber-400/80 font-normal">(Hardwired)</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-bold text-fuchsia-300 font-mono">
                            +{margin}% Spread
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-white font-mono">
                            ${(reseller.totalVolumeProcessed || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-amber-300 font-mono">
                            ${(reseller.totalPlatformFeesEarned || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                reseller.status === 'active'
                                  ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/80'
                                  : 'text-red-300 bg-red-500/10 border border-red-400/80'
                              }`}
                            >
                              {reseller.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Copy Client Login Invite */}
                              <button
                                type="button"
                                onClick={() => handleCopyResellerInvite(reseller)}
                                title="Copy Client Login Info & Portal Link"
                                className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 transition-all cursor-pointer shadow-sm"
                              >
                                {copiedKey === `invite_${reseller.resellerId}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-emerald-300" />
                                )}
                              </button>

                              {/* 2. View Complete Credentials Vault */}
                              <button
                                type="button"
                                onClick={() => setViewAccessReseller(reseller)}
                                title="View Full Credentials & Invite Vault"
                                className="p-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/50 text-cyan-300 transition-all cursor-pointer shadow-sm"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                              </button>

                              {!isRoot && (
                                <>
                                  {/* 3. Reset Password */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setResetModalReseller(reseller)
                                      setResetNewPassword(generateStrongPassword())
                                    }}
                                    title="Reset Password"
                                    className="p-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/50 text-amber-300 transition-all cursor-pointer shadow-sm"
                                  >
                                    <KeyRound className="h-3.5 w-3.5" />
                                  </button>

                                  {/* 4. Suspend / Activate Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(reseller)}
                                    title={reseller.status === 'active' ? 'Suspend Reseller' : 'Activate Reseller'}
                                    className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer shadow-sm ${
                                      reseller.status === 'active'
                                        ? 'bg-red-950/50 border-red-500/50 text-red-300 hover:bg-red-900/70'
                                        : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/70'
                                    }`}
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
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
        </div>
      )}

      {/* TAB 3: SUB-MERCHANT ROUTING & TENANT REASSIGNMENT DESK */}
      {activeTab === 'merchants' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] backdrop-blur-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Platform Sub-Merchant Tenant Routing Desk
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Audit and reassign sub-merchants to any reseller tenant node. Direct organic registrations default to Root.
                  </p>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={merchantSearch}
                  onChange={(e) => setMerchantSearch(e.target.value)}
                  placeholder="Search business, email..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-[#09153d]/70 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Merchant / Company</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Contact Email</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[170px]">Current Tenant Reseller</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px] text-center">Status</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px]">Joined Date</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[240px] text-right">Transfer Tenant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/15">
                  {superMerchants
                    .filter((m) => {
                      if (!merchantSearch) return true
                      const q = merchantSearch.toLowerCase()
                      return (
                        m.legalName?.toLowerCase().includes(q) ||
                        m.fullName?.toLowerCase().includes(q) ||
                        m.businessEmail?.toLowerCase().includes(q) ||
                        m.resellerId?.toLowerCase().includes(q)
                      )
                    })
                    .length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        {superMerchantsLoading ? 'Loading merchants across all tenants...' : 'No merchants found matching your query.'}
                      </td>
                    </tr>
                  ) : (
                    superMerchants
                      .filter((m) => {
                        if (!merchantSearch) return true
                        const q = merchantSearch.toLowerCase()
                        return (
                          m.legalName?.toLowerCase().includes(q) ||
                          m.fullName?.toLowerCase().includes(q) ||
                          m.businessEmail?.toLowerCase().includes(q) ||
                          m.resellerId?.toLowerCase().includes(q)
                        )
                      })
                      .map((merchant) => {
                        const currentResellerId = merchant.resellerId || 'admin_root'
                        const targetId = selectedTargetResellers[merchant._id] || currentResellerId
                        const isChanging = targetId !== currentResellerId
                        const isReassigning = reassigningMerchantId === merchant._id

                        return (
                          <tr key={merchant._id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="font-bold text-white text-sm">{merchant.legalName || merchant.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Ref: {merchant.refId || merchant._id.slice(-8)}</div>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-300">
                              <div>{merchant.businessEmail}</div>
                              <div className="text-[10px] text-slate-400 font-sans">{merchant.phone}</div>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                                currentResellerId === 'admin_root'
                                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/50'
                                  : 'bg-purple-500/10 text-purple-300 border border-purple-400/50'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                <span>{currentResellerId === 'admin_root' ? 'Primary Root (admin_root)' : currentResellerId}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                merchant.applicationStatus === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/60'
                                  : merchant.applicationStatus === 'rejected'
                                  ? 'bg-red-500/10 text-red-300 border border-red-400/60'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-400/60'
                              }`}>
                                {merchant.applicationStatus === 'approved' ? 'Approved' : merchant.applicationStatus === 'rejected' ? 'Rejected' : 'Under Review'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                              {merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={targetId}
                                  onChange={(e) => setSelectedTargetResellers((prev) => ({ ...prev, [merchant._id]: e.target.value }))}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                                >
                                  <option value="admin_root">Primary Root (admin_root)</option>
                                  {resellersList
                                    .filter((r) => r.resellerId !== 'admin_root')
                                    .map((r) => (
                                      <option key={r.resellerId} value={r.resellerId}>
                                        {r.name} ({r.resellerId})
                                      </option>
                                    ))}
                                </select>

                                <button
                                  type="button"
                                  disabled={!isChanging || isReassigning}
                                  onClick={() => handleReassignMerchant(merchant._id)}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                                    isChanging
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)] hover:brightness-110'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                                  }`}
                                >
                                  {isReassigning ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <ArrowRightLeft className="h-3 w-3" />
                                  )}
                                  <span>Transfer</span>
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
        </div>
      )}

      {/* TAB 4: WHITE-LABEL & SYSTEM BRANDING SETTINGS */}
      {activeTab === 'branding' && (
        <div className="space-y-6 animate-fade-in">
          <BrandingTab onShowToast={showToast} />
        </div>
      )}

      {/* TAB 3: GLOBAL MASTER TRANSACTION LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-fade-in">
          <TransactionsTab onShowToast={showToast} isSuperAdmin={true} />
        </div>
      )}

      {/* MODAL 1: VIEW RESELLER ACCESS VAULT */}
      {viewAccessReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#060b20] border-2 border-cyan-400/80 shadow-[0_0_50px_rgba(0,240,255,0.3)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Reseller Access & Credentials Vault
                </h3>
              </div>
              <button
                onClick={() => setViewAccessReseller(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Complete administrative access information for <strong className="text-white">{viewAccessReseller.name}</strong>.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Portal URL */}
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Portal Login URL</div>
                  <div className="font-mono text-cyan-300 font-bold mt-0.5">{window.location.origin}/admin</div>
                </div>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/admin`, 'vault_url')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'vault_url' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
              </div>

              {/* Login Email */}
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Login Email</div>
                  <div className="font-mono text-white font-bold mt-0.5">{viewAccessReseller.email || 'N/A'}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(viewAccessReseller.email || '', 'vault_email')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'vault_email' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
              </div>

              {/* Tenant ID */}
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tenant / Reseller ID</div>
                  <div className="font-mono text-amber-300 font-bold mt-0.5">{viewAccessReseller.resellerId}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(viewAccessReseller.resellerId, 'vault_id')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'vault_id' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
              </div>

              {/* Fee Structure */}
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-700/60 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Merchant Rate</div>
                  <div className="font-mono text-cyan-300 font-bold mt-0.5">
                    {(viewAccessReseller.feeSettings?.merchantFeeRate || 12).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Platform Split</div>
                  <div className="font-mono text-amber-300 font-bold mt-0.5">
                    9.0% Admin / +{((viewAccessReseller.feeSettings?.merchantFeeRate || 12) - 9).toFixed(1)}% Reseller
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyResellerInvite(viewAccessReseller)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 text-xs"
              >
                <Copy className="h-4 w-4 text-black" />
                <span>Copy Full Client Invitation</span>
              </button>

              {viewAccessReseller.resellerId !== 'admin_root' && (
                <button
                  type="button"
                  onClick={() => {
                    setResetModalReseller(viewAccessReseller)
                    setResetNewPassword(generateStrongPassword())
                  }}
                  className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <KeyRound className="h-4 w-4 text-black" />
                  <span>Generate New Password</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROVISION NEW RESELLER MODAL */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#060b20] border-2 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Provision New Reseller / Tenant
                </h3>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {provisionError && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{provisionError}</span>
              </div>
            )}

            <form onSubmit={handleProvisionReseller} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Company / Partner Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Apex Global Payments"
                  className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Business Login Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. admin@apexpayments.com"
                  className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Initial Password</label>
                  <button
                    type="button"
                    onClick={() => setFormPassword(generateStrongPassword())}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-amber-500/20">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-white">Merchant Fee Rate: {formFeeRate.toFixed(1)}%</span>
                  <span className="text-amber-400 font-mono">Floor: 9.0% (Hardwired)</span>
                </div>
                <input
                  type="range"
                  min="9.0"
                  max="25.0"
                  step="0.5"
                  value={formFeeRate}
                  onChange={(e) => setFormFeeRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>9.0% Platform Base</span>
                  <span className="text-fuchsia-300 font-bold">
                    Reseller Markup Spread: +{(formFeeRate - 9.0).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Settlement / Payout Terms</label>
                <input
                  type="text"
                  value={formPayoutTerms}
                  onChange={(e) => setFormPayoutTerms(e.target.value)}
                  placeholder="e.g. Weekly Wire / USDT Transfer"
                  className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {provisionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-black stroke-[2.5]" />
                      <span>Confirm & Provision</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD MODAL */}
      {resetModalReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#060b20] border-2 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Reset Reseller Password
                </h3>
              </div>
              <button
                onClick={() => setResetModalReseller(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Assign a new administrative password for <strong className="text-white">{resetModalReseller.name}</strong> ({resetModalReseller.email}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">New Password</label>
                  <button
                    type="button"
                    onClick={() => setResetNewPassword(generateStrongPassword())}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-[#05091d] border border-amber-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalReseller(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
