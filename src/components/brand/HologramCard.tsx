export default function HologramCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Holographic Cosmic Glow */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-600/30 to-fuchsia-600/35 blur-3xl -z-10 pointer-events-none" />

      {/* Hologram Planetary Orb */}
      <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-cyan-400/50 bg-radial from-cyan-950/50 via-[#071330] to-transparent shadow-[0_0_60px_rgba(0,240,255,0.45)] flex items-center justify-center overflow-hidden">
        {/* Wireframe latitude/longitude rings */}
        <div className="absolute inset-1 rounded-full border border-cyan-400/30 border-dashed animate-[spin_50s_linear_infinite]" />
        <div className="absolute w-full h-[65%] border-y-2 border-cyan-300/35 rounded-[100%] rotate-12" />
        <div className="absolute h-full w-[65%] border-x-2 border-cyan-300/35 rounded-[100%] -rotate-12" />
        <div className="absolute w-[80%] h-[35%] border-y border-cyan-200/25 rounded-[100%] rotate-45" />

        {/* Planet Surface Radiant Glow Flare */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-cyan-300/40 rounded-full blur-2xl" />
        <div className="absolute bottom-2 left-4 w-20 h-20 bg-fuchsia-500/30 rounded-full blur-xl" />
      </div>

      {/* Tilted Holographic PGX Gateway Card */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-[42%] -translate-y-[45%] w-60 sm:w-72 h-36 sm:h-42 rounded-2xl p-4 sm:p-5 text-white shadow-2xl transition-transform duration-500 hover:rotate-[-8deg] hover:scale-105"
        style={{
          transform: 'perspective(1200px) rotateX(18deg) rotateY(-20deg) rotateZ(-12deg)',
          background: 'linear-gradient(135deg, #0d1a45 0%, #15113d 50%, #200d3d 100%)',
          border: '2px solid rgba(217, 70, 239, 0.9)',
          boxShadow: '0 0 30px rgba(217, 70, 239, 0.55), 0 25px 50px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(0, 240, 255, 0.3)'
        }}
      >
        {/* Top: EMV Chip & Brand Logo */}
        <div className="flex items-start justify-between">
          {/* Gold EMV Chip */}
          <div className="w-9 h-7 sm:w-10 sm:h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-200/90 shadow-md relative overflow-hidden flex items-center justify-center">
            <div className="w-full h-[1px] bg-amber-800/70 absolute" />
            <div className="h-full w-[1px] bg-amber-800/70 absolute" />
            <div className="w-5 h-4 rounded-xs border border-amber-900/60" />
          </div>

          {/* Logo on Card */}
          <div className="text-right">
            <div className="text-base sm:text-lg font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              PGX
            </div>
            <div className="text-[9px] font-bold tracking-[0.22em] text-cyan-300 -mt-1 drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]">
              GATEWAY
            </div>
          </div>
        </div>

        {/* Bottom Elements: Decorative Stripes & Contactless Waves */}
        <div className="mt-8 sm:mt-11 flex items-end justify-between">
          {/* Decorative neon bars */}
          <div className="space-y-1.5">
            <div className="w-16 sm:w-20 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.9)]" />
            <div className="w-10 sm:w-14 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.9)]" />
          </div>

          {/* Contactless waves ))) */}
          <div className="flex items-center space-x-1 text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.95)]">
            <span className="text-base font-black opacity-75">)</span>
            <span className="text-lg font-black opacity-90">)</span>
            <span className="text-xl font-black">)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
