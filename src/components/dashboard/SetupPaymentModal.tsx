import { useState } from 'react'
import {
  X,
  CreditCard,
  MessageSquare,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  ExternalLink,
  Coins,
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { createSetupCheckout, submitCryptoPayment } from '@/lib/setupApi'

interface SetupPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount?: number
  merchantRefId?: string
  merchantLegalName?: string
  merchantEmail?: string
  supportWhatsapp?: string
  supportEmail?: string
  websiteDomain?: string
  gitRepoUrl?: string
  btcAddress?: string
  usdcEthAddress?: string
  onPaymentSubmitted?: () => void
}

type PaymentMethod = 'stripe' | 'usdc' | 'btc'

export default function SetupPaymentModal({
  isOpen,
  onClose,
  amount = 450,
  merchantRefId = '',
  merchantLegalName = '',
  merchantEmail = '',
  supportWhatsapp = '+1 (437) 577-8785',
  supportEmail = 'info@pgxgateway.com',
  websiteDomain: initialDomain = '',
  gitRepoUrl = '',
  btcAddress = '3DyMA7VZavn4iA4m4scrjMHJyaEn1XRmaz',
  usdcEthAddress = '0x4520FBE6d418c1bAcE97A1E517e5Be2d78eb9598',
  onPaymentSubmitted,
}: SetupPaymentModalProps) {
  // 3 direct options in the same pop-up box
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('usdc')
  const [domain, setDomain] = useState(initialDomain)
  const [txHash, setTxHash] = useState('')
  const [paying, setPaying] = useState(false)
  const [submittingCrypto, setSubmittingCrypto] = useState(false)
  const [cryptoSuccess, setCryptoSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedWallet, setCopiedWallet] = useState(false)

  if (!isOpen) return null

  // 3% card fee calculation
  const stripeFee = Math.round(amount * 0.03 * 100) / 100
  const totalCardAmount = (amount + stripeFee).toFixed(2)

  // Active crypto wallet & network info
  const activeWallet = selectedMethod === 'btc' ? btcAddress : usdcEthAddress
  const activeCurrency = selectedMethod === 'btc' ? 'BTC' : 'USDC'
  const activeNetwork = selectedMethod === 'btc' ? 'Bitcoin Network' : 'Ethereum (ERC-20)'

  const cleanPhone = supportWhatsapp.replace(/[^0-9]/g, '') || '14375778785'

  // Pre-filled WhatsApp message
  const whatsappMsg = `Hi, I sent the setup fee ($${amount.toFixed(2)}) via ${activeCurrency} (${activeNetwork}).
Name: ${merchantLegalName || 'Merchant'}
Merchant Ref: ${merchantRefId || 'N/A'}
Email: ${merchantEmail || 'N/A'}
TxID: ${txHash.trim() || 'Attached in screenshot'}

Attached is my payment confirmation screenshot.`

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`

  // Pre-filled Email link
  const emailSubj = `Setup Payment Proof - ${merchantLegalName || 'Merchant'} (${merchantRefId || 'N/A'})`
  const emailBody = `Hi PGX Gateway,

I have sent the setup fee ($${amount.toFixed(2)}) via ${activeCurrency} (${activeNetwork}).

Merchant Name: ${merchantLegalName || 'Merchant'}
Merchant Ref ID: ${merchantRefId || 'N/A'}
Email: ${merchantEmail || 'N/A'}
TxID: ${txHash.trim() || 'Attached in screenshot'}

Attached is my payment screenshot. Please activate my live integration.`

  const emailUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(emailSubj)}&body=${encodeURIComponent(emailBody)}`

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(activeWallet)
    setCopiedWallet(true)
    setTimeout(() => setCopiedWallet(false), 2000)
  }

  const handleStripePay = async () => {
    setPaying(true)
    setError(null)
    try {
      const res = await createSetupCheckout({
        websiteDomain: domain.trim(),
        gitRepoUrl: gitRepoUrl.trim(),
      })
      if (res.checkoutUrl) {
        window.location.assign(res.checkoutUrl)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch checkout.')
      setPaying(false)
    }
  }

  const handleSubmitCryptoProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txHash.trim()) {
      setError('Please paste your Transaction Hash (TxID).')
      return
    }

    setSubmittingCrypto(true)
    setError(null)
    try {
      await submitCryptoPayment({
        currency: activeCurrency,
        txHash: txHash.trim(),
        websiteDomain: domain.trim() || undefined,
        gitRepoUrl: gitRepoUrl.trim() || undefined,
      })
      setCryptoSuccess(true)
      if (onPaymentSubmitted) onPaymentSubmitted()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit proof.')
    } finally {
      setSubmittingCrypto(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-[#060b20] border border-cyan-400/80 shadow-[0_0_40px_rgba(0,240,255,0.3)] flex flex-col overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-[#040819] via-[#091538] to-[#040819] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  Setup & Onboarding Fee
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  ${selectedMethod === 'stripe' ? totalCardAmount : amount.toFixed(2)} USD
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Choose your preferred payment method below
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Payment Options in the Same Pop-Up Box */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Option 1: Card / Stripe */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('stripe')
                setError(null)
              }}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[96px] ${
                selectedMethod === 'stripe'
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
                  : 'bg-[#08102b] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <CreditCard className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedMethod === 'stripe' ? 'text-cyan-400' : 'text-slate-400'}`} />
                {selectedMethod === 'stripe' && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">Card</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                  ${totalCardAmount} (+3%)
                </div>
              </div>
            </button>

            {/* Option 2: USDC (Ethereum ERC-20) */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('usdc')
                setError(null)
              }}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[96px] ${
                selectedMethod === 'usdc'
                  ? 'bg-gradient-to-br from-blue-950/60 to-cyan-950/40 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
                  : 'bg-[#08102b] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Coins className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedMethod === 'usdc' ? 'text-cyan-300' : 'text-slate-400'}`} />
                {selectedMethod === 'usdc' && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1">
                  <span>USDC</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold hidden xs:inline">0% Fee</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-cyan-300/80 mt-0.5 truncate">
                  Ethereum ERC-20
                </div>
              </div>
            </button>

            {/* Option 3: Bitcoin (BTC) */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('btc')
                setError(null)
              }}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[96px] ${
                selectedMethod === 'btc'
                  ? 'bg-gradient-to-br from-amber-950/60 to-orange-950/40 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                  : 'bg-[#08102b] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Coins className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedMethod === 'btc' ? 'text-amber-400' : 'text-slate-400'}`} />
                {selectedMethod === 'btc' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1">
                  <span>Bitcoin</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold hidden xs:inline">0% Fee</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-amber-300/80 mt-0.5 truncate">
                  Native BTC
                </div>
              </div>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW 1: STRIPE CARD CHECKOUT */}
          {selectedMethod === 'stripe' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Setup & Integration Fee:</span>
                  <span className="font-bold text-white font-mono">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Card Processing Fee (3%):</span>
                  <span className="font-bold text-cyan-300 font-mono">+${stripeFee.toFixed(2)} USD</span>
                </div>
                <div className="border-t border-cyan-500/15 pt-2 flex justify-between items-center font-bold">
                  <span className="text-white">Total Charged:</span>
                  <span className="text-cyan-400 font-mono text-base font-black">${totalCardAmount} USD</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Store Website Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://yourstore.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040817] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleStripePay}
                disabled={paying}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Opening Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay ${totalCardAmount} USD with Card</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>256-Bit SSL Encrypted Card Processing</span>
              </div>
            </div>
          )}

          {/* VIEW 2 & 3: CRYPTO (USDC OR BITCOIN) */}
          {(selectedMethod === 'usdc' || selectedMethod === 'btc') && (
            <div className="space-y-3.5 animate-fade-in">
              {cryptoSuccess ? (
                /* Success Confirmation */
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2.5 animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mx-auto">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Payment Proof Submitted</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Please send your transfer screenshot to WhatsApp or Email for instant activation.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#040817] border border-emerald-500/20 text-xs font-mono text-cyan-300 break-all">
                    TxID: {txHash}
                  </div>
                  <div className="pt-1 flex flex-wrap gap-2 justify-center">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp Screenshot</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                    <a
                      href={emailUrl}
                      className="px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email Screenshot</span>
                    </a>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Wallet Details & Instructions */
                <>
                  {/* Address Box */}
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                    selectedMethod === 'btc' ? 'bg-[#120e06] border-amber-500/30' : 'bg-[#070f2b] border-cyan-500/30'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white uppercase tracking-wide">
                          {selectedMethod === 'btc' ? 'Bitcoin (BTC) Wallet' : 'USDC Wallet'}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          selectedMethod === 'btc' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {activeNetwork}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        ${amount.toFixed(2)} USD
                      </span>
                    </div>

                    {/* Copy Address */}
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#030614] border border-slate-700 hover:border-cyan-400/50 transition-colors">
                      <input
                        type="text"
                        readOnly
                        value={activeWallet}
                        className="w-full bg-transparent text-white font-mono text-xs select-all outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyWallet}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all ${
                          copiedWallet
                            ? 'bg-emerald-600 text-white'
                            : selectedMethod === 'btc' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        {copiedWallet ? (
                          <>
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span>Send <strong>${amount.toFixed(2)} USD</strong> via <strong>{activeNetwork}</strong>. 0% surcharge.</span>
                    </div>
                  </div>

                  {/* Screenshot Instruction Box */}
                  <div className="p-3 rounded-xl bg-[#06122c] border border-cyan-400/30 space-y-2">
                    <p className="text-xs text-slate-200 leading-relaxed">
                      📸 <strong>Screenshot Verification:</strong> Take a screenshot of payment with your <strong>Name & Company</strong>, and send to WhatsApp or Email:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-[130px] px-3 py-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-200 font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span>WhatsApp (+1 437 577-8785)</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                      <a
                        href={emailUrl}
                        className="flex-1 min-w-[130px] px-3 py-2 rounded-lg bg-blue-950/70 border border-blue-500/40 hover:bg-blue-900/60 text-cyan-200 font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Mail className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Email Proof</span>
                      </a>
                    </div>
                  </div>

                  {/* Quick TxID Submit Form */}
                  <form onSubmit={handleSubmitCryptoProof} className="space-y-2 text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste Blockchain TxID / Hash (Optional)"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#040817] border border-slate-700 focus:border-cyan-400 text-white font-mono text-xs outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingCrypto}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {submittingCrypto ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Submit TxID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-cyan-500/15 bg-[#040819] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="truncate text-[11px]">
            Support: <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">+1 437 577-8785</a>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
