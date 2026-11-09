import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
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
  const [showSecretKey, setShowSecretKey] = useState(false)

  // Settings state
  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test')
  const [isConfigured, setIsConfigured] = useState(false)

  const [setupFeePriceUSD, setSetupFeePriceUSD] = useState<number>(49.0)
  const [officialGithubHandle, setOfficialGithubHandle] = useState('huipper-dev')
  const [affiliateCommissionRate, setAffiliateCommissionRate] = useState<number>(20.0)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPlatformSettings()
      setPublishableKey(data.stripe?.publishableKey || '')
      setSecretKey(data.stripe?.secretKey || '')
      setWebhookSecret(data.stripe?.webhookSecret || '')
      setStripeMode(data.stripe?.mode || 'test')
      setIsConfigured(Boolean(data.stripe?.isConfigured))
      setSetupFeePriceUSD(data.setupFeePriceUSD ?? 49.0)
      setOfficialGithubHandle(data.officialGithubHandle || 'huipper-dev')
      setAffiliateCommissionRate(data.affiliateCommissionRate ?? 20.0)
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
      const updated = await updatePlatformSettings({
        setupFeePriceUSD: Number(setupFeePriceUSD),
        officialGithubHandle: officialGithubHandle.trim().replace(/^@/, ''),
        affiliateCommissionRate: Number(affiliateCommissionRate),
        stripe: {
          publishableKey: publishableKey.trim(),
          secretKey: secretKey.trim(),
          webhookSecret: webhookSecret.trim(),
          mode: stripeMode,
        },
      })
      setIsConfigured(Boolean(updated.stripe?.isConfigured))
      onSuccessToast?.('Platform Settings Updated', 'Stripe credentials, setup fee, and GitHub configurations saved.')
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
    <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#091a45] to-[#071330] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Super Admin Platform & Payment Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Configure your master Stripe payment gateway to receive setup fees, official team GitHub handle, and affiliate commission rates.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Section 1: Super Admin Stripe Gateway (Left 7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Platform Stripe Account</h3>
                <p className="text-xs text-slate-300">Collects setup fees directly into your Super Admin Stripe account</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isConfigured
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {isConfigured ? 'Gateway Active' : 'Stripe Pending'}
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#030614] border border-cyan-500/20">
            <div className="text-xs font-semibold text-slate-300">Stripe Processing Environment:</div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#091332] border border-cyan-500/30">
              <button
                type="button"
                onClick={() => setStripeMode('test')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stripeMode === 'test'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Test Mode
              </button>
              <button
                type="button"
                onClick={() => setStripeMode('live')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stripeMode === 'live'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Production
              </button>
            </div>
          </div>

          {/* Publishable Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Stripe Publishable Key</label>
            <input
              type="text"
              placeholder={stripeMode === 'live' ? 'pk_live_...' : 'pk_test_...'}
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Secret Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Stripe Secret Key</label>
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {showSecretKey ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Reveal
                  </>
                )}
              </button>
            </div>
            <input
              type={showSecretKey ? 'text' : 'password'}
              placeholder={stripeMode === 'live' ? 'sk_live_...' : 'sk_test_...'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Stripe Webhook Signing Secret</label>
            <input
              type="text"
              placeholder="whsec_..."
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[11px] text-slate-400">
              Webhook endpoint to configure in Stripe: <span className="text-cyan-300 font-mono">https://api.pgxgateway.com/api/v1/webhooks/super-admin/stripe</span>
            </p>
          </div>
        </div>

        {/* Section 2: Onboarding Setup Fee & GitHub Handle (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* GitHub Handle Card */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <GithubIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Official GitHub Handle</h3>
                <p className="text-xs text-slate-300">Merchants copy this username to invite your team</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">GitHub Organization or Username</label>
              <div className="flex items-center rounded-xl bg-[#030614] border border-cyan-500/30 overflow-hidden">
                <span className="px-3 text-cyan-400 font-mono text-sm font-bold">@</span>
                <input
                  type="text"
                  placeholder="huipper-dev"
                  value={officialGithubHandle}
                  onChange={(e) => setOfficialGithubHandle(e.target.value)}
                  className="w-full pr-4 py-2.5 bg-transparent text-white font-mono text-sm focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Displayed in the merchant's 1-click collaboration desk.
              </p>
            </div>
          </div>

          {/* Setup Fee & Affiliate Commission Card */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-4">
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
                      ? 'bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-400'
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
                      ? 'bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-400'
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
        </div>
      </div>
    </form>
  )
}
