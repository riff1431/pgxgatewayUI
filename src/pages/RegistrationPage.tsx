import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Layers, Clock, ShieldCheck } from 'lucide-react'
import ApprovalBadge from '@/components/brand/ApprovalBadge'
import HologramCard from '@/components/brand/HologramCard'
import IndustriesBar from '@/components/brand/IndustriesBar'
import LaptopVisual from '@/components/brand/LaptopVisual'
import RegistrationStepper from '@/components/registration/RegistrationStepper'
import Step1Account from '@/components/registration/Step1Account'
import Step2Business from '@/components/registration/Step2Business'
import Step3Verification from '@/components/registration/Step3Verification'
import { useAuth } from '@/context/AuthContext'

export default function RegistrationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, merchant, addToast, refreshMerchant } = useAuth()

  // Detect dedicated sign in mode via route (/login or ?mode=signin)
  const isSignInRoute = location.pathname === '/login' || searchParams.get('mode') === 'signin'

  // Determine dynamic completion state of each step
  const isStep1Complete = Boolean(isAuthenticated && merchant && merchant.businessEmail)
  const isStep2Complete = Boolean(
    isStep1Complete && 
    merchant?.legalName && 
    merchant?.industry && 
    merchant?.monthlyVolume
  )
  const isStep3Complete = Boolean(isStep2Complete && merchant?.agreedToTerms)

  // Maximum step the user is allowed to access right now
  const maxAllowedStep = !isStep1Complete ? 1 : !isStep2Complete ? 2 : 3

  // Completed steps array for visual progress
  const completedSteps: number[] = []
  if (isStep1Complete) completedSteps.push(1)
  if (isStep2Complete) completedSteps.push(2)
  if (isStep3Complete) completedSteps.push(3)

  // Derive active step safely
  const stepParam = Number(searchParams.get('step')) || 1
  const step = Math.min(Math.max(stepParam, 1), 3)

  // If user tries to access a step they haven't unlocked yet, redirect them back to their max allowed step
  useEffect(() => {
    if (isSignInRoute) return
    if (step > maxAllowedStep) {
      setSearchParams({ step: String(maxAllowedStep) }, { replace: true })
      const requiredStep = !isStep1Complete ? 1 : 2
      addToast(
        `Step ${requiredStep} Required`,
        `Please complete Step ${requiredStep} (${requiredStep === 1 ? 'Account & Contact' : 'Business & Processing'}) to continue.`,
        'warning'
      )
    }
  }, [step, maxAllowedStep, isStep1Complete, setSearchParams, addToast, isSignInRoute])

  // If user is already authenticated and visits /login, redirect directly to dashboard
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || searchParams.get('mode') === 'signin')) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, location.pathname, searchParams, navigate])

  // If merchant has already fully submitted their application, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && merchant?.agreedToTerms && merchant?.applicationStatus && merchant.applicationStatus !== 'draft') {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, merchant, navigate])

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= maxAllowedStep) {
      setSearchParams({ step: String(targetStep) })
    } else {
      const requiredStep = !isStep1Complete ? 1 : 2
      addToast(
        `Step ${requiredStep} Required`,
        `Please complete Step ${requiredStep} before proceeding to Step ${targetStep}.`,
        'warning'
      )
    }
  }

  // Async-aware step advancement: refresh merchant profile first then navigate
  const handleNext = useCallback(async () => {
    const nextStep = step + 1
    if (nextStep <= 3) {
      // Refresh merchant data so step-completion guards see updated values
      await refreshMerchant()
      setSearchParams({ step: String(nextStep) })
    }
  }, [step, refreshMerchant, setSearchParams])

  const handleBack = () => {
    if (step > 1) {
      setSearchParams({ step: String(step - 1) })
    }
  }

  const handleSubmit = () => {
    // Transition to the merchant portal dashboard upon submission
    navigate('/dashboard?submitted=true')
  }

  return (
    <div className="w-full max-w-[1440px] min-w-0 min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-3.5 sm:p-6 lg:p-8 mx-auto relative overflow-x-hidden">
      
      {/* Background Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Main Grid: Left Column, Center Form Card, Right Column */}
      <div className="w-full max-w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start my-auto">
        
        {/* Left Column: Title, Benefits & 3D Laptop */}
        <div className="w-full max-w-full min-w-0 lg:col-span-3 flex flex-col justify-between space-y-4 sm:space-y-6 pt-2">
          {/* Main Title & Tagline */}
          <div>
            <div className="text-[11px] font-black tracking-[0.25em] text-cyan-400 uppercase">
              {isSignInRoute ? 'MERCHANT PORTAL' : 'MERCHANT'}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              {isSignInRoute ? 'SIGN IN' : 'REGISTRATION'}
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isSignInRoute
                ? 'Sign in to access your merchant portal, view underwriting status, and manage payment processing.'
                : 'Get a customized payment processing solution for your business with PGX Gateway.'}
            </p>
          </div>

          {/* Value Propositions (Compact 3-Pill Grid on Mobile, Stacked on Desktop) */}
          <div className="w-full min-w-0 grid grid-cols-3 lg:grid-cols-1 gap-1.5 xs:gap-2 sm:gap-3 lg:space-y-4 lg:gap-0">
            {/* Fast */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-1 sm:gap-2 lg:gap-3 p-2 sm:p-2.5 lg:p-0 rounded-2xl bg-[#081232]/60 lg:bg-transparent border border-purple-500/25 lg:border-none text-center lg:text-left min-w-0">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.55)] shrink-0">
                <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate">Fast</div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 leading-tight hidden xs:block truncate">Quick review</div>
              </div>
            </div>

            {/* Easy */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-1 sm:gap-2 lg:gap-3 p-2 sm:p-2.5 lg:p-0 rounded-2xl bg-[#081232]/60 lg:bg-transparent border border-purple-500/25 lg:border-none text-center lg:text-left min-w-0">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.55)] shrink-0">
                <Layers className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate">Easy</div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 leading-tight hidden xs:block truncate">3-step apply</div>
              </div>
            </div>

            {/* Secured */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-1 sm:gap-2 lg:gap-3 p-2 sm:p-2.5 lg:p-0 rounded-2xl bg-[#081232]/60 lg:bg-transparent border border-purple-500/25 lg:border-none text-center lg:text-left min-w-0">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.55)] shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate">Secured</div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 leading-tight hidden xs:block truncate">Bank-grade</div>
              </div>
            </div>
          </div>

          {/* 3D Laptop Visual */}
          <div className="pt-2 hidden lg:flex justify-start">
            <LaptopVisual />
          </div>
        </div>

        {/* Center Column: The Glowing Registration Form Card */}
        <div className="w-full max-w-full min-w-0 lg:col-span-6">
          <div className="w-full rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.35),inset_0_0_15px_rgba(0,240,255,0.1)] p-4 sm:p-7 backdrop-blur-xl">
            
            {/* Top Stepper (Hidden on dedicated Sign In route) */}
            {!isSignInRoute && (
              <RegistrationStepper 
                currentStep={step} 
                maxAllowedStep={maxAllowedStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick} 
              />
            )}

            {/* Step Contents */}
            <div className={!isSignInRoute ? "mt-4" : ""}>
              {step === 1 && (
                <Step1Account 
                  onNext={handleNext} 
                  onBack={() => navigate('/')} 
                />
              )}

              {step === 2 && (
                <Step2Business 
                  onNext={handleNext} 
                  onBack={handleBack} 
                />
              )}

              {step === 3 && (
                <Step3Verification 
                  onSubmit={handleSubmit} 
                  onBack={handleBack} 
                />
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Holographic Card & Approval Crest */}
        <div className="w-full max-w-full min-w-0 lg:col-span-3 flex flex-col justify-between space-y-4 sm:space-y-6 pt-2">
          {/* Top Approval Crest Badge */}
          <div className="flex justify-center">
            <ApprovalBadge />
          </div>

          {/* Tilted Hologram Card */}
          <div className="flex justify-center">
            <HologramCard />
          </div>
        </div>

      </div>

      {/* Bottom Ticker: Industries We Approve */}
      <div className="w-full max-w-full min-w-0 overflow-hidden mt-6 pt-4 border-t border-cyan-500/15">
        <IndustriesBar />
      </div>

    </div>
  )
}
