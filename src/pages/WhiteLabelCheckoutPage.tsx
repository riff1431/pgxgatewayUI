import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  CreditCard,
  FlaskConical,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBranding } from '@/context/BrandingContext'
import { checkoutApi } from '@/lib/checkoutApi'
import {
  fetchWhiteLabelPayment,
  pollCryptoInvoice,
  resolveCardAcrossProviders,
  simulateWhiteLabelOutcome,
  startCryptoInvoice,
  type CryptoInvoiceInfo,
  type WhiteLabelPaymentInfo,
} from '@/lib/onePayCheckoutApi'

type PaymentTab = 'card' | 'crypto'

export default function WhiteLabelCheckoutPage() {
  const { paymentId = '' } = useParams<{ paymentId: string }>()
  const { branding } = useBranding()
  const rawBrand = branding.siteName || 'PGX Gateway'
  const brandName = rawBrand.replace(/\s+Platform$/i, '')
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
  const [copiedField, setCopiedField] = useState<'address' | 'amount' | null>(null)

  const [simulating, setSimulating] = useState(false)

  const applyPaymentSnapshot = useCallback(
    (wlData: WhiteLabelPaymentInfo, pgxStatus: { status?: string } | null) => {
      setPayment(wlData)
      if (
        wlData.status === 'paid' ||
        pgxStatus?.status === 'succeeded' ||
        pgxStatus?.status === 'completed'
      ) {
        setPgxSettled(true)
      }
      setLoadError(null)
      if (wlData.cardProviders.length === 0 && wlData.cryptoAssets.length > 0) {
        setActiveTab('crypto')
      }
      if (wlData.cryptoAssets.length > 0) {
        setSelectedAsset((prev) => prev || wlData.cryptoAssets[0].id)
      }
    },
    []
  )

  const refreshPaymentState = useCallback(async () => {
    if (!paymentId) return
    const [wlData, pgxStatus] = await Promise.all([
      fetchWhiteLabelPayment(apiBase, paymentId),
      checkoutApi.getSessionStatus(paymentId).catch(() => null),
    ])
    applyPaymentSnapshot(wlData, pgxStatus)
  }, [apiBase, applyPaymentSnapshot, paymentId])

  useEffect(() => {
    if (!paymentId) return
    let active = true
    ;(async () => {
      try {
        const [wlData, pgxStatus] = await Promise.all([
          fetchWhiteLabelPayment(apiBase, paymentId),
          checkoutApi.getSessionStatus(paymentId).catch(() => null),
        ])
        if (active) {
          applyPaymentSnapshot(wlData, pgxStatus)
        }
      } catch (err: unknown) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load payment session.')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [apiBase, applyPaymentSnapshot, paymentId])

  // Poll crypto deposit confirmation every 5s while waiting on-chain
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
          void refreshPaymentState()
        }
      } catch {
        // Retry silently on next interval
      }
    }, 5000)
    return () => window.clearInterval(timer)
  }, [activeTab, apiBase, cryptoInvoice, paymentId, pgxSettled, refreshPaymentState])

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
        await refreshPaymentState()
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

  const handleSimulate = async (outcome: 'paid' | 'failed' | 'underpaid') => {
    if (!payment) return
    setSimulating(true)
    setActionError(null)
    try {
      await simulateWhiteLabelOutcome(apiBase, payment.id, outcome)
      await refreshPaymentState()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Simulation failed.')
    } finally {
      setSimulating(false)
    }
  }

  const handleCopy = async (value: string, field: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 1800)
    } catch {
      // Clipboard blocked in non-HTTPS context
    }
  }

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3 text-slate-300 text-sm">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        <span>Loading {brandName} checkout</span>
      </div>
    )
  }

  if (loadError || !payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-8 text-center space-y-4">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto stroke-[1.5]" />
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-white">Checkout session unavailable</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {loadError || 'This checkout session is invalid or has expired.'}
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-slate-200 hover:bg-white/10">
            <Link to="/">Return to {brandName}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isPaid = pgxSettled || payment.status === 'paid'
  const isTerminalFail = payment.status === 'failed' || payment.status === 'expired'
  const formattedAmount = Number(payment.amount || 0).toFixed(2)
  const currencyCode = (payment.currency || 'USD').toUpperCase()
  const hasCards = payment.cardProviders.length > 0
  const hasCrypto = payment.cryptoAssets.length > 0

  if (isPaid) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0b1120] overflow-hidden">
          <div className="px-6 py-8 text-center border-b border-white/[0.08]">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="h-6 w-6 stroke-[1.75]" />
            </div>
            <h1 className="text-xl font-semibold text-white">Payment confirmed</h1>
            <p className="text-xs text-slate-400 mt-1">
              Settled securely through {brandName}
            </p>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="rounded-xl bg-[#070b14] border border-white/[0.08] p-4 space-y-3">
              <div className="flex justify-between text-slate-400">
                <span>Merchant rail</span>
                <span className="font-medium text-white">{brandName}</span>
              </div>
              {payment.productName && (
                <div className="flex justify-between text-slate-400">
                  <span>Order</span>
                  <span className="text-slate-200">{payment.productName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Reference</span>
                <span dir="ltr" className="font-mono text-slate-300">{payment.id}</span>
              </div>
              <div className="border-t border-white/[0.08] pt-3 flex justify-between items-baseline">
                <span className="text-slate-300 font-medium">Total paid</span>
                <span dir="ltr" className="text-lg font-semibold tabular-nums text-emerald-400">
                  ${formattedAmount} {currencyCode}
                </span>
              </div>
            </div>

            <Button asChild className="w-full h-11 bg-white text-slate-950 hover:bg-slate-200 font-semibold">
              <Link to="/">Return to {brandName}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Top Minimal Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 stroke-[1.75]" />
          <span>{brandName}</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5 text-emerald-400 stroke-[1.75]" />
          <span>256-bit TLS encrypted</span>
        </div>
      </div>

      {/* Main Split Checkout Vault Card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#0b1120] overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Order Summary & Trust Rails */}
        <div className="md:col-span-5 bg-[#080d1a] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white font-semibold text-xs">
                  P
                </div>
                <span className="text-sm font-medium text-white">{brandName}</span>
              </div>
              {payment.testMode && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Sandbox
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-400">Amount due</p>
              <div className="flex items-baseline gap-2" dir="ltr">
                <span className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-white">
                  ${formattedAmount}
                </span>
                <span className="text-xs font-medium text-slate-400">{currencyCode}</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#0b1120] border border-white/[0.07] divide-y divide-white/[0.06] text-xs">
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-slate-400">Order</span>
                <span className="font-medium text-slate-100 truncate">
                  {payment.productName || 'Digital Order'}
                </span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-slate-400">Reference</span>
                <span dir="ltr" className="font-mono text-slate-300">{payment.id}</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-slate-400">Processing fee</span>
                <span className="text-emerald-400 font-medium">Included</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 stroke-[1.5]" />
                <span>Verified merchant checkout protection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-slate-400 shrink-0 stroke-[1.5]" />
                <span>Direct encrypted payment routing</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.06]">
              {['Visa', 'Mastercard', 'Apple Pay', 'BTC', 'USDC'].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.07] text-[10px] font-medium text-slate-300"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Payment Terminal */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div>
              <h1 className="text-base font-semibold text-white">Complete payment</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a payment method to authorize this transaction
              </p>
            </div>

            {isTerminalFail && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>
                  This checkout session is {payment.status}. Please return to the store and start a new payment.
                </span>
              </div>
            )}

            {payment.status === 'underpaid' && (
              <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/35 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Partial payment received. Send the remaining amount to settle this order.</span>
              </div>
            )}

            {actionError && (
              <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/35 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{actionError}</span>
              </div>
            )}

            {!isTerminalFail && !payment.testMode && (
              <>
                {/* 2-Option Segmented Rail Switcher (Card & Crypto only) */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#070b14] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('card')
                      setActionError(null)
                    }}
                    disabled={!hasCards}
                    className={`h-10 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeTab === 'card'
                        ? 'bg-[#162038] text-white border border-white/15'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 stroke-[1.6]" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('crypto')
                      setActionError(null)
                      if (!cryptoInvoice && selectedAsset) {
                        void handleStartCrypto(selectedAsset)
                      }
                    }}
                    disabled={!hasCrypto}
                    className={`h-10 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeTab === 'crypto'
                        ? 'bg-[#162038] text-white border border-white/15'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Coins className="h-4 w-4 stroke-[1.6]" />
                    <span>Crypto</span>
                  </button>
                </div>

                {/* Card Payment View */}
                {activeTab === 'card' && hasCards && (
                  <div className="space-y-4">
                    {payment.cardsDegraded && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                        Card networks are experiencing heavy volume. Crypto settlement is available for instant confirmation.
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300 block">
                        Receipt email (optional)
                      </label>
                      <Input
                        type="email"
                        dir="ltr"
                        placeholder="you@example.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="h-11 bg-[#070b14] border-white/10 focus-visible:border-white/30 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="rounded-xl bg-[#070b14] border border-white/[0.07] p-3.5 text-xs text-slate-400 flex items-center justify-between">
                      <span>Accepted cards &amp; wallets</span>
                      <span className="text-slate-200 font-medium">Visa · Mastercard · Apple Pay</span>
                    </div>

                    <Button
                      size="lg"
                      disabled={cardResolving}
                      onClick={() => void handlePayByCard()}
                      className="w-full h-12 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-semibold text-sm cursor-pointer transition-colors"
                    >
                      {cardResolving ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Connecting to card processor...</span>
                        </span>
                      ) : (
                        <span>
                          Pay ${formattedAmount} {currencyCode}
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {/* Crypto Payment View */}
                {activeTab === 'crypto' && hasCrypto && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300 block">
                        Select coin and network
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                        {payment.cryptoAssets.map((asset) => {
                          const isSelected = selectedAsset === asset.id
                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => void handleStartCrypto(asset.id)}
                              className={`p-2 rounded-lg text-left border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#162038] border-white/25 text-white'
                                  : 'bg-[#070b14] border-white/[0.07] text-slate-300 hover:border-white/15'
                              }`}
                            >
                              <div className="text-xs font-semibold font-mono">{asset.symbol}</div>
                              {asset.chain && (
                                <div className="text-[10px] text-slate-400 truncate">{asset.chain}</div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {cryptoLoading ? (
                      <div className="py-10 rounded-xl bg-[#070b14] border border-white/[0.07] flex flex-col items-center gap-2.5 text-xs text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                        <span>Generating deposit address...</span>
                      </div>
                    ) : cryptoInvoice ? (
                      <div className="rounded-xl bg-[#070b14] border border-white/[0.08] p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="p-2.5 bg-white rounded-xl shrink-0">
                            {cryptoInvoice.address ? (
                              <QRCodeSVG value={cryptoInvoice.address} size={128} />
                            ) : (
                              <div className="w-[128px] h-[128px] flex items-center justify-center text-slate-500 text-xs">
                                Assigning...
                              </div>
                            )}
                          </div>

                          <div className="flex-1 w-full space-y-3 text-xs">
                            <div>
                              <span className="text-slate-400 block mb-1">Exact amount</span>
                              <div className="flex items-center justify-between gap-2 bg-[#0b1120] border border-white/[0.08] rounded-lg px-3 py-2">
                                <span dir="ltr" className="font-mono font-semibold text-sm text-white tabular-nums">
                                  {cryptoInvoice.expectedDisplay} {cryptoInvoice.symbol}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => void handleCopy(cryptoInvoice.expectedDisplay, 'amount')}
                                  className="text-slate-400 hover:text-white cursor-pointer"
                                  title="Copy amount"
                                >
                                  {copiedField === 'amount' ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-400 block mb-1">Deposit address</span>
                              <div className="flex items-center justify-between gap-2 bg-[#0b1120] border border-white/[0.08] rounded-lg px-3 py-2">
                                <span dir="ltr" className="font-mono text-[11px] text-slate-200 break-all">
                                  {cryptoInvoice.address || 'Allocating address...'}
                                </span>
                                {cryptoInvoice.address && (
                                  <button
                                    type="button"
                                    onClick={() => void handleCopy(cryptoInvoice.address || '', 'address')}
                                    className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                    title="Copy address"
                                  >
                                    {copiedField === 'address' ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Status: <strong className="text-slate-200">{cryptoInvoice.status}</strong></span>
                          </span>
                          {typeof cryptoInvoice.confirmations === 'number' && (
                            <span className="tabular-nums">
                              Confirmations: {cryptoInvoice.confirmations}/{cryptoInvoice.minConfirmations ?? 1}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {/* Sandbox Controls */}
            {payment.testMode && !isTerminalFail && (
              <div className="p-4 rounded-xl bg-[#070b14] border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                  <FlaskConical className="h-4 w-4" />
                  <span>{brandName} Sandbox Controls</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulate an outcome below to test webhook delivery and order confirmation.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={simulating}
                    onClick={() => void handleSimulate('paid')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold cursor-pointer"
                  >
                    Simulate Paid
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={simulating}
                    onClick={() => void handleSimulate('underpaid')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold cursor-pointer"
                  >
                    Underpaid
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={simulating}
                    onClick={() => void handleSimulate('failed')}
                    className="bg-red-500 hover:bg-red-400 text-white font-semibold cursor-pointer"
                  >
                    Failed
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Secured by {brandName}</span>
            </span>
            <span dir="ltr" className="font-mono text-slate-500">TLS 1.3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
