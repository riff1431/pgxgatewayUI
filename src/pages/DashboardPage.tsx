import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Code2, Sparkles, AlertTriangle, CheckCircle2, X, ShieldCheck, Clock } from 'lucide-react'
import ApplicationStatusCard from '@/components/dashboard/ApplicationStatusCard'
import ProcessingOfferCard from '@/components/dashboard/ProcessingOfferCard'
import QuickActions from '@/components/dashboard/QuickActions'
import Sidebar from '@/components/dashboard/Sidebar'
import HologramCard from '@/components/brand/HologramCard'
import SetupPaymentModal from '@/components/dashboard/SetupPaymentModal'
import MonthlyMaintenanceModal from '@/components/dashboard/MonthlyMaintenanceModal'
import { useAuth } from '@/context/AuthContext'

// Dedicated Tab Views
import ApplicationTab from '@/components/dashboard/tabs/ApplicationTab'
import DocumentsTab from '@/components/dashboard/tabs/DocumentsTab'
import MessagesTab from '@/components/dashboard/tabs/MessagesTab'
import OfferTab from '@/components/dashboard/tabs/OfferTab'
import SettingsTab from '@/components/dashboard/tabs/SettingsTab'
import IntegrationTab from '@/components/dashboard/tabs/IntegrationTab'
import InvoicesTab from '@/components/dashboard/tabs/InvoicesTab'
import MerchantTransactionsTab from '@/components/dashboard/tabs/MerchantTransactionsTab'
import PaymentLinksTab from '@/components/dashboard/tabs/PaymentLinksTab'

