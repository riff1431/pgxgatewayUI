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
  Code2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps {
  className?: string
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

export default function Sidebar({ className = '', activeTab: controlledTab, onTabChange }: SidebarProps) {
  const [internalTab, setInternalTab] = useState('dashboard')
  const navigate = useNavigate()
  const { merchant, unreadCount, logout, offer } = useAuth()
  const hasNewOffer = Boolean(offer?.isAvailable && !offer?.accepted)

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'integration', label: 'Integration & Collab', icon: Code2 },
    { id: 'application', label: 'My Application', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'offer', label: 'Offer', icon: Tag, isOfferNew: hasNewOffer },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ]

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalTab(tabId)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/register?step=1')
  }

  return (
    <aside className={`w-full lg:w-64 select-none ${className}`}>
      {/* Outer Glowing Neon Container */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.12)] p-4 sm:p-5 flex flex-col justify-between h-full backdrop-blur-xl space-y-4">
        
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
