"use client"
import { SessionProvider } from "next-auth/react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CookieConsentProvider } from "@/contexts/CookieConsentContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <CookieConsentProvider>
          {children}
        </CookieConsentProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
