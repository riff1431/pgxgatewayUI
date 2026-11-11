import { useState, useEffect, useCallback } from 'react'
import {
  Receipt,
  Search,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Coins,
  Loader2,
} from 'lucide-react'
import { adminApi, type TransactionItem } from '@/lib/adminApi'

interface TransactionsTabProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'error') => void
  isSuperAdmin?: boolean
}

export default function TransactionsTab({ onShowToast, isSuperAdmin = false }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'succeeded' | 'pending' | 'failed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getTransactions({
        status: statusFilter,
        search: searchQuery,
      })
      if (res.data) {
        setTransactions(res.data)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transactions'
      onShowToast('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, onShowToast])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    onShowToast('Copied', 'ID copied to clipboard.', 'success')
  }

  // Summary Metrics
  const totalGross = transactions.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.grossAmount : 0), 0)
  const totalPlatformFees = transactions.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.platformFeeAmount : 0), 0)
  const totalResellerProfit = transactions.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.resellerProfitAmount : 0), 0)
  const totalMerchantNet = transactions.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.merchantNetAmount : 0), 0)
  const succeededCount = transactions.filter((t) => t.status === 'succeeded').length

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in w-full max-w-full min-w-0">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
        {/* Gross Volume */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-between gap-2 min-w-0 overflow-hidden">
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              {isSuperAdmin ? 'Global Gross Volume' : 'Gateway Volume'}
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-white mt-0.5 sm:mt-1 truncate">
              ${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{transactions.length} records</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Card 2: Conditional between Super Admin 9% Fee vs Succeeded Txn Count */}
        {isSuperAdmin ? (
          <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-[#060b20]/90 border border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.25)] flex items-center justify-between gap-2 min-w-0 overflow-hidden">
            <div className="min-w-0 flex-1">
              <div className="text-[9px] sm:text-[10px] font-semibold text-amber-300 uppercase tracking-wider truncate">Super Admin 9% Cut</div>
              <div className="text-base sm:text-xl lg:text-2xl font-black text-amber-300 mt-0.5 sm:mt-1 truncate">
                ${totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-amber-300/80 mt-0.5 truncate">Hardwired Platform Fee</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-between gap-2 min-w-0 overflow-hidden">
            <div className="min-w-0 flex-1">
              <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-300 uppercase tracking-wider truncate">Succeeded Sales</div>
              <div className="text-base sm:text-xl lg:text-2xl font-black text-emerald-300 mt-0.5 sm:mt-1 truncate">
                {succeededCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Completed Payments</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        )}

        {/* Reseller Profit Margin */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-fuchsia-400/60 shadow-[0_0_18px_rgba(217,70,239,0.25)] flex items-center justify-between gap-2 min-w-0 overflow-hidden">
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] font-semibold text-fuchsia-300 uppercase tracking-wider truncate">
              {isSuperAdmin ? 'Resellers Total Margin' : 'Your Profit Margin'}
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-fuchsia-300 mt-0.5 sm:mt-1 truncate">
              ${totalResellerProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-fuchsia-400/80 mt-0.5 truncate">Spread Income</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-fuchsia-400/60 flex items-center justify-center text-fuchsia-300 shrink-0">
            <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Merchant Net Payout */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.25)] flex items-center justify-between gap-2 min-w-0 overflow-hidden">
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-300 uppercase tracking-wider truncate">Merchant Net Pool</div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-emerald-300 mt-0.5 sm:mt-1 truncate">
              ${totalMerchantNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5 truncate">Net Owed to Merchants</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-xl overflow-hidden w-full max-w-full min-w-0">
        {/* Header Strip with Search & Filters */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <Receipt className="h-5 w-5 text-cyan-400 shrink-0" />
            <h3 className="text-base font-bold text-white tracking-tight break-words">
              {isSuperAdmin ? 'Master Platform Transaction Ledger' : 'Reseller Transaction Ledger'}
            </h3>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0">
              {transactions.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 min-w-0">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Txn ID, Ref ID, Email..."
                className="w-full bg-[#060c24] border border-cyan-500/40 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#050a20] p-1 rounded-xl border border-cyan-500/30 text-xs font-semibold overflow-x-auto max-w-full">
              {(['all', 'succeeded', 'pending', 'failed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer transition-all shrink-0"
              title="Refresh Transactions"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transactions Table with Horizontal Scrolling */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent w-full max-w-full min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[950px]">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#09153d]/50 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3.5 whitespace-nowrap">Date / Time</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Merchant Ref ID</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Customer / Order</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right">Gross Sale</th>
                {isSuperAdmin && (
                  <th className="px-4 py-3.5 whitespace-nowrap text-right text-amber-300">9% Admin Fee</th>
                )}
                <th className="px-4 py-3.5 whitespace-nowrap text-right text-fuchsia-300">
                  {isSuperAdmin ? 'Reseller Profit' : 'Your Profit'}
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right text-emerald-400">Merchant Net</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/15">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading transaction ledger...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="p-12 text-center space-y-2">
                    <Receipt className="h-10 w-10 text-slate-600 mx-auto" />
                    <div className="text-slate-300 font-bold text-sm">No transactions found</div>
                    <div className="text-slate-500 text-xs max-w-sm mx-auto">
                      Transactions processed via connected Stripe gateways will automatically appear here.
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const isSucceeded = txn.status === 'succeeded'
                  const isPending = txn.status === 'pending'
                  const isFailed = txn.status === 'failed'

                  return (
                    <tr key={txn._id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        <div>{new Date(txn.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopy(txn.transactionId, txn.transactionId)}
                          className="flex items-center gap-1 font-mono text-cyan-300 hover:text-white transition-colors cursor-pointer group"
                          title="Click to copy Transaction ID"
                        >
                          <span className="truncate max-w-[120px]">{txn.transactionId}</span>
                          {copiedId === txn.transactionId ? (
                            <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0" />
                          )}
                        </button>
                      </td>

                      {/* Merchant Ref ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono px-2 py-0.5 rounded-md bg-purple-500/10 border border-fuchsia-400/40 text-fuchsia-300 font-semibold text-[11px]">
                          {txn.merchantRefId}
                        </span>
                      </td>

                      {/* Customer / Order */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-white font-medium truncate max-w-[150px]">{txn.customerEmail || 'Guest'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {txn.orderId || 'Direct Payment'}
                        </div>
                      </td>

                      {/* Gross Sale */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-white font-mono">
                        ${txn.grossAmount.toFixed(2)}
                      </td>

                      {/* Super Admin 9% Fee (Only visible to Super Admin) */}
                      {isSuperAdmin && (
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-amber-300 font-mono">
                          ${txn.platformFeeAmount.toFixed(2)}
                        </td>
                      )}

                      {/* Reseller Profit Spread */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-fuchsia-300 font-mono">
                        +${txn.resellerProfitAmount.toFixed(2)}
                      </td>

                      {/* Merchant Net */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-emerald-400 font-mono">
                        ${txn.merchantNetAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSucceeded
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/80'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-400/50'
                              : 'bg-red-500/10 text-red-300 border border-red-400/50'
                          }`}
                        >
                          {isSucceeded && <CheckCircle2 className="h-3 w-3" />}
                          {isPending && <Clock className="h-3 w-3" />}
                          {isFailed && <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{txn.status}</span>
                        </span>
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
  )
}
