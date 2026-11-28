export type SupportedLanguage = 'en' | 'es' | 'fr' | 'nl' | 'hi' | 'bn' | 'ar'

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  dir: 'ltr' | 'rtl'
  badge: string
  greeting: string
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    badge: 'EN',
    greeting: 'Global Standard',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    badge: 'ES',
    greeting: 'Idioma Español',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    badge: 'FR',
    greeting: 'Langue Française',
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    dir: 'ltr',
    badge: 'NL',
    greeting: 'Nederlandse Taal',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    badge: 'HI',
    greeting: 'हिन्दी भाषा',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    dir: 'ltr',
    badge: 'BN',
    greeting: 'বাংলা ভাষা',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    badge: 'AR',
    greeting: 'اللغة العربية',
  },
] as const

export const LANGUAGE_STORAGE_KEY = 'pgx_preferred_language'

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  if (!value) return false
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === value.toLowerCase())
}

export function getLanguageMeta(code: SupportedLanguage): LanguageOption {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
}

export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'en'
  const candidates = [...(navigator.languages || []), navigator.language].filter(Boolean)
  for (const raw of candidates) {
    const primary = raw.toLowerCase().split('-')[0]
    if (isSupportedLanguage(primary)) {
      return primary
    }
  }
  return 'en'
}
