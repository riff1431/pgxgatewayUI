import { useState } from 'react'
import { Tag, Check, ShieldCheck, X, Clock, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProcessingOfferCard({ className = '' }: { className?: string }) {
  const { offer, acceptOffer } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const isAvailable = Boolean(offer?.isAvailable && offer.rate)
  const isAccepted = Boolean(offer?.accepted)

  // Split rate string if possible (e.g., "2.9% + $0.30")
  const rateParts = offer?.rate ? offer.rate.split('+') : []
  const baseRate = rateParts[0]?.trim() || ''
  const perTxFee = rateParts[1]?.trim() ? `+ ${rateParts[1].trim()}` : ''

  const handleAcceptOffer = async () => {
    setAccepting(true)
    try {
      await acceptOffer()
      setShowModal(false)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <>
      <div className={`rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.1)] p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between ${className}`}>
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Tag className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Processing Offer
            </h3>
          </div>

          {/* Status Badge */}
          {isAvailable ? (
            isAccepted ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/80 shadow-[0_0_10px_rgba(0,240,255,0.4)] flex items-center gap-1.5">
                <Check className="h-3 w-3 stroke-[3]" />
                Terms Accepted
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.4)] flex items-center gap-1.5 animate-pulse">
                <Zap className="h-3 w-3" />
                Offer Available
              </span>
            )
          ) : (
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.25)] flex items-center gap-1.5">
              <Clock className="h-3 w-3 animate-pulse" />
              Awaiting Offer
            </span>
          )}
        </div>

        {/* Metrics Row (4 Columns) - Left blank if offer is not sent */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-center divide-x-0 sm:divide-x divide-slate-800">
          
          {/* Rate */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Rate
            </div>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? baseRate : '—'}
            </div>
            <div className={`text-[11px] font-medium ${isAvailable ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAvailable ? perTxFee : '—'}
            </div>
          </div>

          {/* Volume */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Volume
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${isAvailable ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAvailable ? 'Up to' : '—'}
            </div>
            <div className={`text-lg sm:text-xl font-black ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? (offer.volume?.replace('Up to', '').trim() || '$250,000') : '—'}
            </div>
          </div>

          {/* Settlement */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Settlement
            </div>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? (offer.settlement?.split('(')[0]?.trim() || 'Daily') : '—'}
            </div>
            <div className={`text-[11px] font-medium ${isAvailable ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAvailable ? (offer.settlement?.includes('(') ? offer.settlement.slice(offer.settlement.indexOf('(')) : '(Next Day)') : '—'}
            </div>
          </div>

          {/* Reserve */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Reserve
            </div>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? (offer.reserve?.split('(')[0]?.trim() || '5%') : '—'}
            </div>
            <div className={`text-[11px] font-medium ${isAvailable ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAvailable ? (offer.reserve?.includes('(') ? offer.reserve.slice(offer.reserve.indexOf('(')) : '(90 Days)') : '—'}
            </div>
          </div>

        </div>

        {/* If offer not sent: Display 24-hr reminder message */}
        {!isAvailable && (
          <div className="my-1.5 p-3.5 rounded-2xl bg-[#09153a]/90 border border-amber-500/35 text-amber-200 text-xs sm:text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex-1 font-semibold leading-relaxed">
              Please check back every 24hrs to see if offer is available and accept to proceed
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isAvailable ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:shadow-[0_0_28px_rgba(217,70,239,0.9)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAccepted ? 'View Accepted Offer Terms' : 'View Offer & Accept to Proceed'}</span>
              <span>&rarr;</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            >
              <Clock className="h-4 w-4 text-amber-400/80" />
              <span>Offer Pending Underwriter Review</span>
            </button>
          )}
        </div>

      </div>

      {/* Offer Modal */}
      {showModal && isAvailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.45)] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-fuchsia-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">PGX Processing Terms</h3>
                  <div className="text-[11px] text-cyan-300">Customized Underwriting Schedule</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/30 flex justify-between items-center">
                <span className="text-slate-400">Interchange / Processing Rate:</span>
                <span className="font-bold text-white">{offer.rate}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/30 flex justify-between items-center">
                <span className="text-slate-400">Monthly Processing Ceiling:</span>
                <span className="font-bold text-white">{offer.volume}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/30 flex justify-between items-center">
                <span className="text-slate-400">Settlement Schedule:</span>
                <span className="font-bold text-white">{offer.settlement}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/30 flex justify-between items-center">
                <span className="text-slate-400">Rolling Reserve Requirement:</span>
                <span className="font-bold text-white">{offer.reserve}</span>
              </div>
            </div>

            <div className="pt-2">
              {isAccepted ? (
                <div className="w-full py-2.5 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Terms Accepted & Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={accepting}
                  onClick={handleAcceptOffer}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:shadow-[0_0_28px_rgba(0,240,255,0.85)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{accepting ? 'Recording Acceptance...' : 'Accept to Proceed'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
