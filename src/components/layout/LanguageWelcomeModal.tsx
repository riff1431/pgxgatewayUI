import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, Globe2, Loader2, Sparkles, X } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'
import { getLanguageMeta, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/types'

export default function LanguageWelcomeModal() {
  const location = useLocation()
  const {
    language,
    suggestedLanguage,
    hasSelectedLanguage,
    isModalOpen,
    isLoadingLocale,
    setLanguage,
    previewLanguage,
    closeLanguageModal,
    t,
  } = useTranslation()

  const isBackOfficeRoute =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin')

  const shouldShow = !isBackOfficeRoute && (isModalOpen || !hasSelectedLanguage)
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language)
  const [saving, setSaving] = useState(false)

  // Keep local highlight synced when reopened
  const effectiveSelected = isModalOpen ? selectedLang : selectedLang || language

  useEffect(() => {
    if (!shouldShow) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLanguageModal()
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shouldShow, closeLanguageModal])

  if (!shouldShow) return null

  const selectedMeta = getLanguageMeta(effectiveSelected)

  const handleSelectCard = async (code: SupportedLanguage) => {
    setSelectedLang(code)
    await previewLanguage(code)
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await setLanguage(effectiveSelected, true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-[#020512]/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pgx-language-modal-title"
    >
      {/* Ambient Cyber Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/15 blur-[130px] rounded-full" />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl bg-[#050b1f]/95 border-[1.5px] border-cyan-400/75 shadow-[0_0_45px_rgba(0,240,255,0.28),0_0_60px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Top Glowing Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600" />

        {/* Close Button (persists current selection so user isn't trapped) */}
        <button
          type="button"
          onClick={closeLanguageModal}
          aria-label={t('common.close')}
          className="absolute top-4 end-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-5 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2.5 pe-6 sm:pe-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/50 bg-cyan-950/50 text-cyan-300 text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t('languageModal.badge')}</span>
            </div>

            <h2
              id="pgx-language-modal-title"
              className="text-2xl sm:text-3xl font-black tracking-tight text-white"
            >
              {t('languageModal.title')}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {t('languageModal.subtitle')}
            </p>
          </div>

          {/* 7 Language Selection Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-[52vh] overflow-y-auto pr-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = effectiveSelected === lang.code
              const isSuggested = suggestedLanguage === lang.code

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => void handleSelectCard(lang.code)}
                  dir={lang.dir}
                  className={`relative flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-start transition-all cursor-pointer min-h-[62px] ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500/20 via-[#081538] to-fuchsia-600/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.35)]'
                      : 'bg-[#070f28]/90 border-slate-700/80 text-slate-200 hover:border-cyan-400/60 hover:bg-[#0a1638]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      dir="ltr"
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black tracking-wider shrink-0 border ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.7)]'
                          : 'bg-[#04091b] text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {lang.badge}
                    </span>

                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-white truncate">
                        {lang.nativeName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>{lang.name}</span>
                        {lang.dir === 'rtl' && (
                          <span className="px-1.5 py-0.2 rounded bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 text-[9px] font-bold">
                            {t('languageModal.rtlBadge')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    ) : isSuggested ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[9px] font-bold">
                        <Sparkles className="h-2.5 w-2.5" />
                        {t('languageModal.suggested')}
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Confirm Action */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={saving || isLoadingLocale}
              onClick={() => void handleConfirm()}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-500 hover:from-purple-600 hover:via-fuchsia-500 hover:to-cyan-400 text-white font-extrabold text-sm border border-cyan-300/60 shadow-[0_0_25px_rgba(217,70,239,0.5)] hover:shadow-[0_0_32px_rgba(0,240,255,0.65)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving || isLoadingLocale ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <span>
                  {t('languageModal.continueBtn', { language: selectedMeta.nativeName })}
                </span>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              {t('languageModal.footerNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
