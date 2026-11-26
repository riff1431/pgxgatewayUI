import { useState, useEffect } from 'react'
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Loader2,
  AlertCircle,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { api, type PaymentLinkItem } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const

export default function PaymentLinksTab() {
  const { merchant, addToast } = useAuth()

  const [links, setLinks] = useState<PaymentLinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<string>('USD')
  const [description, setDescription] = useState('')
  const [reusable, setReusable] = useState(true)

  const isLive = merchant?.accountMode === 'live'
  const trialExpiresAt = merchant?.trial?.expiresAt ? new Date(merchant.trial.expiresAt) : null
  const isTrialActive = Boolean(
    merchant?.accountMode === 'trial' &&
      merchant?.trial?.isActive &&
      merchant?.trial?.status === 'active' &&
      trialExpiresAt &&
      new Date() <= trialExpiresAt
  )
  const isCheckoutReady = isLive || isTrialActive
  const maxTrialAmount = merchant?.trial?.maxTestAmount || 100

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await api.paymentLinks.list()
        if (active) {
          setLinks(Array.isArray(res.data) ? res.data : [])
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load payment links.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const getShareUrl = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pgxgateway.com'
    return `${origin}/pay/${slug}`
  }

  const handleCopy = (id: string, slug: string) => {
    navigator.clipboard.writeText(getShareUrl(slug))
    setCopiedId(id)
    addToast('Payment Link Copied', 'Share this URL with your customer on WhatsApp, email, or social.', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numericAmount = parseFloat(amount)
    if (!title.trim()) {
      setError('Please enter a title or product name.')
      return
    }
    if (isNaN(numericAmount) || numericAmount < 0.5) {
      setError('Amount must be at least 0.50.')
      return
    }

    setCreating(true)
    try {
      const res = await api.paymentLinks.create({
        title: title.trim(),
        description: description.trim() || undefined,
        amount: numericAmount,
        currency,
        reusable,
      })
      if (res.data) {
        setLinks((prev) => [res.data!, ...prev])
      }
      setTitle('')
      setAmount('')
      setDescription('')
      addToast('Payment Link Created', 'Your hosted payment link is ready to share.', 'success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create payment link.')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleStatus = async (link: PaymentLinkItem) => {
    const nextStatus = link.status === 'active' ? 'disabled' : 'active'
    try {
      const res = await api.paymentLinks.updateStatus(link._id, nextStatus)
      if (res.data) {
        setLinks((prev) => prev.map((item) => (item._id === link._id ? res.data! : item)))
      }
      addToast(
        nextStatus === 'active' ? 'Link Activated' : 'Link Paused',
        `"${link.title}" is now ${nextStatus === 'active' ? 'accepting payments' : 'paused'}.`,
        'success'
      )
    } catch (err: unknown) {
      addToast('Error', err instanceof Error ? err.message : 'Could not update link status.', 'error')
    }
  }

  const handleDelete = async (link: PaymentLinkItem) => {
    try {
      await api.paymentLinks.remove(link._id)
      setLinks((prev) => prev.filter((item) => item._id !== link._id))
      addToast('Deleted', `Payment link "${link.title}" removed.`, 'success')
    } catch (err: unknown) {
      addToast('Error', err instanceof Error ? err.message : 'Failed to delete link.', 'error')
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Link2 className="h-6 w-6 text-cyan-400" />
            <span>Payment Links</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Create hosted payment links with no coding required. Share with customers to accept cards, Apple Pay, Google Pay, and local payment methods.
          </p>
        </div>

        <span
          className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border shrink-0 self-start sm:self-auto ${
            isLive
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/50'
              : isTrialActive
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/50'
                : 'bg-amber-500/15 text-amber-300 border-amber-400/50'
          }`}
        >
          {isLive ? 'Live Processing Active' : isTrialActive ? `24h Sandbox (Max $${maxTrialAmount})` : 'Pending Activation'}
        </span>
      </div>

      {/* 3-Step Quick Payment Links Guide */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-[#060b20] to-blue-500/10 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            1
          </div>
          <div className="text-xs space-y-1">
            <strong className="text-white block font-bold text-sm">1. Create Payment Link</strong>
            <p className="text-slate-300 leading-relaxed">
              Enter item title, amount, and currency. Choose <span className="text-cyan-300 font-semibold">Reusable</span> for multiple buyers or <span className="text-cyan-300 font-semibold">One-Time</span> for single invoices.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            2
          </div>
          <div className="text-xs space-y-1">
            <strong className="text-white block font-bold text-sm">2. Share Link Anywhere</strong>
            <p className="text-slate-300 leading-relaxed">
              Click <span className="text-cyan-300 font-semibold">Copy Link</span> and send the <code className="text-cyan-300 font-mono">/pay/...</code> URL via WhatsApp, email, DM, or invoice. Buyers pay via Card, Apple Pay, Google Pay, or local methods.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            3
          </div>
          <div className="text-xs space-y-1">
            <strong className="text-white block font-bold text-sm">3. Track & Auto-Settle</strong>
            <p className="text-slate-300 leading-relaxed">
              Payments appear instantly in your <span className="text-cyan-300 font-semibold">Transactions</span> ledger and update link volume automatically. Pause or delete links anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Activation Notice */}
      {!isCheckoutReady && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-400/60 text-amber-200 text-xs flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-white">Account Activation Required Before Collecting Payments</div>
            <p className="text-amber-200/80 mt-0.5">
              You can draft and organize payment links now, but customers cannot complete checkout until underwriting enables your 24-hour sandbox trial or live processing.
            </p>
          </div>
        </div>
      )}

      {isTrialActive && !isLive && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 text-xs flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">24-Hour Sandbox Mode Active</div>
            <p className="text-slate-300 mt-0.5">
              Trial links support test orders up to <span className="font-bold text-cyan-300">${maxTrialAmount}.00</span>. Complete your setup fee to unlock unlimited live volume.
            </p>
          </div>
        </div>
      )}

      {/* Create Payment Link Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.25)] p-5 sm:p-7 backdrop-blur-xl space-y-5"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <Plus className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Create a New Payment Link</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-slate-300 font-semibold block">Item / Service Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Retainer, Coaching Package, Custom Order"
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-slate-300 font-semibold block">Amount *</label>
            <input
              type="number"
              required
              min="0.50"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-slate-300 font-semibold block">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-8 space-y-1.5">
            <label className="text-slate-300 font-semibold block">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shown to the buyer on the hosted payment page"
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-slate-300 font-semibold block">Link Usage</label>
            <select
              value={reusable ? 'reusable' : 'one_time'}
              onChange={(e) => setReusable(e.target.value === 'reusable')}
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="reusable">Reusable (Multiple Customers)</option>
              <option value="one_time">One-Time (Auto-closes after 1 payment)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_18px_rgba(0,240,255,0.45)] hover:shadow-[0_0_26px_rgba(0,240,255,0.75)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>{creating ? 'Generating...' : 'Generate Payment Link'}</span>
          </button>
        </div>
      </form>

      {/* Created Payment Links List */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-5 sm:p-7 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <h3 className="text-base font-bold text-white">Your Payment Links ({links.length})</h3>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Loading payment links...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="py-10 text-center space-y-2 text-slate-400 text-xs">
            <Link2 className="h-8 w-8 text-cyan-500/40 mx-auto" />
            <p className="font-semibold text-slate-300">No payment links created yet</p>
            <p>Create your first link above and send it to customers anywhere.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const shareUrl = getShareUrl(link.slug)
              const isCompleted = link.status === 'completed'
              const isActive = link.status === 'active'

              return (
                <div
                  key={link._id}
                  className="p-4 rounded-2xl bg-[#091332]/85 border border-cyan-500/25 hover:border-cyan-400/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{link.title}</span>
                      <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {link.amount.toFixed(2)} {link.currency}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                            : isCompleted
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                              : 'bg-slate-700/50 text-slate-300 border-slate-600'
                        }`}
                      >
                        {isActive ? 'Active' : isCompleted ? 'Paid & Completed' : 'Paused'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {link.reusable ? 'Reusable' : 'One-Time'}
                      </span>
                    </div>

                    {link.description && <p className="text-xs text-slate-400 truncate">{link.description}</p>}

                    <div className="flex items-center gap-3 flex-wrap text-[11px]">
                      <span className="font-mono text-cyan-300 truncate max-w-full">{shareUrl}</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {link.totalPayments} paid (${(link.totalVolume || 0).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(link._id, link.slug)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === link._id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedId === link._id ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-fuchsia-400/50 text-fuchsia-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open</span>
                    </a>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(link)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                        title={isActive ? 'Pause link' : 'Activate link'}
                      >
                        {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(link)}
                      className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 cursor-pointer"
                      title="Delete payment link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
