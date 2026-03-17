"use client"
import { useEffect, useState } from "react"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2000)
    const t2 = setTimeout(() => setVisible(false), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`page-loader ${leaving ? "page-loader-out" : ""}`} aria-hidden="true">
      <div className="loader-content">
        <div className="loader-logo-mark">
          <span>PG</span>
        </div>
        <div className="loader-wordmark">PGLife</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", fontFamily: "Josefin Sans, sans-serif", marginTop: "4px" }}>
          Find your home
        </p>
      </div>
    </div>
  )
}
