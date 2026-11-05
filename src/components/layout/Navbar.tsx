import { Link, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, User } from 'lucide-react'
import Logo from '@/components/brand/Logo'

interface NavbarProps {
  isDashboard?: boolean
}

export default function Navbar({ isDashboard = false }: NavbarProps) {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full bg-[#05091a]/85 border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Slanted Separator Slash */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Logo size="md" />
          <span className="hidden md:inline-block text-xl font-light text-slate-500 italic rotate-12 select-none">
            /
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {[
            { label: 'Home', path: '/' },
            { label: 'Solutions', path: '/solutions' },
            { label: 'Industries', path: '/industries' },
            { label: 'How It Works', path: '/how-it-works' },
            { label: 'Support', path: '/support' },
          ].map((item) => {
            const isActive = location.pathname === item.path || (item.label === 'Home' && location.pathname === '/')
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`text-xs sm:text-sm font-semibold transition-all relative ${
                  isActive && isDashboard
                    ? 'px-3 py-1 rounded-md border border-white/80 text-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                    : isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                {item.label}
                {isActive && !isDashboard && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-4">
          {isDashboard ? (
            <>
              {/* Notification Bell with Badge */}
              <button 
                type="button" 
                aria-label="Notifications"
                className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.9)]">
                  2
                </span>
              </button>

              {/* Merchant Profile Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/60 bg-[#09112a] shadow-[0_0_12px_rgba(0,240,255,0.3)] text-white text-xs font-semibold cursor-pointer hover:border-cyan-300 transition-colors">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span>Merchant</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </>
          ) : (
            /* Sign In Button Pill */
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/80 bg-[#08102a]/80 text-white text-xs font-semibold shadow-[0_0_14px_rgba(0,240,255,0.35)] hover:bg-cyan-500/10 hover:border-cyan-300 transition-all"
            >
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
