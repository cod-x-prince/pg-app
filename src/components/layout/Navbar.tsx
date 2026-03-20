"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { SessionUser } from "@/types"

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const dashLink = () => {
    if (!user) return "/auth/login"
    if (user.role === "ADMIN") return "/admin"
    if (user.role === "OWNER" || user.role === "BROKER") return "/owner/dashboard"
    return "/dashboard"
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? "white" : "transparent",
        borderBottom: scrolled ? "1px solid hsl(var(--border))" : "none",
        boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="section-wrap">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-display font-bold text-xs text-white tracking-tight">PG</span>
            </div>
            <span
              className="font-display font-bold text-lg transition-colors"
              style={{ color: scrolled ? "hsl(var(--foreground))" : "white", letterSpacing: "-0.02em" }}
            >
              PGLife
            </span>
          </Link>

          {/* Desktop center — city links */}
          <div className="hidden lg:flex items-center gap-1">
            {["Bangalore","Mumbai","Delhi","Hyderabad"].map(city => (
              <Link key={city} href={`/properties/${city.toLowerCase()}`}
                className="font-body text-sm px-3 py-1.5 rounded-lg transition-all duration-150"
                style={{ color: scrolled ? "hsl(var(--muted-foreground))" : "rgba(255,255,255,0.85)" }}
                onMouseOver={e => (e.currentTarget.style.background = "hsl(var(--muted))", e.currentTarget.style.color = "hsl(var(--foreground))")}
                onMouseOut={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = scrolled ? "hsl(var(--muted-foreground))" : "rgba(255,255,255,0.85)")}
              >
                {city}
              </Link>
            ))}
          </div>

          {/* Auth — right side */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <span className="font-body text-sm mr-1"
                  style={{ color: scrolled ? "hsl(var(--muted-foreground))" : "rgba(255,255,255,0.8)" }}>
                  {user?.name?.split(" ")[0]}
                </span>
                <Link href="/profile" className="btn-ghost btn-sm">Profile</Link>
                <Link href={dashLink()} className="btn-outline btn-sm"
                  style={!scrolled ? { borderColor: "rgba(255,255,255,0.5)", color: "white", background: "rgba(255,255,255,0.1)" } : {}}>
                  Dashboard
                </Link>
                {(user?.role === "OWNER" || user?.role === "BROKER") && user?.isApproved && (
                  <Link href="/owner/listings/new" className="btn-primary btn-sm">+ List PG</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="font-body text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ color: scrolled ? "hsl(var(--muted-foreground))" : "rgba(255,255,255,0.7)" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-body text-sm px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ color: scrolled ? "hsl(var(--foreground))" : "white" }}>
                  Log in
                </Link>
                <Link href="/auth/signup" className="btn-primary btn-sm">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            style={{ color: scrolled ? "hsl(var(--foreground))" : "white" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu — white always */}
        {open && (
          <div className="md:hidden border-t border-border pb-4 pt-3 space-y-1 bg-white">
            {["Bangalore","Mumbai","Delhi","Hyderabad","Pune"].map(city => (
              <Link key={city} href={`/properties/${city.toLowerCase()}`}
                className="block px-3 py-2.5 font-body text-sm text-muted-foreground hover:bg-muted rounded-lg"
                onClick={() => setOpen(false)}>{city}</Link>
            ))}
            <div className="h-px bg-border my-2" />
            {session ? (
              <>
                <Link href="/profile" className="block px-3 py-2.5 font-body text-sm text-foreground hover:bg-muted rounded-lg" onClick={() => setOpen(false)}>Profile</Link>
                <Link href={dashLink()} className="block px-3 py-2.5 font-body text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="block w-full text-left px-3 py-2.5 font-body text-sm text-muted-foreground hover:bg-muted rounded-lg cursor-pointer">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2.5 font-body text-sm text-foreground hover:bg-muted rounded-lg" onClick={() => setOpen(false)}>Log in</Link>
                <Link href="/auth/signup" className="block px-3 py-2.5 font-body text-sm font-semibold text-primary hover:bg-muted rounded-lg" onClick={() => setOpen(false)}>Sign up →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
