"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const getDashboardLink = () => {
    if (!user) return "/auth/login"
    if (user.role === "ADMIN") return "/admin"
    if (user.role === "OWNER" || user.role === "BROKER") return "/owner/dashboard"
    return "/dashboard"
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#1B3B6F] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#254E99] transition-colors">
              <span className="text-white font-bold text-sm font-sans">PG</span>
            </div>
            <span className={`font-serif text-xl font-semibold tracking-tight transition-colors ${
              scrolled ? "text-[#1B3B6F]" : "text-white"
            }`}>PGLife</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <span className={`text-sm mr-1 transition-colors ${scrolled ? "text-gray-500" : "text-white/80"}`}>
                  Hi, {user?.name?.split(" ")[0]}
                </span>
                <Link href={getDashboardLink()}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                    scrolled ? "text-[#1B3B6F] hover:bg-blue-light" : "text-white hover:bg-white/10"
                  }`}>
                  Dashboard
                </Link>
                {(user?.role === "OWNER" || user?.role === "BROKER") && user?.isApproved && (
                  <Link href="/owner/listings/new" className="btn-amber text-sm">
                    + List PG
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className={`text-sm px-4 py-2 rounded-xl transition-all ${
                    scrolled ? "text-gray-500 hover:text-gray-700 hover:bg-gray-50" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                    scrolled ? "text-[#1B3B6F] hover:bg-blue-light" : "text-white hover:bg-white/10"
                  }`}>
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-amber text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 transition-colors ${scrolled ? "bg-gray-700" : "bg-white"}`}></span>
              <span className={`block w-5 h-0.5 transition-colors ${scrolled ? "bg-gray-700" : "bg-white"}`}></span>
              <span className={`block w-5 h-0.5 transition-colors ${scrolled ? "bg-gray-700" : "bg-white"}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-2 space-y-1 rounded-b-2xl shadow-lg">
            {session ? (
              <>
                <Link href={getDashboardLink()} className="block px-4 py-2.5 text-sm font-medium text-[#1B3B6F] hover:bg-blue-light rounded-xl">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-4 py-2.5 text-sm font-medium text-[#1B3B6F] hover:bg-blue-light rounded-xl">Login</Link>
                <Link href="/auth/signup" className="block px-4 py-2.5 text-sm font-medium text-[#F59E0B] hover:bg-amber-light rounded-xl">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
