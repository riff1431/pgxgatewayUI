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
import { useTranslation } from '@/context/LanguageContext'
import type { TranslationKey } from '@/i18n/locales/en'

const industries: { nameKey: TranslationKey; icon: typeof ShoppingCart }[] = [
  { nameKey: 'brand.ind1', icon: ShoppingCart },
  { nameKey: 'brand.ind2', icon: Plane },
  { nameKey: 'brand.ind3', icon: Dices },
  { nameKey: 'brand.ind4', icon: Gamepad2 },
  { nameKey: 'brand.ind5', icon: PlaySquare },
  { nameKey: 'brand.ind6', icon: Users2 },
  { nameKey: 'brand.ind7', icon: Heart },
  { nameKey: 'brand.ind8', icon: Coins },
  { nameKey: 'brand.ind9', icon: TrendingUp },
]

export default function IndustriesBar({ className = '' }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <div className={`w-full max-w-full min-w-0 overflow-hidden ${className}`}>
      <div className="w-full max-w-full rounded-2xl bg-[#070d24]/90 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] p-3 sm:p-4 backdrop-blur-md overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
        <div className="flex items-center justify-between min-w-[950px] gap-4">
          
          {/* Header Title with Checkmark */}
          <div className="flex items-center gap-2.5 pe-4 border-e border-cyan-500/30 shrink-0">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.6)]">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{t('brand.industriesTitle')}</div>
              <div className="text-xs font-semibold text-cyan-400 leading-tight">{t('brand.industriesSub')}</div>
            </div>
          </div>

          {/* Industry Icons Grid / Row */}
          <div className="flex items-center justify-between flex-1 gap-3">
            {industries.map((item) => {
              const Icon = item.icon
              return (
                <div 
                  key={item.nameKey}
                  className="flex flex-col items-center justify-center text-center group cursor-pointer transition-transform hover:scale-105 px-2"
                >
                  <div className="text-cyan-400 group-hover:text-fuchsia-400 transition-colors drop-shadow-[0_0_6px_rgba(0,240,255,0.7)] mb-1">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300 group-hover:text-white transition-colors leading-tight whitespace-nowrap">
                    {t(item.nameKey)}
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
