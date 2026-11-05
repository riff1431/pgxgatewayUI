import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminApi, type SystemConfigData } from '@/lib/adminApi'

interface BrandingContextType {
  branding: SystemConfigData
  updateLocalBranding: (newConfig: Partial<SystemConfigData>) => void
  refreshBranding: () => Promise<void>
}

const defaultBranding: SystemConfigData = {
  siteName: 'PGX Gateway',
  logoUrl: '',
  faviconUrl: '/favicon.svg',
  supportEmail: 'Register@pgxgateway.com',
  supportPhone: '+1 (800) 749-4283',
  supportTelegram: '@pgxsupport',
  supportWhatsapp: '+1 (800) 749-4283',
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  updateLocalBranding: () => {},
  refreshBranding: async () => {},
})

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<SystemConfigData>(defaultBranding)

  const refreshBranding = async () => {
    try {
      const data = await adminApi.getPublicConfig()
      if (data) {
        setBranding((prev) => ({ ...prev, ...data }))
      }
    } catch {
      // Use defaults on network fallback
    }
  }

  useEffect(() => {
    let isSubscribed = true
    const load = async () => {
      try {
        const data = await adminApi.getPublicConfig()
        if (isSubscribed && data) {
          setBranding((prev) => ({ ...prev, ...data }))
        }
      } catch {
        // Fallback
      }
    }
    void load()
    return () => {
      isSubscribed = false
    }
  }, [])

  // Sync document title and favicon dynamically
  useEffect(() => {
    if (branding.siteName) {
      document.title = `${branding.siteName} - Next-Gen Payment Gateway`
    }
    if (branding.faviconUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
      if (link) {
        link.href = branding.faviconUrl
      } else {
        const newLink = document.createElement('link')
        newLink.rel = 'shortcut icon'
        newLink.href = branding.faviconUrl
        document.head.appendChild(newLink)
      }
    }
  }, [branding.siteName, branding.faviconUrl])

  const updateLocalBranding = (newConfig: Partial<SystemConfigData>) => {
    setBranding((prev) => ({ ...prev, ...newConfig }))
  }

  return (
    <BrandingContext.Provider value={{ branding, updateLocalBranding, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  return useContext(BrandingContext)
}
