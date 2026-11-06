import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Bell, 
  ChevronDown, 
  User, 
  Menu, 
  X, 
  ArrowRight, 
  Home as HomeIcon, 
  Zap, 
  Building2, 
  Workflow, 
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
  { label: 'How It Works', path: '/how-it-works', icon: Workflow },
  { label: 'Support', path: '/support', icon: Headphones },
]

export default function Navbar({ isDashboard = false }: NavbarProps) {
  const location = useLocation()
  const { merchant, unreadCount, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const merchantName = merchant?.fullName ? merchant.fullName.split(' ')[0] : 'Merchant'

  return (
    <header className="sticky top-0 z-50 w-full bg-[#05091a]/90 border-b border-cyan-500/20 backdrop-blur-xl transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-xs lg:text-sm font-semibold transition-all flex items-center gap-2 group ${
                  isActive
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                <span>{item.label}</span>
                {isActive && !isDashboard && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA / Auth Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            /* User Authenticated Dropdown / Profile Pill */
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard?tab=messages"
                className="relative p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-[#070e28] border border-cyan-500/30 hover:border-cyan-400 transition-all"
                title="Notifications & Messages"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-500 text-[10px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.9)] animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081335] border border-cyan-400/60 text-xs font-bold text-white shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:border-cyan-300 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span>{merchantName}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </Link>
            </div>
          ) : (
            /* Guest Actions */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-[#070e28] border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>

              {/* Quick Apply Button on tablet/desktop */}
              <Link
                to="/register"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:to-purple-600 text-white text-xs font-bold shadow-[0_0_14px_rgba(217,70,239,0.4)] transition-all"
              >
                <ArrowRight className="h-3 w-3" />
                <span>Apply</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/60 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#040819]/95 border-b border-cyan-500/30 px-4 py-4 space-y-3 backdrop-blur-2xl">
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-semibold flex items-center gap-2.5 transition-all ${
                    isActive
                      ? 'text-cyan-300 font-bold bg-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#070e28] border border-cyan-500/30 text-white text-xs font-semibold hover:border-cyan-400 transition-all"
                >
                  <User className="h-4 w-4 text-cyan-400" />
                  <span>Sign In to Merchant Portal</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Start Merchant Application</span>
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#081335] border border-cyan-400/60 text-white text-xs font-bold"
              >
                <User className="h-4 w-4 text-cyan-400" />
                <span>Go to Dashboard ({merchantName})</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
