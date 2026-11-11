import {
  Users,
  Coins,
  Activity,
  Building2,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  ShieldCheck,
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
    icon: React.ComponentType<{ className?: string }>
    badge?: number | string
    badgeColor?: string
  }> = [
    {
      id: 'applications',
      label: 'Merchant Applications',
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : totalMerchants > 0 ? totalMerchants : undefined,
      badgeColor: pendingCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : undefined,
    },
    {
      id: 'stripe',
      label: 'Affiliate Program',
      icon: Coins,
      badge: '20%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'transactions',
      label: 'Gateway Transactions',
      icon: Activity,
    },
  ]

  return (
    <aside className={`w-full select-none ${className}`}>
      
      {/* MOBILE (< lg): Compact Partner Header & Horizontal Tab Rail */}
      <div className="block lg:hidden rounded-2xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.25)] p-3 backdrop-blur-xl space-y-2.5 mb-2">
        {/* Mobile Top Row: Identity + Quick Referral Copy */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full rounded-[9px] bg-[#040819] flex items-center justify-center text-cyan-300">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{adminUser?.name === 'Primary Gateway Administrator' ? 'Primary Admin' : (adminUser?.name || 'Reseller Gateway')}</span>
                <ShieldCheck className="h-3 w-3 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[10px] font-mono text-cyan-300 truncate">
                Tenant: {resellerId}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCopyReferral}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {copiedReferral ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                <span className="text-[11px] text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-[11px]">Referral</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Horizontal Tab Rail */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.7)] scale-[1.02]'
                    : 'text-slate-300 hover:text-white bg-[#091332]/80 border border-cyan-500/20'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span>{item.label}</span>

                {item.badge !== undefined && item.badge !== null ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold shrink-0 border ${
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
      </div>

      {/* DESKTOP (>= lg): Original Glowing Neon Container (Cyan & Purple Reseller Aesthetics) */}
      <div className="hidden lg:flex rounded-3xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.12)] p-4 sm:p-5 flex-col justify-between h-full backdrop-blur-2xl space-y-5">
        
        {/* Top: Identity Pill */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#091332] to-[#040819] border border-cyan-500/30 shadow-[0_0_14px_rgba(0,240,255,0.15)]">
            <div className="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.45)]">
              <div className="w-full h-full rounded-[10px] bg-[#040819] flex items-center justify-center text-cyan-300">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className="text-xs font-black tracking-wide text-white leading-tight break-words"
                  title={adminUser?.name || 'Reseller Gateway'}
                >
                  {adminUser?.name === 'Primary Gateway Administrator' ? 'Primary Gateway Admin' : (adminUser?.name || 'Reseller Gateway')}
                </span>
                <ShieldCheck className="h-3 w-3 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[10px] font-mono text-cyan-300 truncate mt-0.5">
                Tenant: {resellerId}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>AFFILIATE PARTNER</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
          </div>

          {/* Quick 1-Click Referral Link Pill */}
          <button
            type="button"
            onClick={onCopyReferral}
            title={referralLink}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#091332] hover:bg-[#0e1c4a] border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.15)]"
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>Copy Referral Link</span>
            </div>
            {copiedReferral ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                <Check className="h-3.5 w-3.5" /> Copied!
              </span>
            ) : (
              <Copy className="h-3.5 w-3.5 text-purple-400" />
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-2 flex-1">
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
                  <span className="whitespace-nowrap text-left">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge !== null ? (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border whitespace-nowrap ${
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
