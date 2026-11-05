import { Check, FileText } from 'lucide-react'

export default function ApplicationStatusCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.1)] p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between ${className}`}>
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Application Status
          </h3>
        </div>

        {/* Yellow Pill: Under Review */}
        <span className="px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.4)]">
          Under Review
        </span>
      </div>

      {/* Progress Stepper Display */}
      <div className="py-6 sm:py-8 relative">
        {/* Connector Line */}
        <div className="absolute top-10 sm:top-12 left-10 right-10 h-[2.5px] bg-slate-800 -z-0">
          <div className="w-1/2 h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500 to-purple-500 ml-auto -mt-[2.5px]" />
        </div>

        {/* Step Nodes */}
        <div className="flex items-start justify-between relative z-10">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center max-w-[100px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 border-2 border-emerald-300 text-slate-950 flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.8)]">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white mt-2">1</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 leading-tight">
              Account & Contact
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center max-w-[100px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 border-2 border-emerald-300 text-slate-950 flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.8)]">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white mt-2">2</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 leading-tight">
              Business & Processing
            </span>
          </div>

          {/* Step 3 (Active) */}
          <div className="flex flex-col items-center text-center max-w-[100px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-600 border-2 border-fuchsia-400 text-white font-bold text-sm flex items-center justify-center shadow-[0_0_18px_rgba(217,70,239,0.9)] scale-110">
              3
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white mt-2">3</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-fuchsia-300 leading-tight">
              Verification & Documents
            </span>
          </div>

        </div>
      </div>

    </div>
  )
}
