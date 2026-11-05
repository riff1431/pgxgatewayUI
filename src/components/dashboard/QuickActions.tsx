import { Clock, Headphones, Mail, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function QuickActions({ className = '' }: { className?: string }) {
  const navigate = useNavigate()

  const actions = [
    {
      id: 'upload',
      title: 'Upload Documents',
      icon: UploadCloud,
      borderType: 'cyan',
      onClick: () => navigate('/register?step=3'),
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: Mail,
      badge: 2,
      borderType: 'purple',
      onClick: () => alert('Messages inbox view'),
    },
    {
      id: 'activity',
      title: 'Recent Activity',
      icon: Clock,
      borderType: 'cyan',
      onClick: () => alert('Recent transaction & audit activity log'),
    },
    {
      id: 'support',
      title: 'Request Support',
      icon: Headphones,
      borderType: 'purple',
      onClick: () => alert('24/7 Priority Merchant Support Ticket Opened'),
    },
  ]

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {actions.map((act) => {
        const Icon = act.icon
        const isCyan = act.borderType === 'cyan'

        return (
          <button
            key={act.id}
            type="button"
            onClick={act.onClick}
            className={`p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer text-left backdrop-blur-xl ${
              isCyan
                ? 'border-[1.5px] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_22px_rgba(0,240,255,0.5)]'
                : 'border-[1.5px] border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:shadow-[0_0_22px_rgba(217,70,239,0.6)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Circular Icon Container */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                  isCyan
                    ? 'bg-cyan-500/10 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                    : 'bg-purple-600/20 border border-fuchsia-400 text-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.6)]'
                }`}
              >
                <Icon className="h-5 w-5" />

                {act.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_6px_rgba(217,70,239,0.9)]">
                    {act.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {act.title}
              </span>
            </div>

            {/* Chevron Right */}
            <span className="text-slate-400 text-sm font-bold ml-2">
              &gt;
            </span>
          </button>
        )
      })}
    </div>
  )
}
