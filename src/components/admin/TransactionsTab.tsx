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
  Sparkles,
  Loader2,
} from 'lucide-react'
import { adminApi, type TransactionItem } from '@/lib/adminApi'

interface TransactionsTabProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'error') => void
}

export default function TransactionsTab({ onShowToast }: TransactionsTabProps) {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gross Volume</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              ${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{transactions.length} records</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Super Admin 9% Fee */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-[#060b20]/90 border border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.25)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">Super Admin 9% Cut</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              ${totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Hardwired Platform Fee</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/60 flex items-center justify-center text-amber-300">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Reseller Profit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-fuchsia-400/60 shadow-[0_0_18px_rgba(217,70,239,0.25)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-fuchsia-300 uppercase tracking-wider">Reseller Margin</div>
            <div className="text-xl sm:text-2xl font-black text-fuchsia-300 mt-1">
              ${totalResellerProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-fuchsia-400/80 mt-0.5">Admin Spread Profit</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-fuchsia-400/60 flex items-center justify-center text-fuchsia-300">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Merchant Net Payout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.25)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Merchant Net Pool</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
              ${totalMerchantNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Net Owed to Merchants</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-xl overflow-hidden">
        {/* Header Strip with Search & Filters */}
        <div className="p-5 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Dynamic Transaction Ledger & Fee Split
            </h3>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full ml-1">
              {transactions.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
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
            <div className="flex items-center gap-1 bg-[#050a20] p-1 rounded-xl border border-cyan-500/30 text-xs font-semibold">
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
              className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer transition-all"
              title="Refresh Transactions"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#09153d]/50 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Date / Time</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Merchant Ref ID</th>
                <th className="p-4">Customer / Order</th>
                <th className="p-4 text-right">Gross Sale</th>
                <th className="p-4 text-right text-amber-300">9% Admin Fee</th>
                <th className="p-4 text-right text-fuchsia-300">Reseller Profit</th>
                <th className="p-4 text-right text-emerald-400">Merchant Net</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/15">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading transaction ledger...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center space-y-2">
                    <Receipt className="h-10 w-10 text-slate-600 mx-auto" />
                    <div className="text-slate-300 font-bold text-sm">No transactions found</div>
                    <div className="text-slate-500 text-xs max-w-sm mx-auto">
                      Transactions processed via the single Stripe gateway will automatically appear here with their 9% platform cut and reseller spread.
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
                      <td className="p-4 text-slate-300 whitespace-nowrap">
                        <div className="font-semibold">{new Date(txn.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono text-cyan-300 font-bold">
                          <span>{txn.transactionId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(txn.transactionId, txn._id)}
                            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedId === txn._id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        {txn.stripeSessionId && (
                          <div className="text-[9px] text-slate-500 font-mono truncate max-w-[120px]" title={txn.stripeSessionId}>
                            {txn.stripeSessionId}
                          </div>
                        )}
                      </td>

                      {/* Merchant Ref ID */}
                      <td className="p-4">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          {txn.merchantRefId}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4 text-slate-300">
                        <div className="truncate max-w-[150px] font-medium">{txn.customerEmail || 'Guest Customer'}</div>
                        {txn.orderId && <div className="text-[10px] text-slate-500 font-mono">#{txn.orderId}</div>}
                      </td>

                      {/* Gross Amount */}
                      <td className="p-4 text-right font-black text-white whitespace-nowrap">
                        ${txn.grossAmount.toFixed(2)}
                      </td>

                      {/* Super Admin 9% Fee */}
                      <td className="p-4 text-right font-bold text-amber-300 font-mono whitespace-nowrap">
                        -${txn.platformFeeAmount.toFixed(2)}
                      </td>

                      {/* Reseller Profit */}
                      <td className="p-4 text-right font-bold text-fuchsia-300 font-mono whitespace-nowrap">
                        +${txn.resellerProfitAmount.toFixed(2)}
                      </td>

                      {/* Merchant Net */}
                      <td className="p-4 text-right font-black text-emerald-400 font-mono whitespace-nowrap">
                        ${txn.merchantNetAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {isSucceeded && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.3)] inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Succeeded
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.3)] inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {isFailed && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-red-300 bg-red-500/10 border border-red-400/80 shadow-[0_0_8px_rgba(239,68,68,0.3)] inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
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
