"use client"
import { useEffect, useState } from "react"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1600)
    const t2 = setTimeout(() => setVisible(false), 2100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`page-loader ${leaving ? "page-loader-out" : ""}`} aria-hidden="true">
      <div className="flex flex-col items-center" style={{ animation: "fade-up 0.4s ease forwards" }}>
        <div className="loader-mark">
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <path d="M13 2L22 8V22H16V15H13V22H4V8L13 2Z" fill="white" opacity=".95"/>
            <rect x="13" y="15" width="4" height="7" rx="1.5" fill="white"/>
          </svg>
        </div>
        <div className="loader-wordmark">Gharam</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
        <p className="mt-3 font-body text-xs text-muted-foreground tracking-widest uppercase">
          Stay where it feels right
        </p>
      </div>
    </div>
  )
}
