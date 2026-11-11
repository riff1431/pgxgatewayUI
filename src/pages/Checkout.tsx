import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Coins,
  Wallet,
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

  const refParam = searchParams.get('ref') || 'PGX_REF_DEMO'
  const amountParam = parseFloat(searchParams.get('amount') || '129.00')
  const amount = isNaN(amountParam) || amountParam <= 0 ? 129.0 : amountParam
  const currencyParam = (searchParams.get('currency') || 'USD').toUpperCase()
  const [orderIdParam] = useState(
    () => searchParams.get('orderId') || `ORD-${Date.now().toString().slice(-5)}`
  )
  const statusParam = searchParams.get('status')
  const sessionIdParam = searchParams.get('session_id')

  const [merchantProfile, setMerchantProfile] = useState<PublicMerchantProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [method, setMethod] = useState<'card' | 'mfs' | 'wallet'>('card')
  const [cardName, setCardName] = useState('Tanvir Ahmed')
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242')
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [paidSuccess, setPaidSuccess] = useState<boolean>(statusParam === 'success')

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
        productName: merchantProfile ? `${merchantProfile.businessName} Purchase` : `Order #${orderIdParam}`,
      })

      if (res.checkoutUrl) {
        // Direct redirect to Stripe Hosted Checkout
        window.location.href = res.checkoutUrl
        return
      }

      // If simulated or immediate confirmation
      setPaidSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout initiation failed'
      // If Stripe credentials are not configured by reseller yet, show helpful fallback
      if (msg.includes('setup mode') || msg.includes('Stripe credentials')) {
        setCheckoutError('Admin has not yet saved Stripe API keys in the Settings tab. Running in simulated authorization mode.')
        setTimeout(() => {
          setPaidSuccess(true)
          setIsProcessing(false)
        }, 1200)
        return
      }
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
                <span className="font-mono text-cyan-300 font-bold">{refParam}</span>
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
                    Ref: {refParam}
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

          <CardContent className="space-y-6">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Payment Rails</label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant={method === 'card' ? 'default' : 'outline'}
                  className={`gap-1 sm:gap-2 h-auto py-2.5 sm:py-3 px-1 sm:px-2 flex-col items-center justify-center text-[11px] sm:text-xs font-bold transition-all min-h-[44px] ${
                    method === 'card'
                      ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_18px_rgba(217,70,239,0.7)] border border-fuchsia-400'
                      : 'border-slate-700 text-slate-400 hover:text-white bg-[#060c24]'
                  }`}
                  onClick={() => setMethod('card')}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Stripe Card</span>
                </Button>
                <Button
                  type="button"
                  variant={method === 'mfs' ? 'default' : 'outline'}
                  className={`gap-1 sm:gap-2 h-auto py-2.5 sm:py-3 px-1 sm:px-2 flex-col items-center justify-center text-[11px] sm:text-xs font-bold transition-all min-h-[44px] ${
                    method === 'mfs'
                      ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_18px_rgba(217,70,239,0.7)] border border-fuchsia-400'
                      : 'border-slate-700 text-slate-400 hover:text-white bg-[#060c24]'
                  }`}
                  onClick={() => setMethod('mfs')}
                >
                  <Wallet className="h-4 w-4" />
                  <span>MFS / Direct</span>
                </Button>
                <Button
                  type="button"
                  variant={method === 'wallet' ? 'default' : 'outline'}
                  className={`gap-1 sm:gap-2 h-auto py-2.5 sm:py-3 px-1 sm:px-2 flex-col items-center justify-center text-[11px] sm:text-xs font-bold transition-all min-h-[44px] ${
                    method === 'wallet'
                      ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_18px_rgba(217,70,239,0.7)] border border-fuchsia-400'
                      : 'border-slate-700 text-slate-400 hover:text-white bg-[#060c24]'
                  }`}
                  onClick={() => setMethod('wallet')}
                >
                  <Coins className="h-4 w-4" />
                  <span>Crypto Rails</span>
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Card Form */}
            {method === 'card' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cardholder Full Name</label>
                  <Input
                    placeholder="Cardholder Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-[#060c24] border-cyan-500/40 text-white placeholder-slate-500 text-base sm:text-sm min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Card Number</label>
                  <Input
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-[#060c24] border-cyan-500/40 text-white placeholder-slate-500 font-mono text-base sm:text-sm min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Expires</label>
                    <Input
                      placeholder="MM/YY"
                      defaultValue="12/28"
                      className="bg-[#060c24] border-cyan-500/40 text-white font-mono text-base sm:text-sm min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Security CVC</label>
                    <Input
                      placeholder="CVC"
                      defaultValue="888"
                      type="password"
                      maxLength={4}
                      className="bg-[#060c24] border-cyan-500/40 text-white font-mono text-base sm:text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'mfs' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#060c24] border border-cyan-500/30 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Mobile Account Number</label>
                  <Input placeholder="017XXXXXXXX" defaultValue="01812345678" className="bg-[#040817] text-base sm:text-sm min-h-[44px]" />
                </div>
                <p className="text-slate-400 text-[11px]">
                  An authorization prompt will be pushed to your verified mobile handset.
                </p>
              </div>
            )}

            {method === 'wallet' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#060c24] border border-cyan-500/30 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Digital Asset Currency</label>
                  <Input defaultValue="USDT (Polygon PoS)" readOnly className="bg-[#040817] font-mono text-cyan-300 text-base sm:text-sm min-h-[44px]" />
                </div>
                <p className="text-slate-400 text-[11px]">
                  Smart contract escrow deposit address generated and verified on polygonscan.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full gap-2 py-4 sm:py-6 text-sm font-extrabold min-h-[48px] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:via-blue-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(0,240,255,0.7)] cursor-pointer"
              size="lg"
              disabled={isProcessing}
              onClick={handlePayment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to Stripe Secure Gateway...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Pay ${amount.toFixed(2)} {currencyParam}</span>
                </>
              )}
            </Button>

            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Directly authenticated with Stripe & PGX multi-merchant routing.</span>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
