import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layers, Rocket, ShieldCheck } from 'lucide-react'
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
  const navigate = useNavigate()
  const { isAuthenticated, merchant } = useAuth()

  // If merchant is already authenticated and has submitted application or approved, redirect directly to dashboard
  useEffect(() => {
    if (
      isAuthenticated &&
      (merchant?.applicationStatus === 'approved' ||
        merchant?.applicationStatus === 'under_review' ||
        merchant?.currentStep === 3)
    ) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, merchant?.applicationStatus, merchant?.currentStep, navigate])

  // Derive step directly from searchParams (single source of truth)
  const stepParam = Number(searchParams.get('step'))
  const step = stepParam >= 1 && stepParam <= 3 ? stepParam : 1

  const handleStepChange = (newStep: number) => {
    setSearchParams({ step: String(newStep) })
  }

  const handleNext = () => {
    if (step < 3) {
      handleStepChange(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      handleStepChange(step - 1)
    }
  }

  const handleSubmit = () => {
    // Transition to the merchant portal dashboard upon submission
    navigate('/dashboard?submitted=true')
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto relative">
      
      {/* Background Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Main Grid: Left Column, Center Form Card, Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start my-auto">
        
        {/* Left Column: Title, Benefits & 3D Laptop */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-6 pt-2">
          {/* Main Title & Tagline */}
          <div>
            <div className="text-[11px] font-black tracking-[0.25em] text-cyan-400 uppercase">
              MERCHANT
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              REGISTRATION
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Get a customized payment processing solution for your business with PGX Gateway.
            </p>
          </div>

          {/* Value Propositions (Unified Glowing Purple Badges as in Reference) */}
          <div className="space-y-4">
            {/* Fast */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.55)] shrink-0">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">Fast</div>
                <div className="text-[11px] text-slate-400 leading-tight">Quick application & review</div>
              </div>
            </div>

            {/* Easy */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.55)] shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">Easy</div>
                <div className="text-[11px] text-slate-400 leading-tight">Simple 3-step registration</div>
              </div>
            </div>

            {/* Secured */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.55)] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">Secured</div>
                <div className="text-[11px] text-slate-400 leading-tight">Bank-grade data protection & compliance</div>
              </div>
            </div>
          </div>

          {/* 3D Laptop Visual */}
          <div className="pt-2 hidden lg:flex justify-start">
            <LaptopVisual />
          </div>
        </div>

        {/* Center Column: The Glowing Registration Form Card */}
        <div className="lg:col-span-6 w-full">
          <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.35),inset_0_0_15px_rgba(0,240,255,0.1)] p-5 sm:p-7 backdrop-blur-xl">
            
            {/* Top Stepper */}
            <RegistrationStepper 
              currentStep={step} 
              onStepClick={handleStepChange} 
            />

            {/* Step Contents */}
            <div className="mt-4">
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

        {/* Right Column: 99% Approval Badge & Holographic 3D Card */}
        <div className="lg:col-span-3 flex flex-col items-center justify-between space-y-6 pt-2">
          {/* Approval Crest */}
          <ApprovalBadge />

          {/* Hologram Card with Globe */}
          <div className="my-auto py-4">
            <HologramCard />
          </div>
        </div>

      </div>

      {/* Bottom Full-Width Approved Industries Bar */}
      <div className="mt-8 pt-4">
        <IndustriesBar />
      </div>

    </div>
  )
}
