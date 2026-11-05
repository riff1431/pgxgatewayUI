import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  User,
  XCircle,
  Store
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ApplicationTab() {
  const { merchant, applicationStatus } = useAuth()

  const isApproved = applicationStatus === 'approved'
  const isRejected = applicationStatus === 'rejected'

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner Status */}
      <div
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl ${
          isApproved
            ? 'bg-emerald-950/20 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
            : isRejected
            ? 'bg-red-950/20 border-red-400/80 shadow-[0_0_25px_rgba(239,68,68,0.35)]'
            : 'bg-amber-950/20 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isApproved
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : isRejected
                ? 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isRejected ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <Clock className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Application Lifecycle
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {isApproved
                ? 'Application Approved & Live'
                : isRejected
                ? 'Application Declined'
                : 'Underwriting Review In Progress'}
            </h2>
            <p className="text-xs text-slate-300">
              {isApproved
                ? 'Your merchant processing account is active. Payment gateway credentials and settlement are live.'
                : isRejected
                ? 'Your application could not be approved at this time. Contact your account manager for assistance.'
                : 'Your business documentation and processing metrics are being verified by our compliance desk.'}
            </p>
          </div>
        </div>

        <div className="sm:self-center">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold border inline-block ${
              isApproved
                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : isRejected
                ? 'text-red-300 bg-red-500/10 border-red-400/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                : 'text-amber-300 bg-amber-500/10 border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
            }`}
          >
            {isApproved ? 'Approved' : isRejected ? 'Declined' : 'Under Review'}
          </span>
        </div>
      </div>

      {/* Grid: Business Details & Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Business & Processing Profile */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-5 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/20">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Store className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Business & Processing Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Legal Company Name</span>
              <span className="font-bold text-white text-sm">{merchant?.legalName || 'Huipper Technology Ltd.'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Industry</span>
              <span className="font-bold text-cyan-300 capitalize text-sm">{merchant?.industry?.replace('-', ' ') || 'E-Commerce'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Website</span>
              <span className="font-bold text-white truncate block">
                {merchant?.website ? (
                  <a href={merchant.website} target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-200">
                    {merchant.website}
                  </a>
                ) : (
                  'https://pgxgateway.com'
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Years in Business</span>
              <span className="font-bold text-white">{merchant?.yearsInBusiness || '3-5 Years'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Monthly Volume</span>
              <span className="font-bold text-white">{merchant?.monthlyVolume || '$50,000 - $250,000'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Processor</span>
              <span className="font-bold text-white">{merchant?.currentProcessor || 'Stripe'}</span>
            </div>
          </div>

          {/* Switch Reason */}
          <div className="p-3 rounded-xl bg-[#091332]/60 border border-cyan-500/25 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Reason for Applying</span>
            <p className="text-slate-200 mt-1">
              {merchant?.switchReason || 'Higher processing limits, multi-currency settlement, and direct underwriting approval.'}
            </p>
          </div>
        </div>

        {/* Account & Director Contact Information */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-5 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/20">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Authorized Account Director
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <div className="flex items-center gap-2.5 text-slate-300">
                <User className="h-4 w-4 text-cyan-400" />
                <span>Full Name:</span>
              </div>
              <span className="font-bold text-white">{merchant?.fullName || 'Tanvir Ahmed'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="h-4 w-4 text-cyan-400" />
                <span>Business Email:</span>
              </div>
              <span className="font-bold text-white">{merchant?.businessEmail || 'tanvir@pgxgateway.com'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span>Phone:</span>
              </div>
              <span className="font-bold text-white">{merchant?.phone || '+880 1712 345678'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Send className="h-4 w-4 text-sky-400" />
                <span>Telegram:</span>
              </div>
              <span className="font-bold text-white">{merchant?.telegram || '@tanvir_pgx'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
              <div className="flex items-center gap-2.5 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Terms of Service Agreement:</span>
              </div>
              <span className="font-bold text-emerald-400">Accepted & Verified</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
