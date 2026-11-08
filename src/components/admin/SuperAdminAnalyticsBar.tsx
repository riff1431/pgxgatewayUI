import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Users, Sparkles, RefreshCw } from 'lucide-react'
import { adminApi, type SuperAdminAnalytics } from '@/lib/adminApi'

interface SuperAdminAnalyticsBarProps {
  onRefresh?: () => void
}

export default function SuperAdminAnalyticsBar({ onRefresh }: SuperAdminAnalyticsBarProps) {
  const [data, setData] = useState<SuperAdminAnalytics>({
    totalGrossVolume: 0,
    totalPlatformFees: 0,
    totalResellerProfit: 0,
    totalMerchantNet: 0,
    totalTransactions: 0,
    totalMerchants: 0,
    approvedMerchants: 0,
    platformFeeRate: 9.0,
  })
  const [loading, setLoading] = useState(false)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getSuperAdminAnalytics()
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
    loadAnalytics()
  }, [])

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#060c28] via-[#09153d] to-[#060c28] border-[1.5px] border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.3)] p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-xs shadow-[0_0_12px_rgba(251,191,36,0.6)]">
            9%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Super Admin Multi-Tenant Oversight
              </h2>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> 9.0% Hardwired Commission
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Live consolidated telemetry across all connected resellers and sub-merchants.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            loadAnalytics()
            if (onRefresh) onRefresh()
          }}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Analytics</span>
        </button>
      </div>

      {/* 4 Super Admin Revenue Chambers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Total Platform Volume */}
        <div className="p-4 rounded-2xl bg-[#050a22]/80 border border-cyan-500/30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Total Gross Volume</span>
            <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            ${data.totalGrossVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {data.totalTransactions} total transactions processed
          </div>
        </div>

        {/* Super Admin 9% Fee Revenue (Highlighted) */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-[#050a22]/90 border border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.25)]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
            <span>Platform 9% Revenue</span>
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
            ${data.totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-0.5">
            Your hardwired 9.0% platform fee
          </div>
        </div>

        {/* Reseller Net Profit */}
        <div className="p-4 rounded-2xl bg-[#050a22]/80 border border-purple-500/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 flex items-center justify-between">
            <span>Reseller Profit Spread</span>
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-fuchsia-300 mt-1">
            ${data.totalResellerProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Reseller client net earnings
          </div>
        </div>

        {/* Sub-Merchants Active */}
        <div className="p-4 rounded-2xl bg-[#050a22]/80 border border-emerald-500/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between">
            <span>Active Sub-Merchants</span>
            <Users className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
            {data.approvedMerchants}{' '}
            <span className="text-xs font-semibold text-slate-400">/ {data.totalMerchants}</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            Assigned unique Ref IDs
          </div>
        </div>
      </div>
    </div>
  )
}
