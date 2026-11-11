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
  LogOut
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

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

  const { register, login, updateProfile, logout, merchant, isAuthenticated } = useAuth()
  
  const isSignInMode = isSignInRoute

  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: merchant?.fullName || '',
    businessEmail: merchant?.businessEmail || '',
    phone: merchant?.phone || '',
    whatsapp: merchant?.whatsapp || '',
    telegram: merchant?.telegram || '',
    password: '',
  })

  // Synchronize with merchant data when context updates
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

  // Field refs for auto-focusing on first error
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Validation rules
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!isSignInMode && !isAuthenticated) {
          if (!value.trim()) return 'Full name is required.'
          if (value.trim().length < 2) return 'Full name must be at least 2 characters.'
        }
        break
      case 'businessEmail': {
        if (!value.trim()) return 'Business email is required.'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address (e.g. name@company.com).'
        break
      }
      case 'phone':
        if (!isSignInMode && !isAuthenticated) {
          if (!value.trim()) return 'Phone number is required.'
          const digits = value.replace(/\D/g, '')
          if (digits.length < 7) return 'Please enter a valid phone number (at least 7 digits).'
        }
        break
      case 'whatsapp':
        if (value.trim()) {
          const digits = value.replace(/\D/g, '')
          if (digits.length < 7) return 'Please enter a valid WhatsApp phone number.'
        }
        break
      case 'telegram':
        if (value.trim()) {
          const clean = value.replace(/^@/, '')
          if (clean.length < 3 || !/^[a-zA-Z0-9_]+$/.test(clean)) {
            return 'Telegram username must be at least 3 characters (letters, numbers, underscores).'
          }
        }
        break
      case 'password':
        // If already authenticated and editing profile, password is not required
        if (isAuthenticated) break
        if (!value) return 'Password is required.'
        if (value.length < 8) return 'Password must be at least 8 characters long.'
        break
    }
    return undefined
  }

  // Validate entire form
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

    // Dynamic real-time validation if field has been touched
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

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-400' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-400' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    // Mark all relevant fields as touched
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
      // Focus the first invalid field
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

      // If user is already authenticated and just continuing or updating Step 1 info
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

      // New user registration
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
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication.'
      setGlobalError(msg)
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        setErrors((prev) => ({
          ...prev,
          businessEmail: 'Email is already registered. Please sign in.',
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
    setTimeout(() => {
      passwordRef.current?.focus()
    }, 100)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Step Header with Dual-Ring Purple Glow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/20 gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            {!isSignInMode && (
              <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
                Step 1 of 3
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {isSignInMode ? 'Merchant Sign In' : 'Account & Contact Information'}
            </h2>
            <p className="text-xs text-slate-400">
              {isSignInMode
                ? 'Sign in to access and manage your merchant processing application.'
                : isAuthenticated
                ? 'Your account is active. Review or update contact information below.'
                : "Let's create your account and get your contact details."}
            </p>
          </div>
        </div>

        {/* Toggle between Register and Sign In (or Logout if authenticated) */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Signed In
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
              title="Sign out of current account"
            >
              <LogOut className="w-3.5 h-3.5" /> Switch
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
            }}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer transition-colors text-left sm:text-right"
          >
            {isSignInMode ? 'Need an account? Register' : 'Already have account? Sign In'}
          </button>
        )}
      </div>

      {/* Global error alert banner */}
      {/* Partner Onboarding Badge */
      (searchParams.get('reseller') || searchParams.get('ref')) && (
        <div className="mb-4 p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/60 text-cyan-200 text-xs flex items-center gap-2.5 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white">Partner Onboarding Program</div>
            <div className="text-[11px] text-cyan-300 font-mono">
              Registering under Authorized Partner: <strong>{searchParams.get('reseller') || searchParams.get('ref')}</strong>
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
              Sign In Now &rarr;
            </button>
          )}
        </div>
      )}

      {/* Dual-Chamber Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Full Name (Registration / Edit Profile only) */}
        {!isSignInMode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Full Name <span className="text-fuchsia-400">*</span>
              </label>
              {touched.fullName && !errors.fullName && formData.fullName && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              )}
            </div>
            <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
              touched.fullName && errors.fullName
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}>
              <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <input
                ref={fullNameRef}
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your full name"
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
              Business Email <span className="text-fuchsia-400">*</span>
            </label>
            {touched.businessEmail && !errors.businessEmail && formData.businessEmail && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
          <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
            touched.businessEmail && errors.businessEmail
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
          }`}>
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <input
              ref={emailRef}
              type="email"
              value={formData.businessEmail}
              onChange={(e) => handleChange('businessEmail', e.target.value)}
              onBlur={() => handleBlur('businessEmail')}
              placeholder="name@company.com"
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
              {errors.businessEmail.includes('already registered') && (
                <button
                  type="button"
                  onClick={handleSwitchToSignInWithEmail}
                  className="underline text-cyan-400 font-bold ml-2 cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>

        {/* Phone Number (Registration only) */}
        {!isSignInMode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Phone Number <span className="text-fuchsia-400">*</span>
              </label>
              {touched.phone && !errors.phone && formData.phone && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              )}
            </div>
            <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
              touched.phone && errors.phone
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}>
              <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <input
                ref={phoneRef}
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="+1 (555) 019-2834"
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

        {/* WhatsApp Number (Registration only) */}
        {!isSignInMode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                WhatsApp Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
            </div>
            <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
              touched.whatsapp && errors.whatsapp
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}>
              <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                onBlur={() => handleBlur('whatsapp')}
                placeholder="+1 (555) 019-2834"
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

        {/* Telegram Username (Registration only) */}
        {!isSignInMode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Telegram Username <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
            </div>
            <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all ${
              touched.telegram && errors.telegram
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}>
              <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-sky-400 shrink-0">
                <Send className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                onBlur={() => handleBlur('telegram')}
                placeholder="@yourhandle"
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

        {/* Password (Hidden if authenticated, shown if registering or signing in) */}
        {!isAuthenticated && (
          <div className={`space-y-1.5 ${isSignInMode ? 'sm:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                {isSignInMode ? 'Account Password' : 'Create Password'}{' '}
                <span className="text-fuchsia-400">*</span>
              </label>
              {!isSignInMode && formData.password && (
                <span className="text-[10px] font-semibold text-slate-300">
                  Strength:{' '}
                  <span className={passwordStrength.label === 'Strong' ? 'text-emerald-400' : passwordStrength.label === 'Fair' ? 'text-amber-400' : 'text-red-400'}>
                    {passwordStrength.label}
                  </span>
                </span>
              )}
            </div>
            <div className={`flex rounded-xl border bg-[#060c24] overflow-hidden transition-all relative ${
              touched.password && errors.password
                ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)]'
            }`}>
              <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Minimum 8 characters"
                className="w-full bg-transparent pl-3 pr-10 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength meter bar (in registration mode) */}
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

        {/* If already authenticated, show friendly notice that credentials are saved */}
        {isAuthenticated && (
          <div className="space-y-1.5 flex flex-col justify-center p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Account Verified & Active
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Your credentials are securely stored. You can proceed directly to Business Details or edit your contact phone above.
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
          <span>&larr;</span> {isSignInMode ? 'Back to Home' : 'Back'}
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isSignInMode ? 'Signing In...' : 'Saving Account...'}</span>
            </>
          ) : (
            <>
              <span>
                {isSignInMode
                  ? 'Sign In to Portal'
                  : isAuthenticated
                  ? 'Continue to Step 2'
                  : 'Complete Step 1 & Proceed'}
              </span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
