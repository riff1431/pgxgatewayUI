import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Users, BadgePercent, RefreshCw, Sparkles, Calendar, Landmark } from 'lucide-react'
import { adminApi, type SuperAdminAnalytics } from '@/lib/adminApi'

interface SuperAdminAnalyticsBarProps {
  onRefresh?: () => void
}

type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'ytd' | 'all'

export default function SuperAdminAnalyticsBar({ onRefresh }: SuperAdminAnalyticsBarProps) {
  const [period, setPeriod] = useState<PeriodType>('all')
  const [data, setData] = useState<SuperAdminAnalytics>({
    totalGrossVolume: 0,
    totalPlatformFees: 0,
    totalResellerProfit: 0,
    totalMerchantNet: 0,
    totalTransactions: 0,
    totalMerchants: 0,
    approvedMerchants: 0,
    platformFeeRate: 9.0,
    totalSetupFees: 0,
    totalMonthlyRecurring: 0,
    totalPlatformRevenue: 0,
  })
  const [loading, setLoading] = useState(false)

  const loadAnalytics = async (selectedPeriod: PeriodType = period) => {
    setLoading(true)
    try {
      const res = await adminApi.getSuperAdminAnalytics({ period: selectedPeriod })
      if (res.data) {
        setData(res.data)
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics(period)
  }, [])

  const setupFees = (data.totalSetupFees !== undefined && data.totalSetupFees > 0)
    ? data.totalSetupFees
    : (data.approvedMerchants * 1499)

  const monthlyRecurring = (data.totalMonthlyRecurring !== undefined && data.totalMonthlyRecurring > 0)
    ? data.totalMonthlyRecurring
    : (data.approvedMerchants * 499)

  const combinedRevenue = (data.totalPlatformRevenue !== undefined && data.totalPlatformRevenue > 0)
    ? data.totalPlatformRevenue
    : (data.totalPlatformFees + setupFees + monthlyRecurring)

  return (
    <div className="w-full max-w-full min-w-0 rounded-3xl bg-gradient-to-r from-[#060c28] via-[#09153d] to-[#060c28] border-[1.5px] border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.3)] p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Strip */}
      <div className="w-full min-w-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-xs shadow-[0_0_12px_rgba(251,191,36,0.6)] shrink-0 mt-0.5 sm:mt-0">
            9%
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight break-words">
                Super Admin Multi-Tenant Oversight
              </h2>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <BadgePercent className="h-3 w-3" /> 9.0% Hardwired Commission
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Live consolidated telemetry across all connected resellers and sub-merchants.
            </p>
          </div>
        </div>

        {/* Timeframe Selector Pills & Sync Button */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <div className="flex items-center gap-1 bg-[#04081c]/90 p-1 rounded-2xl border border-cyan-500/30 flex-wrap">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'ytd', label: 'YTD' },
              { id: 'all', label: 'All Time' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setPeriod(t.id as PeriodType)
                  loadAnalytics(t.id as PeriodType)
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  period === t.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              loadAnalytics(period)
              if (onRefresh) onRefresh()
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 6 Super Admin Revenue & Billing Chambers */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 pt-4 w-full min-w-0">
        {/* 1. Total Platform Volume */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#050a22]/80 border border-cyan-500/30 min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between gap-1">
            <span className="truncate">Gross Volume</span>
            <DollarSign className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-white mt-1 truncate">
            ${data.totalGrossVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {data.totalTransactions} transactions
          </div>
        </div>

        {/* 2. Platform 9% Fee Revenue */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-[#050a22]/90 border border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.25)] min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between gap-1">
            <span className="truncate">9% Gateway Cut</span>
            <TrendingUp className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-amber-300 mt-1 truncate">
            ${data.totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-0.5 truncate">
            Processing Revenue
          </div>
        </div>

        {/* 3. Setup Fees Revenue (NEW!) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#050a22]/80 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)] min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between gap-1">
            <span className="truncate">Setup Fees</span>
            <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-purple-300 mt-1 truncate">
            ${setupFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-purple-300/80 mt-0.5 truncate">
            $1,499 / $2,500 per act.
          </div>
        </div>

        {/* 4. Monthly Maintenance Recurring (NEW!) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#050a22]/80 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)] min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center justify-between gap-1">
            <span className="truncate">Monthly Fees</span>
            <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-blue-300 mt-1 truncate">
            ${monthlyRecurring.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-blue-300/80 mt-0.5 truncate">
            $499 / mo recurring
          </div>
        </div>

        {/* 5. Combined Total Platform Revenue (NEW!) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-[#050a22]/90 border border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.25)] min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between gap-1">
            <span className="truncate">Total Revenue</span>
            <Landmark className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-emerald-300 mt-1 truncate">
            ${combinedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5 truncate">
            9% Cut + Setup + Mthly
          </div>
        </div>

        {/* 6. Sub-Merchants Active */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#050a22]/80 border border-slate-700/60 min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between gap-1">
            <span className="truncate">Active Merchants</span>
            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-white mt-1 truncate">
            {data.approvedMerchants}{' '}
            <span className="text-xs font-semibold text-slate-400">/ {data.totalMerchants}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Assigned Ref IDs
          </div>
        </div>
      </div>
    </div>
  )
}
