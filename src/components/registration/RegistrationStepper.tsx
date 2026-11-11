import { Check, Lock } from 'lucide-react'

interface RegistrationStepperProps {
  currentStep: number
  maxAllowedStep?: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
}

const steps = [
  { step: 1, label: 'Account & Contact', shortLabel: 'Account' },
  { step: 2, label: 'Business & Processing', shortLabel: 'Business' },
  { step: 3, label: 'Verification & Documents', shortLabel: 'Verify' },
]

export default function RegistrationStepper({ 
  currentStep, 
  maxAllowedStep = 1,
  onStepClick,
  completedSteps = []
}: RegistrationStepperProps) {
  // Determine connector line width
  const getProgressWidth = () => {
    if (completedSteps.includes(2) || currentStep === 3) return '100%'
    if (completedSteps.includes(1) || currentStep === 2) return '50%'
    return '15%'
  }

  return (
    <div className="w-full max-w-lg mx-auto py-3 select-none">
      <div className="relative flex items-center justify-between">
        
        {/* Connector Line Background */}
        <div className="absolute top-4 left-8 right-8 h-[2px] bg-slate-800 -z-0">
          {/* Active Connector Progress */}
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            style={{ width: getProgressWidth() }}
          />
        </div>

        {/* Steps */}
        {steps.map((s) => {
          const isCompleted = completedSteps.includes(s.step) || (currentStep > s.step && s.step <= maxAllowedStep)
          const isActive = currentStep === s.step
          const isLocked = s.step > maxAllowedStep

          return (
            <div 
              key={s.step} 
              className={`flex flex-col items-center relative z-10 transition-all ${
                isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer group'
              }`}
              onClick={() => onStepClick?.(s.step)}
              title={
                isLocked 
                  ? `Please complete Step ${s.step - 1} first` 
                  : isCompleted 
                  ? `Step ${s.step}: ${s.label} (Completed)` 
                  : `Step ${s.step}: ${s.label}`
              }
            >
              {/* Circle Indicator */}
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative ${
                  isCompleted
                    ? 'bg-cyan-500 text-slate-950 border-2 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.85)] group-hover:scale-105'
                    : isActive
                    ? 'bg-purple-600 text-white border-2 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.95)] scale-110'
                    : isLocked
                    ? 'bg-[#060b1e] text-slate-500 border border-slate-800'
                    : 'bg-[#08102a] text-slate-400 border border-slate-700 group-hover:border-slate-500 group-hover:scale-105'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : isLocked ? (
                  <div className="flex items-center justify-center">
                    <span className="text-xs">{s.step}</span>
                    <Lock className="w-2.5 h-2.5 text-slate-500 absolute -bottom-0.5 -right-0.5 bg-[#05091a] rounded-full p-0.5" />
                  </div>
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              {/* Step Label */}
              <span 
                className={`text-[10px] sm:text-[11px] font-semibold tracking-tight transition-colors text-center mt-2 px-1 ${
                  isActive 
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                    : isCompleted
                    ? 'text-cyan-300 group-hover:text-cyan-200'
                    : isLocked
                    ? 'text-slate-600'
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
                <span className="inline sm:hidden whitespace-nowrap">{s.shortLabel}</span>
              </span>
            </div>
          )
        })}

      </div>
    </div>
  )
}
