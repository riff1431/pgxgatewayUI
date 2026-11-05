import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  return (
    <Link 
      to="/" 
      className={`inline-flex flex-col items-start select-none group transition-transform hover:scale-[1.02] ${className}`}
    >
      <div className="flex items-center tracking-tighter">
        <span 
          className={`font-black italic uppercase tracking-wider bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] ${
            isSm ? 'text-xl' : isLg ? 'text-4xl' : 'text-2xl sm:text-3xl'
          }`}
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          PGX
        </span>
        <span 
          className={`font-black italic bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent ml-0.5 drop-shadow-[0_0_12px_rgba(217,70,239,0.8)] ${
            isSm ? 'text-xl' : isLg ? 'text-4xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          /
        </span>
      </div>
      <span 
        className={`font-black tracking-[0.28em] uppercase text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] -mt-1 ${
          isSm ? 'text-[8px]' : isLg ? 'text-[12px]' : 'text-[9px] sm:text-[10px]'
        }`}
      >
        GATEWAY
      </span>
    </Link>
  )
}
