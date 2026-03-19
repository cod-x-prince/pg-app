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
        <div className="loader-mark"><span>PG</span></div>
        <div className="loader-wordmark">PGLife</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
        <p className="mt-3 font-body text-xs text-muted-foreground tracking-widest uppercase">
          Finding your home
        </p>
      </div>
    </div>
  )
}
