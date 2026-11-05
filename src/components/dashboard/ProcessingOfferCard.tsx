import { useState } from 'react'
import { Tag, Check, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProcessingOfferCard({ className = '' }: { className?: string }) {
  const { offer } = useAuth()
  const [showModal, setShowModal] = useState(false)

  // Split rate string if possible (e.g., "2.9% + $0.30")
  const rateParts = offer.rate ? offer.rate.split('+') : ['2.9%', '$0.30']
  const baseRate = rateParts[0]?.trim() || '2.9%'
  const perTxFee = rateParts[1]?.trim() ? `+ ${rateParts[1].trim()}` : '+ $0.30'

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

          {/* Green Pill: Offer Available */}
          <span className="px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            Offer Available
          </span>
        </div>

        {/* Metrics Row (4 Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-center divide-x-0 sm:divide-x divide-slate-800">
          
          {/* Rate */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Rate
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {baseRate}
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              {perTxFee}
            </div>
          </div>

          {/* Volume */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Volume
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              Up to
            </div>
            <div className="text-lg sm:text-xl font-black text-white">
              {offer.volume?.replace('Up to', '').trim() || '$250,000'}
            </div>
          </div>

          {/* Settlement */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Settlement
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {offer.settlement?.split('(')[0]?.trim() || 'Daily'}
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              (Next Day)
            </div>
          </div>

          {/* Reserve */}
          <div className="px-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Reserve
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {offer.reserve?.split('(')[0]?.trim() || '5%'}
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              (90 Days)
            </div>
          </div>

        </div>

        {/* View Offer Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:shadow-[0_0_28px_rgba(217,70,239,0.9)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Offer</span>
            <span>&rarr;</span>
          </button>
        </div>

      </div>

      {/* Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.45)] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-fuchsia-400" />
                <h3 className="text-lg font-bold text-white">PGX Processing Terms</h3>
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
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(0,240,255,0.5)] cursor-pointer"
              >
                <Check className="inline h-4 w-4 mr-1" /> Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
