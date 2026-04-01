"use client"
import { useCookieConsent } from "@/contexts/CookieConsentContext"
import Link from "next/link"

export default function CookieConsent() {
  const { showBanner, acceptAll, rejectAll, acceptNecessary } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-gray-200 shadow-2xl"
      role="dialog"
      aria-label="Cookie consent banner"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 className="font-display font-semibold text-sm text-foreground">We value your privacy</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to improve your experience, analyze traffic, and personalize content. 
              By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or reject non-essential cookies.{" "}
              <Link href="/cookies-policy" className="text-primary hover:underline font-medium">
                Learn more
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={acceptNecessary}
              className="btn-outline btn-sm text-xs px-3 py-1.5"
              aria-label="Accept necessary cookies only"
            >
              Necessary Only
            </button>
            <button
              onClick={rejectAll}
              className="btn-outline btn-sm text-xs px-3 py-1.5"
              aria-label="Reject all cookies"
            >
              Reject All
            </button>
            <button
              onClick={acceptAll}
              className="btn-primary btn-sm text-xs px-4 py-1.5"
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
