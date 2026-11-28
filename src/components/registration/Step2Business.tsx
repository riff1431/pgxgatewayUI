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
  GitBranch,
  Loader2,
  MessageSquare,
  Store,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'

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
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    legalName: merchant?.legalName || '',
    industry: merchant?.industry || '',
    website: merchant?.website || '',
    gitRepoUrl: merchant?.gitRepoUrl || '',
    yearsInBusiness: merchant?.yearsInBusiness || '',
    currentProcessor: merchant?.currentProcessor || '',
    monthlyVolume: merchant?.monthlyVolume || '',
    avgTransaction: merchant?.avgTransaction || '',
    chargebackRate: merchant?.chargebackRate || '',
    switchReason: merchant?.switchReason || '',
  })

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

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'legalName':
        if (!value.trim()) return t('registration.step2.errLegalNameReq')
        if (value.trim().length < 2) return t('registration.step2.errLegalNameLen')
        break
      case 'industry':
        if (!value) return t('registration.step2.errIndustryReq')
        break
      case 'website':
        if (value.trim()) {
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
          if (!urlPattern.test(value.trim())) {
            return t('registration.step2.errWebsiteInvalid')
          }
        }
        break
      case 'monthlyVolume':
        if (!value) return t('registration.step2.errVolumeReq')
        break
      case 'switchReason':
        if (!value.trim()) return t('registration.step2.errReasonReq')
        if (value.trim().length < 5) return t('registration.step2.errReasonLen')
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
        gitRepoUrl: formData.gitRepoUrl.trim(),
        yearsInBusiness: formData.yearsInBusiness,
        currentProcessor: formData.currentProcessor.trim(),
        monthlyVolume: formData.monthlyVolume,
        avgTransaction: formData.avgTransaction.trim(),
        chargebackRate: formData.chargebackRate,
        switchReason: formData.switchReason.trim(),
      })
      addToast(
        t('registration.step2.toastSavedTitle'),
        t('registration.step2.toastSavedMsg'),
        'success'
      )
      await onNext()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('registration.step2.errUpdateFailed')
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
        <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
            {t('registration.step2.eyebrow')}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t('registration.step2.title')}
          </h2>
          <p className="text-xs text-slate-400">{t('registration.step2.subtitle')}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Business Legal Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              {t('registration.step2.legalName')} <span className="text-fuchsia-400">*</span>
            </label>
            {touched.legalName && !errors.legalName && formData.legalName && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> {t('common.valid')}
              </span>
            )}
          </div>
          <div
            className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
              touched.legalName && errors.legalName
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}
          >
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <input
              ref={legalNameRef}
              type="text"
              value={formData.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              onBlur={() => handleBlur('legalName')}
              placeholder={t('registration.step2.legalNamePlaceholder')}
              className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
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
              {t('registration.step2.industry')} <span className="text-fuchsia-400">*</span>
            </label>
            {touched.industry && !errors.industry && formData.industry && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> {t('common.selected')}
              </span>
            )}
          </div>
          <div
            className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all relative ${
              touched.industry && errors.industry
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}
          >
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <select
              ref={industryRef}
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              onBlur={() => handleBlur('industry')}
              className="w-full bg-transparent ps-3 pe-8 py-2.5 text-base sm:text-sm text-white focus:outline-none appearance-none cursor-pointer min-h-[44px]"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">
                {t('registration.step2.industryPlaceholder')}
              </option>
              <option value="e-commerce" className="bg-[#070e28]">
                {t('registration.step2.indEcommerce')}
              </option>
              <option value="crypto" className="bg-[#070e28]">
                {t('registration.step2.indCrypto')}
              </option>
              <option value="gaming" className="bg-[#070e28]">
                {t('registration.step2.indGaming')}
              </option>
              <option value="saas" className="bg-[#070e28]">
                {t('registration.step2.indSaas')}
              </option>
              <option value="travel" className="bg-[#070e28]">
                {t('registration.step2.indTravel')}
              </option>
              <option value="forex" className="bg-[#070e28]">
                {t('registration.step2.indForex')}
              </option>
              <option value="digital-goods" className="bg-[#070e28]">
                {t('registration.step2.indDigital')}
              </option>
              <option value="other" className="bg-[#070e28]">
                {t('registration.step2.indOther')}
              </option>
            </select>
            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-cyan-400 text-xs">
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
            {t('registration.step2.website')}{' '}
            <span className="text-slate-500 font-normal">{t('common.optional')}</span>
          </label>
          <div
            className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
              touched.website && errors.website
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}
          >
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <input
              type="url"
              dir="ltr"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              onBlur={() => handleBlur('website')}
              placeholder={t('registration.step2.websitePlaceholder')}
              className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
            />
          </div>
          {touched.website && errors.website && (
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.website}
            </p>
          )}
        </div>

        {/* Git Repository Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            {t('registration.step2.gitRepo')}{' '}
            <span className="text-slate-500 font-normal">
              {t('registration.step2.gitRepoOptional')}
            </span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 transition-all">
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <GitBranch className="h-4 w-4" />
            </div>
            <input
              type="url"
              dir="ltr"
              value={formData.gitRepoUrl}
              onChange={(e) => handleChange('gitRepoUrl', e.target.value)}
              placeholder={t('registration.step2.gitRepoPlaceholder')}
              className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        {/* Estimated Monthly Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              {t('registration.step2.monthlyVolume')} <span className="text-fuchsia-400">*</span>
            </label>
            {touched.monthlyVolume && !errors.monthlyVolume && formData.monthlyVolume && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> {t('common.selected')}
              </span>
            )}
          </div>
          <div
            className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all relative ${
              touched.monthlyVolume && errors.monthlyVolume
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}
          >
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Coins className="h-4 w-4" />
            </div>
            <select
              ref={volumeRef}
              value={formData.monthlyVolume}
              onChange={(e) => handleChange('monthlyVolume', e.target.value)}
              onBlur={() => handleBlur('monthlyVolume')}
              className="w-full bg-transparent ps-3 pe-8 py-2.5 text-base sm:text-sm text-white focus:outline-none appearance-none cursor-pointer min-h-[44px]"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">
                {t('registration.step2.volumePlaceholder')}
              </option>
              <option value="under-10k" className="bg-[#070e28]">
                {t('registration.step2.volUnder10k')}
              </option>
              <option value="10k-50k" className="bg-[#070e28]">
                {t('registration.step2.vol10k50k')}
              </option>
              <option value="50k-250k" className="bg-[#070e28]">
                {t('registration.step2.vol50k250k')}
              </option>
              <option value="250k-1m" className="bg-[#070e28]">
                {t('registration.step2.vol250k1m')}
              </option>
              <option value="1m+" className="bg-[#070e28]">
                {t('registration.step2.vol1mPlus')}
              </option>
            </select>
            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-cyan-400 text-xs">
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
            {t('registration.step2.currentProcessor')}{' '}
            <span className="text-slate-500 font-normal">{t('common.optional')}</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.currentProcessor}
              onChange={(e) => handleChange('currentProcessor', e.target.value)}
              placeholder={t('registration.step2.currentProcessorPlaceholder')}
              className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        {/* Years in Business */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            {t('registration.step2.yearsInBusiness')}{' '}
            <span className="text-slate-500 font-normal">{t('common.optional')}</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <select
              value={formData.yearsInBusiness}
              onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
              className="w-full bg-transparent ps-3 pe-8 py-2.5 text-base sm:text-sm text-white focus:outline-none appearance-none cursor-pointer min-h-[44px]"
            >
              <option value="" className="bg-[#070e28] text-slate-400">
                {t('registration.step2.yearsPlaceholder')}
              </option>
              <option value="startup" className="bg-[#070e28]">
                {t('registration.step2.yearsStartup')}
              </option>
              <option value="1-2" className="bg-[#070e28]">
                {t('registration.step2.years1to2')}
              </option>
              <option value="3-5" className="bg-[#070e28]">
                {t('registration.step2.years3to5')}
              </option>
              <option value="5+" className="bg-[#070e28]">
                {t('registration.step2.years5Plus')}
              </option>
            </select>
            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Average Transaction Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            {t('registration.step2.avgTransaction')}{' '}
            <span className="text-slate-500 font-normal">{t('common.optional')}</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <input
              type="text"
              dir="ltr"
              value={formData.avgTransaction}
              onChange={(e) => handleChange('avgTransaction', e.target.value)}
              placeholder={t('registration.step2.avgTransactionPlaceholder')}
              className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        {/* Chargeback Ratio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            {t('registration.step2.chargebackRate')}{' '}
            <span className="text-slate-500 font-normal">{t('common.optional')}</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <select
              value={formData.chargebackRate}
              onChange={(e) => handleChange('chargebackRate', e.target.value)}
              className="w-full bg-transparent ps-3 pe-8 py-2.5 text-base sm:text-sm text-white focus:outline-none appearance-none cursor-pointer min-h-[44px]"
            >
              <option value="" className="bg-[#070e28] text-slate-400">
                {t('registration.step2.chargebackPlaceholder')}
              </option>
              <option value="low" className="bg-[#070e28]">
                {t('registration.step2.cbLow')}
              </option>
              <option value="normal" className="bg-[#070e28]">
                {t('registration.step2.cbNormal')}
              </option>
              <option value="elevated" className="bg-[#070e28]">
                {t('registration.step2.cbElevated')}
              </option>
              <option value="high" className="bg-[#070e28]">
                {t('registration.step2.cbHigh')}
              </option>
            </select>
            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Reason for Switching Processors */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200">
            {t('registration.step2.switchReason')} <span className="text-fuchsia-400">*</span>
          </label>
          {touched.switchReason && !errors.switchReason && formData.switchReason && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> {t('common.valid')}
            </span>
          )}
        </div>
        <div
          className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
            touched.switchReason && errors.switchReason
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
          }`}
        >
          <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-start justify-center pt-3 text-cyan-400 shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <textarea
            ref={reasonRef}
            rows={3}
            value={formData.switchReason}
            onChange={(e) => handleChange('switchReason', e.target.value)}
            onBlur={() => handleBlur('switchReason')}
            placeholder={t('registration.step2.switchReasonPlaceholder')}
            className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none min-h-[80px]"
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
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)] min-h-[44px]"
        >
          <span>&larr;</span> {t('registration.step2.backStep1')}
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('registration.step2.savingDetails')}</span>
            </>
          ) : (
            <>
              <span>{t('registration.step2.saveAndContinue')}</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
