import { 
  Check, 
  Gamepad2, 
  Heart, 
  Plane, 
  PlaySquare, 
  Coins, 
  ShoppingCart, 
  TrendingUp, 
  Users2, 
  Dices 
} from 'lucide-react'

const industries = [
  { name: 'eCommerce & Retail', icon: ShoppingCart },
  { name: 'Travel & Airlines', icon: Plane },
  { name: 'Gaming & Casino', icon: Dices },
  { name: 'Online Gaming', icon: Gamepad2 },
  { name: 'Streaming & Content', icon: PlaySquare },
  { name: 'Adult & Creator', icon: Users2 },
  { name: 'Health & Wellness', icon: Heart },
  { name: 'Digital Services', icon: Coins },
  { name: 'High-Risk & More', icon: TrendingUp },
]

export default function IndustriesBar({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full max-w-full min-w-0 overflow-hidden ${className}`}>
      <div className="w-full max-w-full rounded-2xl bg-[#070d24]/90 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] p-3 sm:p-4 backdrop-blur-md overflow-x-auto">
        <div className="flex items-center justify-between min-w-[950px] gap-4">
          
          {/* Header Title with Checkmark */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-cyan-500/30 shrink-0">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.6)]">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Industries</div>
              <div className="text-xs font-semibold text-cyan-400 leading-tight">We Approve</div>
            </div>
          </div>

          {/* Industry Icons Grid / Row */}
          <div className="flex items-center justify-between flex-1 gap-3">
            {industries.map((item) => {
              const Icon = item.icon
              return (
                <div 
                  key={item.name}
                  className="flex flex-col items-center justify-center text-center group cursor-pointer transition-transform hover:scale-105 px-2"
                >
                  <div className="text-cyan-400 group-hover:text-fuchsia-400 transition-colors drop-shadow-[0_0_6px_rgba(0,240,255,0.7)] mb-1">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300 group-hover:text-white transition-colors leading-tight whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
