import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  DollarSign,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
} from 'lucide-react'
import { getStoredToken } from '@/lib/api'

interface TransactionItem {
  _id: string
  transactionId: string
  orderId?: string
  merchantRefId: string
  grossAmount: number
  merchantNetAmount: number
  platformFeeAmount?: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  settlementStatus?: 'on_hold' | 'available' | 'paid_out'
  holdMaturesAt?: string
  rollingReserveStatus?: 'locked' | 'released'
  rollingReserveAmount?: number
  reserveReleaseDate?: string
  customerEmail?: string
  customerName?: string
  createdAt: string
}

interface TransactionMetrics {
  totalGross: number
  totalNet: number
  onHoldBalance: number
  availableBalance: number
  rollingReserveBalance: number
  totalCount: number
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

export default function MerchantTransactionsTab() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [metrics, setMetrics] = useState<TransactionMetrics>({
    totalGross: 0,
    totalNet: 0,
    onHoldBalance: 0,
    availableBalance: 0,
    rollingReserveBalance: 0,
    totalCount: 0,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'succeeded' | 'pending' | 'refunded'>('all')

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const token = getStoredToken()
      const res = await fetch(`${API_BASE}/merchants/transactions`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load transactions: HTTP ${res.status}`)
      }

      const data = await res.json()
      if (data.success) {
        setTransactions(data.data || [])
        if (data.metrics) {
          setMetrics(data.metrics)
        }
      } else {
        throw new Error(data.message || 'Failed to retrieve transaction ledger.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching transaction history')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const term = search.toLowerCase().trim()
    const matchesSearch =
      !term ||
      t.transactionId?.toLowerCase().includes(term) ||
      t.orderId?.toLowerCase().includes(term) ||
      t.customerEmail?.toLowerCase().includes(term)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#091a45] to-[#071330] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            Merchant Sales &amp; Settlement Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time verified customer card transactions, hold maturity timeline, and payout balance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchTransactions(true)}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl bg-[#030614] hover:bg-[#09153a] border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {/* Metric 1: Total Gross Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Gross Sales Volume</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${metrics.totalGross.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">{metrics.totalCount} total processed orders</p>
        </div>

        {/* Metric 2: Net Available for Payout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Available for Payout</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            ${metrics.availableBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-300/80">Ready for instant USDT / Wire withdrawal</p>
        </div>

        {/* Metric 3: 14-Day Hold Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>14-Day Hold Pool</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">
            ${metrics.onHoldBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-amber-200/80">Auto-matures into available balance</p>
        </div>

        {/* Metric 4: 10% Rolling Reserve */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Rolling Reserve (10%)</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 tracking-tight">
            ${metrics.rollingReserveBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-cyan-200/80">60-day security reserve pool</p>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-4 sm:p-6 space-y-5 w-full min-w-0">
        {/* Table Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Txn ID, Order ID, or Customer Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#030614] border border-cyan-500/20 shrink-0">
            {(['all', 'succeeded', 'pending', 'refunded'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading verified transaction records...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center p-12 space-y-3 rounded-2xl bg-[#030614] border border-cyan-500/20">
            <CreditCard className="w-8 h-8 text-cyan-400/40 mx-auto" />
            <div className="text-sm font-bold text-white">No Transactions Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Transactions processed via your PGX checkout integration will automatically appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-cyan-500/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#030614] text-slate-400 border-b border-cyan-500/20 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Date &amp; Time</th>
                  <th className="p-3.5 whitespace-nowrap">Transaction ID / Order</th>
                  <th className="p-3.5 whitespace-nowrap">Customer</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Gross Amount</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Merchant Net</th>
                  <th className="p-3.5 whitespace-nowrap text-center">Status</th>
                  <th className="p-3.5 whitespace-nowrap">Hold &amp; Reserve Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {filteredTransactions.map((t) => {
                  const holdDate = t.holdMaturesAt
                    ? new Date(t.holdMaturesAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                    : null
                  const reserveDate = t.reserveReleaseDate
                    ? new Date(t.reserveReleaseDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                    : null

                  return (
                    <tr key={t._id} className="hover:bg-cyan-500/5 transition-colors">
                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap text-slate-300">
                        <div className="font-semibold text-white">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Transaction ID / Order */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-cyan-300 text-xs">{t.transactionId}</div>
                        {t.orderId && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {t.orderId}</div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="p-3.5 whitespace-nowrap text-slate-300">
                        <div className="text-white font-medium">{t.customerEmail || 'Guest Buyer'}</div>
                        <div className="text-[10px] text-slate-500">Stripe Card Payment</div>
                      </td>

                      {/* Gross Amount */}
                      <td className="p-3.5 whitespace-nowrap text-right font-bold text-white">
                        ${t.grossAmount?.toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">{t.currency}</span>
                      </td>

                      {/* Merchant Net */}
                      <td className="p-3.5 whitespace-nowrap text-right">
                        <div className="font-bold text-emerald-400 text-sm">
                          ${t.merchantNetAmount?.toFixed(2)}
                        </div>
                        {t.platformFeeAmount !== undefined && (
                          <div className="text-[10px] text-slate-500">
                            Fee: -${t.platformFeeAmount.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                            t.status === 'succeeded'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : t.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Hold & Reserve Schedule */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {t.settlementStatus === 'available' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                                AVAILABLE
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                ON HOLD
                              </span>
                            )}
                            {holdDate && (
                              <span className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                                <Calendar className="w-3 h-3 text-cyan-400" />
                                {holdDate}
                              </span>
                            )}
                          </div>

                          {t.rollingReserveAmount !== undefined && t.rollingReserveAmount > 0 && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Lock className="w-2.5 h-2.5 text-cyan-400" />
                              <span>Reserve (10%): ${t.rollingReserveAmount.toFixed(2)}</span>
                              {reserveDate && <span className="text-slate-500">({reserveDate})</span>}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
