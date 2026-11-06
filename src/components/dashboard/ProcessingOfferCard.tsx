import { useState } from 'react'
import { Tag, Check, ShieldCheck, X, Clock, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProcessingOfferCard({ className = '' }: { className?: string }) {
  const { offer, acceptOffer } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const isAvailable = Boolean(offer?.isAvailable && offer.rate)
  const isAccepted = Boolean(offer?.accepted)

  // Split rate string (e.g. "2.1% + $0.20")
  const rateParts = offer?.rate ? offer.rate.split('+') : []
  const baseRate = rateParts[0]?.trim() || (isAvailable ? '2.1%' : '—')
  const perTxFee = rateParts[1]?.trim() ? `+ $${rateParts[1].replace(/[$]/g, '').trim()}` : (isAvailable ? '+ $0.20' : '—')

  // Clean Volume (e.g. "$250,000 / month", "Up to $250,000", "$250,000")
  const rawVolume = offer?.volume || ''
  const cleanVol = rawVolume.replace(/up\s*to/i, '').trim()
  const volParts = cleanVol.split('/')
  const volumeAmount = volParts[0]?.trim() || (isAvailable ? '$250,000' : '—')
  const volumePeriod = volParts[1]?.trim() ? `/${volParts[1].trim()}` : (isAvailable ? '/ month' : '—')

  // Clean Settlement (e.g. "Daily T+2", "Daily T+2 (Next Day)", "Daily")
  const rawSettlement = offer?.settlement || ''
  let settlementMain = isAvailable ? 'Daily' : '—'
  let settlementSub = isAvailable ? 'T+2 (Next Day)' : '—'
  if (rawSettlement) {
    if (rawSettlement.toLowerCase().includes('daily')) {
      settlementMain = 'Daily'
      const rest = rawSettlement.replace(/daily/i, '').replace(/[()]/g, '').trim()
      settlementSub = rest ? rest : 'T+2 (Next Day)'
    } else {
      const parts = rawSettlement.split('(')
      settlementMain = parts[0]?.trim() || rawSettlement
      settlementSub = parts[1] ? parts[1].replace(/[()]/g, '').trim() : 'Rolling'
    }
  }

  // Clean Reserve (e.g. "5% Rolling (90 days)", "5% Rolling", "5%")
  const rawReserve = offer?.reserve || ''
  let reserveMain = isAvailable ? '5%' : '—'
  let reserveSub = isAvailable ? 'Rolling (90d)' : '—'
  if (rawReserve) {
    const pctMatch = rawReserve.match(/^(\d+(\.\d+)?%)/)
    if (pctMatch) {
      reserveMain = pctMatch[1]
      const rest = rawReserve.replace(pctMatch[1], '').replace(/[()]/g, '').trim()
      reserveSub = rest || 'Rolling (90d)'
    } else {
      const parts = rawReserve.split('(')
      reserveMain = parts[0]?.trim() || rawReserve
      reserveSub = parts[1] ? parts[1].replace(/[()]/g, '').trim() : 'Rolling'
    }
  }

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
      <div className={`rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35),inset_0_0_12px_rgba(0,240,255,0.1)] p-4 sm:p-5 lg:p-6 backdrop-blur-xl flex flex-col justify-between ${className}`}>
        
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-cyan-500/20 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Tag className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              Processing Offer
            </h3>
          </div>

          {/* Status Badge */}
          {isAvailable ? (
            isAccepted ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/80 shadow-[0_0_10px_rgba(0,240,255,0.4)] flex items-center gap-1.5 shrink-0">
                <Check className="h-3 w-3 stroke-[3]" />
                Terms Accepted
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.4)] flex items-center gap-1.5 animate-pulse shrink-0">
                <Zap className="h-3 w-3" />
                Offer Available
              </span>
            )
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.25)] flex items-center gap-1.5 shrink-0">
              <Clock className="h-3 w-3 animate-pulse" />
              Awaiting Offer
            </span>
          )}
        </div>

        {/* Metrics Row (4 Responsive Chambers - perfectly adaptable to any screen width) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-4">
          
          {/* Rate Chamber */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#091332]/70 border border-cyan-500/25 flex flex-col items-center justify-center text-center shadow-[inset_0_0_10px_rgba(0,240,255,0.05)] hover:border-cyan-400/50 transition-all min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">
              Rate
            </div>
            <div className={`text-base sm:text-lg xl:text-xl font-black mt-1 tracking-tight truncate w-full ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? baseRate : '—'}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate w-full ${isAvailable ? 'text-cyan-400' : 'text-slate-600'}`}>
              {isAvailable ? perTxFee : '—'}
            </div>
          </div>

          {/* Volume Chamber */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#091332]/70 border border-cyan-500/25 flex flex-col items-center justify-center text-center shadow-[inset_0_0_10px_rgba(0,240,255,0.05)] hover:border-cyan-400/50 transition-all min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">
              Volume
            </div>
            <div className={`text-base sm:text-lg xl:text-xl font-black mt-1 tracking-tight truncate w-full ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? volumeAmount : '—'}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate w-full ${isAvailable ? 'text-cyan-400' : 'text-slate-600'}`}>
              {isAvailable ? volumePeriod : '—'}
            </div>
          </div>

          {/* Settlement Chamber */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#091332]/70 border border-cyan-500/25 flex flex-col items-center justify-center text-center shadow-[inset_0_0_10px_rgba(0,240,255,0.05)] hover:border-cyan-400/50 transition-all min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">
              Settlement
            </div>
            <div className={`text-base sm:text-lg xl:text-xl font-black mt-1 tracking-tight truncate w-full ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? settlementMain : '—'}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate w-full ${isAvailable ? 'text-cyan-400' : 'text-slate-600'}`}>
              {isAvailable ? settlementSub : '—'}
            </div>
          </div>

          {/* Reserve Chamber */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#091332]/70 border border-cyan-500/25 flex flex-col items-center justify-center text-center shadow-[inset_0_0_10px_rgba(0,240,255,0.05)] hover:border-cyan-400/50 transition-all min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">
              Reserve
            </div>
            <div className={`text-base sm:text-lg xl:text-xl font-black mt-1 tracking-tight truncate w-full ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? reserveMain : '—'}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate w-full ${isAvailable ? 'text-cyan-400' : 'text-slate-600'}`}>
              {isAvailable ? reserveSub : '—'}
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
              className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:shadow-[0_0_28px_rgba(217,70,239,0.9)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAccepted ? 'View Accepted Offer Terms' : 'View Offer & Accept to Proceed'}</span>
              <span>&rarr;</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-4 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
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
          <div className="w-full max-w-lg rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.45)] p-5 sm:p-6 space-y-5">
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
