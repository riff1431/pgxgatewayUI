import { useState, useEffect } from 'react'
import {
  CreditCard,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sliders,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { adminApi, type ResellerStripeConfig } from '@/lib/adminApi'

interface StripeGatewayTabProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'error') => void
}

export default function StripeGatewayTab({ onShowToast }: StripeGatewayTabProps) {
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ResellerStripeConfig | null>(null)

  // Form State
  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [mode, setMode] = useState<'test' | 'live'>('test')
  const [merchantFeeRate, setMerchantFeeRate] = useState<number>(12.0)
  const [showSecret, setShowSecret] = useState(false)
  const [showWebhook, setShowWebhook] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  const apiBase =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')
  const webhookUrl = `${apiBase}/webhooks/stripe`

  useEffect(() => {
    let active = true
    const loadConfig = async () => {
      try {
        const res = await adminApi.getStripeConfig()
        if (active && res.data) {
          setConfig(res.data)
          setPublishableKey(res.data.stripe.publishableKey || '')
          setSecretKey(res.data.stripe.secretKeyMasked || '')
          setWebhookSecret(res.data.stripe.webhookSecretMasked || '')
          setMode(res.data.stripe.mode || 'test')
          setMerchantFeeRate(res.data.feeSettings?.merchantFeeRate || 12.0)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load Stripe configuration'
        onShowToast('Error', msg, 'error')
      }
    }

    loadConfig()
    return () => {
      active = false
    }
  }, [onShowToast])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (merchantFeeRate < 9.0) {
      onShowToast('Invalid Fee Rate', 'Merchant fee rate cannot be set lower than the 9.0% hardwired base fee.', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await adminApi.updateStripeConfig({
        publishableKey,
        secretKey: secretKey.includes('••••') ? undefined : secretKey,
        webhookSecret: webhookSecret.includes('••••') ? undefined : webhookSecret,
        mode,
        merchantFeeRate,
      })

      if (res.success) {
        onShowToast('Settings Saved', 'Stripe credentials and merchant fee parameters updated.', 'success')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update gateway settings'
      onShowToast('Error', msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Real-time calculations
  const platformRate = 9.0 // Fixed constant
  const resellerMargin = Math.max(0, merchantFeeRate - platformRate)
  const merchantNetRate = Math.max(0, 100 - merchantFeeRate)

  // Monthly Volume Estimations ($750k projected)
  const monthlyProjectionVolume = 750000
  const monthlySuperAdminFee = (monthlyProjectionVolume * platformRate) / 100
  const monthlyResellerProfit = (monthlyProjectionVolume * resellerMargin) / 100

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.5)] shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Stripe Single-Gateway & Reseller Control</h2>
            <p className="text-xs text-slate-300">
              Plug in your Stripe API credentials to route sub-merchants through your single account using dynamic Ref IDs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              config?.stripe.isConfigured
                ? 'bg-emerald-500/10 border-emerald-400/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500/10 border-amber-400/70 text-amber-300'
            }`}
          >
            {config?.stripe.isConfigured ? 'Gateway Active (Stripe Linked)' : 'Setup Incomplete'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stripe API Keys & Webhook (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Stripe Account API Credentials
                </h3>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#050a20] p-1 rounded-xl border border-cyan-500/30">
                <button
                  type="button"
                  onClick={() => setMode('test')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'test'
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'live'
                      ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Mode
                </button>
              </div>
            </div>

            {/* Publishable Key */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-200 flex justify-between">
                <span>Stripe Publishable Key</span>
                <span className="text-[10px] text-cyan-400 font-mono">pk_test_... or pk_live_...</span>
              </label>
              <input
                type="text"
                required
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder="pk_test_51Pxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl px-3 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-200 flex justify-between">
                <span>Stripe Secret Key</span>
                <span className="text-[10px] text-cyan-400 font-mono">sk_test_... or sk_live_...</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required={!config?.stripe.hasSecretKey}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_test_51Pxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl pl-3 pr-10 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-200 flex justify-between">
                <span>Stripe Webhook Signing Secret</span>
                <span className="text-[10px] text-cyan-400 font-mono">whsec_...</span>
              </label>
              <div className="relative">
                <input
                  type={showWebhook ? 'text' : 'password'}
                  required={!config?.stripe.hasWebhookSecret}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#060c24] border border-cyan-500/40 rounded-xl pl-3 pr-10 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhook(!showWebhook)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Instructions & URL */}
            <div className="p-3.5 rounded-2xl bg-[#09153a] border border-cyan-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                  Your Central Webhook Listener URL
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl)
                    setCopiedWebhook(true)
                    onShowToast('Copied', 'Webhook URL copied.', 'success')
                    setTimeout(() => setCopiedWebhook(false), 2000)
                  }}
                  className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer text-[10px] font-bold"
                >
                  {copiedWebhook ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copy URL</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-white bg-black/40 p-2 rounded-lg border border-cyan-500/20 break-all select-all">
                {webhookUrl}
              </div>
              <p className="text-[11px] text-slate-300">
                In your Stripe Dashboard (<a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">Stripe Webhooks <ExternalLink className="h-2.5 w-2.5" /></a>), add this endpoint and subscribe to <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">checkout.session.completed</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Fee Markup & Profit Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Fee Structure & Profit Markup
              </h3>
            </div>

            {/* Hardwired Base Fee Notice */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/50 to-[#070e28] border border-amber-500/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-amber-300">Super Admin Base Fee (Fixed)</div>
                  <div className="text-[10px] text-slate-300">Hardwired platform commission per transaction</div>
                </div>
              </div>
              <div className="text-lg font-black text-amber-300 font-mono">9.0%</div>
            </div>

            {/* Merchant Fee Rate Input / Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-200">Your Merchant Rate Charged to Clients</label>
                <span className="text-lg font-black text-cyan-300 font-mono">{merchantFeeRate.toFixed(1)}%</span>
              </div>

              <input
                type="range"
                min="9.0"
                max="25.0"
                step="0.1"
                value={merchantFeeRate}
                onChange={(e) => setMerchantFeeRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min: 9.0%</span>
                <span>Standard: 12.0%</span>
                <span>Max: 25.0%</span>
              </div>
            </div>

            {/* Visual Breakdown of $100.00 Transaction */}
            <div className="p-4 rounded-2xl bg-[#071131] border border-cyan-500/30 space-y-2 text-xs">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-1 border-b border-slate-700">
                Live Calculation per $100.00 Sale
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Customer Pays:</span>
                <span className="font-bold text-white font-mono">$100.00</span>
              </div>

              <div className="flex justify-between text-amber-300">
                <span>- Super Admin 9% Fee:</span>
                <span className="font-bold font-mono">-$9.00</span>
              </div>

              <div className="flex justify-between text-fuchsia-300">
                <span>+ Your Reseller Profit Margin:</span>
                <span className="font-bold font-mono">+${resellerMargin.toFixed(2)} ({resellerMargin.toFixed(1)}%)</span>
              </div>

              <div className="border-t border-slate-700 pt-1 flex justify-between font-bold text-emerald-400">
                <span>Sub-Merchant Receives Net:</span>
                <span className="font-mono">${merchantNetRate.toFixed(2)} ({merchantNetRate.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Estimated Monthly Revenue Card ($750k Volume) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0a1845] to-[#04081c] border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Monthly Forecast on $750,000 Target Volume</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-black/40 border border-fuchsia-500/40">
                  <div className="text-[10px] text-fuchsia-300 font-semibold">Your Reseller Net Profit</div>
                  <div className="text-base sm:text-lg font-black text-white font-mono">
                    ${monthlyResellerProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/40">
                  <div className="text-[10px] text-amber-300 font-semibold">Super Admin Platform Fee</div>
                  <div className="text-base sm:text-lg font-black text-white font-mono">
                    ${monthlySuperAdminFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-extrabold text-sm border border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:shadow-[0_0_30px_rgba(217,70,239,0.9)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Stripe & Fee Parameters...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Save Gateway & Fee Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
