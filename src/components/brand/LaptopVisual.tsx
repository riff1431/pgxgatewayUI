import { Check } from 'lucide-react'

export default function LaptopVisual({ className = '' }: { className?: string }) {
  return (
    <div className={`relative select-none ${className}`}>
      {/* Ambient Floor Glow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-cyan-500/20 blur-xl rounded-full" />

      {/* 3D Tilted Laptop Container */}
      <div 
        className="relative transition-transform duration-300 hover:scale-105"
        style={{
          transform: 'perspective(900px) rotateY(18deg) rotateX(10deg) rotateZ(-3deg)',
        }}
      >
        {/* Laptop Display (Lid) */}
        <div className="w-48 sm:w-56 h-30 sm:h-34 rounded-t-xl bg-slate-950 border-2 border-slate-700/80 shadow-2xl p-2 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Bezel Camera */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-600 mb-auto" />

          {/* Screen Content */}
          <div className="w-full flex-1 rounded bg-gradient-to-br from-[#0c1333] via-[#080d24] to-[#040817] border border-cyan-500/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            {/* Screen Neon Glow */}
            <div className="absolute inset-0 bg-radial from-cyan-500/15 via-purple-500/10 to-transparent" />
            
            <div className="text-sm font-black italic tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] z-10">
              PGX
            </div>
            <div className="text-[7px] font-bold tracking-[0.25em] text-cyan-400 -mt-0.5 z-10">
              GATEWAY
            </div>
          </div>
        </div>

        {/* Laptop Base (Keyboard Deck) */}
        <div className="w-56 sm:w-66 -ml-4 sm:-ml-5 h-4 rounded-b-xl bg-gradient-to-b from-slate-700 to-slate-900 border-t border-slate-600 shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
          {/* Keyboard RGB Glow Line */}
          <div className="w-32 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-400 blur-[1px]" />
          
          {/* Trackpad indentation */}
          <div className="w-10 h-1.5 bg-slate-800 rounded-sm absolute bottom-1" />
        </div>
      </div>

      {/* Verified Purple Badge Overlap */}
      <div className="absolute -bottom-2 right-0 sm:right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 border-2 border-white/90 shadow-[0_0_15px_rgba(217,70,239,0.9)] flex items-center justify-center z-20">
        <Check className="h-5 w-5 text-white stroke-[3]" />
      </div>
    </div>
  )
}