export default function DashboardPage() {
  const { merchant } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const displayName = merchant?.fullName ? merchant.fullName.split(' ')[0] : 'Merchant'

  // Derive active tab from searchParams (default: 'dashboard')
  const validTabs = ['dashboard', 'transactions', 'payment-links', 'integration', 'invoices', 'application', 'documents', 'messages', 'offer', 'settings']
  const tabParam = searchParams.get('tab') || 'dashboard'
  const activeTab = validTabs.includes(tabParam) ? tabParam : 'dashboard'

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab })
  }

  // Setup Payment Modal State
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)

  // 30-Day Monthly Maintenance Modal State & Auto Pop-up
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false)
  const isLive = merchant?.accountMode === 'live'
  const monthlyDueAt = merchant?.arxopayWholesale?.monthlyMaintenance?.nextDueAt
    ? new Date(merchant.arxopayWholesale.monthlyMaintenance.nextDueAt)
    : null
  const maintenanceStatus = merchant?.arxopayWholesale?.monthlyMaintenance?.status
  const isMonthlyDue = Boolean(
    isLive &&
      (maintenanceStatus === 'due' || (monthlyDueAt && Date.now() >= monthlyDueAt.getTime()))
  )

  useEffect(() => {
    if (isMonthlyDue && maintenanceStatus !== 'pending_verification') {
      setIsMonthlyModalOpen(true)
    }
  }, [isMonthlyDue, maintenanceStatus])

  // 24-Hour Trial Status & Dynamic Countdown
  const isArxo = merchant?.resellerId === 'ARXO' || merchant?.resellerId === 'arxopay' || merchant?.refId?.startsWith('ARXO-')
  const tier = merchant?.tier || (merchant?.offer?.rate?.includes('15') || merchant?.offer?.setupFee?.includes('2500') ? 2 : 1)
  const defaultSetupFee = isArxo ? (tier === 2 ? '$2,500' : '$1,499') : '$999'
  const setupFeeNum = isArxo ? (tier === 2 ? 2500 : 1499) : 999
  const setupFeeFormatted = merchant?.offer?.setupFee || defaultSetupFee
  const trialExpiresAt = merchant?.trial?.expiresAt ? new Date(merchant.trial.expiresAt) : null
  const isTrialTurnedOn = Boolean(
    merchant?.accountMode === 'trial' &&
    merchant?.trial?.isActive &&
    merchant?.trial?.status === 'active' &&
    trialExpiresAt
  )
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
    isExpired: Boolean(merchant?.trial?.status === 'expired' || (trialExpiresAt && Date.now() > trialExpiresAt.getTime())),
  })

  useEffect(() => {
    if (!isTrialTurnedOn || !trialExpiresAt) return

    const calculateTime = () => {
      const now = Date.now()
      const diff = trialExpiresAt.getTime() - now
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true })
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ hours, minutes, seconds, isExpired: false })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [isTrialTurnedOn, trialExpiresAt])

  return (
    <div className="w-full max-w-[1440px] min-w-0 min-h-[calc(100vh-4.5rem)] mx-auto p-3.5 sm:p-6 lg:p-8 relative overflow-x-hidden">
      
      {/* Background Radial Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Setup Payment Success Banner */}
      {searchParams.get('setup_payment') === 'success' && (
        <div className="w-full mb-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-cyan-950/90 border border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] p-4 sm:px-6 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Setup Fee Payment Received & Verified!</h4>
              <p className="text-xs text-slate-300">
                Your payment has been confirmed via PGX Digital. Your gateway integration and dedicated desk are now unlocked!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.delete('setup_payment')
              next.delete('session_id')
              setSearchParams(next)
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 30-Day Monthly Maintenance Payment Due Alert Banner */}
      {isMonthlyDue && (
        <div className="w-full mb-5 rounded-2xl bg-gradient-to-r from-cyan-950/95 via-[#071330]/95 to-purple-950/95 border-[1.5px] border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)] p-3.5 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shrink-0">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                  Monthly Gateway Maintenance Due ($499.00 USD)
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
                  30-Day Billing Cycle
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Your 30-day live gateway maintenance is due. Please settle via USDT / USDC / BTC and attach payment proof.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMonthlyModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-[0_0_16px_rgba(0,240,255,0.5)] hover:shadow-[0_0_24px_rgba(0,240,255,0.8)] transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>Pay Monthly $499 ⚡</span>
          </button>
        </div>
      )}

      {/* 24-Hour Integration Sandbox Active Banner (Only if underwriting activated trial) */}
      {isTrialTurnedOn && !timeLeft.isExpired && (
        <div className="w-full mb-5 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-[#071330]/95 to-purple-950/90 border-[1.5px] border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3)] p-3 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
            </span>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                  24-Hour Integration Sandbox Active
                </span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  ⏳ {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden md:block">
                Test your hosted card checkout with your Merchant Ref ID (<code className="text-cyan-300 font-bold">{merchant?.refId || 'PGX-PX-001'}</code>) in the API & Integration tab.
              </p>
            </div>
          </div>
          {!isArxo ? (
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-[0_0_16px_rgba(217,70,239,0.5)] hover:shadow-[0_0_24px_rgba(217,70,239,0.8)] hover:brightness-110 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Pay Setup Fee & Go Live 🚀</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Partner Plan (Arxopay)</span>
            </div>
          )}
        </div>
      )}

      {/* 24-Hour Integration Trial Expired Warning Banner */}
      {merchant?.accountMode === 'trial' && timeLeft.isExpired && (
        <div className="w-full mb-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#261506]/95 to-red-950/90 border-[1.5px] border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] p-3 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs sm:text-sm font-black text-amber-200 tracking-wide">
                Integration Trial Expired — Checkout Sessions Paused
              </span>
              <p className="text-[11px] text-amber-300/80">
                {isArxo
                  ? 'Your 24-hour sandbox testing period has ended. Your partner manager at Arxopay will submit your live activation request.'
                  : 'Your 24-hour test period has ended. Settle your setup fee to instantly activate permanent live processing.'}
              </p>
            </div>
          </div>
          {!isArxo ? (
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-[0_0_16px_rgba(245,158,11,0.5)] hover:brightness-110 transition-all cursor-pointer shrink-0"
            >
              Activate Live Processing ({setupFeeFormatted})
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold text-xs shrink-0 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Awaiting Partner Live Request</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Sidebar on Left, Content on Right */}
      <div className="w-full max-w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        
        {/* Left Sidebar (Col 3 on desktop) */}
        <div className="lg:col-span-3 w-full max-w-full min-w-0">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Main Content Area (Col 9 on desktop) */}
        <div className="lg:col-span-9 w-full max-w-full min-w-0 space-y-5 sm:space-y-6">
          
          {/* TAB 1: Dashboard (Overview) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in w-full min-w-0">
              {/* Welcome Header + Hologram Card Visual */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 relative w-full min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {merchant?.avatarUrl ? (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shadow-[0_0_20px_rgba(0,240,255,0.4)] shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#050a1d]">
                        <img
                          src={merchant.avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] break-words">
                      Welcome, {displayName}
                    </h1>
                    <p className="text-xs sm:text-base text-slate-300">
                      Track your application, configure website integration, and view your processing offer.
                    </p>
                  </div>
                </div>

                {/* Hologram Card (right aligned) */}
                <div className="hidden md:flex justify-end pr-4 shrink-0">
                  <HologramCard size="sm" />
                </div>
              </div>

              {/* White-Glove Integration Banner */}
              <div 
                onClick={() => handleTabChange('integration')}
                className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-[#09153a] via-[#0f235e] to-[#09153a] border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-between gap-4 cursor-pointer hover:border-cyan-300 transition-all group w-full min-w-0"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 group-hover:scale-105 transition-transform shrink-0">
                    <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="break-words">Developer API & Website Integration Hub</span>
                      <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/40 shrink-0">Developer Hub</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-2 sm:line-clamp-none">
                      Get your Merchant Ref ID, 1-endpoint Checkout API docs, ready-to-run code snippets (Node, PHP, Python, cURL), or request white-glove setup.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs group-hover:bg-cyan-300 transition-colors shrink-0"
                >
                  Open Workspace &rarr;
                </button>
              </div>

              {/* Row 1: Status & Processing Offer Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApplicationStatusCard />
                <ProcessingOfferCard />
              </div>

              {/* Row 2: 4 Quick Action Cards */}
              <div className="pt-2">
                <QuickActions onNavigateTab={handleTabChange} />
              </div>
            </div>
          )}

          {/* TAB: Merchant Transaction Ledger */}
          {activeTab === 'transactions' && <MerchantTransactionsTab />}

          {/* TAB: Payment Links */}
          {activeTab === 'payment-links' && <PaymentLinksTab />}

          {/* TAB: Integration & Collab */}
          {activeTab === 'integration' && <IntegrationTab />}

          {/* TAB: Weekly Invoices (PRD Section 07) */}
          {activeTab === 'invoices' && <InvoicesTab />}

          {/* TAB 2: My Application */}
          {activeTab === 'application' && <ApplicationTab />}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && <DocumentsTab />}

          {/* TAB 4: Messages */}
          {activeTab === 'messages' && <MessagesTab />}

          {/* TAB 5: Offer */}
          {activeTab === 'offer' && <OfferTab />}

          {/* TAB 6: Account Settings */}
          {activeTab === 'settings' && <SettingsTab />}

        </div>

      </div>

      {/* Bottom Glowing Neon Horizon Arc */}
      <div className="mt-12 relative w-full h-8 overflow-hidden pointer-events-none select-none">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[120%] h-32 rounded-[100%] border-t-2 border-cyan-400 shadow-[0_-4px_25px_rgba(0,240,255,0.7),0_-10px_50px_rgba(217,70,239,0.5)]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-48 h-2 bg-cyan-300 blur-sm rounded-full" />
      </div>

      {/* Setup Payment Modal for Instant Live Conversion */}
      <SetupPaymentModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        amount={merchant?.offer?.setupFee ? (parseFloat(String(merchant.offer.setupFee).replace(/[^0-9.]/g, '')) || setupFeeNum) : setupFeeNum}
        merchantRefId={merchant?.refId || ''}
        merchantLegalName={merchant?.legalName || merchant?.fullName || ''}
        merchantEmail={merchant?.businessEmail || ''}
        websiteDomain={merchant?.websiteDomain || merchant?.website || ''}
        gitRepoUrl={merchant?.gitRepoUrl || ''}
      />

      {/* 30-Day Monthly Maintenance Pop-up Modal */}
      <MonthlyMaintenanceModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        merchantLegalName={merchant?.legalName || merchant?.fullName}
        merchantRefId={merchant?.refId}
        amount={merchant?.arxopayWholesale?.monthlyMaintenance?.amount || 499}
      />

    </div>
  )
}
