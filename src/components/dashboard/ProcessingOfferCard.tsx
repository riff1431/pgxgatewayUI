import { Tag } from 'lucide-react'

export default function ProcessingOfferCard({ className = '' }: { className?: string }) {
  return (
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
            2.9%
          </div>
          <div className="text-[11px] font-medium text-slate-400">
            + $0.30
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
            $250,000
          </div>
        </div>

        {/* Settlement */}
        <div className="px-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Settlement
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            Daily
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
            5%
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
          onClick={() => alert('Processing Offer details modal / agreement sheet.')}
          className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:shadow-[0_0_28px_rgba(217,70,239,0.9)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View Offer</span>
          <span>&rarr;</span>
        </button>
      </div>

    </div>
  )
}
