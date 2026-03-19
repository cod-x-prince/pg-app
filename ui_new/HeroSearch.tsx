"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

const SUGGESTIONS = [
  { city: "Bangalore", label: "Koramangala, Bangalore",   tag: "IT Hub" },
  { city: "Bangalore", label: "Indiranagar, Bangalore",    tag: "Trendy" },
  { city: "Bangalore", label: "Electronic City, Bangalore",tag: "Tech Park" },
  { city: "Mumbai",    label: "Andheri, Mumbai",           tag: "Finance" },
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

  const go = (city: string) => {
    setFocused(false)
    router.push(`/properties/${city.toLowerCase()}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const match = SUGGESTIONS.find(s =>
      s.label.toLowerCase().includes(value.toLowerCase()) ||
      s.city.toLowerCase() === value.toLowerCase().trim()
    )
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
    <div className="relative w-full" onKeyDown={handleKey}>
      <form
        onSubmit={handleSubmit}
        className="flex rounded-xl overflow-hidden transition-all duration-200"
        style={{
          boxShadow: focused ? "var(--shadow-elevated)" : "var(--shadow-soft)",
          border: `1px solid ${focused ? "hsl(var(--primary)/0.4)" : "hsl(var(--border))"}`,
          background: "hsl(var(--popover))",
        }}
      >
        <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
          <svg
            className="w-4 h-4 shrink-0 transition-colors duration-200"
            style={{ color: focused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
          <input
            ref={inputRef}
            value={value}
            onChange={e => { setValue(e.target.value); setHovered(-1) }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search city — Bangalore, Mumbai, Delhi..."
            className="w-full font-body text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
            autoComplete="off"
          />
          {value && (
            <button type="button" onClick={() => { setValue(""); inputRef.current?.focus() }}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary rounded-none rounded-r-xl px-7 text-sm font-display font-semibold shrink-0">
          Search
        </button>
      </form>

      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-elevated)" }}>
          <div className="p-2">
            {filtered.map((s, i) => (
              <button key={i} type="button"
                onMouseDown={() => go(s.city)}
                onMouseEnter={() => setHovered(i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer"
                style={{ background: hovered === i ? "hsl(var(--muted))" : "transparent" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: hovered === i ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))" }}>
                    <svg className="w-3 h-3" style={{ color: hovered === i ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                  </div>
                  <span className="font-body text-sm text-foreground">{s.label}</span>
                </div>
                <span className="badge-primary text-[10px] shrink-0">{s.tag}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-border">
            {["Bangalore","Mumbai","Delhi","Hyderabad","Pune","Jammu"].map(city => (
              <button key={city} type="button" onMouseDown={() => go(city)}
                className="badge-default hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-[11px]">
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
