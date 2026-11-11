import { useState } from 'react'
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
  Menu,
  X,
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
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
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
  mobileOpen,
  onMobileOpenChange,
}: ResellerSidebarProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const isDrawerOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen
  const setDrawerOpen = (open: boolean) => {
    if (onMobileOpenChange) {
      onMobileOpenChange(open)
    } else {
      setInternalMobileOpen(open)
    }
  }

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

  const activeItem = navItems.find((i) => i.id === activeSection) || navItems[0]
  const ActiveIcon = activeItem.icon

  return (
    <aside className={`w-full max-w-full min-w-0 select-none ${className}`}>
      
      {/* MOBILE (< lg): Compact Partner Navigation Bar with Hamburger Trigger */}
      <div className="block lg:hidden w-full max-w-full min-w-0 mb-3">
        <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full rounded-[9px] bg-[#040819] flex items-center justify-center text-cyan-300">
                <ActiveIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{activeItem.label}</span>
                {activeItem.badge !== undefined && activeItem.badge !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold shrink-0 border ${
                      activeItem.badgeColor || 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}
                  >
                    {activeItem.badge}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-cyan-300 truncate">
                Tenant: {resellerId} • Tap to switch section
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCopyReferral}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Copy Referral Link"
            >
              {copiedReferral ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-[11px] text-emerald-300 hidden xs:inline">Copied</span>
                </>
              ) : (
                <>
                  <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[11px] hidden xs:inline">Referral</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
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
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-out Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-[88vw] max-w-xs sm:max-w-sm bg-[#060b20] border-r-[1.5px] border-cyan-400/90 shadow-[0_0_50px_rgba(0,240,255,0.45)] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto z-50">
            <div className="space-y-4">
              {/* Drawer Top Row: Identity + Close X */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                    <div className="w-full h-full rounded-[9px] bg-[#040819] flex items-center justify-center text-cyan-300">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <span className="truncate">
                        {adminUser?.name === 'Primary Gateway Administrator' ? 'Primary Admin' : (adminUser?.name || 'Reseller Gateway')}
                      </span>
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 truncate">
                      Tenant: {resellerId}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span>AFFILIATE PARTNER</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
              </div>

              {/* 1-Click Referral Link Pill */}
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

              {/* Navigation Items in Drawer */}
              <div className="space-y-2 pt-1">
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Partner Navigation
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={`drawer-${item.id}`}
                      type="button"
                      onClick={() => {
                        onSectionChange(item.id)
                        setDrawerOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer ${
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
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-4 border-t border-cyan-500/20 space-y-2 mt-6">
              {onRefresh && (
                <button
                  type="button"
                  onClick={() => {
                    onRefresh()
                    setDrawerOpen(false)
                  }}
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
        </div>
      )}

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
