interface HologramCardProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function HologramCard({ className = '', size = 'md' }: HologramCardProps) {
  const sizeClasses = {
    sm: 'max-w-[260px] sm:max-w-[300px]',
    md: 'max-w-[340px] sm:max-w-[390px] lg:max-w-[430px]',
    lg: 'max-w-[460px] sm:max-w-[540px] lg:max-w-[620px]',
  }

  return (
    <div className={`relative flex items-center justify-center select-none group ${className}`}>
      {/* Background Cosmic Deep Neon Glows */}
      <div className="absolute w-[90%] h-[90%] rounded-full bg-cyan-500/25 blur-3xl -z-10 group-hover:bg-cyan-500/35 transition-all duration-700 pointer-events-none" />
      <div className="absolute w-[80%] h-[80%] rounded-full bg-fuchsia-600/25 blur-3xl -z-10 group-hover:bg-fuchsia-600/40 transition-all duration-700 pointer-events-none" />
      <div className="absolute -bottom-6 w-3/4 h-12 bg-cyan-400/30 blur-2xl rounded-full pointer-events-none" />

      {/* Cyberpunk Hologram Frame with Perspective Tilt */}
      <div 
        className={`relative w-full ${sizeClasses[size]} rounded-3xl p-1 bg-gradient-to-br from-cyan-400/60 via-purple-500/40 to-fuchsia-500/60 shadow-[0_0_35px_rgba(0,240,255,0.35),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 group-hover:shadow-[0_0_55px_rgba(217,70,239,0.55),0_30px_70px_rgba(0,0,0,0.9)] group-hover:scale-[1.02]`}
      >
        <div className="relative rounded-[1.35rem] overflow-hidden bg-[#03081b]">
          {/* Authentic 3D Holographic Card + Earth Globe Illustration */}
          <img
            src="/hologram-card-3d.png"
            alt="PGX Gateway 3D Holographic Card & Global Earth Network"
            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Subtle Ambient Vignette & Glare Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#03081b]/75 via-transparent to-cyan-500/10 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-fuchsia-500/20 rounded-full blur-xl pointer-events-none" />

          {/* Interactive Live Processing Status Indicator Pill */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-1.5 rounded-full bg-[#050b22]/90 border border-cyan-400/70 backdrop-blur-md flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-200 tracking-wide">
              Global Processing Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
