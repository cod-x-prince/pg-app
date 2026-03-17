"use client"
import { useEffect, useRef } from "react"

interface Props {
  onVerify: (token: string) => void
  onError?: () => void
}

declare global {
  interface Window {
    turnstile: {
      render: (el: HTMLElement, opts: object) => string
      reset:  (id: string) => void
    }
    onloadTurnstileCallback: () => void
  }
}

export default function TurnstileWidget({ onVerify, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId     = useRef<string>("")

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey || !containerRef.current) return

    const render = () => {
      if (!containerRef.current) return
      widgetId.current = window.turnstile?.render(containerRef.current, {
        sitekey:  siteKey,
        theme:    "light",
        callback: onVerify,
        "error-callback": onError,
      })
    }

    if (window.turnstile) {
      render()
    } else {
      window.onloadTurnstileCallback = render
      const script = document.createElement("script")
      script.src   = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
      script.async = true
      document.head.appendChild(script)
    }

    return () => {
      if (widgetId.current) window.turnstile?.reset(widgetId.current)
    }
  }, [onVerify, onError])

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) return null // Gracefully disabled if no key

  return <div ref={containerRef} className="mt-4" />
}
