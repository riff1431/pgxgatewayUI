import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
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
import { checkoutApi, type PublicMerchantProfile } from '@/lib/checkoutApi'

export default function Checkout() {
  const [searchParams] = useSearchParams()

  const refParam = searchParams.get('ref') || ''
  const amountParam = parseFloat(searchParams.get('amount') || '100.00')
  const amount = isNaN(amountParam) || amountParam <= 0 ? 100.0 : amountParam
  const currencyParam = (searchParams.get('currency') || 'USD').toUpperCase()
  const [orderIdParam] = useState(
    () => searchParams.get('orderId') || `ORD-${Date.now().toString().slice(-5)}`
  )
  const statusParam = searchParams.get('status')
  const sessionIdParam = searchParams.get('session_id')

  const [merchantProfile, setMerchantProfile] = useState<PublicMerchantProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(
    statusParam === 'cancelled' ? 'Payment was cancelled. You can retry checkout below.' : null
  )
  const paidSuccess = statusParam === 'success'

  // Load Merchant Public Profile by Ref ID
  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      if (!refParam) return
      setProfileLoading(true)
      try {
        const profile = await checkoutApi.getPublicMerchant(refParam)
        if (active && profile) {
          setMerchantProfile(profile)
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (active) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [refParam])

  // Handle Card / Stripe Payment Submission
  const handlePayment = async () => {
    setCheckoutError(null)
    setIsProcessing(true)

    try {
      const res = await checkoutApi.createCheckoutSession({
        refId: refParam,
        amount,
        currency: currencyParam,
        orderId: orderIdParam,
        customerEmail: customerEmail.trim() || undefined,
        productName: merchantProfile ? `${merchantProfile.businessName} Purchase` : `Order #${orderIdParam}`,
      })

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl
        return
      }

      setCheckoutError('Checkout URL was not returned by gateway.')
      setIsProcessing(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout initiation failed'
      setCheckoutError(msg)
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 relative animate-fade-in">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back to PGX
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 border-cyan-500/40 text-cyan-300 bg-cyan-950/40">
            <Lock className="h-3 w-3 text-cyan-400" /> 256-bit Encrypted
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 border-emerald-500/40 text-emerald-300 bg-emerald-950/40">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Stripe Rail
          </Badge>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION VIEW */}
      {paidSuccess ? (
        <Card className="border-[1.5px] border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] bg-[#050b1f]/95 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] mb-3">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <CardTitle className="text-2xl font-black text-white">Payment Authorized & Settled</CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              Your transaction has been processed and logged in the multi-merchant ledger.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#07102e] border border-cyan-500/30 space-y-2.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>Merchant / Shop</span>
                <span className="font-bold text-white text-sm">
                  {merchantProfile?.businessName || 'Verified PGX Sub-Merchant'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Merchant Ref ID</span>
                <span className="font-mono text-cyan-300 font-bold">{refParam || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Order Reference</span>
                <span className="font-mono text-slate-200">{orderIdParam}</span>
              </div>
              {sessionIdParam && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Stripe Session</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                    {sessionIdParam}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-700/60 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-200">Total Charged</span>
                <span className="text-lg font-black text-emerald-400">
                  ${amount.toFixed(2)} {currencyParam}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>
                Fees split: 9.0% hardwired to Super Admin, reseller spread recorded, net balance credited to merchant.
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black" size="lg">
              <Link to="/">Return to Merchant Store</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        /* ACTIVE CHECKOUT FORM */
        <Card className="border-[1.5px] border-cyan-400/70 shadow-[0_0_30px_rgba(0,240,255,0.25)] bg-[#050b1f]/95 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                    {refParam ? `Ref: ${refParam}` : 'Direct Checkout'}
                  </span>
                  {merchantProfile?.isVerified && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/50 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl sm:text-2xl font-black text-white">
                  {profileLoading ? (
                    <span className="flex items-center gap-2 text-slate-400 text-base font-normal">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> Resolving merchant...
                    </span>
                  ) : (
                    merchantProfile?.businessName || 'Express Checkout'
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Order #{orderIdParam} • Routed via Single Stripe Architecture
                </CardDescription>
              </div>
              <div className="text-left sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 pt-1 sm:pt-0 border-t border-cyan-500/10 sm:border-t-0">
                <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  ${amount.toFixed(2)}
                </span>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{currencyParam}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {checkoutError && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#07102e] border border-cyan-500/30 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Order Reference</span>
                <span className="font-mono text-slate-200">{orderIdParam}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Due</span>
                <span className="font-bold text-white">${amount.toFixed(2)} {currencyParam}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Receipt Email (Optional)</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-[#060c24] border-cyan-500/40 text-white placeholder-slate-500 text-base sm:text-sm min-h-[44px]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full gap-2 py-4 sm:py-6 text-sm font-extrabold min-h-[48px] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:via-blue-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(0,240,255,0.7)] cursor-pointer"
              size="lg"
              disabled={isProcessing || !refParam}
              onClick={handlePayment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to Secure Checkout...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  <span>Proceed to Pay ${amount.toFixed(2)} {currencyParam}</span>
                </>
              )}
            </Button>

            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Supports Cards, Apple Pay, Google Pay, Link, and eligible local payment methods.</span>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
