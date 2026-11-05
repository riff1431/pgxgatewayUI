import { useState, useRef, useEffect } from 'react'
import { 
  AlertCircle,
  AlertTriangle, 
  ArrowLeftRight, 
  Briefcase, 
  Building2, 
  Calendar, 
  CheckCircle2,
  Coins, 
  CreditCard, 
  Globe, 
  Loader2,
  MessageSquare, 
  Store 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Step2BusinessProps {
  onNext: () => void | Promise<void>
  onBack: () => void
}

interface FormErrors {
  legalName?: string
  industry?: string
  website?: string
  monthlyVolume?: string
  switchReason?: string
}

export default function Step2Business({ onNext, onBack }: Step2BusinessProps) {
  const { merchant, addToast } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    legalName: merchant?.legalName || '',
    industry: merchant?.industry || '',
    website: merchant?.website || '',
    yearsInBusiness: merchant?.yearsInBusiness || '',
    currentProcessor: merchant?.currentProcessor || '',
    monthlyVolume: merchant?.monthlyVolume || '',
    avgTransaction: merchant?.avgTransaction || '',
    chargebackRate: merchant?.chargebackRate || '',
    switchReason: merchant?.switchReason || '',
  })

  // Synchronize when merchant is updated
  useEffect(() => {
    if (merchant) {
      setFormData((prev) => ({
        ...prev,
        legalName: prev.legalName || merchant.legalName || '',
        industry: prev.industry || merchant.industry || '',
        website: prev.website || merchant.website || '',
        yearsInBusiness: prev.yearsInBusiness || merchant.yearsInBusiness || '',
        currentProcessor: prev.currentProcessor || merchant.currentProcessor || '',
        monthlyVolume: prev.monthlyVolume || merchant.monthlyVolume || '',
        avgTransaction: prev.avgTransaction || merchant.avgTransaction || '',
        chargebackRate: prev.chargebackRate || merchant.chargebackRate || '',
        switchReason: prev.switchReason || merchant.switchReason || '',
      }))
    }
  }, [merchant])

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<FormErrors>({})

  const legalNameRef = useRef<HTMLInputElement>(null)
  const industryRef = useRef<HTMLSelectElement>(null)
  const volumeRef = useRef<HTMLSelectElement>(null)
  const reasonRef = useRef<HTMLTextAreaElement>(null)

  // Validation function
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'legalName':
        if (!value.trim()) return 'Business legal name is required.'
        if (value.trim().length < 2) return 'Legal name must be at least 2 characters.'
        break
      case 'industry':
        if (!value) return 'Please select your business industry.'
        break
      case 'website':
        if (value.trim()) {
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
          if (!urlPattern.test(value.trim())) {
            return 'Please enter a valid URL (e.g. https://company.com).'
          }
        }
        break
      case 'monthlyVolume':
        if (!value) return 'Please select your estimated monthly volume.'
        break
      case 'switchReason':
        if (!value.trim()) return 'Reason for seeking payment processing is required.'
        if (value.trim().length < 5) return 'Please provide a brief description (at least 5 characters).'
        break
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const fieldsToValidate = ['legalName', 'industry', 'website', 'monthlyVolume', 'switchReason']

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f as keyof typeof formData])
      if (err) newErrors[f as keyof FormErrors] = err
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errorMessage) setErrorMessage(null)

    if (touched[field]) {
      const err = validateField(field, value)
      setErrors((prev) => ({ ...prev, [field]: err }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateField(field, formData[field as keyof typeof formData])
    setErrors((prev) => ({ ...prev, [field]: err }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const allTouched: Record<string, boolean> = {
      legalName: true,
      industry: true,
      website: true,
      monthlyVolume: true,
      switchReason: true,
    }
    setTouched(allTouched)

    if (!validateForm()) {
      if (errors.legalName || !formData.legalName) legalNameRef.current?.focus()
      else if (errors.industry || !formData.industry) industryRef.current?.focus()
      else if (errors.monthlyVolume || !formData.monthlyVolume) volumeRef.current?.focus()
      else if (errors.switchReason || !formData.switchReason) reasonRef.current?.focus()
      return
    }

    setSubmitting(true)

    try {
      await api.merchants.updateStep2({
        legalName: formData.legalName.trim(),
        industry: formData.industry,
        website: formData.website.trim(),
        yearsInBusiness: formData.yearsInBusiness,
        currentProcessor: formData.currentProcessor.trim(),
        monthlyVolume: formData.monthlyVolume,
        avgTransaction: formData.avgTransaction.trim(),
        chargebackRate: formData.chargebackRate,
        switchReason: formData.switchReason.trim(),
      })
      addToast('Business Information Saved', 'Proceeding to Step 3 document verification.', 'success')
      await onNext()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update business information.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Step Header with Dual-Ring Purple Glow */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
        <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
            Step 2 of 3
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Business & Processing Information
          </h2>
          <p className="text-xs text-slate-400">
            Tell us about your business metrics and current payment processing setup.
          </p>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dual-Chamber Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Business Legal Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Business Legal Name <span className="text-fuchsia-400">*</span>
            </label>
            {touched.legalName && !errors.legalName && formData.legalName && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
          <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
            touched.legalName && errors.legalName
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
          }`}>
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <input
              ref={legalNameRef}
              type="text"
              value={formData.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              onBlur={() => handleBlur('legalName')}
              placeholder="e.g. Apex Global Trading LLC"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          {touched.legalName && errors.legalName && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.legalName}
            </p>
          )}
        </div>

        {/* Business Industry */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Business Industry <span className="text-fuchsia-400">*</span>
            </label>
            {touched.industry && !errors.industry && formData.industry && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Selected
              </span>
            )}
          </div>
          <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all relative ${
            touched.industry && errors.industry
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
          }`}>
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <select
              ref={industryRef}
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              onBlur={() => handleBlur('industry')}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">Select your industry</option>
              <option value="e-commerce" className="bg-[#070e28]">E-Commerce & Retail</option>
              <option value="crypto" className="bg-[#070e28]">Crypto & Digital Assets</option>
              <option value="gaming" className="bg-[#070e28]">iGaming & Esports</option>
              <option value="saas" className="bg-[#070e28]">SaaS & Software</option>
              <option value="travel" className="bg-[#070e28]">Travel & Hospitality</option>
              <option value="forex" className="bg-[#070e28]">Forex & Trading</option>
              <option value="digital-goods" className="bg-[#070e28]">Digital Products & Services</option>
              <option value="other" className="bg-[#070e28]">Other Industry</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-cyan-400 text-xs">
              ▼
            </div>
          </div>
          {touched.industry && errors.industry && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.industry}
            </p>
          )}
        </div>

        {/* Website URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Website URL <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
            touched.website && errors.website
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
          }`}>
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              onBlur={() => handleBlur('website')}
              placeholder="https://yourwebsite.com"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          {touched.website && errors.website && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.website}
            </p>
          )}
        </div>

        {/* Estimated Monthly Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Estimated Monthly Volume <span className="text-fuchsia-400">*</span>
            </label>
            {touched.monthlyVolume && !errors.monthlyVolume && formData.monthlyVolume && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Selected
              </span>
            )}
          </div>
          <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all relative ${
            touched.monthlyVolume && errors.monthlyVolume
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
          }`}>
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Coins className="h-4 w-4" />
            </div>
            <select
              ref={volumeRef}
              value={formData.monthlyVolume}
              onChange={(e) => handleChange('monthlyVolume', e.target.value)}
              onBlur={() => handleBlur('monthlyVolume')}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">Select monthly processing volume</option>
              <option value="under-10k" className="bg-[#070e28]">&lt; $10,000 / month</option>
              <option value="10k-50k" className="bg-[#070e28]">$10,000 - $50,000 / month</option>
              <option value="50k-250k" className="bg-[#070e28]">$50,000 - $250,000 / month</option>
              <option value="250k-1m" className="bg-[#070e28]">$250,000 - $1,000,000 / month</option>
              <option value="1m+" className="bg-[#070e28]">$1,000,000+ / month (Enterprise)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-cyan-400 text-xs">
              ▼
            </div>
          </div>
          {touched.monthlyVolume && errors.monthlyVolume && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.monthlyVolume}
            </p>
          )}
        </div>

        {/* Current Processor */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Current Processor <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.currentProcessor}
              onChange={(e) => handleChange('currentProcessor', e.target.value)}
              placeholder="e.g. Stripe, PayPal, Square, First Data"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Years in Business */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Years in Business <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <select
              value={formData.yearsInBusiness}
              onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#070e28] text-slate-400">Select business tenure (optional)</option>
              <option value="startup" className="bg-[#070e28]">New Startup (&lt; 1 Year)</option>
              <option value="1-2" className="bg-[#070e28]">1 - 2 Years</option>
              <option value="3-5" className="bg-[#070e28]">3 - 5 Years</option>
              <option value="5+" className="bg-[#070e28]">5+ Years Established</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Average Transaction Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Average Transaction Size <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.avgTransaction}
              onChange={(e) => handleChange('avgTransaction', e.target.value)}
              placeholder="e.g. $75"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Chargeback Ratio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Estimated Chargeback Ratio <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <select
              value={formData.chargebackRate}
              onChange={(e) => handleChange('chargebackRate', e.target.value)}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#070e28] text-slate-400">Select range (optional)</option>
              <option value="low" className="bg-[#070e28]">Under 0.5% (Very Low)</option>
              <option value="normal" className="bg-[#070e28]">0.5% - 1.0% (Standard)</option>
              <option value="elevated" className="bg-[#070e28]">1.0% - 2.0% (Elevated)</option>
              <option value="high" className="bg-[#070e28]">Above 2.0% (High-Risk)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

      </div>

      {/* Reason for Switching Processors */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200">
            Reason for Seeking PGX Gateway <span className="text-fuchsia-400">*</span>
          </label>
          {touched.switchReason && !errors.switchReason && formData.switchReason && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Valid
            </span>
          )}
        </div>
        <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
          touched.switchReason && errors.switchReason
            ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
            : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
        }`}>
          <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-start justify-center pt-3 text-cyan-400 shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <textarea
            ref={reasonRef}
            rows={3}
            value={formData.switchReason}
            onChange={(e) => handleChange('switchReason', e.target.value)}
            onBlur={() => handleBlur('switchReason')}
            placeholder="Tell us why you are seeking a new processing solution (e.g. higher volume limits, lower decline rate, multi-currency processing)..."
            className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
          />
        </div>
        {touched.switchReason && errors.switchReason && (
          <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors.switchReason}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
        >
          <span>&larr;</span> Back to Step 1
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Business Details...</span>
            </>
          ) : (
            <>
              <span>Save & Continue to Step 3</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
