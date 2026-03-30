"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface CookieConsentContextType {
  hasConsent: boolean | null
  acceptAll: () => void
  rejectAll: () => void
  acceptNecessary: () => void
  showBanner: boolean
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void
  }
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent")
    if (stored !== null) {
      setHasConsent(stored === "true")
      setShowBanner(false)
      return undefined
    } else {
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "true")
    setHasConsent(true)
    setShowBanner(false)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "granted" })
    }
  }

  const rejectAll = () => {
    localStorage.setItem("cookie-consent", "false")
    setHasConsent(false)
    setShowBanner(false)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "denied" })
    }
  }

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary")
    setHasConsent(false)
    setShowBanner(false)
  }

  return (
    <CookieConsentContext.Provider value={{ hasConsent, acceptAll, rejectAll, acceptNecessary, showBanner }}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider")
  }
  return context
}
