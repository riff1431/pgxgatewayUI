import {
  Users,
  Coins,
  Receipt,
  Building2,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react'
import type { AdminUserInfo } from '@/lib/adminApi'

export type ResellerSectionId = 'applications' | 'stripe' | 'transactions'

interface ResellerSidebarProps {
  activeSection: ResellerSectionId
  onSectionChange: (section: ResellerSectionId) => void
  adminUser: AdminUserInfo | null
  resellerId: string
  pendingCount?: number
  totalMerchants?: number
  referralLink: string
  copiedReferral: boolean
  onCopyReferral: () => void
  onRefresh?: () => void
  onLogout?: () => void
  isRefreshing?: boolean
  className?: string
}

export default function ResellerSidebar({
  activeSection,
  onSectionChange,
  adminUser,
  resellerId,
  pendingCount = 0,
  totalMerchants = 0,
  referralLink,
  copiedReferral,
  onCopyReferral,
  onRefresh,
  onLogout,
  isRefreshing = false,
  className = '',
}: ResellerSidebarProps) {
  const navItems: Array<{
    id: ResellerSectionId
    label: string
    shortLabel: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number | string
    badgeColor?: string
  }> = [
    {
      id: 'applications',
      label: 'Merchant KYC & Desk',
      shortLabel: 'Applications',
      icon: Users,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : totalMerchants > 0 ? totalMerchants : undefined,
      badgeColor: pendingCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : undefined,
    },
    {
      id: 'stripe',
      label: 'Affiliate & Commissions',
      shortLabel: 'Affiliate Program',
      icon: Coins,
      badge: '20% + 2%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'transactions',
      label: 'Tenant Transactions',
      shortLabel: 'Transactions',
      icon: Receipt,
    },
  ]

  return (
    <aside className={`w-full select-none ${className}`}>
      {/* Outer Glowing Neon Container (Cyan & Purple Reseller Aesthetics) */}
      <div className="rounded-3xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.12)] p-4 sm:p-5 flex flex-col justify-between h-full backdrop-blur-2xl space-y-5">
        
        {/* Top: Identity Pill */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#091332] to-[#040819] border border-cyan-500/30 shadow-[0_0_14px_rgba(0,240,255,0.15)]">
            <div className="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.45)]">
              <div className="w-full h-full rounded-[10px] bg-[#040819] flex items-center justify-center text-cyan-300">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white truncate">
                  {adminUser?.name || 'Reseller Gateway'}
                </span>
                <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[10px] font-mono text-cyan-300 truncate">
                Tenant: {resellerId}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>AFFILIATE PARTNER</span>
            </div>
            <span className="text-[10px] text-slate-400">PRD Model</span>
          </div>

          {/* Quick Referral Link Widget in Sidebar */}
          <div className="p-3 rounded-2xl bg-[#091332]/90 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center gap-1">
                <LinkIcon className="h-3 w-3 text-purple-400" />
                Referral Link
              </span>
              <span className="text-[10px] font-mono text-purple-300">20% Cut</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-black/40 border border-purple-500/30 font-mono text-[10px] text-purple-200 truncate select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={onCopyReferral}
                className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shrink-0 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                title="Copy Referral Link"
              >
                {copiedReferral ? (
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-1.5 flex-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Partner Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-[0_0_20px_rgba(217,70,239,0.85)] border-2 border-fuchsia-400 scale-[1.02] font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-400/20'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge !== null ? (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-black/30 text-white border-white/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40')
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
        <div className="pt-3 border-t border-cyan-500/20 space-y-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#091332] hover:bg-[#0d1a45] border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Partner Data'}</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

      </div>
    </aside>
  )
}
