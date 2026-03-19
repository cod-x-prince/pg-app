"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { SessionUser } from "@/types"

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
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
    <nav className={`fixed z-50 transition-all duration-500 ${
      scrolled ? "top-4 left-4 right-4 md:left-8 md:right-8 lg:left-20 lg:right-20" : "top-0 left-0 right-0"
    }`}>
      <div className={`transition-all duration-500 ${
        scrolled
          ? "glass rounded-2xl px-5 py-3 shadow-glass"
          : "px-6 py-5 bg-transparent"
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl glass-gold flex items-center justify-center transition-all duration-300 group-hover:shadow-gold">
              <span className="font-serif text-sm font-semibold" style={{
                background: "linear-gradient(135deg, #C9A84C, #F0D080)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>PG</span>
            </div>
            <span className="font-serif text-lg font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
              PGLife
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {session ? (
              <>
                <span className="text-xs mr-2 tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {user?.name?.split(" ")[0]}
                </span>
                <Link href={dashLink()} className="btn-ghost text-xs py-2 px-5">
                  Dashboard
                </Link>
                {(user?.role === "OWNER" || user?.role === "BROKER") && user?.isApproved && (
                  <Link href="/owner/listings/new" className="btn-gold text-xs py-2 px-5 ml-1">
                    + List PG
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-xs py-2 px-5">
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-gold text-xs py-2 px-5 ml-1">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            className="md:hidden p-2 rounded-xl glass cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className="block h-px transition-all" style={{ background: menuOpen ? "var(--gold)" : "var(--text-secondary)", transform: menuOpen ? "rotate(45deg) translate(2px, 4px)" : "none" }} />
              <span className="block h-px transition-all" style={{ background: "var(--text-secondary)", opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-px transition-all" style={{ background: menuOpen ? "var(--gold)" : "var(--text-secondary)", transform: menuOpen ? "rotate(-45deg) translate(2px, -4px)" : "none" }} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
            {session ? (
              <>
                <p className="text-xs px-3 pb-1" style={{ color: "var(--text-muted)" }}>{user?.name}</p>
                <Link href={dashLink()} className="block px-3 py-2.5 text-sm rounded-xl transition-colors" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2.5 text-sm rounded-xl cursor-pointer" style={{ color: "var(--text-muted)" }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2.5 text-sm rounded-xl" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="block px-3 py-2.5 text-sm font-semibold rounded-xl" style={{ color: "var(--gold)" }} onClick={() => setMenuOpen(false)}>Get Started →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
