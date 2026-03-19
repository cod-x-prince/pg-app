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
    const fn = () => setScrolled(window.scrollY > 40)
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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "hsl(var(--background))" : "transparent",
        boxShadow: scrolled ? "var(--shadow-soft)" : "none",
        borderBottom: scrolled ? "1px solid hsl(var(--border))" : "none",
      }}
    >
      <div className="section-wrap">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-soft transition-all duration-200 group-hover:shadow-elevated group-hover:scale-105">
              <span className="font-display font-bold text-sm text-primary-foreground tracking-tight">PG</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">PGLife</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {["Bangalore","Mumbai","Delhi","Hyderabad"].map(city => (
              <Link key={city} href={`/properties/${city.toLowerCase()}`}
                className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
                {city}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <span className="font-body text-sm text-muted-foreground mr-1">
                  {user?.name?.split(" ")[0]}
                </span>
                <Link href={dashLink()} className="btn-outline btn-sm">Dashboard</Link>
                {(user?.role === "OWNER" || user?.role === "BROKER") && user?.isApproved && (
                  <Link href="/owner/listings/new" className="btn-primary btn-sm">+ List PG</Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost btn-sm text-muted-foreground"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"  className="btn-ghost">Login</Link>
                <Link href="/auth/signup" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            className="md:hidden btn-ghost p-2 h-auto"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border pb-4 pt-3 space-y-1 bg-background">
            {session ? (
              <>
                <p className="font-body text-xs text-muted-foreground px-3 py-1">{user?.name}</p>
                <Link href={dashLink()} className="block px-3 py-2.5 font-body text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2.5 font-body text-sm rounded-lg hover:bg-muted text-muted-foreground">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login"  className="block px-3 py-2.5 font-body text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="block px-3 py-2.5 font-body text-sm font-semibold text-primary rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Get Started →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
