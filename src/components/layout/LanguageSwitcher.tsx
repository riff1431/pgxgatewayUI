import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe2 } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'
import { getLanguageMeta, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/types'

interface LanguageSwitcherProps {
  compact?: boolean
  className?: string
}

export default function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentMeta = getLanguageMeta(language)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = async (code: SupportedLanguage) => {
    setOpen(false)
    await setLanguage(code, true)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.switchLanguage')}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#070e28] hover:bg-[#0c173d] border border-cyan-500/35 hover:border-cyan-400 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.12)]"
      >
        <Globe2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span dir="ltr" className="font-bold tracking-wide text-cyan-300">
          {currentMeta.badge}
        </span>
        {!compact && (
          <span className="hidden xl:inline text-slate-300 truncate max-w-[80px]">
            {currentMeta.nativeName}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('common.switchLanguage')}
          className="absolute end-0 mt-2 w-56 rounded-2xl bg-[#050b1f]/98 border border-cyan-400/50 shadow-[0_14px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-xl p-1.5 z-50 animate-fade-in"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === language
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isActive}
                dir={lang.dir}
                onClick={() => void handleSelect(lang.code)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-white border border-cyan-400/50 font-bold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    dir="ltr"
                    className={`w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-[#081232] text-cyan-300 border border-cyan-500/25'
                    }`}
                  >
                    {lang.badge}
                  </span>
                  <div className="text-start truncate">
                    <div className="truncate">{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                  </div>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
