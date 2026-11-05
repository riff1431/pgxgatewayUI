import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Bell, 
  ChevronDown, 
  User, 
  Menu, 
  X, 
  Rocket, 
  Home as HomeIcon, 
  Zap, 
  Building2, 
  Cpu, 
  Headphones,
  type LucideIcon
} from 'lucide-react'
import Logo from '@/components/brand/Logo'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  isDashboard?: boolean
}

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', icon: HomeIcon },
  { label: 'Solutions', path: '/solutions', icon: Zap },
  { label: 'Industries', path: '/industries', icon: Building2 },
  { label: 'How It Works', path: '/how-it-works', icon: Cpu },
  { label: 'Support', path: '/support', icon: Headphones },
]

export default function Navbar({ isDashboard = false }: NavbarProps) {
  const location = useLocation()
  const { merchant, unreadCount, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const merchantName = merchant?.fullName ? merchant.fullName.split(' ')[0] : 'Merchant'

  return (
    <header className="sticky top-0 z-50 w-full bg-[#05091a]/90 border-b border-cyan-500/20 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Slanted Separator Slash */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Logo size="md" />
          <span className="hidden md:inline-block text-xl font-light text-slate-500 italic rotate-12 select-none">
            /
          </span>
        </div>

        {/* Center Desktop Navigation Links with Icons */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all relative py-1 group ${
                  isActive && isDashboard
                    ? 'px-3 py-1 rounded-md border border-white/80 text-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                    : isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive 
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' 
                      : 'text-slate-400 group-hover:text-cyan-300'
                  }`} 
                />
                <span>{item.label}</span>
                {isActive && !isDashboard && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isDashboard || isAuthenticated ? (
            <>
              {/* Notification Bell with Badge */}
              <Link 
                to="/dashboard?tab=messages"
                aria-label="Notifications"
                className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {Boolean(unreadCount && unreadCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.9)]">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Merchant Profile Pill */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/60 bg-[#09112a] shadow-[0_0_12px_rgba(0,240,255,0.3)] text-white text-xs font-semibold cursor-pointer hover:border-cyan-300 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span>{merchantName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sign In Button Pill */}
              <Link
                to="/register?step=1"
                className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-cyan-400/80 bg-[#08102a]/80 text-white text-xs font-semibold shadow-[0_0_14px_rgba(0,240,255,0.35)] hover:bg-cyan-500/10 hover:border-cyan-300 transition-all"
              >
                <User className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>

              {/* Quick Apply Button on tablet/desktop */}
              <Link
                to="/register"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:to-purple-600 text-white text-xs font-bold shadow-[0_0_14px_rgba(217,70,239,0.4)] transition-all"
              >
                <Rocket className="h-3 w-3" />
                <span>Apply</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-cyan-400" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05091a]/98 border-b border-cyan-500/30 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/60 to-purple-950/60 text-white border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.9)]" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
            >
              <Rocket className="h-4 w-4" />
              <span>Start Merchant Application</span>
            </Link>
            <Link
              to="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#09112a] text-cyan-300 text-xs font-bold border border-cyan-500/40"
            >
              <span>Explore Checkout Demo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
