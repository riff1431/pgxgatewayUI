import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Folder, 
  Home, 
  LogOut, 
  MessageSquare, 
  Settings, 
  Tag,
  User,
  Code2,
  Receipt,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps {
  className?: string
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

export default function Sidebar({ className = '', activeTab: controlledTab, onTabChange }: SidebarProps) {
  const [internalTab, setInternalTab] = useState('dashboard')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { merchant, unreadCount, logout, offer } = useAuth()
  const hasNewOffer = Boolean(offer?.isAvailable && !offer?.accepted)

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'integration', label: 'API & Integration', icon: Code2 },
    { id: 'invoices', label: 'Weekly Invoices', icon: Receipt },
    { id: 'application', label: 'My Application', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'offer', label: 'Offer', icon: Tag, isOfferNew: hasNewOffer },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ]

  const activeItem = navItems.find((i) => i.id === currentTab) || navItems[0]
  const ActiveIcon = activeItem.icon

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalTab(tabId)
    }
    setIsMobileOpen(false)
  }

  const handleSignOut = () => {
    logout()
    navigate('/register?step=1')
  }

  return (
    <aside className={`w-full max-w-full min-w-0 lg:w-64 select-none ${className}`}>
      
      {/* MOBILE (< lg): Compact Nav Trigger Bar with Hamburger Menu Button */}
      <div className="block lg:hidden w-full max-w-full min-w-0 mb-3">
        <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#040819] flex items-center justify-center">
                {merchant?.avatarUrl ? (
                  <img
                    src={merchant.avatarUrl}
                    alt={merchant.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ActiveIcon className="h-3.5 w-3.5 text-cyan-300" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{activeItem.label}</span>
                {Boolean(activeItem.badge && activeItem.badge > 0) && (
                  <span className="w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_6px_rgba(217,70,239,0.9)]">
                    {activeItem.badge}
                  </span>
                )}
                {activeItem.isOfferNew && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-bold">
                    Ready
                  </span>
                )}
              </div>
              <div className="text-[10px] text-cyan-300 truncate">
                {merchant?.fullName || 'Merchant Account'} • Tap for menu
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-800"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[11px] hidden xs:inline">Sign Out</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:to-fuchsia-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-fuchsia-400 cursor-pointer shrink-0 transition-transform active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE (< lg): Slide-over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Slide-out Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-[88vw] max-w-xs sm:max-w-sm bg-[#060b20] border-r-[1.5px] border-cyan-400/90 shadow-[0_0_50px_rgba(0,240,255,0.45)] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto z-50">
            <div className="space-y-4">
              {/* Drawer Top Row: Identity + Close X */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#040819] flex items-center justify-center">
                      {merchant?.avatarUrl ? (
                        <img
                          src={merchant.avatarUrl}
                          alt={merchant.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-cyan-300" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {merchant?.fullName || 'Merchant Account'}
                    </div>
                    <div className="text-[10px] text-cyan-300 truncate">
                      {merchant?.legalName || 'PGX Direct Gateway'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Items in Drawer */}
              <div className="space-y-1.5 pt-1">
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Merchant Portal Navigation
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentTab === item.id

                  return (
                    <button
                      key={`drawer-${item.id}`}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_20px_rgba(217,70,239,0.85)] border-2 border-fuchsia-400 scale-[1.01] font-black'
                          : 'text-slate-300 hover:text-white bg-[#091332]/80 hover:bg-[#0e1c4a] border border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-black/20 text-white'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <span className="whitespace-nowrap text-left">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {Boolean(item.badge && item.badge > 0) && (
                          <span className="w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_6px_rgba(217,70,239,0.9)]">
                            {item.badge}
                          </span>
                        )}

                        {item.isOfferNew && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-bold">
                            Ready
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom Sign Out inside Drawer */}
            <div className="pt-4 border-t border-cyan-500/20 mt-6">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP (>= lg): Original Cyberpunk Full Vertical Sidebar */}
      <div className="hidden lg:flex rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.12)] p-4 sm:p-5 flex-col justify-between h-full backdrop-blur-xl space-y-4">
        
        {/* Merchant Identity Pill */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#091332] border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#040819] flex items-center justify-center">
              {merchant?.avatarUrl ? (
                <img
                  src={merchant.avatarUrl}
                  alt={merchant.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-cyan-300" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {merchant?.fullName || 'Merchant Account'}
            </div>
            <div className="text-[10px] text-cyan-300 truncate">
              {merchant?.legalName || 'PGX Direct Gateway'}
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white border-2 border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.85)] scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {Boolean(item.badge && item.badge > 0) && (
                  <span className="w-5 h-5 rounded-full bg-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.9)]">
                    {item.badge}
                  </span>
                )}

                {item.isOfferNew && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    Ready
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sign Out at the Bottom */}
        <div className="pt-4 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-semibold text-xs sm:text-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </aside>
  )
}
