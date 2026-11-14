import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  CheckCircle2,
  Loader2,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import {
  fetchPlatformSettings,
  updatePlatformSettings,
} from '@/lib/setupApi'

interface PlatformSettingsTabProps {
  onSuccessToast?: (title: string, desc: string) => void
  onErrorToast?: (title: string, desc: string) => void
}

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export default function PlatformSettingsTab({ onSuccessToast, onErrorToast }: PlatformSettingsTabProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [setupFeePriceUSD, setSetupFeePriceUSD] = useState<number>(450.0)
  const [officialGithubHandle, setOfficialGithubHandle] = useState('pgxgateway')
  const [affiliateCommissionRate, setAffiliateCommissionRate] = useState<number>(20.0)
  const [supportWhatsapp, setSupportWhatsapp] = useState('+1 (437) 577-8785')

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPlatformSettings()
      setSetupFeePriceUSD(data.setupFeePriceUSD ?? 450.0)
      setOfficialGithubHandle(data.officialGithubHandle || 'pgxgateway')
      setAffiliateCommissionRate(data.affiliateCommissionRate ?? 20.0)
      setSupportWhatsapp(
        data.supportWhatsapp && data.supportWhatsapp !== '+1 (800) 749-4283'
          ? data.supportWhatsapp
          : '+1 (437) 577-8785'
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error connecting to backend'
      onErrorToast?.('Failed to load platform settings', message)
    } finally {
      setLoading(false)
    }
  }, [onErrorToast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updatePlatformSettings({
        setupFeePriceUSD: Number(setupFeePriceUSD),
        officialGithubHandle: officialGithubHandle.trim().replace(/^@/, ''),
        affiliateCommissionRate: Number(affiliateCommissionRate),
        supportWhatsapp: supportWhatsapp.trim(),
      })
      onSuccessToast?.(
        'Platform Settings Updated',
        'Setup fee, affiliate commissions, GitHub handle, and support desk saved successfully.'
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Server error occurred'
      onErrorToast?.('Failed to save settings', message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading Super Admin platform configurations...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 sm:space-y-8 animate-fade-in w-full max-w-full min-w-0">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#091a45] to-[#071330] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Super Admin Platform Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Configure merchant onboarding setup fees, official team GitHub handle, affiliate commissions, and support desk.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040819] font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Platform Settings
        </button>
      </div>

      {/* Bridge Engine Notice Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06102b] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Payment Processing & Cloaking Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                E-Commerce Bridge Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer checkouts and Stripe credentials (Test / Live) are securely managed and cloaked via the E-Commerce Storefront Bridge.
            </p>
          </div>
        </div>
        <a
          href="https://pgxdigital.shop"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors shrink-0"
        >
          <span>Storefront Bridge</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start w-full max-w-full min-w-0">
        {/* Card 1: Setup Fee & Affiliate Commission */}
        <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 sm:p-8 space-y-6 w-full max-w-full min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Setup Fee & Commissions</h3>
              <p className="text-xs text-slate-300">Dynamic pricing and affiliate splits</p>
            </div>
          </div>

          {/* Setup Fee Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Merchant Setup Fee (USD)</label>
              <span className="text-[10px] text-cyan-300 font-bold">Standard Pricing</span>
            </div>
            <div className="flex items-center rounded-xl bg-[#030614] border border-cyan-500/30 overflow-hidden">
              <span className="px-3 text-cyan-400 font-bold text-sm">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={setupFeePriceUSD}
                onChange={(e) => setSetupFeePriceUSD(Number(e.target.value))}
                className="w-full pr-4 py-2.5 bg-transparent text-white font-bold text-sm focus:outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSetupFeePriceUSD(450)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  setupFeePriceUSD === 450
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-[#030614] text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                $450 (Standard Tier)
              </button>
              <button
                type="button"
                onClick={() => setSetupFeePriceUSD(565)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  setupFeePriceUSD === 565
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-[#030614] text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                $565 (VIP Turnkey)
              </button>
            </div>
          </div>

          {/* Affiliate Commission Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Reseller Affiliate Commission</label>
            <div className="flex items-center rounded-xl bg-[#030614] border border-cyan-500/30 overflow-hidden">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={affiliateCommissionRate}
                onChange={(e) => setAffiliateCommissionRate(Number(e.target.value))}
                className="w-full pl-4 py-2.5 bg-transparent text-white font-bold text-sm focus:outline-none"
              />
              <span className="px-3 text-cyan-400 font-bold text-sm">%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Amount credited to reseller: <span className="text-white font-semibold">${((setupFeePriceUSD * affiliateCommissionRate) / 100).toFixed(2)} USD</span> per referred merchant.
            </p>
          </div>
        </div>

        {/* Card 2: GitHub Handle & WhatsApp Desk */}
        <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 sm:p-8 space-y-6 w-full max-w-full min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <GithubIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Collaboration & Support Desk</h3>
              <p className="text-xs text-slate-300">GitHub team handle and direct merchant communications</p>
            </div>
          </div>

          {/* GitHub Organization or Handle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">GitHub Organization or Username</label>
            <div className="flex items-center rounded-xl bg-[#030614] border border-cyan-500/30 overflow-hidden">
              <span className="px-3 text-cyan-400 font-mono text-sm font-bold">@</span>
              <input
                type="text"
                placeholder="pgxgateway"
                value={officialGithubHandle}
                onChange={(e) => setOfficialGithubHandle(e.target.value)}
                className="w-full pr-4 py-2.5 bg-transparent text-white font-mono text-sm focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Displayed in the merchant&apos;s 1-click collaboration desk to invite your integration team.
            </p>
          </div>

          {/* Crypto Payments & Direct WhatsApp Finance Desk */}
          <div className="space-y-2 pt-4 border-t border-cyan-500/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Crypto Payments & Finance WhatsApp</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Merchants choosing &ldquo;Pay with Bitcoin&rdquo; for their setup fee will be directed to this WhatsApp number to arrange Bitcoin (BTC) transfer.
            </p>
            <div className="flex items-center rounded-xl bg-[#030614] border border-cyan-500/30 overflow-hidden">
              <span className="px-3 text-emerald-400 font-bold text-sm">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="+1 (437) 577-8785"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                className="w-full pr-4 py-2.5 bg-transparent text-white font-bold text-sm focus:outline-none"
              />
            </div>
            <div className="p-2.5 rounded-xl bg-[#09153a] border border-cyan-500/20 text-[11px] text-slate-300 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">Auto Message:</span>
              <span className="text-slate-400 truncate italic">
                &ldquo;Hi, I accepted the processing offer and want to pay Setup Fee via Crypto...&rdquo;
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
