import {
  DollarSign,
  Building2,
  Users,
  Code2,
  Sliders,
  Palette,
  Receipt,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export type SuperAdminTabId =
  | 'overview'
  | 'integrations'
  | 'settings'
  | 'resellers'
  | 'merchants'
  | 'transactions'
  | 'branding'

interface SuperAdminSidebarProps {
  activeTab: SuperAdminTabId
  onTabChange: (tab: SuperAdminTabId) => void
  resellerCount?: number
  merchantCount?: number
  onRefresh?: () => void
  onLogout?: () => void
  isRefreshing?: boolean
  className?: string
}

export default function SuperAdminSidebar({
  activeTab,
  onTabChange,
  resellerCount = 0,
  merchantCount = 0,
  onRefresh,
  onLogout,
  isRefreshing = false,
  className = '',
}: SuperAdminSidebarProps) {
  const navItems: Array<{
    id: SuperAdminTabId
    label: string
    shortLabel: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number | string
    highlight?: boolean
  }> = [
    {
      id: 'overview',
      label: '9% Revenue Audit',
      shortLabel: 'Revenue Audit',
      icon: DollarSign,
    },
    {
      id: 'integrations',
      label: 'Integration Desk & Collab',
      shortLabel: 'Integration Desk',
      icon: Code2,
      highlight: true,
    },
    {
      id: 'settings',
      label: 'Platform & Stripe Settings',
      shortLabel: 'Platform Settings',
      icon: Sliders,
    },
    {
      id: 'resellers',
      label: 'Connected Resellers',
      shortLabel: 'Resellers',
      icon: Building2,
      badge: resellerCount,
    },
    {
      id: 'merchants',
      label: 'Merchant Routing',
      shortLabel: 'Merchants',
      icon: Users,
      badge: merchantCount,
    },
    {
      id: 'transactions',
      label: 'Global Master Ledger',
      shortLabel: 'Master Ledger',
      icon: Receipt,
    },
    {
      id: 'branding',
      label: 'System Branding',
      shortLabel: 'Branding',
      icon: Palette,
    },
  ]

  return (
    <aside className={`w-full select-none ${className}`}>
      {/* Outer Glowing Neon Container (Amber/Gold Root Aesthetics) */}
      <div className="rounded-3xl bg-[#060b20]/95 border-[1.5px] border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.22),inset_0_0_12px_rgba(251,191,36,0.08)] p-4 sm:p-5 flex flex-col justify-between h-full backdrop-blur-2xl space-y-5">
        
        {/* Top: Identity Pill */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#0d163a] to-[#080d24] border border-amber-500/30 shadow-[0_0_14px_rgba(251,191,36,0.12)]">
            <div className="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shrink-0 shadow-[0_0_12px_rgba(251,191,36,0.45)]">
              <div className="w-full h-full rounded-[10px] bg-[#050a1d] flex items-center justify-center text-amber-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white truncate">Super Administrator</span>
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
              </div>
              <div className="text-[10px] font-mono text-amber-300/80 truncate">
                Root Platform Controller
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>COMMAND CONSOLE</span>
            </div>
            <span className="text-[10px] text-slate-400">PRD v1.0</span>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-1.5 flex-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)] border-2 border-amber-300 scale-[1.02] font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-black/20 text-slate-950'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-400/20'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {item.badge !== undefined &&
                item.badge !== null &&
                (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) ? (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Bottom Section: Refresh & Sign Out */}
        <div className="pt-3 border-t border-amber-500/20 space-y-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#091332] hover:bg-[#0d1a45] border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing Telemetry...' : 'Refresh Telemetry'}</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Terminate Session</span>
            </button>
          )}
        </div>

      </div>
    </aside>
  )
}
