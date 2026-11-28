import { useState } from 'react'
import { Star, Send, ShieldCheck, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'

export default function SubmitReviewCard() {
  const { merchant, addToast } = useAuth()
  const { t } = useTranslation()

  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [headline, setHeadline] = useState('')
  const [content, setContent] = useState('')
  const [companyName, setCompanyName] = useState(merchant?.legalName || merchant?.fullName || '')
  const [country, setCountry] = useState('US')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!content.trim()) {
      setErrorMessage(t('dashboard.reviewCard.errEmpty'))
      return
    }

    if (content.trim().length < 15) {
      setErrorMessage(t('dashboard.reviewCard.errMinLength'))
      return
    }

    setSubmitting(true)
    try {
      const res = await api.reviews.submit({
        rating,
        headline: headline.trim() || `${rating}-Star Verified Processing Experience`,
        content: content.trim(),
        companyName: companyName.trim() || merchant?.fullName || 'Verified Merchant',
        country: country.trim().toUpperCase(),
      })

      if (res?.success) {
        setSubmitted(true)
        addToast(
          t('dashboard.reviewCard.toastTitle'),
          t('dashboard.reviewCard.toastDesc'),
          'success'
        )
      } else {
        setErrorMessage(res?.message || t('dashboard.reviewCard.errFailed'))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('dashboard.reviewCard.errFallback')
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setHeadline('')
    setContent('')
    setRating(5)
  }

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#080f28]/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_25px_rgba(0,240,255,0.1)] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 border border-cyan-400/40 text-cyan-300">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{t('dashboard.reviewCard.badge')}</span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{t('dashboard.reviewCard.title')}</span>
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('dashboard.reviewCard.desc')}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="py-8 text-center space-y-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(52,211,153,0.4)] animate-bounce-slow">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-lg font-bold text-white">{t('dashboard.reviewCard.successTitle')}</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('dashboard.reviewCard.successDesc')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-400/50 transition-all cursor-pointer"
          >
            {t('dashboard.reviewCard.submitAnother')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-6 space-y-5 relative z-10">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('dashboard.reviewCard.ratingLabel')} <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#060c22] border border-cyan-500/30 w-fit">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-600 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <span className="text-xs font-bold text-amber-300">
                {rating === 5 ? '5.0 — Outstanding' : `${rating}.0 Stars`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business / Brand Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('dashboard.reviewCard.companyLabel')}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('dashboard.reviewCard.companyPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/30 bg-[#060c22] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('dashboard.reviewCard.countryLabel')}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-cyan-500/30 bg-[#060c22] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="US">🇺🇸 United States (US)</option>
                <option value="GB">🇬🇧 United Kingdom (GB)</option>
                <option value="BD">🇧🇩 Bangladesh (BD)</option>
                <option value="ES">🇪🇸 Spain (ES)</option>
                <option value="MX">🇲🇽 Mexico (MX)</option>
                <option value="FR">🇫🇷 France (FR)</option>
                <option value="CA">🇨🇦 Canada (CA)</option>
                <option value="DE">🇩🇪 Germany (DE)</option>
                <option value="AU">🇦🇺 Australia (AU)</option>
                <option value="SG">🇸🇬 Singapore (SG)</option>
                <option value="AE">🇦🇪 United Arab Emirates (AE)</option>
                <option value="IN">🇮🇳 India (IN)</option>
              </select>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('dashboard.reviewCard.headlineLabel')}
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={t('dashboard.reviewCard.headlinePlaceholder')}
              className="w-full rounded-xl border border-cyan-500/30 bg-[#060c22] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('dashboard.reviewCard.contentLabel')} <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('dashboard.reviewCard.contentPlaceholder')}
              className="w-full rounded-xl border border-cyan-500/30 bg-[#060c22] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              {t('dashboard.reviewCard.minCharsNote')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>{t('dashboard.reviewCard.submittingBtn')}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-slate-950" />
                  <span>{t('dashboard.reviewCard.submitBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
