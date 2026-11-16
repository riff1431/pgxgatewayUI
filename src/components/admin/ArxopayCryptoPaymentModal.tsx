import { useState } from 'react'
import {
  X,
  Coins,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Zap,
  Calendar,
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

interface ArxopayCryptoPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  merchantId: string
  merchantRefId?: string
  merchantLegalName?: string
  mode: 'golive' | 'monthly'
  onSuccess: () => void
}

type CryptoAsset = 'USDT_TRC20' | 'USDT_ERC20' | 'BTC' | 'USDC_ERC20'

const CRYPTO_WALLETS: Record<
  CryptoAsset,
  { label: string; currency: string; network: string; address: string; badge: string }
> = {
  USDT_TRC20: {
    label: 'USDT (TRC-20)',
    currency: 'USDT',
    network: 'TRC-20 (Tron)',
    address: 'TNtVp9Zk7eN77vD7wX252F4Q1w7PqQvYdZ',
    badge: 'Fast & Low Fee',
  },
  USDT_ERC20: {
    label: 'USDT (ERC-20)',
    currency: 'USDT',
    network: 'ERC-20 (Ethereum)',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    badge: 'Ethereum Network',
  },
  BTC: {
    label: 'Bitcoin (BTC)',
    currency: 'BTC',
    network: 'Native Bitcoin',
    address: '3DyMA7VZavn4iA4m4scrjMHJyaEn1XRmaz',
    badge: 'BTC Mainnet',
  },
  USDC_ERC20: {
    label: 'USDC (ERC-20)',
    currency: 'USDC',
    network: 'ERC-20 (Ethereum)',
    address: '0x4520FBE6d418c1bAcE97A1E517e5Be2d78eb9598',
    badge: 'Circle USDC',
  },
}

export default function ArxopayCryptoPaymentModal({
  isOpen,
  onClose,
  merchantId,
  merchantRefId,
  merchantLegalName,
  mode,
  onSuccess,
}: ArxopayCryptoPaymentModalProps) {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('USDT_TRC20')
  const [txHash, setTxHash] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)

  if (!isOpen) return null

  const activeWallet = CRYPTO_WALLETS[selectedAsset]
  const isGoLive = mode === 'golive'

  const handleCopy = () => {
    navigator.clipboard.writeText(activeWallet.address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txHash.trim()) {
      setError('Please provide the transaction hash (TxID) for verification.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isGoLive) {
        await adminApi.requestLiveActivation(merchantId, notes.trim() || undefined, {
          txHash: txHash.trim(),
          currency: activeWallet.currency,
          network: activeWallet.network,
        })
      } else {
        await adminApi.submitMonthlyCryptoPayment(merchantId, {
          txHash: txHash.trim(),
          currency: activeWallet.currency,
          network: activeWallet.network,
        })
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit crypto payment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.4)] p-5 sm:p-7 space-y-5 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              {isGoLive ? <Zap className="h-5 w-5 fill-current text-cyan-400" /> : <Calendar className="h-5 w-5 text-purple-400" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>{isGoLive ? 'Request Go Live — Setup Fee' : 'Monthly Maintenance Due'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
                  Arxopay Wholesale
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isGoLive
                  ? `Pay wholesale setup fee to PGX Gateway on behalf of ${merchantLegalName || merchantRefId || 'merchant'}.`
                  : `30-day recurring maintenance fee due to PGX Gateway for ${merchantLegalName || merchantRefId || 'merchant'}.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wholesale Fee Amount Chamber */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#071330] to-purple-950/60 border border-cyan-400/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Wholesale Amount Due
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
              $499.00 <span className="text-xs font-semibold text-cyan-300 uppercase">USD</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-400/50">
              <Coins className="h-3.5 w-3.5" /> Crypto Only (No Stripe)
            </span>
            <div className="text-[10px] text-slate-400 mt-1">Direct Wholesale Rail</div>
          </div>
        </div>

        {/* Crypto Asset Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            Select Deposit Currency & Network:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CRYPTO_WALLETS) as CryptoAsset[]).map((key) => {
              const item = CRYPTO_WALLETS[key]
              const isSelected = selectedAsset === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedAsset(key)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#030614] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.network}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Deposit Address Box */}
        <div className="p-4 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              PGX {activeWallet.currency} Deposit Address ({activeWallet.network}):
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-cyan-400 text-[#040819] font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-[#060b20] border border-cyan-500/40 font-mono text-xs sm:text-sm text-cyan-300 break-all select-all font-bold">
            {activeWallet.address}
          </div>
          <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Send exactly $499 equivalent via {activeWallet.network}. Funds are credited upon 1 network confirmation.</span>
          </p>
        </div>

        {/* Form: TxID & Notes */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Transaction Hash (TxID) *</span>
              <span className="text-[10px] text-slate-400">Required for reconciliation</span>
            </label>
            <input
              type="text"
              required
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="e.g. 0x8f3c7b2e1a... or 7d2e9f..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030614] border border-slate-700 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {isGoLive && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Go Live Notes (Optional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Trial tests passed, live volume ready to process"
                className="w-full px-3.5 py-2 rounded-xl bg-[#030614] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_28px_rgba(0,240,255,0.65)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Submitting Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>{isGoLive ? 'Confirm $499 & Request Go Live' : 'Confirm $499 Monthly Payment'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
