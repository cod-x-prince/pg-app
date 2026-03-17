"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

const SUGGESTIONS = [
  { city: "Bangalore", label: "Koramangala, Bangalore", tag: "IT Hub" },
  { city: "Bangalore", label: "Indiranagar, Bangalore", tag: "Trendy" },
  { city: "Bangalore", label: "Electronic City, Bangalore", tag: "Tech Park" },
  { city: "Mumbai",    label: "Andheri, Mumbai",          tag: "Finance" },
  { city: "Mumbai",    label: "Bandra, Mumbai",            tag: "Premium" },
  { city: "Delhi",     label: "Greater Kailash, Delhi",    tag: "Upscale" },
  { city: "Hyderabad", label: "HITEC City, Hyderabad",     tag: "IT Hub" },
  { city: "Pune",      label: "Kothrud, Pune",             tag: "Education" },
  { city: "Jammu",     label: "Gandhi Nagar, Jammu",       tag: "Heritage" },
]

export default function HeroSearch() {
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value,   setValue]   = useState("")
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(-1)

  const filtered = value.length > 0
    ? SUGGESTIONS.filter(s => s.label.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTIONS.slice(0, 6)

  const go = (city: string) => router.push(`/properties/${city.toLowerCase()}`)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const match = SUGGESTIONS.find(s => s.label.toLowerCase().includes(value.toLowerCase()) || s.city.toLowerCase() === value.toLowerCase().trim())
    if (match) go(match.city)
    else if (value.trim()) go(value.trim())
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHovered(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHovered(h => Math.max(h - 1, -1)) }
    if (e.key === "Enter" && hovered >= 0) { e.preventDefault(); go(filtered[hovered].city) }
    if (e.key === "Escape") { setFocused(false); inputRef.current?.blur() }
  }

  return (
    <div className="relative" onKeyDown={handleKey}>
      {/* Glow ring */}
      <div className={`absolute -inset-px rounded-2xl transition-opacity duration-500 ${focused ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(135deg, var(--gold), transparent, var(--gold))", filter: "blur(1px)" }} />

      <form onSubmit={handleSubmit} className="relative flex rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${focused ? "var(--border-gold)" : "var(--border)"}`, backdropFilter: "blur(20px)", transition: "border-color 0.3s ease" }}>
        {/* Input */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4">
          <svg className="w-4 h-4 shrink-0 transition-colors duration-300" style={{ color: focused ? "var(--gold)" : "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
          <input
            ref={inputRef}
            value={value}
            onChange={e => { setValue(e.target.value); setHovered(-1) }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search city — Bangalore, Mumbai, Delhi..."
            className="w-full text-sm bg-transparent outline-none font-sans"
            style={{ color: "var(--text-primary)", fontWeight: 400, letterSpacing: "0.02em" }}
            autoComplete="off"
          />
          {value && (
            <button type="button" onClick={() => { setValue(""); inputRef.current?.focus() }}
              className="cursor-pointer transition-colors" style={{ color: "var(--text-muted)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="btn-gold rounded-none rounded-r-2xl px-6 py-4 text-xs" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
          Search PGs
        </button>
      </form>

      {/* Dropdown */}
      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
          style={{ background: "var(--ink2)", border: "1px solid var(--border-gold)", backdropFilter: "blur(20px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
          <div className="p-2">
            {filtered.map((s, i) => (
              <button key={i} type="button"
                onMouseDown={() => go(s.city)}
                onMouseEnter={() => setHovered(i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer"
                style={{ background: hovered === i ? "var(--glass-hover)" : "transparent" }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: hovered === i ? "var(--gold-dim)" : "var(--glass-bg)", border: "1px solid var(--border)" }}>
                    <svg className="w-3 h-3" style={{ color: hovered === i ? "var(--gold)" : "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-sans" style={{ color: hovered === i ? "var(--text-primary)" : "var(--text-secondary)" }}>{s.label}</span>
                </div>
                <span className="badge-gold text-[9px]">{s.tag}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderTop: "1px solid var(--border)" }}>
            {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Jammu"].map(city => (
              <button key={city} type="button" onMouseDown={() => go(city)}
                className="badge-dark hover:badge-gold transition-all duration-150 cursor-pointer" style={{ letterSpacing: "1px" }}>
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
