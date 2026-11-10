import { useState } from 'react'
import {
  X,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  ExternalLink,
  Globe,
  GitBranch,
  Coins,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react'
import { createSetupCheckout } from '@/lib/setupApi'

interface SetupPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount?: number
  merchantRefId?: string
  merchantLegalName?: string
  merchantEmail?: string
  supportWhatsapp?: string
  websiteDomain?: string
  gitRepoUrl?: string
}

export default function SetupPaymentModal({
  isOpen,
  onClose,
  amount = 450,
  merchantRefId = '',
  merchantLegalName = '',
  merchantEmail = '',
  supportWhatsapp = '+1 (437) 577-8785',
  websiteDomain: initialDomain = '',
  gitRepoUrl: initialGitRepo = '',
}: SetupPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'crypto'>('stripe')
  const [domain, setDomain] = useState(initialDomain)
  const [gitRepo, setGitRepo] = useState(initialGitRepo)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false)

  if (!isOpen) return null

  // Clean phone number for WhatsApp wa.me link
  const cleanPhone = supportWhatsapp.replace(/[^0-9]/g, '') || '18007494283'

  // Pre-filled WhatsApp message
  const whatsappMessage = `Hi, I accepted the commercial processing offer on PGX Gateway and would like to pay the Setup & Integration Fee ($${amount.toFixed(
    2
  )}) via Crypto (USDT).

Merchant Ref: ${merchantRefId || 'N/A'}
Business: ${merchantLegalName || 'N/A'}
Email: ${merchantEmail || 'N/A'}

Please provide your official USDT (TRC-20 / ERC-20) wallet address to arrange payment.`

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(supportWhatsapp)
    setCopiedWhatsapp(true)
    setTimeout(() => setCopiedWhatsapp(false), 2000)
  }

  const handleStripePay = async () => {
    setPaying(true)
    setError(null)
    try {
      const res = await createSetupCheckout({
        websiteDomain: domain.trim(),
        gitRepoUrl: gitRepo.trim(),
      })
      if (res.checkoutUrl) {
        window.location.assign(res.checkoutUrl)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch Stripe Checkout.')
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.4)] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-500/20 bg-gradient-to-r from-[#040819] via-[#091538] to-[#040819] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                Account Activation
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Choose Setup Fee Payment Method
              </h3>
              <p className="text-xs text-slate-400">
                One-time white-glove onboarding and gateway activation fee
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-6 py-3.5 bg-[#08102d] border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Total Setup Fee Payable:</span>
            {merchantRefId && (
              <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                {merchantRefId}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">${amount.toFixed(2)}</span>
            <span className="text-xs text-cyan-300 font-bold">USD</span>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Option 1: Card / Stripe */}
            <button
              type="button"
              onClick={() => setSelectedMethod('stripe')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'stripe'
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'bg-[#08102b] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#040817] border border-cyan-500/30 text-cyan-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                {selectedMethod === 'stripe' && <CheckCircle2 className="h-5 w-5 text-cyan-400" />}
              </div>
              <div className="mt-3">
                <div className="font-bold text-white text-sm">Pay with Card</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Stripe Checkout • Visa, MC, Amex, Apple Pay
                </div>
              </div>
            </button>

            {/* Option 2: Crypto on WhatsApp */}
            <button
              type="button"
              onClick={() => setSelectedMethod('crypto')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'crypto'
                  ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-[#08102b] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#040817] border border-emerald-500/30 text-emerald-400">
                  <Coins className="h-5 w-5" />
                </div>
                {selectedMethod === 'crypto' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              </div>
              <div className="mt-3">
                <div className="font-bold text-white text-sm">Pay with Crypto</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5">
                  USDT, BTC, ETH • WhatsApp Finance Desk
                </div>
              </div>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* VIEW A: STRIPE CARD CHECKOUT */}
          {selectedMethod === 'stripe' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  Store Details for Gateway Integration
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" />
                      Store Website Domain
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://mystore.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040817] border border-cyan-500/40 text-white font-medium text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                      Git Repository Link (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/my-org/my-app"
                      value={gitRepo}
                      onChange={(e) => setGitRepo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040817] border border-cyan-500/40 text-white font-medium text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStripePay}
                disabled={paying}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Opening Stripe Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay ${amount.toFixed(2)} USD via Stripe Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>256-Bit SSL Encrypted Card Processing via Stripe</span>
              </div>
            </div>
          )}

          {/* VIEW B: CRYPTO VIA WHATSAPP */}
          {selectedMethod === 'crypto' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#08102b] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    Crypto Finance Desk (USDT / BTC / ETH)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Manual Settlement
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  To pay your setup fee with cryptocurrency (such as <strong>USDT TRC-20</strong> or <strong>ERC-20</strong>), please message our finance desk on WhatsApp. We will provide our official corporate wallet address and confirm your transaction hash.
                </p>

                <div className="p-3 rounded-xl bg-[#040817] border border-emerald-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Finance Desk WhatsApp:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{supportWhatsapp}</span>
                      <button
                        type="button"
                        onClick={handleCopyWhatsapp}
                        className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedWhatsapp ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Your Merchant Ref ID:</span>
                    <span className="font-bold text-cyan-300 font-mono">{merchantRefId || 'PGX_MERCHANT'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Amount to Settle:</span>
                    <span className="font-bold text-emerald-400">${amount.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message on WhatsApp to Arrange Crypto</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <div className="text-center text-[11px] text-slate-400">
                After transferring USDT, send the TXID / hash screenshot in WhatsApp for instant activation.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/15 bg-[#040817] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Need assistance? Our support team is online 24/7.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            I will pay later
          </button>
        </div>

      </div>
    </div>
  )
}
