import { useState } from 'react'
import {
  Link2,
  Copy,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Users,
  Globe,
} from 'lucide-react'
import type { ApplicationItem } from '@/lib/adminApi'

interface ResellerAffiliateTabProps {
  resellerId: string
  applications: ApplicationItem[]
  onShowToast: (title: string, desc: string, type?: 'success' | 'error') => void
}

export default function ResellerAffiliateTab({
  resellerId,
  applications,
  onShowToast,
}: ResellerAffiliateTabProps) {
  const [copied, setCopied] = useState(false)

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?reseller=${resellerId}`
      : `https://pgxgateway.com/register?reseller=${resellerId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    onShowToast('Affiliate Link Copied', 'Share this link with merchants to earn commissions.', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  // Calculate stats
  const totalReferred = applications.length
  const paidSetups = applications.filter(
    (a) => a.setupStatus && a.setupStatus !== 'pending_payment'
  ).length

  // Assuming $49 setup fee with 20% commission ($9.80 per merchant)
  const estimatedEarned = paidSetups * 9.8

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Affiliate Link Banner */}
      <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09153a] via-[#102766] to-[#09153a] border-[1.5px] border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.25)] space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Zero-Liability Affiliate Model
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Affiliate Referral & Partner Program
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              You do not need to configure Stripe or take any payment risk. Share your unique referral link to onboard merchants. When a merchant pays their setup fee, you automatically earn an instant 20% affiliate commission!
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#040819]/80 border border-cyan-500/30 text-left sm:text-right shrink-0">
            <div className="text-[11px] text-slate-400 font-medium">Your Reseller Partner ID</div>
            <div className="text-base sm:text-lg font-mono font-black text-cyan-300">{resellerId}</div>
          </div>
        </div>

        {/* Copyable Link Box */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#030614] border border-cyan-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs sm:text-sm text-cyan-200 truncate select-all">
              {referralLink}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040819] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#040819]" /> Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Referral Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Referred Merchants
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalReferred}</div>
          <p className="text-[11px] text-slate-400">Merchants registered via your referral link</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Paid White-Glove Setups
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{paidSetups}</div>
          <p className="text-[11px] text-slate-400">Merchants who completed setup fee payment</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Accumulated Commission Earned
            </span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300">${estimatedEarned.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">20% commission on all onboarding setup fees</p>
        </div>
      </div>

      {/* Referred Merchants Breakdown */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div>
            <h3 className="text-lg font-bold text-white">Your Referred Merchant Roster</h3>
            <p className="text-xs text-slate-400">
              Real-time integration progress and commission accrual for merchants tagged under you.
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No merchants have signed up with your referral link yet. Share your link above to begin earning commissions!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-[#091332] text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Merchant</th>
                  <th className="px-4 py-3">Store Domain</th>
                  <th className="px-4 py-3">Setup Status</th>
                  <th className="px-4 py-3">Commission Earned</th>
                  <th className="px-4 py-3 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {applications.map((app) => {
                  const setupStatus = app.setupStatus || 'pending_payment'
                  const isPaid = setupStatus !== 'pending_payment'
                  const domain = app.websiteDomain || app.website

                  return (
                    <tr key={app._id} className="hover:bg-[#091332]/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{app.fullName}</div>
                        <div className="text-slate-400 text-[11px]">{app.businessEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        {domain ? (
                          <span className="text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            {domain.replace(/^https?:\/\//, '')}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            Fee Paid ({setupStatus})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                            Pending Payment
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {isPaid ? (
                          <span className="text-emerald-400 font-bold">+$9.80 USD</span>
                        ) : (
                          <span className="text-slate-500">$0.00 (Pending)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
