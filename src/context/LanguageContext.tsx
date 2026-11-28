import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { en, type TranslationKey, type TranslationSchema } from '@/i18n/locales/en'
import {
  detectBrowserLanguage,
  getLanguageMeta,
  isSupportedLanguage,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguage,
} from '@/i18n/types'

type LocaleLoader = () => Promise<TranslationSchema>

const LOCALE_LOADERS: Record<SupportedLanguage, LocaleLoader> = {
  en: async () => en,
  es: async () => (await import('@/i18n/locales/es')).es,
  fr: async () => (await import('@/i18n/locales/fr')).fr,
  nl: async () => (await import('@/i18n/locales/nl')).nl,
  hi: async () => (await import('@/i18n/locales/hi')).hi,
  bn: async () => (await import('@/i18n/locales/bn')).bn,
  ar: async () => (await import('@/i18n/locales/ar')).ar,
}

const localeCache: Partial<Record<SupportedLanguage, TranslationSchema>> = {
  en,
}

function getQueryLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null
  const param = new URLSearchParams(window.location.search).get('lang')
  return isSupportedLanguage(param) ? (param.toLowerCase() as SupportedLanguage) : null
}

function getStoredLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isSupportedLanguage(stored) ? (stored.toLowerCase() as SupportedLanguage) : null
  } catch {
    return null
  }
}

function resolveDotPath(dict: TranslationSchema, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = dict
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`
  )
}

interface LanguageContextValue {
  language: SupportedLanguage
  suggestedLanguage: SupportedLanguage
  dir: 'ltr' | 'rtl'
  hasSelectedLanguage: boolean
  isModalOpen: boolean
  isLoadingLocale: boolean
  setLanguage: (lang: SupportedLanguage, persist?: boolean) => Promise<void>
  previewLanguage: (lang: SupportedLanguage) => Promise<void>
  openLanguageModal: () => void
  closeLanguageModal: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  suggestedLanguage: 'en',
  dir: 'ltr',
  hasSelectedLanguage: true,
  isModalOpen: false,
  isLoadingLocale: false,
  setLanguage: async () => {},
  previewLanguage: async () => {},
  openLanguageModal: () => {},
  closeLanguageModal: () => {},
  t: (key) => resolveDotPath(en, key) || key,
})

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suggestedLanguage] = useState<SupportedLanguage>(() => detectBrowserLanguage())

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(() => {
    return Boolean(getQueryLanguage() || getStoredLanguage())
  })

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return getQueryLanguage() || getStoredLanguage() || detectBrowserLanguage()
  })

  const [activeDict, setActiveDict] = useState<TranslationSchema>(() => localeCache[language] || en)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isLoadingLocale, setIsLoadingLocale] = useState<boolean>(false)

  const dir = getLanguageMeta(language).dir

  // Sync <html lang="..." dir="..."> whenever language changes
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir])

  // Load non-English initial locale dictionary asynchronously on mount
  useEffect(() => {
    let active = true
    if (language === 'en' || localeCache[language]) return

    LOCALE_LOADERS[language]()
      .then((dict) => {
        localeCache[language] = dict
        if (active) {
          setActiveDict(dict)
        }
      })
      .catch(() => {
        // Fallback silently to English
      })

    return () => {
      active = false
    }
  }, [language])

  const loadDictionary = useCallback(async (lang: SupportedLanguage): Promise<TranslationSchema> => {
    const cached = localeCache[lang]
    if (cached) return cached

    setIsLoadingLocale(true)
    try {
      const loaded = await LOCALE_LOADERS[lang]()
      localeCache[lang] = loaded
      return loaded
    } finally {
      setIsLoadingLocale(false)
    }
  }, [])

  const setLanguage = useCallback(
    async (lang: SupportedLanguage, persist = true) => {
      const dict = await loadDictionary(lang)
      setLanguageState(lang)
      setActiveDict(dict)
      if (persist) {
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
        } catch {
          // Ignore storage quota / privacy mode errors
        }
        setHasSelectedLanguage(true)
        setIsModalOpen(false)
      }
    },
    [loadDictionary]
  )

  const previewLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      const dict = await loadDictionary(lang)
      setLanguageState(lang)
      setActiveDict(dict)
    },
    [loadDictionary]
  )

  const openLanguageModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeLanguageModal = useCallback(() => {
    if (!hasSelectedLanguage) {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
      } catch {
        // Ignore storage errors
      }
      setHasSelectedLanguage(true)
    }
    setIsModalOpen(false)
  }, [hasSelectedLanguage, language])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const translated = resolveDotPath(activeDict, key)
      const fallback = resolveDotPath(en, key)
      const raw = translated ?? fallback ?? key
      return interpolate(raw, params)
    },
    [activeDict]
  )

  return (
    <LanguageContext.Provider
      value={{
        language,
        suggestedLanguage,
        dir,
        hasSelectedLanguage,
        isModalOpen,
        isLoadingLocale,
        setLanguage,
        previewLanguage,
        openLanguageModal,
        closeLanguageModal,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
