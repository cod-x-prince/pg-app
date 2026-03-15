"use client"
import { useEffect, useState } from "react"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1800)
    const t2 = setTimeout(() => setVisible(false), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`page-loader ${leaving ? "page-loader-out" : ""}`} aria-hidden="true">
      {/* Noise grain texture */}
      <div className="loader-grain" />

      {/* Center logo */}
      <div className="loader-content">
        <div className="loader-logo">
          <div className="loader-logo-box">
            <span>PG</span>
          </div>
          <span className="loader-logo-text">PGLife</span>
        </div>

        {/* Progress bar */}
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>

        <p className="loader-tagline">Find Your Perfect Home Away from Home</p>
      </div>

      {/* Curtain panels */}
      <div className="loader-panel loader-panel-left"  />
      <div className="loader-panel loader-panel-right" />
    </div>
  )
}
