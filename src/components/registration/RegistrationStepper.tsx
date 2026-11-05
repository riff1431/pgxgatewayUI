import { Check } from 'lucide-react'

interface RegistrationStepperProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

const steps = [
  { step: 1, label: 'Account & Contact' },
  { step: 2, label: 'Business & Processing' },
  { step: 3, label: 'Verification & Documents' },
]

export default function RegistrationStepper({ currentStep, onStepClick }: RegistrationStepperProps) {
  return (
    <div className="w-full max-w-lg mx-auto py-3 select-none">
      <div className="relative flex items-center justify-between">
        
        {/* Connector Lines */}
        <div className="absolute top-4 left-8 right-8 h-[2px] bg-slate-800 -z-0">
          {/* Active Connector Progress */}
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.7)]"
            style={{
              width: currentStep === 1 ? '15%' : currentStep === 2 ? '50%' : '100%'
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((s) => {
          const isCompleted = currentStep > s.step
          const isActive = currentStep === s.step

          return (
            <div 
              key={s.step} 
              className="flex flex-col items-center relative z-10 cursor-pointer group"
              onClick={() => onStepClick?.(s.step)}
            >
              {/* Circle Indicator */}
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-cyan-500 text-slate-950 border-2 border-cyan-300 shadow-[0_0_14px_rgba(0,240,255,0.8)]'
                    : isActive
                    ? 'bg-purple-600 text-white border-2 border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.9)] scale-110'
                    : 'bg-[#08102a] text-slate-400 border border-slate-700 group-hover:border-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              {/* Step Number & Label */}
              <span className="text-[10px] font-bold text-slate-400 mt-1">
                {s.step}
              </span>
              <span 
                className={`text-[11px] font-semibold tracking-tight transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' 
                    : isCompleted
                    ? 'text-cyan-300'
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {s.label}
              </span>
            </div>
          )
        })}

      </div>
    </div>
  )
}
