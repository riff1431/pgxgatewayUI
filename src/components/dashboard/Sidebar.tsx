import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Folder, 
  Home, 
  LogOut, 
  MessageSquare, 
  Settings, 
  Tag 
} from 'lucide-react'

export default function Sidebar({ className = '' }: { className?: string }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'application', label: 'My Application', icon: FileText, path: '/register?step=3' },
    { id: 'documents', label: 'Documents', icon: Folder, path: '/register?step=3' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2, path: '#messages' },
    { id: 'offer', label: 'Offer', icon: Tag, path: '#offer' },
    { id: 'settings', label: 'Account Settings', icon: Settings, path: '#settings' },
  ]

  const handleSignOut = () => {
    navigate('/register?step=1')
  }

  return (
    <aside className={`w-full lg:w-64 select-none ${className}`}>
      {/* Outer Glowing Neon Container */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.12)] p-4 sm:p-5 flex flex-col justify-between h-full backdrop-blur-xl space-y-4">
        
        {/* Navigation Items List */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id)
                  if (item.path.startsWith('/')) {
                    navigate(item.path)
                  }
                }}
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

                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.9)]">
                    {item.badge}
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
