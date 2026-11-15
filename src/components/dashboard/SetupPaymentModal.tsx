import { useState } from 'react'
import {
  X,
  CreditCard,
  MessageSquare,
  Mail,
  Camera,
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
  gitRepoUrl: initialGitRepo = '',
  btcAddress = '3DyMA7VZavn4iA4m4scrjMHJyaEn1XRmaz',
  usdcEthAddress = '0x4520FBE6d418c1bAcE97A1E517e5Be2d78eb9598',
  onPaymentSubmitted,
}: SetupPaymentModalProps) {
  // Client prefers crypto as primary payment method
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'stripe'>('crypto')
  const [cryptoAsset, setCryptoAsset] = useState<'USDC' | 'BTC'>('USDC')
  const [contactName, setContactName] = useState(merchantLegalName || '')
  const [companyName, setCompanyName] = useState(merchantLegalName || '')
  const [domain, setDomain] = useState(initialDomain)
  const [gitRepo, setGitRepo] = useState(initialGitRepo)
  const [txHash, setTxHash] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [paying, setPaying] = useState(false)
  const [submittingCrypto, setSubmittingCrypto] = useState(false)
  const [cryptoSuccess, setCryptoSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedWallet, setCopiedWallet] = useState(false)
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // 3% Stripe Card Processing Surcharge calculation
  const stripeFee = Math.round(amount * 0.03 * 100) / 100
  const totalCardAmount = (amount + stripeFee).toFixed(2)

  if (!isOpen) return null

  const activeWalletAddress = cryptoAsset === 'USDC' ? usdcEthAddress : btcAddress
  const activeNetworkName = cryptoAsset === 'USDC' ? 'Ethereum Network (ERC-20)' : 'Bitcoin Network (Native BTC)'

  // Clean phone number for WhatsApp wa.me link
  const cleanPhone = supportWhatsapp.replace(/[^0-9]/g, '') || '14375778785'

  // Pre-filled WhatsApp message
  const whatsappMessage = `Hi, I completed the PGX Setup & Integration Fee payment ($${amount.toFixed(
    2
  )}) via ${cryptoAsset} (${activeNetworkName}).

Contact Name: ${contactName || merchantLegalName || 'N/A'}
Company Name: ${companyName || merchantLegalName || 'N/A'}
Merchant Ref: ${merchantRefId || 'N/A'}
Email: ${merchantEmail || 'N/A'}
TxID: ${txHash.trim() || 'Attached in screenshot'}

Attached is my payment confirmation screenshot. Please verify on blockchain and activate my live gateway.`

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`

  // Pre-filled Email mailto link
  const emailSubject = `Crypto Setup Payment Proof - ${companyName || merchantLegalName || 'Merchant'} (${merchantRefId || 'N/A'})`
  const emailBody = `Hi PGX Gateway Finance Desk,

I have completed the Setup & Integration Fee payment ($${amount.toFixed(2)}) via ${cryptoAsset} (${activeNetworkName}).

Contact Name: ${contactName || merchantLegalName || 'N/A'}
Company Name: ${companyName || merchantLegalName || 'N/A'}
Merchant Ref ID: ${merchantRefId || 'N/A'}
Account Email: ${merchantEmail || 'N/A'}
Blockchain TxID: ${txHash.trim() || 'Attached in screenshot'}

I have attached the payment confirmation screenshot to this email. Please verify on the blockchain and activate my live gateway integration.

Thank you!`

  const emailUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(activeWalletAddress)
    setCopiedWallet(true)
    setTimeout(() => setCopiedWallet(false), 2000)
  }

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(supportWhatsapp)
    setCopiedWhatsapp(true)
    setTimeout(() => setCopiedWhatsapp(false), 2000)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
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

  const handleSubmitCryptoProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txHash.trim()) {
      setError('Please enter your blockchain Transaction Hash (TxID).')
      return
    }
    if (txHash.trim().length < 8) {
      setError('Please enter a valid Transaction Hash (TxID).')
      return
    }

    setSubmittingCrypto(true)
    setError(null)
    try {
      await submitCryptoPayment({
        currency: cryptoAsset,
        txHash: txHash.trim(),
        senderAddress: senderAddress.trim() || undefined,
        websiteDomain: domain.trim() || undefined,
        gitRepoUrl: gitRepo.trim() || undefined,
      })
      setCryptoSuccess(true)
      if (onPaymentSubmitted) onPaymentSubmitted()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit crypto proof.')
    } finally {
      setSubmittingCrypto(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.4)] flex flex-col overflow-y-auto my-auto">
        
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
            <span className="text-xs text-slate-300">
              {selectedMethod === 'crypto' ? `Total Payable via ${cryptoAsset}:` : 'Total Payable via Card:'}
            </span>
            {merchantRefId && (
              <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                {merchantRefId}
              </span>
            )}
            {selectedMethod === 'crypto' ? (
              <span className="text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Preferred Method • 0% Surcharge
              </span>
            ) : (
              <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                Includes 3% Card Surcharge (+${stripeFee.toFixed(2)})
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">
              ${selectedMethod === 'crypto' ? amount.toFixed(2) : totalCardAmount}
            </span>
            <span className="text-xs text-cyan-300 font-bold uppercase">
              {selectedMethod === 'crypto' ? cryptoAsset : 'USD'}
            </span>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Option 1: Crypto (USDC & BTC) - Preferred by Client */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('crypto')
                setError(null)
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'crypto'
                  ? 'bg-gradient-to-br from-fuchsia-950/50 via-purple-900/40 to-cyan-950/40 border-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.35)]'
                  : 'bg-[#08102b] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#040817] border border-fuchsia-500/30 text-fuchsia-400">
                  <Coins className="h-5 w-5" />
                </div>
                {selectedMethod === 'crypto' && <CheckCircle2 className="h-5 w-5 text-fuchsia-400" />}
              </div>
              <div className="mt-3">
                <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                  <span>Crypto Transfer</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">Preferred</span>
                </div>
                <div className="text-[11px] text-fuchsia-300/80 mt-0.5">
                  USDC (Ethereum ERC-20) & Bitcoin (BTC) • 0% Fee
                </div>
              </div>
            </button>

            {/* Option 2: Card / Stripe */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('stripe')
                setError(null)
              }}
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
                  Stripe Checkout • Visa, MC, Amex (+3% Fee)
                </div>
              </div>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW A: CRYPTOCURRENCY TRANSFER (USDC on Ethereum & BTC) */}
          {selectedMethod === 'crypto' && (
            <div className="space-y-4 animate-fade-in">
              {/* Crypto Asset Selector */}
              <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-[#040817] border border-fuchsia-500/25">
                <button
                  type="button"
                  onClick={() => {
                    setCryptoAsset('USDC')
                    setError(null)
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    cryptoAsset === 'USDC'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                  <span>USDC (Ethereum ERC-20)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCryptoAsset('BTC')
                    setError(null)
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    cryptoAsset === 'BTC'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                  <span>Bitcoin (Native BTC)</span>
                </button>
              </div>

              {cryptoSuccess ? (
                /* Success State */
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Payment Proof Submitted Successfully!</h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                      Your <strong>{cryptoAsset}</strong> transaction hash has been registered. Please send your payment screenshot with your Name and Company Name to WhatsApp or Email below for instant confirmation.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040817] border border-emerald-500/20 text-xs font-mono text-cyan-300 break-all">
                    TxID: {txHash}
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Send Screenshot on WhatsApp</span>
                      <ExternalLink className="h-3 w-3 opacity-80" />
                    </a>
                    <a
                      href={emailUrl}
                      className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Send via Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Wallet Transfer Box & Form */
                <>
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    cryptoAsset === 'USDC'
                      ? 'bg-[#070f2b] border-cyan-500/30'
                      : 'bg-[#120e06] border-amber-500/30'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border ${
                          cryptoAsset === 'USDC' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          <Coins className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block uppercase tracking-wider">
                            {cryptoAsset === 'USDC' ? 'USDC Official Wallet' : 'Bitcoin (BTC) Official Wallet'}
                          </span>
                          <span className={`text-[10px] font-semibold ${
                            cryptoAsset === 'USDC' ? 'text-cyan-400' : 'text-amber-400'
                          }`}>
                            {activeNetworkName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-white font-mono">
                          ${amount.toFixed(2)} USD
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          0% Card Surcharge
                        </div>
                      </div>
                    </div>

                    {/* Official Wallet Address Box with 1-Click Copy */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Send Exact Funds To Address:</span>
                        <span className="text-[10px] text-slate-400 lowercase font-normal">click to copy</span>
                      </label>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#030614] border border-slate-700 hover:border-cyan-400/60 transition-colors">
                        <input
                          type="text"
                          readOnly
                          value={activeWalletAddress}
                          className="w-full bg-transparent text-white font-mono text-xs sm:text-sm select-all outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopyWallet}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                            copiedWallet
                              ? 'bg-emerald-600 text-white'
                              : 'bg-cyan-600/80 hover:bg-cyan-500 text-white'
                          }`}
                        >
                          {copiedWallet ? (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Address</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Network Safety Alert */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-[11px] text-amber-200/90 leading-relaxed">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        {cryptoAsset === 'USDC' ? (
                          <span>
                            <strong>Network Warning:</strong> Send USDC only via <strong>Ethereum Mainnet (ERC-20)</strong>. Do not use Binance Smart Chain, Tron, or Polygon.
                          </span>
                        ) : (
                          <span>
                            <strong>Network Warning:</strong> Send native <strong>Bitcoin (BTC)</strong> only. Do not send Wrapped BTC or tokens on other chains.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Screenshot & Contact Dispatch Instructions Box */}
                  <div className="p-3.5 rounded-2xl bg-[#06122c] border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.12)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wide">
                        <Camera className="h-4 w-4 text-cyan-400" />
                        <span>Screenshot Verification Requirement</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        Fast Activation
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      Please take a <strong>screenshot of your payment confirmation</strong> and send it along with your <strong>Full Name and Company Name</strong> to our finance team for instant blockchain verification:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {/* WhatsApp Option */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-200 font-bold flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-[10px] text-emerald-400 block font-normal uppercase">Send on WhatsApp</span>
                            <span className="font-mono text-xs text-white">{supportWhatsapp}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 shrink-0 ml-1" />
                      </a>

                      {/* Email Option */}
                      <a
                        href={emailUrl}
                        className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 hover:bg-blue-900/60 text-cyan-200 font-bold flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 rounded-lg bg-blue-500/20 text-cyan-300">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-[10px] text-cyan-400 block font-normal uppercase">Send via Email</span>
                            <span className="font-mono text-xs text-white">{supportEmail}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 shrink-0 ml-1" />
                      </a>
                    </div>
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleSubmitCryptoProof} className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-3 text-xs">
                    <span className="font-bold text-white block text-xs">
                      Submit Your Transaction Hash (TxID) to the Portal
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#040817] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Company / Business Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#040817] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Transaction Hash (TxID) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={cryptoAsset === 'USDC' ? '0x...' : 'e.g. 7c9a6f...'}
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#040817] border border-cyan-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Sender Wallet Address (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Your sending address"
                          value={senderAddress}
                          onChange={(e) => setSenderAddress(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#040817] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Store Website Domain (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://mystore.com"
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#040817] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="submit"
                        disabled={submittingCrypto}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-[0_0_18px_rgba(217,70,239,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingCrypto ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Submitting Proof...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Submit Payment Proof for Verification</span>
                          </>
                        )}
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                        title="Send Screenshot via WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Send on WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* VIEW B: STRIPE CARD CHECKOUT */}
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040817] border border-cyan-500/40 text-white font-medium text-base sm:text-xs min-h-[44px] focus:outline-none focus:border-cyan-400"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040817] border border-cyan-500/40 text-white font-medium text-base sm:text-xs min-h-[44px] focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Transparent Card Processing Surcharge Breakdown */}
              <div className="p-3.5 rounded-2xl bg-[#08102b] border border-cyan-500/25 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Base Setup & Integration Fee:</span>
                  <span className="font-bold text-white">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span>Card Processing Surcharge (3%):</span>
                  </span>
                  <span className="font-bold text-cyan-300">+${stripeFee.toFixed(2)} USD</span>
                </div>
                <div className="border-t border-cyan-500/20 pt-2 flex justify-between items-center font-bold">
                  <span className="text-white text-xs">Total Charged via Stripe:</span>
                  <span className="text-cyan-400 font-mono text-base">${totalCardAmount} USD</span>
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
                    <span>Pay ${totalCardAmount} USD via Stripe Checkout</span>
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

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/15 bg-[#040817] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>WhatsApp:</span>
              <span className="font-mono text-white font-bold">{supportWhatsapp}</span>
              <button
                type="button"
                onClick={handleCopyWhatsapp}
                className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Copy WhatsApp"
              >
                {copiedWhatsapp ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Email:</span>
              <span className="font-mono text-white font-bold">{supportEmail}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Copy Email"
              >
                {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

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
