import { useState, useRef } from 'react'
import {
  X,
  Coins,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  Calendar,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useTranslation } from '@/context/LanguageContext'

interface MonthlyMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  merchantLegalName?: string
  merchantRefId?: string
  amount?: number
  onSuccess?: () => void
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

export default function MonthlyMaintenanceModal({
  isOpen,
  onClose,
  merchantLegalName,
  merchantRefId,
  amount = 499,
  onSuccess,
}: MonthlyMaintenanceModalProps) {
  const { t } = useTranslation()
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('USDT_TRC20')
  const [txHash, setTxHash] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const activeWallet = CRYPTO_WALLETS[selectedAsset]

  const badgeMap: Record<CryptoAsset, string> = {
    USDT_TRC20: t('dashboard.monthlyModal.badgeFast'),
    USDT_ERC20: t('dashboard.monthlyModal.badgeEth'),
    BTC: t('dashboard.monthlyModal.badgeBtc'),
    USDC_ERC20: t('dashboard.monthlyModal.badgeCircle'),
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeWallet.address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txHash.trim()) {
      setError(t('dashboard.monthlyModal.errMissingTx'))
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('txHash', txHash.trim())
      formData.append('currency', activeWallet.currency)
      formData.append('network', activeWallet.network)
      if (notes.trim()) formData.append('notes', notes.trim())
      if (selectedFile) formData.append('screenshot', selectedFile)

      await api.payout.submitMonthlyMaintenance(formData)

      setIsSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.monthlyModal.errFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.35)] p-6 sm:p-8 space-y-6 text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-cyan-500/20">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shrink-0">
            <Coins className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">
                {t('dashboard.monthlyModal.title')}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {t('dashboard.monthlyModal.subtitle', {
                account: merchantLegalName || merchantRefId || t('dashboard.monthlyModal.defaultAccount'),
              })}
            </p>
          </div>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4 rounded-2xl bg-[#04081c] border border-emerald-500/40 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{t('dashboard.monthlyModal.successTitle')}</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {t('dashboard.monthlyModal.successDesc', { amount })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
            >
              {t('dashboard.monthlyModal.closeWindow')}
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Amount Callout Banner */}
            <div className="p-4 rounded-2xl bg-[#09153a] border border-cyan-500/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('dashboard.monthlyModal.recurringLabel')}</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mt-0.5" dir="ltr">
                  ${amount}.00 <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
              </div>
              <div className="text-end">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase">
                  {t('dashboard.monthlyModal.cryptoOnly')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.monthlyModal.instantReceipt')}</p>
              </div>
            </div>

            {/* Asset Selection Buttons */}
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold">{t('dashboard.monthlyModal.selectRail')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(CRYPTO_WALLETS) as CryptoAsset[]).map((key) => {
                  const w = CRYPTO_WALLETS[key]
                  const isSelected = selectedAsset === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedAsset(key)}
                      className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                          : 'bg-[#030614] border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{w.currency}</div>
                      <div className="text-[10px] text-slate-400 truncate">{w.network.split(' ')[0]}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Address Chamber */}
            <div className="p-4 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  {t('dashboard.monthlyModal.walletLabel', { label: activeWallet.label })}
                </span>
                <span className="text-[10px] text-emerald-400">{badgeMap[selectedAsset]}</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#09153a] border border-cyan-500/40">
                <span dir="ltr" className="font-mono text-cyan-300 font-semibold break-all select-all flex-1 text-[11px]">
                  {activeWallet.address}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAddress ? t('dashboard.monthlyModal.copied') : t('dashboard.monthlyModal.copy')}</span>
                </button>
              </div>

              <p className="text-[10px] text-amber-300/80 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>
                  {t('dashboard.monthlyModal.networkWarning', {
                    currency: activeWallet.currency,
                    network: activeWallet.network,
                  })}
                </span>
              </p>
            </div>

            {/* Transaction Hash Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>{t('dashboard.monthlyModal.txHashLabel')}</span>
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder={t('dashboard.monthlyModal.txHashPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-xs"
              />
            </div>

            {/* Payment Proof / Screenshot Upload */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>{t('dashboard.monthlyModal.screenshotLabel')}</span>
                <span className="text-cyan-400 font-normal">{t('dashboard.monthlyModal.screenshotOptional')}</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border border-dashed border-cyan-500/40 bg-[#030614] hover:bg-[#071330] text-slate-400 hover:text-white flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-xs">{t('dashboard.monthlyModal.uploadCta')}</span>
                  <span className="text-[10px] text-slate-500">{t('dashboard.monthlyModal.uploadFormats')}</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Proof Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-cyan-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{selectedFile.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title={t('dashboard.monthlyModal.removeFile')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">{t('dashboard.monthlyModal.notesLabel')}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('dashboard.monthlyModal.notesPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{t('dashboard.monthlyModal.escrowNote')}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.45)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>
                  {submitting ? t('dashboard.monthlyModal.submittingBtn') : t('dashboard.monthlyModal.submitBtn')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
