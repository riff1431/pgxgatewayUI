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
  Wallet,
  Landmark,
  Copy,
  Check,
} from 'lucide-react'
import { getStoredToken } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'

interface TransactionItem {
  _id: string
  transactionId: string
  orderId?: string
  merchantRefId: string
  grossAmount: number
  merchantNetAmount: number
  platformFeeAmount?: number
  resellerFeeAmount?: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  settlementStatus?: 'on_hold' | 'available' | 'paid_out'
  settlementEligibleAt?: string
  holdMaturesAt?: string
  rollingReserveStatus?: 'locked' | 'released'
  rollingReserveAmount?: number
  rollingReserveReleaseAt?: string
  reserveReleaseDate?: string
  customerEmail?: string
  customerName?: string
  createdAt: string
}

interface PayoutRecord {
  payoutId: string
  amount: number
  method: 'crypto_usdc' | 'bank_swift'
  destination: string
  reference: string
  status: 'completed' | 'pending'
  notes?: string
  adminName?: string
  depositedAt: string
}

interface TransactionMetrics {
  totalGross: number
  totalNet: number
  onHoldBalance: number
  availableBalance: number
  rollingReserveBalance: number
  totalDeposited?: number
  totalCount: number
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

export default function MerchantTransactionsTab() {
  const { merchant } = useAuth()
  const { t } = useTranslation()
  const isArxo = merchant?.resellerId === 'ARXO' || merchant?.refId?.startsWith('ARXO-')
  const tier = merchant?.tier || (merchant?.offer?.rate?.includes('15') || merchant?.offer?.setupFee?.includes('2500') ? 2 : 1)
  const holdDays = isArxo ? (tier === 2 ? 45 : 14) : 14
  const reserveRate = isArxo ? (tier === 2 ? 20 : 10) : 10
  const reserveDays = isArxo ? (tier === 2 ? 90 : 60) : 60
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([])
  const [activeView, setActiveView] = useState<'transactions' | 'deposits'>('transactions')
  const [copiedPayoutId, setCopiedPayoutId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<TransactionMetrics>({
    totalGross: 0,
    totalNet: 0,
    onHoldBalance: 0,
    availableBalance: 0,
    rollingReserveBalance: 0,
    totalDeposited: 0,
    totalCount: 0,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'succeeded' | 'pending' | 'failed' | 'refunded'>('all')

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
        throw new Error(t('dashboard.transactionsTab.errLoad', { status: res.status }))
      }

      const data = await res.json()
      if (data.success) {
        setTransactions(data.data || [])
        setPayoutHistory(data.payoutHistory || [])
        if (data.metrics) {
          setMetrics(data.metrics)
        }
      } else {
        throw new Error(data.message || t('dashboard.transactionsTab.errRetrieve'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.transactionsTab.errFetch'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleCopyRef = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPayoutId(id)
    setTimeout(() => setCopiedPayoutId(null), 2000)
  }

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

  // Filter payouts
  const filteredPayouts = payoutHistory.filter((p) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      p.payoutId?.toLowerCase().includes(term) ||
      p.reference?.toLowerCase().includes(term) ||
      p.destination?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#091a45] to-[#071330] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            {t('dashboard.transactionsTab.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('dashboard.transactionsTab.desc')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchTransactions(true)}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl bg-[#030614] hover:bg-[#09153a] border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{t('dashboard.transactionsTab.refreshLedger')}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full min-w-0">
        {/* Metric 1: Total Gross Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{t('dashboard.transactionsTab.grossVolume')}</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div dir="ltr" className="text-2xl font-black text-white tracking-tight">
            ${metrics.totalGross.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            {t('dashboard.transactionsTab.txCount', { count: metrics.totalCount })}
          </p>
        </div>

        {/* Metric 2: Net Available for Payout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{t('dashboard.transactionsTab.availablePayout')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div dir="ltr" className="text-2xl font-black text-emerald-400 tracking-tight">
            ${metrics.availableBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-300/80">{t('dashboard.transactionsTab.availableDesc')}</p>
        </div>

        {/* Metric 3: Hold Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{t('dashboard.transactionsTab.heldBalanceLabel', { days: holdDays })}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div dir="ltr" className="text-2xl font-black text-amber-300 tracking-tight">
            ${metrics.onHoldBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-amber-200/80">
            {t('dashboard.transactionsTab.heldDesc', { days: holdDays })}
          </p>
        </div>

        {/* Metric 4: Rolling Reserve */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{t('dashboard.transactionsTab.rollingReserve', { rate: reserveRate })}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div dir="ltr" className="text-2xl font-black text-cyan-300 tracking-tight">
            ${metrics.rollingReserveBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-cyan-200/80">
            {t('dashboard.transactionsTab.reserveTermNote', { days: reserveDays })}
          </p>
        </div>

        {/* Metric 5: Total Deposited to Merchant */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{t('dashboard.transactionsTab.totalDeposited')}</span>
            <Landmark className="w-4 h-4 text-purple-400" />
          </div>
          <div dir="ltr" className="text-2xl font-black text-purple-300 tracking-tight">
            ${(metrics.totalDeposited || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-purple-200/80">{t('dashboard.transactionsTab.depositedDesc')}</p>
        </div>
      </div>

      {/* Agreed Processing Formula Banner */}
      <div className="p-4 rounded-2xl bg-[#04081c] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{t('dashboard.transactionsTab.formulaLabel')}</span>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                {t('dashboard.transactionsTab.formulaValue', { rate: reserveRate, days: holdDays })}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {t('dashboard.transactionsTab.formulaDesc', { days: holdDays })}
            </p>
          </div>
        </div>

        <div dir="ltr" className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] shrink-0">
          Tier {tier}: {holdDays}d Hold &bull; {reserveRate}% Reserve ({reserveDays}d)
        </div>
      </div>

      {/* Main Ledger Section with View Switcher */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-4 sm:p-6 space-y-5 w-full min-w-0">
        {/* View Switcher Tabs & Search Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-cyan-500/20">
          {/* Switcher Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'transactions'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t('dashboard.transactionsTab.viewTransactions', { count: filteredTransactions.length })}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('deposits')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'deposits'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{t('dashboard.transactionsTab.viewDeposits', { count: payoutHistory.length })}</span>
            </button>
          </div>

          {/* Search Input & Status Filter (Only in Transactions View) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeView === 'transactions'
                    ? t('dashboard.transactionsTab.searchTxnPlaceholder')
                    : t('dashboard.transactionsTab.searchPayoutPlaceholder')
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-10 pe-4 py-2 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {activeView === 'transactions' && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#030614] border border-cyan-500/20 shrink-0 overflow-x-auto">
                {(
                  [
                    { id: 'all', label: t('dashboard.transactionsTab.statusAll') },
                    { id: 'succeeded', label: t('dashboard.transactionsTab.statusSucceeded') },
                    { id: 'pending', label: t('dashboard.transactionsTab.statusPending') },
                    { id: 'failed', label: t('dashboard.transactionsTab.statusFailed') },
                    { id: 'refunded', label: t('dashboard.transactionsTab.statusRefunded') },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">{t('dashboard.transactionsTab.loading')}</p>
          </div>
        ) : activeView === 'transactions' ? (
          /* Processed Transactions Table */
          filteredTransactions.length === 0 ? (
            <div className="text-center p-12 space-y-3 rounded-2xl bg-[#030614] border border-cyan-500/20">
              <CreditCard className="w-8 h-8 text-cyan-400/40 mx-auto" />
              <div className="text-sm font-bold text-white">{t('dashboard.transactionsTab.noTxnTitle')}</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t('dashboard.transactionsTab.noTxnDesc')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-cyan-500/20">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#030614] text-slate-400 border-b border-cyan-500/20 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colDateTime')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colTxnOrder')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colCustomer')}</th>
                    <th className="p-3.5 whitespace-nowrap text-end">{t('dashboard.transactionsTab.colGross')}</th>
                    <th className="p-3.5 whitespace-nowrap text-end">{t('dashboard.transactionsTab.colNet')}</th>
                    <th className="p-3.5 whitespace-nowrap text-center">{t('dashboard.transactionsTab.colStatus')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colHoldSchedule')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {filteredTransactions.map((tr) => {
                    const rawHold = tr.settlementEligibleAt || tr.holdMaturesAt
                    const rawReserve = tr.rollingReserveReleaseAt || tr.reserveReleaseDate
                    const holdDate = rawHold
                      ? new Date(rawHold).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                      : null
                    const reserveDate = rawReserve
                      ? new Date(rawReserve).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                      : null

                    return (
                      <tr key={tr._id} className="hover:bg-cyan-500/5 transition-colors">
                        {/* Date & Time */}
                        <td className="p-3.5 whitespace-nowrap text-slate-300">
                          <div className="font-semibold text-white">
                            {new Date(tr.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(tr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Transaction ID / Order */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div dir="ltr" className="font-mono font-bold text-cyan-300 text-xs">{tr.transactionId}</div>
                          {tr.orderId && (
                            <div dir="ltr" className="text-[10px] text-slate-400 font-mono">
                              {t('dashboard.transactionsTab.orderRef', { id: tr.orderId })}
                            </div>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="p-3.5 whitespace-nowrap text-slate-300">
                          <div dir="ltr" className="text-white font-medium">{tr.customerEmail || 'Guest Buyer'}</div>
                          <div className="text-[10px] text-slate-500">{t('dashboard.transactionsTab.cardPayment')}</div>
                        </td>

                        {/* Gross Amount */}
                        <td className="p-3.5 whitespace-nowrap text-end font-bold text-white" dir="ltr">
                          ${tr.grossAmount?.toFixed(2)}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">{tr.currency}</span>
                        </td>

                        {/* Merchant Net */}
                        <td className="p-3.5 whitespace-nowrap text-end" dir="ltr">
                          <div className="font-bold text-emerald-400 text-sm">
                            ${tr.merchantNetAmount?.toFixed(2)}
                          </div>
                          {(tr.resellerFeeAmount !== undefined || tr.platformFeeAmount !== undefined) && (
                            <div className="text-[10px] text-slate-500">
                              Fee: -${(tr.resellerFeeAmount || tr.platformFeeAmount || 0).toFixed(2)}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 whitespace-nowrap text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                              tr.status === 'succeeded'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : tr.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {tr.status === 'succeeded'
                              ? t('dashboard.transactionsTab.statusSucceeded')
                              : tr.status === 'pending'
                              ? t('dashboard.transactionsTab.statusPending')
                              : tr.status === 'refunded'
                              ? t('dashboard.transactionsTab.statusRefunded')
                              : t('dashboard.transactionsTab.statusFailed')}
                          </span>
                        </td>

                        {/* Hold & Reserve Schedule */}
                        <td className="p-3.5 whitespace-nowrap">
                          {tr.status === 'failed' ? (
                            <div className="space-y-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
                                {t('dashboard.transactionsTab.noSettlementFailed')}
                              </span>
                            </div>
                          ) : tr.status === 'pending' ? (
                            <div className="space-y-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                                {t('dashboard.transactionsTab.awaitingPayment')}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {tr.settlementStatus === 'available' ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                                    {t('dashboard.transactionsTab.statusAvailable')}
                                  </span>
                                ) : tr.settlementStatus === 'paid_out' ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                                    {t('dashboard.transactionsTab.statusPaidOut')}
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                    {t('dashboard.transactionsTab.statusOnHold', { days: holdDays })}
                                  </span>
                                )}
                                {holdDate && (
                                  <span className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                                    <Calendar className="w-3 h-3 text-cyan-400" />
                                    {holdDate}
                                  </span>
                                )}
                              </div>

                              {tr.rollingReserveAmount !== undefined && tr.rollingReserveAmount > 0 && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <Lock className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>
                                    {t('dashboard.transactionsTab.reserveAmount', {
                                      rate: reserveRate,
                                      amount: tr.rollingReserveAmount.toFixed(2),
                                    })}
                                  </span>
                                  {reserveDate && <span className="text-slate-500">({reserveDate})</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Daily Deposits & Payouts Table (Sent by Admin) */
          filteredPayouts.length === 0 ? (
            <div className="text-center p-12 space-y-3 rounded-2xl bg-[#030614] border border-cyan-500/20">
              <Landmark className="w-8 h-8 text-cyan-400/40 mx-auto" />
              <div className="text-sm font-bold text-white">{t('dashboard.transactionsTab.noDepositsTitle')}</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t('dashboard.transactionsTab.noDepositsDesc', { days: holdDays })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-cyan-500/20">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#030614] text-slate-400 border-b border-cyan-500/20 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colDepositDate')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colPayoutId')}</th>
                    <th className="p-3.5 whitespace-nowrap text-end">{t('dashboard.transactionsTab.colDeposited')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colMethodRail')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colDestination')}</th>
                    <th className="p-3.5 whitespace-nowrap">{t('dashboard.transactionsTab.colTxWireRef')}</th>
                    <th className="p-3.5 whitespace-nowrap text-center">{t('dashboard.transactionsTab.colPayoutStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {filteredPayouts.map((p) => (
                    <tr key={p.payoutId} className="hover:bg-cyan-500/5 transition-colors">
                      {/* Date */}
                      <td className="p-3.5 whitespace-nowrap text-slate-300">
                        <div className="font-semibold text-white">
                          {new Date(p.depositedAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.depositedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Payout ID */}
                      <td dir="ltr" className="p-3.5 whitespace-nowrap font-mono font-bold text-cyan-300">
                        {p.payoutId}
                      </td>

                      {/* Amount */}
                      <td dir="ltr" className="p-3.5 whitespace-nowrap text-end font-black text-emerald-400 text-sm">
                        +${p.amount.toFixed(2)} USD
                      </td>

                      {/* Method */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-[10px]">
                          {p.method === 'crypto_usdc' ? (
                            <>
                              <Wallet className="w-3 h-3 text-cyan-400" />
                              {t('dashboard.transactionsTab.methodUsdc')}
                            </>
                          ) : (
                            <>
                              <Landmark className="w-3 h-3 text-cyan-400" />
                              {t('dashboard.transactionsTab.methodSwift')}
                            </>
                          )}
                        </span>
                      </td>

                      {/* Destination */}
                      <td dir="ltr" className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-300">
                        <div className="max-w-[180px] truncate" title={p.destination}>
                          {p.destination || 'Registered Bank / Wallet'}
                        </div>
                      </td>

                      {/* Reference */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-white" dir="ltr">
                          <span className="max-w-[140px] truncate">{p.reference}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyRef(p.reference, p.payoutId)}
                            className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 cursor-pointer"
                            title={t('dashboard.transactionsTab.copyRefTitle')}
                          >
                            {copiedPayoutId === p.payoutId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {p.notes && <div className="text-[10px] text-slate-400 italic">{p.notes}</div>}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap text-center">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                          {p.status || t('dashboard.transactionsTab.statusCompleted')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}
