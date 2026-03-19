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
    <nav className={`fixed z-50 w-full transition-all duration-300 ${
      scrolled ? "bg-white shadow-sm border-b border-gray-100 py-3" : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-brand" style={{ backgroundColor: "#E25A3B" }}>
              <span className="font-serif text-sm font-bold text-white">PG</span>
            </div>
            <span className={`font-serif text-xl font-bold tracking-tight ${scrolled ? "text-gray-900" : "text-white drop-shadow-md"}`}>
              PGLife
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <span className={`text-sm font-medium mr-2 ${scrolled ? "text-gray-600" : "text-white"}`}>
                  {user?.name?.split(" ")[0]}
                </span>
                <Link href={dashLink()} className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
                  scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/20 text-white"
                }`}>
                  Dashboard
                </Link>
                {(user?.role === "OWNER" || user?.role === "BROKER") && user?.isApproved && (
                  <Link href="/owner/listings/new" className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ml-1 ${
                    scrolled ? "border-gray-200 text-gray-900 hover:border-gray-900" : "border-white/40 text-white hover:bg-white/20"
                  }`}>
                    Add Listing
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer ${
                    scrolled ? "text-gray-500 hover:bg-gray-100" : "text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-colors ${
                  scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/20 text-white"
                }`}>
                  Log in
                </Link>
                <Link href="/auth/signup" className={`text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm transition-transform hover:scale-105 ml-1 ${
                  scrolled ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                }`}>
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            className={`md:hidden p-2.5 rounded-full cursor-pointer transition-colors ${
              scrolled ? "hover:bg-gray-100" : "hover:bg-white/20"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className={`w-5 flex flex-col gap-1.5 ${scrolled ? "text-gray-900" : "text-white"}`}>
              <span className="block h-px bg-current transition-all" style={{ transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
              <span className="block h-[1.5px] bg-current transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-px bg-current transition-all" style={{ transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden mt-4 py-4 border-t ${scrolled ? "border-gray-100" : "border-white/20"} space-y-2`}>
            {session ? (
              <>
                <p className={`text-xs px-4 pb-2 font-medium ${scrolled ? "text-gray-500" : "text-white/70"}`}>Logged in as {user?.name}</p>
                <Link href={dashLink()} className={`block px-4 py-2 text-sm font-semibold rounded-lg ${scrolled ? "text-gray-900 hover:bg-gray-50" : "text-white hover:bg-white/10"}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className={`block w-full text-left px-4 py-2 text-sm font-semibold rounded-lg ${scrolled ? "text-gray-600 hover:bg-gray-50" : "text-white/80 hover:bg-white/10"}`}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`block px-4 py-2.5 text-sm font-semibold rounded-lg ${scrolled ? "text-gray-900 hover:bg-gray-50" : "text-white hover:bg-white/10"}`} onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link href="/auth/signup" className={`block px-4 py-2.5 text-sm font-semibold rounded-lg mt-1 ${scrolled ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`} onClick={() => setMenuOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
