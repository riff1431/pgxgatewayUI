import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Coins,
  Copy,
  CreditCard,
  ExternalLink,
  FlaskConical,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useBranding } from '@/context/BrandingContext'
import { checkoutApi } from '@/lib/checkoutApi'
import {
  fetchCashAppInvoice,
  fetchWhiteLabelPayment,
  pollCryptoInvoice,
  renewCashAppInvoice,
  resolveCardAcrossProviders,
  simulateWhiteLabelOutcome,
  startCryptoInvoice,
  type CashAppInvoiceInfo,
  type CryptoInvoiceInfo,
  type WhiteLabelPaymentInfo,
} from '@/lib/onePayCheckoutApi'

type PaymentTab = 'card' | 'crypto' | 'cashapp'

export default function WhiteLabelCheckoutPage() {
  const { paymentId = '' } = useParams<{ paymentId: string }>()
  const { branding } = useBranding()
  const brandName = branding.siteName || 'PGX Gateway'
  const apiBase = branding.onePayCheckout?.checkoutApiBase || 'https://pay.pgxgateway.com/api'

  const [payment, setPayment] = useState<WhiteLabelPaymentInfo | null>(null)
  const [pgxSettled, setPgxSettled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<PaymentTab>('card')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [cardResolving, setCardResolving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [cryptoInvoice, setCryptoInvoice] = useState<CryptoInvoiceInfo | null>(null)
  const [cryptoLoading, setCryptoLoading] = useState(false)
  const [copiedAddr, setCopiedAddr] = useState(false)

  const [cashAppInvoice, setCashAppInvoice] = useState<CashAppInvoiceInfo | null>(null)
  const [cashAppLoading, setCashAppLoading] = useState(false)

  const [simulating, setSimulating] = useState(false)

  const loadPaymentState = useCallback(async () => {
    if (!paymentId) return
    try {
      const [wlData, pgxStatus] = await Promise.all([
        fetchWhiteLabelPayment(apiBase, paymentId),
        checkoutApi.getSessionStatus(paymentId).catch(() => null),
      ])
      setPayment(wlData)
      if (
        wlData.status === 'paid' ||
        pgxStatus?.status === 'succeeded' ||
        (pgxStatus?.status as string) === 'completed'
      ) {
        setPgxSettled(true)
      }
      setLoadError(null)
      if (wlData.cardProviders.length === 0 && wlData.cryptoAssets.length > 0) {
        setActiveTab((prev) => (prev === 'card' ? 'crypto' : prev))
      }
      if (wlData.cryptoAssets.length > 0) {
        setSelectedAsset((prev) => prev || wlData.cryptoAssets[0].id)
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load payment session.')
    } finally {
      setLoading(false)
    }
  }, [apiBase, paymentId])

  useEffect(() => {
    void loadPaymentState()
  }, [loadPaymentState])

  // Poll crypto invoice every 5s once generated while payment is pending
  useEffect(() => {
    if (
      !paymentId ||
      activeTab !== 'crypto' ||
      !cryptoInvoice ||
      cryptoInvoice.status === 'confirmed' ||
      pgxSettled
    ) {
      return
    }
    const timer = window.setInterval(async () => {
      try {
        const updated = await pollCryptoInvoice(apiBase, paymentId)
        setCryptoInvoice(updated)
        if (updated.status === 'confirmed') {
          setPgxSettled(true)
          void loadPaymentState()
        }
      } catch {
        // Keep polling gracefully on transient error
      }
    }, 5000)
    return () => window.clearInterval(timer)
  }, [activeTab, apiBase, cryptoInvoice, loadPaymentState, paymentId, pgxSettled])

  // Poll Lightning / Cash App invoice every 4s when active
  useEffect(() => {
    if (
      !paymentId ||
      activeTab !== 'cashapp' ||
      !cashAppInvoice ||
      cashAppInvoice.status === 'paid' ||
      cashAppInvoice.status === 'expired' ||
      pgxSettled
    ) {
      return
    }
    const timer = window.setInterval(async () => {
      try {
        const updated = await fetchCashAppInvoice(apiBase, paymentId)
        setCashAppInvoice(updated)
        if (updated.status === 'paid') {
          setPgxSettled(true)
          void loadPaymentState()
        }
      } catch {
        // Continue polling cleanly
      }
    }, 4000)
    return () => window.clearInterval(timer)
  }, [activeTab, apiBase, cashAppInvoice, loadPaymentState, paymentId, pgxSettled])

  const handlePayByCard = async () => {
    if (!payment || payment.cardProviders.length === 0) return
    setActionError(null)
    setCardResolving(true)
    try {
      const outcome = await resolveCardAcrossProviders(
        apiBase,
        payment.id,
        payment.cardProviders,
        buyerEmail
      )
      if (outcome.url) {
        window.location.assign(outcome.url)
        return
      }
      if (outcome.shouldReload) {
        await loadPaymentState()
      }
      setActionError(outcome.error || 'Unable to launch card checkout.')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Card checkout request timed out.')
    } finally {
      setCardResolving(false)
    }
  }

  const handleStartCrypto = async (assetId: string) => {
    if (!payment) return
    setActionError(null)
    setSelectedAsset(assetId)
    setCryptoLoading(true)
    try {
      const invoice = await startCryptoInvoice(apiBase, payment.id, assetId)
      setCryptoInvoice(invoice)
      if (invoice.status === 'confirmed') {
        setPgxSettled(true)
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Unable to generate deposit address.')
    } finally {
      setCryptoLoading(false)
    }
  }

  const handleOpenCashApp = async () => {
    if (!payment) return
    setActiveTab('cashapp')
    setActionError(null)
    setCashAppLoading(true)
    try {
      const data = await fetchCashAppInvoice(apiBase, payment.id)
      setCashAppInvoice(data)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Instant wallet rail is unavailable for this session.')
    } finally {
      setCashAppLoading(false)
    }
  }

  const handleRenewCashApp = async () => {
    if (!payment) return
    setCashAppLoading(true)
    setActionError(null)
    try {
      const data = await renewCashAppInvoice(apiBase, payment.id)
      setCashAppInvoice(data)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Could not renew invoice.')
    } finally {
      setCashAppLoading(false)
    }
  }

  const handleSimulate = async (outcome: 'paid' | 'failed' | 'underpaid') => {
    if (!payment) return
    setSimulating(true)
    setActionError(null)
    try {
      await simulateWhiteLabelOutcome(apiBase, payment.id, outcome)
      await loadPaymentState()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Simulation failed.')
    } finally {
      setSimulating(false)
    }
  }

  const handleCopyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddr(true)
      window.setTimeout(() => setCopiedAddr(false), 2000)
    } catch {
      // Clipboard blocked in non-HTTPS contexts
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-300 text-xs">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <span>Loading {brandName} secure checkout...</span>
      </div>
    )
  }

  if (loadError || !payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="border-[1.5px] border-red-500/60 bg-[#050b1f]/95 text-center p-6 space-y-4">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white">Checkout Session Unavailable</h1>
            <p className="text-xs text-slate-400">
              {loadError || 'This payment link is invalid or has already expired.'}
            </p>
          </div>
          <Button asChild variant="outline" className="border-cyan-500/40 text-cyan-300">
            <Link to="/">Return to {brandName}</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const isPaid = pgxSettled || payment.status === 'paid'
  const isTerminalFail = payment.status === 'failed' || payment.status === 'expired'

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-6 relative animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button asChild variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back to {brandName}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 border-cyan-500/40 text-cyan-300 bg-cyan-950/40">
            <Lock className="h-3 w-3 text-cyan-400" /> 256-Bit TLS
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 border-emerald-500/40 text-emerald-300 bg-emerald-950/40">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> {brandName} Verified
          </Badge>
        </div>
      </div>

      {isPaid ? (
        <Card className="border-[1.5px] border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] bg-[#050b1f]/95 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] mb-3">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <CardTitle className="text-2xl font-black text-white">Payment Confirmed</CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              Your payment through {brandName} has been settled and confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#07102e] border border-cyan-500/30 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Processor</span>
                <span className="font-bold text-white">{brandName}</span>
              </div>
              {payment.productName && (
                <div className="flex justify-between text-slate-400">
                  <span>Order</span>
                  <span className="font-semibold text-slate-200">{payment.productName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Reference</span>
                <span dir="ltr" className="font-mono text-cyan-300">{payment.id}</span>
              </div>
              <div className="border-t border-slate-700/60 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-200">Amount Paid</span>
                <span dir="ltr" className="text-lg font-black text-emerald-400">
                  ${Number(payment.amount || 0).toFixed(2)} {(payment.currency || 'USD').toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black" size="lg">
              <Link to="/">Return to {brandName}</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-[1.5px] border-cyan-400/70 shadow-[0_0_30px_rgba(0,240,255,0.2)] bg-[#050b1f]/95 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                    {brandName} Checkout
                  </span>
                  {payment.testMode && (
                    <span className="text-[10px] font-bold uppercase text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full">
                      Sandbox Mode
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl sm:text-2xl font-black text-white">
                  {payment.productName || `${brandName} Express Checkout`}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Reference <span dir="ltr" className="font-mono text-slate-300">{payment.id}</span>
                </CardDescription>
              </div>
              <div className="text-start sm:text-end">
                <span dir="ltr" className="text-2xl sm:text-3xl font-black text-white">
                  ${Number(payment.amount || 0).toFixed(2)}
                </span>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {(payment.currency || 'USD').toUpperCase()}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {isTerminalFail && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>
                  This checkout session is {payment.status}. Please initiate a fresh order from the store.
                </span>
              </div>
            )}

            {payment.status === 'underpaid' && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Partial payment detected. Please complete the remaining balance or contact support.</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{actionError}</span>
              </div>
            )}

            {!isTerminalFail && !payment.testMode && (
              <>
                {/* Method Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('card')}
                    disabled={payment.cardProviders.length === 0}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeTab === 'card'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-[#07102e] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('crypto')
                      if (!cryptoInvoice && selectedAsset) {
                        void handleStartCrypto(selectedAsset)
                      }
                    }}
                    disabled={payment.cryptoAssets.length === 0}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeTab === 'crypto'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-[#07102e] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Coins className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Crypto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleOpenCashApp()}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'cashapp'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white'
                        : 'bg-[#07102e] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Instant</span>
                  </button>
                </div>

                {/* Card Tab */}
                {activeTab === 'card' && payment.cardProviders.length > 0 && (
                  <div className="space-y-4 p-4 rounded-2xl bg-[#07102e] border border-cyan-500/25">
                    {payment.cardsDegraded && (
                      <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-[11px]">
                        Card network is experiencing higher traffic. You may proceed or choose Crypto for instant settlement.
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Email for Receipt (Optional)
                      </label>
                      <Input
                        type="email"
                        dir="ltr"
                        placeholder="buyer@example.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="bg-[#040819] border-cyan-500/35 text-white placeholder-slate-500 min-h-[42px]"
                      />
                    </div>
                    <Button
                      size="lg"
                      disabled={cardResolving}
                      onClick={() => void handlePayByCard()}
                      className="w-full gap-2 min-h-[48px] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:via-blue-500 hover:to-cyan-400 text-white font-extrabold cursor-pointer"
                    >
                      {cardResolving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Preparing encrypted card session...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          <span>
                            Pay by Card — ${Number(payment.amount || 0).toFixed(2)}{' '}
                            {(payment.currency || 'USD').toUpperCase()}
                          </span>
                        </>
                      )}
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Supports Visa, Mastercard, Apple Pay &amp; Google Pay where available.
                    </p>
                  </div>
                )}

                {/* Crypto Tab */}
                {activeTab === 'crypto' && payment.cryptoAssets.length > 0 && (
                  <div className="space-y-4 p-4 rounded-2xl bg-[#07102e] border border-emerald-500/25">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-200">Select Cryptocurrency</label>
                      <div className="flex flex-wrap gap-1.5">
                        {payment.cryptoAssets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => void handleStartCrypto(asset.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                              selectedAsset === asset.id
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                : 'bg-[#040819] border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {asset.symbol}
                          </button>
                        ))}
                      </div>
                    </div>

                    {cryptoLoading ? (
                      <div className="py-8 flex flex-col items-center gap-2 text-xs text-slate-300">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                        <span>Generating secure deposit address...</span>
                      </div>
                    ) : cryptoInvoice ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl shrink-0">
                            {cryptoInvoice.address ? (
                              <QRCodeSVG value={cryptoInvoice.address} size={136} />
                            ) : (
                              <div className="w-[136px] h-[136px] flex items-center justify-center text-slate-600 text-xs">
                                Assigning...
                              </div>
                            )}
                          </div>
                          <div className="flex-1 w-full space-y-2.5 text-xs">
                            <div>
                              <span className="text-slate-400 block">Send Exact Amount</span>
                              <span dir="ltr" className="text-lg font-black text-emerald-400 font-mono">
                                {cryptoInvoice.expectedDisplay} {cryptoInvoice.symbol}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-1">Deposit Address</span>
                              <div className="flex items-center gap-2 bg-[#040819] border border-slate-700 rounded-xl px-3 py-2">
                                <span dir="ltr" className="font-mono text-[11px] text-slate-200 break-all flex-1">
                                  {cryptoInvoice.address || 'Allocating address...'}
                                </span>
                                {cryptoInvoice.address && (
                                  <button
                                    type="button"
                                    onClick={() => void handleCopyAddress(cryptoInvoice.address || '')}
                                    className="text-cyan-400 hover:text-cyan-300 shrink-0 cursor-pointer"
                                    title="Copy address"
                                  >
                                    {copiedAddr ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                              <span>Status: <strong className="text-cyan-300 uppercase">{cryptoInvoice.status}</strong></span>
                              {typeof cryptoInvoice.confirmations === 'number' && (
                                <span>
                                  Confirmations: {cryptoInvoice.confirmations}/{cryptoInvoice.minConfirmations ?? 1}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Cash App / Instant Lightning Tab */}
                {activeTab === 'cashapp' && (
                  <div className="space-y-4 p-4 rounded-2xl bg-[#07102e] border border-emerald-500/25 text-center">
                    {cashAppLoading ? (
                      <div className="py-8 flex flex-col items-center gap-2 text-xs text-slate-300">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                        <span>Preparing Lightning invoice...</span>
                      </div>
                    ) : cashAppInvoice?.bolt11 ? (
                      <div className="space-y-4">
                        <div className="inline-block p-3 bg-white rounded-2xl">
                          <QRCodeSVG value={cashAppInvoice.lightningUrl || cashAppInvoice.bolt11} size={156} />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {cashAppInvoice.cashAppUrl && (
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                              <a href={cashAppInvoice.cashAppUrl} rel="noreferrer">Open Cash App</a>
                            </Button>
                          )}
                          {cashAppInvoice.lightningUrl && (
                            <Button asChild variant="outline" className="border-cyan-500/40 text-cyan-300">
                              <a href={cashAppInvoice.lightningUrl} rel="noreferrer">Open Lightning Wallet</a>
                            </Button>
                          )}
                          {cashAppInvoice.status === 'expired' && (
                            <Button
                              variant="outline"
                              onClick={() => void handleRenewCashApp()}
                              className="gap-1.5 border-amber-500/40 text-amber-300"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Renew Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-4">
                        {cashAppInvoice?.status === 'preparing'
                          ? 'Preparing instant invoice...'
                          : 'Click Card or Crypto above to complete this payment.'}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Sandbox Simulation Bar */}
            {payment.testMode && !isTerminalFail && (
              <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <FlaskConical className="h-4 w-4" />
                  <span>PGX Gateway Sandbox Controls</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  This is a test transaction. Simulate any payment outcome below to trigger webhook settlement.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={simulating}
                    onClick={() => void handleSimulate('paid')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
                  >
                    Simulate Paid
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={simulating}
                    onClick={() => void handleSimulate('underpaid')}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer"
                  >
                    Underpaid
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={simulating}
                    onClick={() => void handleSimulate('failed')}
                    className="bg-red-500 hover:bg-red-400 text-white font-bold cursor-pointer"
                  >
                    Failed
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-center text-[11px] text-slate-400 border-t border-cyan-500/15 pt-4">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-400" />
              Powered securely by <strong className="text-slate-200">{brandName}</strong>
            </span>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
