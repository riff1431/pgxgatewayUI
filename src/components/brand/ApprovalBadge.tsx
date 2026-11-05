import { Star } from 'lucide-react'

export default function ApprovalBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer Radiant Glow */}
      <div className="absolute inset-0 bg-purple-600/35 blur-2xl -z-10 rounded-full" />
      <div className="absolute inset-0 bg-cyan-500/20 blur-xl -z-10 rounded-full" />

      {/* Laurel Wreath Left (SVG) */}
      <svg 
        className="w-8 h-28 sm:w-10 sm:h-32 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] -mr-3 z-10" 
        viewBox="0 0 40 120" 
        fill="currentColor"
      >
        <path d="M30 10 C20 20, 15 35, 18 50 C12 40, 8 25, 20 15 Z" />
        <path d="M28 35 C16 45, 10 60, 15 75 C8 65, 5 50, 18 40 Z" />
        <path d="M25 65 C14 75, 10 90, 18 105 C10 95, 8 80, 18 70 Z" />
        <path d="M22 90 C15 100, 18 112, 28 118 C20 114, 15 105, 18 95 Z" />
      </svg>

      {/* Main Shield / Crest Container */}
      <div className="relative w-36 sm:w-44 p-3 rounded-2xl bg-gradient-to-b from-[#161245] via-[#100c35] to-[#080620] border-2 border-purple-500/90 shadow-[0_0_30px_rgba(168,85,247,0.6),inset_0_0_20px_rgba(168,85,247,0.35)] flex flex-col items-center text-center z-0">
        
        {/* 3 Gold Stars */}
        <div className="flex items-center gap-1.5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] mb-1">
          <Star className="h-3.5 w-3.5 fill-amber-300 stroke-amber-400" />
          <Star className="h-4.5 w-4.5 fill-amber-300 stroke-amber-400 -mt-0.5" />
          <Star className="h-3.5 w-3.5 fill-amber-300 stroke-amber-400" />
        </div>

        {/* 99% Stat */}
        <div className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none my-0.5">
          99%
        </div>

        {/* Gold Ribbon Banner */}
        <div className="w-[114%] -mx-3 mt-1.5 py-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center border-y border-amber-200/60">
          <span className="text-[10px] sm:text-xs font-black tracking-wider text-slate-950 uppercase drop-shadow-xs">
            Approval Rate
          </span>
        </div>

        {/* Subtitle */}
        <div className="mt-2 text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-cyan-300 uppercase">
          For Our Gateway
        </div>

        {/* Bottom Chevron Accent */}
        <div className="w-2.5 h-2.5 rotate-45 border-b-2 border-r-2 border-cyan-400 mt-1 opacity-90 shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
      </div>

      {/* Laurel Wreath Right (SVG) */}
      <svg 
        className="w-8 h-28 sm:w-10 sm:h-32 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] -ml-3 z-10 -scale-x-100" 
        viewBox="0 0 40 120" 
        fill="currentColor"
      >
        <path d="M30 10 C20 20, 15 35, 18 50 C12 40, 8 25, 20 15 Z" />
        <path d="M28 35 C16 45, 10 60, 15 75 C8 65, 5 50, 18 40 Z" />
        <path d="M25 65 C14 75, 10 90, 18 105 C10 95, 8 80, 18 70 Z" />
        <path d="M22 90 C15 100, 18 112, 28 118 C20 114, 15 105, 18 95 Z" />
      </svg>
    </div>
  )
}
