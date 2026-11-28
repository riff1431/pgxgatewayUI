import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Check, Lock, ShieldCheck, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
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
import { checkoutApi, type PublicPaymentLinkData } from '@/lib/checkoutApi'
import { useTranslation } from '@/context/LanguageContext'

export default function PayLinkPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const sessionIdParam = searchParams.get('session_id')

  const [data, setData] = useState<PublicPaymentLinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [customerEmail, setCustomerEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dismissedCancelled, setDismissedCancelled] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const error =
    actionError ?? (!dismissedCancelled && statusParam === 'cancelled' ? t('payLink.cancelledMsg') : null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await checkoutApi.getPublicPaymentLink(slug)
        if (active) setData(res)
      } catch {
        if (active) setData(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    if (slug) void load()
    return () => {
      active = false
    }
  }, [slug])

  const handleProceedToPay = async () => {
    if (!slug) return
    setActionError(null)
    setDismissedCancelled(true)
    setIsProcessing(true)
    try {
      const res = await checkoutApi.createPaymentLinkCheckout(slug, {
        customerEmail: customerEmail.trim() || undefined,
      })
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl
        return
      }
      setActionError(t('payLink.errMissingUrl'))
      setIsProcessing(false)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : t('payLink.errInitFailed'))
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-300 text-xs">
        <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
        <span>{t('payLink.loading')}</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="border-[1.5px] border-red-500/60 bg-[#050b1f]/95 text-center p-6 space-y-4">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white">{t('payLink.notFoundTitle')}</h1>
            <p className="text-xs text-slate-400">{t('payLink.notFoundDesc')}</p>
          </div>
          <Button asChild variant="outline" className="border-cyan-500/40 text-cyan-300">
            <Link to="/">{t('payLink.backHome')}</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const { paymentLink, merchant } = data
  const isSuccess = statusParam === 'success'

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-6 relative animate-fade-in">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs gap-1 border-cyan-500/40 text-cyan-300 bg-cyan-950/40">
          <Lock className="h-3 w-3 text-cyan-400" /> {t('payLink.badgeEncrypted')}
        </Badge>
        <Badge variant="outline" className="text-xs gap-1 border-emerald-500/40 text-emerald-300 bg-emerald-950/40">
          <ShieldCheck className="h-3 w-3 text-emerald-400" /> {t('payLink.badgeHosted')}
        </Badge>
      </div>

      {isSuccess ? (
        <Card className="border-[1.5px] border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] bg-[#050b1f]/95 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] mb-3">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <CardTitle className="text-2xl font-black text-white">
              {t('payLink.successTitle')}
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              {t('payLink.successDescPrefix')}{' '}
              <span className="text-white font-semibold">{paymentLink.title}</span>{' '}
              {t('payLink.successDescSuffix')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#07102e] border border-cyan-500/30 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>{t('payLink.merchantLabel')}</span>
                <span className="font-bold text-white">
                  {merchant?.businessName || t('payLink.verifiedMerchantFallback')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('payLink.amountPaidLabel')}</span>
                <span dir="ltr" className="font-black text-emerald-400 text-base">
                  {paymentLink.amount.toFixed(2)} {paymentLink.currency}
                </span>
              </div>
              {sessionIdParam && (
                <div className="flex justify-between text-slate-400">
                  <span>{t('payLink.referenceLabel')}</span>
                  <span dir="ltr" className="font-mono text-[10px] text-slate-300 truncate max-w-[200px]">
                    {sessionIdParam}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[1.5px] border-cyan-400/70 shadow-[0_0_30px_rgba(0,240,255,0.25)] bg-[#050b1f]/95 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-cyan-300">
                {merchant?.businessName || t('payLink.verifiedMerchantFallback')}
              </span>
              {merchant?.isVerified && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> {t('payLink.verifiedBadge')}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black text-white">
                  {paymentLink.title}
                </CardTitle>
                {paymentLink.description && (
                  <CardDescription className="text-slate-300 text-xs mt-1">
                    {paymentLink.description}
                  </CardDescription>
                )}
              </div>
              <div className="text-end shrink-0">
                <div dir="ltr" className="text-2xl sm:text-3xl font-black text-white">
                  {paymentLink.amount.toFixed(2)}
                </div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase">
                  {paymentLink.currency}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {paymentLink.status !== 'active' && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {paymentLink.status === 'completed'
                    ? t('payLink.statusCompletedMsg')
                    : t('payLink.statusDisabledMsg')}
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {paymentLink.status === 'active' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t('payLink.receiptEmailLabel')}
                </label>
                <Input
                  type="email"
                  dir="ltr"
                  placeholder={t('payLink.receiptEmailPlaceholder')}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="bg-[#060c24] border-cyan-500/40 text-white placeholder-slate-500 text-base sm:text-sm min-h-[44px]"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full gap-2 py-5 text-sm font-extrabold min-h-[48px] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:via-blue-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(0,240,255,0.6)] cursor-pointer"
              disabled={isProcessing || paymentLink.status !== 'active'}
              onClick={handleProceedToPay}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('payLink.openingCheckout')}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>
                    {t('payLink.payBtn', {
                      amount: paymentLink.amount.toFixed(2),
                      currency: paymentLink.currency,
                    })}
                  </span>
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-slate-400">
              {t('payLink.supportedMethods')}
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
