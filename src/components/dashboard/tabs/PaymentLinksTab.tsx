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
import { useTranslation } from '@/context/LanguageContext'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const

export default function PaymentLinksTab() {
  const { merchant, addToast } = useAuth()
  const { t } = useTranslation()

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
          setError(err instanceof Error ? err.message : t('dashboard.paymentLinksTab.errLoad'))
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
  }, [t])

  const getShareUrl = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pgxgateway.com'
    return `${origin}/pay/${slug}`
  }

  const handleCopy = (id: string, slug: string) => {
    navigator.clipboard.writeText(getShareUrl(slug))
    setCopiedId(id)
    addToast(
      t('dashboard.paymentLinksTab.toastCopiedTitle'),
      t('dashboard.paymentLinksTab.toastCopiedDesc'),
      'success'
    )
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numericAmount = parseFloat(amount)
    if (!title.trim()) {
      setError(t('dashboard.paymentLinksTab.errTitle'))
      return
    }
    if (isNaN(numericAmount) || numericAmount < 0.5) {
      setError(t('dashboard.paymentLinksTab.errAmount'))
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
      addToast(
        t('dashboard.paymentLinksTab.toastCreatedTitle'),
        t('dashboard.paymentLinksTab.toastCreatedDesc'),
        'success'
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.paymentLinksTab.errCreate'))
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
        t('dashboard.paymentLinksTab.toastUpdatedTitle'),
        `${link.title}: ${nextStatus === 'active' ? t('dashboard.paymentLinksTab.activeBadge') : t('dashboard.paymentLinksTab.pausedBadge')}`,
        'success'
      )
    } catch (err: unknown) {
      addToast(
        t('dashboard.quickActions.errorTitle'),
        err instanceof Error ? err.message : t('dashboard.paymentLinksTab.errStatus'),
        'error'
      )
    }
  }

  const handleDelete = async (link: PaymentLinkItem) => {
    try {
      await api.paymentLinks.remove(link._id)
      setLinks((prev) => prev.filter((item) => item._id !== link._id))
      addToast(
        t('dashboard.paymentLinksTab.toastDeletedTitle'),
        t('dashboard.paymentLinksTab.toastDeletedDesc', { title: link.title }),
        'success'
      )
    } catch (err: unknown) {
      addToast(
        t('dashboard.quickActions.errorTitle'),
        err instanceof Error ? err.message : t('dashboard.paymentLinksTab.errStatus'),
        'error'
      )
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Link2 className="h-6 w-6 text-cyan-400" />
            <span>{t('dashboard.paymentLinksTab.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('dashboard.paymentLinksTab.desc')}
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
          {isLive
            ? t('dashboard.paymentLinksTab.statusLive')
            : isTrialActive
              ? `${t('dashboard.paymentLinksTab.statusTrial')} (Max $${maxTrialAmount})`
              : t('dashboard.paymentLinksTab.statusLocked')}
        </span>
      </div>

      {/* 3-Step Quick Payment Links Guide */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-[#060b20] to-blue-500/10 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            1
          </div>
          <div className="text-xs space-y-1">
            <strong className="text-white block font-bold text-sm">{t('dashboard.paymentLinksTab.step1Title')}</strong>
            <p className="text-slate-300 leading-relaxed">
              {t('dashboard.paymentLinksTab.step1Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            2
          </div>
          <div className="text-xs space-y-1">
            <strong className="text-white block font-bold text-sm">{t('dashboard.paymentLinksTab.step2Title')}</strong>
            <p className="text-slate-300 leading-relaxed">
              {t('dashboard.paymentLinksTab.step2Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            3
          </div>
          <div className="text-xs space-y-1">
            <strong className="text-white block font-bold text-sm">{t('dashboard.paymentLinksTab.step3Title')}</strong>
            <p className="text-slate-300 leading-relaxed">
              {t('dashboard.paymentLinksTab.step3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Activation Notice */}
      {!isCheckoutReady && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-400/60 text-amber-200 text-xs flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-white">{t('dashboard.paymentLinksTab.activationRequiredTitle')}</div>
            <p className="text-amber-200/80 mt-0.5">
              {t('dashboard.paymentLinksTab.activationRequiredDesc')}
            </p>
          </div>
        </div>
      )}

      {isTrialActive && !isLive && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 text-xs flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">{t('dashboard.paymentLinksTab.trialActiveTitle')}</div>
            <p className="text-slate-300 mt-0.5">
              {t('dashboard.paymentLinksTab.trialActiveDesc', { max: maxTrialAmount })}
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
          <h3 className="text-base font-bold text-white">{t('dashboard.paymentLinksTab.createTitle')}</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('dashboard.paymentLinksTab.itemLabel')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('dashboard.paymentLinksTab.itemPlaceholder')}
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('dashboard.paymentLinksTab.amountLabel')}</label>
            <input
              type="number"
              required
              min="0.50"
              step="0.01"
              dir="ltr"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('dashboard.paymentLinksTab.currencyLabel')}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              dir="ltr"
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
            <label className="text-slate-300 font-semibold block">{t('dashboard.paymentLinksTab.descLabel')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('dashboard.paymentLinksTab.descPlaceholder')}
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('dashboard.paymentLinksTab.usageLabel')}</label>
            <select
              value={reusable ? 'reusable' : 'one_time'}
              onChange={(e) => setReusable(e.target.value === 'reusable')}
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="reusable">{t('dashboard.paymentLinksTab.usageReusable')}</option>
              <option value="one_time">{t('dashboard.paymentLinksTab.usageOneTime')}</option>
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
            <span>{creating ? t('dashboard.paymentLinksTab.creatingBtn') : t('dashboard.paymentLinksTab.createBtn')}</span>
          </button>
        </div>
      </form>

      {/* Created Payment Links List */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-5 sm:p-7 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <h3 className="text-base font-bold text-white">
            {t('dashboard.paymentLinksTab.yourLinksTitle', { count: links.length })}
          </h3>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>{t('dashboard.paymentLinksTab.loading')}</span>
          </div>
        ) : links.length === 0 ? (
          <div className="py-10 text-center space-y-2 text-slate-400 text-xs">
            <Link2 className="h-8 w-8 text-cyan-500/40 mx-auto" />
            <p className="font-semibold text-slate-300">{t('dashboard.paymentLinksTab.emptyTitle')}</p>
            <p>{t('dashboard.paymentLinksTab.emptyDesc')}</p>
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
                      <span dir="ltr" className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
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
                        {isActive
                          ? t('dashboard.paymentLinksTab.activeBadge')
                          : isCompleted
                            ? t('dashboard.invoicesTab.statusPaid')
                            : t('dashboard.paymentLinksTab.pausedBadge')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {link.reusable
                          ? t('dashboard.paymentLinksTab.reusableBadge')
                          : t('dashboard.paymentLinksTab.oneTimeBadge')}
                      </span>
                    </div>

                    {link.description && <p className="text-xs text-slate-400 truncate">{link.description}</p>}

                    <div className="flex items-center gap-3 flex-wrap text-[11px]">
                      <span dir="ltr" className="font-mono text-cyan-300 truncate max-w-full">{shareUrl}</span>
                      <span className="text-slate-400 flex items-center gap-1" dir="ltr">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {t('dashboard.paymentLinksTab.paidCount', { count: link.totalPayments })} ($
                        {(link.totalVolume || 0).toFixed(2)})
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
                      <span>
                        {copiedId === link._id
                          ? t('dashboard.paymentLinksTab.copied')
                          : t('dashboard.paymentLinksTab.copyLink')}
                      </span>
                    </button>

                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-fuchsia-400/50 text-fuchsia-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{t('dashboard.paymentLinksTab.open')}</span>
                    </a>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(link)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                        title={isActive ? t('dashboard.paymentLinksTab.pause') : t('dashboard.paymentLinksTab.resume')}
                      >
                        {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(link)}
                      className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 cursor-pointer"
                      title={t('dashboard.paymentLinksTab.deleteTitle')}
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
