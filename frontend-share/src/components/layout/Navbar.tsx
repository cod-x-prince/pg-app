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
    const onScroll = () => setScrolled(window.scrollY > 40)
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
    <nav className={`fixed z-50 transition-all duration-500 ${
      scrolled
        ? "top-4 left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16"
        : "top-0 left-0 right-0"
    }`}>
      <div className={`transition-all duration-500 ${
        scrolled
          ? "navbar-float rounded-2xl px-5 py-3"
          : "bg-transparent px-4 sm:px-6 lg:px-8 py-4"
      }`}>
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
              scrolled
                ? "bg-[#1B3B6F] shadow-sm"
                : "bg-white/20 backdrop-blur-sm border border-white/30"
            }`}>
              <span className="text-white font-bold text-sm font-sans">PG</span>
            </div>
            <span className={`font-serif text-xl font-semibold tracking-tight transition-colors duration-300 ${
              scrolled ? "text-[#1B3B6F]" : "text-white"
            }`}>PGLife</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {session ? (
              <>
                <span className={`text-sm mr-2 font-medium transition-colors ${
                  scrolled ? "text-gray-500" : "text-white/80"
                }`}>
                  Hi, {user?.name?.split(" ")[0]}
                </span>
                <Link
                  href={getDashboardLink()}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                    scrolled
                      ? "text-[#1B3B6F] hover:bg-[#EEF3FB]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Dashboard
                </Link>
                {(user?.role === "OWNER" || user?.role === "BROKER") && user?.isApproved && (
                  <Link href="/owner/listings/new" className="btn-amber text-xs py-2 px-4">
                    + List PG
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={`text-sm px-4 py-2 rounded-xl transition-all ${
                    scrolled
                      ? "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                    scrolled
                      ? "text-[#1B3B6F] hover:bg-[#EEF3FB]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-amber text-xs py-2 px-5 ml-1">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-xl transition-colors ${
              scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 transition-all ${
                menuOpen
                  ? "rotate-45 translate-y-2 " + (scrolled ? "bg-gray-700" : "bg-white")
                  : (scrolled ? "bg-gray-700" : "bg-white")
              }`} />
              <span className={`block h-0.5 transition-all ${
                menuOpen ? "opacity-0" : ""
              } ${scrolled ? "bg-gray-700" : "bg-white"}`} />
              <span className={`block h-0.5 transition-all ${
                menuOpen
                  ? "-rotate-45 -translate-y-2 " + (scrolled ? "bg-gray-700" : "bg-white")
                  : (scrolled ? "bg-gray-700" : "bg-white")
              }`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-100 pt-4 space-y-1">
            {session ? (
              <>
                <p className="text-xs text-gray-400 px-3 pb-1">Hi, {user?.name}</p>
                <Link href={getDashboardLink()} className="block px-3 py-2.5 text-sm font-medium text-[#1B3B6F] hover:bg-blue-50 rounded-xl">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2.5 text-sm font-medium text-[#1B3B6F] hover:bg-blue-50 rounded-xl">Login</Link>
                <Link href="/auth/signup" className="block px-3 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-xl">Get Started →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
