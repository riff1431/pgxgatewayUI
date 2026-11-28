import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Send,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Mail,
  KeyRound,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import { api } from '@/lib/api'

interface Step1AccountProps {
  onNext: () => void | Promise<void>
  onBack?: () => void
}

interface FormErrors {
  fullName?: string
  businessEmail?: string
  phone?: string
  whatsapp?: string
  telegram?: string
  password?: string
}

export default function Step1Account({ onNext, onBack }: Step1AccountProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isSignInRoute = location.pathname === '/login' || searchParams.get('mode') === 'signin'
  const isResetMode = searchParams.get('mode') === 'reset'
  const resetTokenParam = searchParams.get('token') || ''
  const resetEmailParam = searchParams.get('email') || ''

  const { register, login, updateProfile, logout, merchant, isAuthenticated } = useAuth()
  const { t } = useTranslation()

  const isSignInMode = isSignInRoute

  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)

  // Reset password form state (when in isResetMode)
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetEmail, setResetEmail] = useState(resetEmailParam)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: merchant?.fullName || '',
    businessEmail: merchant?.businessEmail || '',
    phone: merchant?.phone || '',
    whatsapp: merchant?.whatsapp || '',
    telegram: merchant?.telegram || '',
    password: '',
  })

  useEffect(() => {
    if (merchant) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || merchant.fullName || '',
        businessEmail: prev.businessEmail || merchant.businessEmail || '',
        phone: prev.phone || merchant.phone || '',
        whatsapp: prev.whatsapp || merchant.whatsapp || '',
        telegram: prev.telegram || merchant.telegram || '',
      }))
    }
  }, [merchant])

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [emailExistsError, setEmailExistsError] = useState(false)

  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!isSignInMode && !isAuthenticated) {
          if (!value.trim()) return t('registration.step1.errFullNameReq')
          if (value.trim().length < 2) return t('registration.step1.errFullNameLen')
        }
        break
      case 'businessEmail': {
        if (!value.trim()) return t('registration.step1.errEmailReq')
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
        if (!emailRegex.test(value.trim())) return t('registration.step1.errEmailInvalid')
        break
      }
      case 'phone':
        if (!isSignInMode && !isAuthenticated) {
          if (!value.trim()) return t('registration.step1.errPhoneReq')
          const digits = value.replace(/\D/g, '')
          if (digits.length < 7) return t('registration.step1.errPhoneInvalid')
        }
        break
      case 'whatsapp':
        if (value.trim()) {
          const digits = value.replace(/\D/g, '')
          if (digits.length < 7) return t('registration.step1.errWhatsappInvalid')
        }
        break
      case 'telegram':
        if (value.trim()) {
          const clean = value.replace(/^@/, '')
          if (clean.length < 3 || !/^[a-zA-Z0-9_]+$/.test(clean)) {
            return t('registration.step1.errTelegramInvalid')
          }
        }
        break
      case 'password':
        if (isAuthenticated) break
        if (!value) return t('registration.step1.errPassReq')
        if (value.length < 8) return t('registration.step1.errPassLen')
        break
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const fieldsToValidate = isSignInMode
      ? ['businessEmail', 'password']
      : isAuthenticated
        ? ['fullName', 'businessEmail', 'phone', 'whatsapp', 'telegram']
        : ['fullName', 'businessEmail', 'phone', 'whatsapp', 'telegram', 'password']

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f as keyof typeof formData])
      if (err) newErrors[f as keyof FormErrors] = err
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (globalError) setGlobalError(null)
    if (field === 'businessEmail') setEmailExistsError(false)

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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '', textColor: '' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1) {
      return {
        score: 1,
        label: t('registration.step1.strengthWeak'),
        color: 'bg-red-500',
        textColor: 'text-red-400',
      }
    }
    if (score <= 3) {
      return {
        score: 2,
        label: t('registration.step1.strengthFair'),
        color: 'bg-amber-400',
        textColor: 'text-amber-400',
      }
    }
    return {
      score: 3,
      label: t('registration.step1.strengthStrong'),
      color: 'bg-emerald-400',
      textColor: 'text-emerald-400',
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    const allTouched: Record<string, boolean> = {
      fullName: true,
      businessEmail: true,
      phone: true,
      whatsapp: true,
      telegram: true,
      password: true,
    }
    setTouched(allTouched)

    if (!validateForm()) {
      if (errors.fullName || !formData.fullName) fullNameRef.current?.focus()
      else if (errors.businessEmail || !formData.businessEmail) emailRef.current?.focus()
      else if (errors.phone || !formData.phone) phoneRef.current?.focus()
      else if (errors.password || !formData.password) passwordRef.current?.focus()
      return
    }

    setSubmitting(true)

    try {
      if (isSignInMode) {
        await login({
          businessEmail: formData.businessEmail.trim(),
          password: formData.password,
        })
        navigate('/dashboard', { replace: true })
        return
      }

      if (isAuthenticated && merchant) {
        await updateProfile({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim(),
          telegram: formData.telegram.trim(),
        })
        await onNext()
        return
      }

      await register({
        fullName: formData.fullName.trim(),
        businessEmail: formData.businessEmail.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        telegram: formData.telegram.trim(),
        password: formData.password,
      })
      await onNext()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('registration.step1.errAuthGeneric')
      setGlobalError(msg)
      if (
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('already registered')
      ) {
        setEmailExistsError(true)
        setErrors((prev) => ({
          ...prev,
          businessEmail: t('registration.step1.errEmailExists'),
        }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSwitchToSignInWithEmail = () => {
    navigate('/login')
    setGlobalError(null)
    setErrors({})
    setEmailExistsError(false)
    setTimeout(() => {
      passwordRef.current?.focus()
    }, 100)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError(t('registration.step1.errForgotInvalid'))
      return
    }
    setForgotSubmitting(true)
    setForgotError(null)
    setForgotSuccess(null)
    try {
      const res = await api.auth.forgotPassword({ email: forgotEmail.trim() })
      setForgotSuccess(res.message || t('registration.step1.forgotSentDefault'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('registration.step1.errForgotFailed')
      setForgotError(msg)
    } finally {
      setForgotSubmitting(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetNewPassword || resetNewPassword.length < 8) {
      setResetError(t('registration.step1.errPassLen'))
      return
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError(t('registration.step1.errResetMismatch'))
      return
    }
    setResetSubmitting(true)
    setResetError(null)
    setResetSuccess(null)
    try {
      const res = await api.auth.resetPassword({
        token: resetTokenParam,
        email: (resetEmail || resetEmailParam).trim(),
        password: resetNewPassword,
      })
      setResetSuccess(res.message || t('registration.step1.resetSuccessDefault'))
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('registration.step1.errResetExpired')
      setResetError(msg)
    } finally {
      setResetSubmitting(false)
    }
  }

  if (isResetMode) {
    return (
      <form onSubmit={handleResetSubmit} noValidate className="space-y-6">
        <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
          <div className="w-12 h-12 rounded-full bg-cyan-600/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)] shrink-0">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              {t('registration.step1.resetEyebrow')}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {t('registration.step1.resetTitle')}
            </h2>
            <p className="text-xs text-slate-400">{t('registration.step1.resetDesc')}</p>
          </div>
        </div>

        {resetError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{resetError}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{resetSuccess}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {t('registration.step1.resetEmailLabel')}
            </label>
            <div className="flex rounded-xl border border-cyan-500/30 bg-[#060c24] overflow-hidden opacity-90">
              <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                dir="ltr"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                readOnly={Boolean(resetEmailParam)}
                placeholder={t('registration.step1.emailPlaceholder')}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {t('registration.step1.resetNewPassLabel')} <span className="text-fuchsia-400">*</span>
            </label>
            <div className="flex rounded-xl border border-cyan-500/40 focus-within:border-cyan-400 bg-[#060c24] overflow-hidden relative">
              <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showResetPassword ? 'text' : 'password'}
                dir="ltr"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder={t('registration.step1.passwordPlaceholder')}
                className="w-full bg-transparent ps-3 pe-10 py-2.5 text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {t('registration.step1.resetConfirmPassLabel')}{' '}
              <span className="text-fuchsia-400">*</span>
            </label>
            <div className="flex rounded-xl border border-cyan-500/40 focus-within:border-cyan-400 bg-[#060c24] overflow-hidden">
              <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showResetPassword ? 'text' : 'password'}
                dir="ltr"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder={t('registration.step1.resetConfirmPlaceholder')}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          >
            &larr; {t('registration.step1.cancelSignIn')}
          </button>
          <button
            type="submit"
            disabled={resetSubmitting}
            className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] cursor-pointer disabled:opacity-50"
          >
            {resetSubmitting
              ? t('registration.step1.updatingPassword')
              : t('registration.step1.saveNewPassword')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/20 gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
              <User className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              {!isSignInMode && (
                <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
                  {t('registration.step1.eyebrow')}
                </div>
              )}
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {isSignInMode
                  ? t('registration.step1.titleSignIn')
                  : t('registration.step1.titleReg')}
              </h2>
              <p className="text-xs text-slate-400">
                {isSignInMode
                  ? t('registration.step1.subSignIn')
                  : isAuthenticated
                    ? t('registration.step1.subAuthed')
                    : t('registration.step1.subReg')}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />{' '}
                {t('registration.step1.signedInPill')}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                title={t('registration.step1.switchAccountTitle')}
              >
                <LogOut className="w-3.5 h-3.5" /> {t('registration.step1.switchBtn')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isSignInMode) {
                  navigate('/register')
                } else {
                  navigate('/login')
                }
                setGlobalError(null)
                setErrors({})
                setEmailExistsError(false)
              }}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer transition-colors text-start sm:text-end"
            >
              {isSignInMode
                ? t('registration.step1.needAccount')
                : t('registration.step1.alreadyHaveAccount')}
            </button>
          )}
        </div>

        {(searchParams.get('reseller') || searchParams.get('ref')) && (
          <div className="mb-4 p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/60 text-cyan-200 text-xs flex items-center gap-2.5 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white">{t('registration.step1.partnerTitle')}</div>
              <div className="text-[11px] text-cyan-300 font-mono">
                {t('registration.step1.partnerPrefix')}{' '}
                <strong dir="ltr">{searchParams.get('reseller') || searchParams.get('ref')}</strong>
              </div>
            </div>
          </div>
        )}

        {globalError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start justify-between gap-2.5 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{globalError}</span>
            </div>
            {globalError.toLowerCase().includes('already exists') && (
              <button
                type="button"
                onClick={handleSwitchToSignInWithEmail}
                className="underline font-bold text-cyan-300 hover:text-white shrink-0 cursor-pointer"
              >
                {t('registration.step1.signInNow')}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          {!isSignInMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  {t('registration.step1.fullName')} <span className="text-fuchsia-400">*</span>
                </label>
                {touched.fullName && !errors.fullName && formData.fullName && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> {t('common.valid')}
                  </span>
                )}
              </div>
              <div
                className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
                  touched.fullName && errors.fullName
                    ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
                }`}
              >
                <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <input
                  ref={fullNameRef}
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder={t('registration.step1.fullNamePlaceholder')}
                  className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.fullName}
                </p>
              )}
            </div>
          )}

          {/* Business Email */}
          <div className={`space-y-1.5 ${isSignInMode ? 'sm:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                {t('registration.step1.businessEmail')} <span className="text-fuchsia-400">*</span>
              </label>
              {touched.businessEmail && !errors.businessEmail && formData.businessEmail && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> {t('common.valid')}
                </span>
              )}
            </div>
            <div
              className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
                touched.businessEmail && errors.businessEmail
                  ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
              }`}
            >
              <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <input
                ref={emailRef}
                type="email"
                dir="ltr"
                value={formData.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                onBlur={() => handleBlur('businessEmail')}
                placeholder={t('registration.step1.emailPlaceholder')}
                disabled={isAuthenticated}
                className={`w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px] ${
                  isAuthenticated ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              />
            </div>
            {touched.businessEmail && errors.businessEmail && (
              <div className="flex items-center justify-between text-[11px] text-red-400 font-medium animate-fadeIn">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.businessEmail}
                </span>
                {emailExistsError && (
                  <button
                    type="button"
                    onClick={handleSwitchToSignInWithEmail}
                    className="underline text-cyan-400 font-bold ms-2 cursor-pointer"
                  >
                    {t('nav.signIn')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Phone Number */}
          {!isSignInMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  {t('registration.step1.phone')} <span className="text-fuchsia-400">*</span>
                </label>
                {touched.phone && !errors.phone && formData.phone && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> {t('common.valid')}
                  </span>
                )}
              </div>
              <div
                className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
                  touched.phone && errors.phone
                    ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
                }`}
              >
                <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  ref={phoneRef}
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder={t('registration.step1.phonePlaceholder')}
                  className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.phone}
                </p>
              )}
            </div>
          )}

          {/* WhatsApp */}
          {!isSignInMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  {t('registration.step1.whatsapp')}{' '}
                  <span className="text-slate-500 font-normal">{t('common.optional')}</span>
                </label>
              </div>
              <div
                className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
                  touched.whatsapp && errors.whatsapp
                    ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
                }`}
              >
                <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  onBlur={() => handleBlur('whatsapp')}
                  placeholder={t('registration.step1.phonePlaceholder')}
                  className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>
              {touched.whatsapp && errors.whatsapp && (
                <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.whatsapp}
                </p>
              )}
            </div>
          )}

          {/* Telegram */}
          {!isSignInMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  {t('registration.step1.telegram')}{' '}
                  <span className="text-slate-500 font-normal">{t('common.optional')}</span>
                </label>
              </div>
              <div
                className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
                  touched.telegram && errors.telegram
                    ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
                }`}
              >
                <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-sky-400 shrink-0">
                  <Send className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.telegram}
                  onChange={(e) => handleChange('telegram', e.target.value)}
                  onBlur={() => handleBlur('telegram')}
                  placeholder={t('registration.step1.telegramPlaceholder')}
                  className="w-full bg-transparent px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>
              {touched.telegram && errors.telegram && (
                <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.telegram}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          {!isAuthenticated && (
            <div className={`space-y-1.5 ${isSignInMode ? 'sm:col-span-2' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  {isSignInMode
                    ? t('registration.step1.accountPassword')
                    : t('registration.step1.createPassword')}{' '}
                  <span className="text-fuchsia-400">*</span>
                </label>
                {isSignInMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(formData.businessEmail || '')
                      setShowForgotModal(true)
                      setForgotSuccess(null)
                      setForgotError(null)
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                  >
                    {t('registration.step1.forgotPassword')}
                  </button>
                ) : formData.password ? (
                  <span className="text-[10px] font-semibold text-slate-300">
                    {t('registration.step1.strengthLabel')}{' '}
                    <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                  </span>
                ) : null}
              </div>
              <div
                className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all relative ${
                  touched.password && errors.password
                    ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
                }`}
              >
                <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder={t('registration.step1.passwordPlaceholder')}
                  className="w-full bg-transparent ps-3 pe-10 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={
                    showPassword
                      ? t('registration.step1.hidePassword')
                      : t('registration.step1.showPassword')
                  }
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {!isSignInMode && formData.password && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 flex gap-1">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                  />
                </div>
              )}

              {touched.password && errors.password && (
                <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="space-y-1.5 flex flex-col justify-center p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />{' '}
                {t('registration.step1.verifiedActive')}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {t('registration.step1.verifiedActiveSub')}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={() => {
              if (isSignInMode) {
                navigate('/')
              } else if (onBack) {
                onBack()
              } else {
                navigate('/')
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)] min-h-[44px]"
          >
            <span>&larr;</span>{' '}
            {isSignInMode ? t('registration.step1.backHome') : t('common.back')}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {isSignInMode
                    ? t('registration.step1.signingIn')
                    : t('registration.step1.savingAccount')}
                </span>
              </>
            ) : (
              <>
                <span>
                  {isSignInMode
                    ? t('registration.step1.btnSignIn')
                    : isAuthenticated
                      ? t('registration.step1.btnContinueStep2')
                      : t('registration.step1.btnCompleteStep1')}
                </span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#070d24] border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {t('registration.step1.forgotTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {t('registration.step1.forgotDesc')}
            </p>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  {t('registration.step1.businessEmail')}
                </label>
                <div className="flex rounded-xl border border-cyan-500/40 focus-within:border-cyan-400 bg-[#060c24] overflow-hidden">
                  <div className="w-11 bg-[#091332] border-e border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    dir="ltr"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t('registration.step1.emailPlaceholder')}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  {t('common.close')}
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {forgotSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('registration.step1.sending')}</span>
                    </>
                  ) : (
                    <span>{t('registration.step1.sendResetLink')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
