"use client"
import type { SessionUser } from "@/types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import Image from "next/image"

type Tab = "approvals" | "properties"

export default function AdminPanel() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined

  const [tab, setTab]             = useState<Tab>("approvals")
  const [pending, setPending]     = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (user?.role !== "ADMIN") return
    Promise.all([
      fetch("/api/admin/owners").then(r => r.json()),
      fetch("/api/properties?limit=200").then(r => r.json()),
    ]).then(([owners, props]) => {
      setPending(Array.isArray(owners) ? owners : [])
      const list = props?.properties ?? props
      setProperties(Array.isArray(list) ? list : [])
      setLoading(false)
    })
  }, [session, user?.role])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const approveOwner = async (id: string, approved: boolean) => {
    const res = await fetch(`/api/admin/owners/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    })
    if (res.ok) {
      setPending(prev => prev.filter(u => u.id !== id))
      showToast(approved ? "Owner approved successfully" : "Owner rejected")
    } else showToast("Action failed", "error")
  }

  const toggleVerified = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current }),
    })
    if (res.ok) {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, isVerified: !current } : p))
      showToast(!current ? "Property verified" : "Verification removed")
    } else showToast("Action failed", "error")
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p))
      showToast(!current ? "Property relisted" : "Property delisted")
    } else showToast("Action failed", "error")
  }

  // Access denied
  if (session && user?.role !== "ADMIN") {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: "var(--ink)" }}>
          <div className="glass-card rounded-3xl max-w-sm w-full p-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-3xl">🚫</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Access Denied</h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>This page is only accessible to platform admins.</p>
            <Link href="/" className="btn-gold w-full justify-center py-3">Go Home</Link>
          </div>
        </div>
      </>
    )
  }

  const filteredProperties = properties.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  )

  const verifiedCount  = properties.filter(p => p.isVerified).length
  const delistedCount  = properties.filter(p => !p.isActive).length

  const STATS = [
    { label: "Pending Approvals", value: pending.length,      icon: "⏳", alert: pending.length > 0 },
    { label: "Total Listings",    value: properties.length,   icon: "🏠", alert: false },
    { label: "Verified PGs",      value: verifiedCount,       icon: "✓",  alert: false },
    { label: "Delisted",          value: delistedCount,       icon: "🚫", alert: false },
  ]

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen" style={{ background: "var(--ink)" }}>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ background: "var(--ink2)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 reveal">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center glass-gold">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--gold)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Admin Panel</h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Platform management · Logged in as {user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STATS.map((s, i) => (
              <div key={s.label} className={`stat-card relative reveal reveal-d${i + 1}`}
                style={s.alert ? { borderColor: "rgba(245,158,11,0.3)" } : {}}>
                {s.alert && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ background: "#EF4444" }} />
                )}
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="font-serif text-3xl font-semibold mb-1 text-shimmer">{s.value}</p>
                <p className="text-xs tracking-[2px] uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl w-fit mb-6" style={{ background: "var(--ink2)", border: "1px solid var(--border)" }}>
            {(["approvals", "properties"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="relative px-6 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer"
                style={{
                  background: tab === t ? "var(--gold-dim)" : "transparent",
                  border: tab === t ? "1px solid var(--border-gold)" : "1px solid transparent",
                  color: tab === t ? "var(--gold)" : "var(--text-muted)",
                }}>
                {t === "approvals" ? "Pending Approvals" : "All Listings"}
                {t === "approvals" && pending.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── APPROVALS TAB ──────────────────────────────────────────── */}
          {tab === "approvals" && (
            loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5 flex gap-4">
                    <div className="w-12 h-12 skeleton rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-1/3" />
                      <div className="h-3 skeleton rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pending.length === 0 ? (
              <div className="glass-card rounded-3xl py-20 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)" }}>
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="font-serif text-lg mb-2" style={{ color: "var(--text-primary)" }}>All caught up!</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No pending owner or broker approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(u => (
                  <div key={u.id} className="glass-card rounded-2xl p-5" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--ink)" }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                            <span className="badge-gold text-[9px]">{u.role}</span>
                          </div>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                          <p className="text-xs mt-0.5 flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
                            {u.phone ? (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                {u.phone}
                              </span>
                            ) : "No phone provided"}
                            <span>Registered {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0 pl-16 sm:pl-0">
                        <button onClick={() => approveOwner(u.id, true)}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                          Approve
                        </button>
                        <button onClick={() => approveOwner(u.id, false)}
                          className="flex items-center gap-1.5 bg-red-400 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── PROPERTIES TAB ─────────────────────────────────────────── */}
          {tab === "properties" && (
            <>
              {/* Search */}
              <div className="relative mb-5">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or city..."
                  className="input-dark pl-10 max-w-sm"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer transition-colors"
                    style={{ color: "var(--text-muted)" }}>
                    Clear
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5 flex gap-4">
                      <div className="w-16 h-16 skeleton rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton rounded w-1/3" />
                        <div className="h-3 skeleton rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="glass-card rounded-3xl py-16 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No properties found{search ? ` for "${search}"` : ""}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                    Showing {filteredProperties.length} of {properties.length} listings
                  </p>
                  {filteredProperties.map(p => (
                    <div key={p.id} className="glass-card rounded-2xl p-5 transition-all" style={!p.isActive ? { opacity: 0.7, borderColor: "rgba(239,68,68,0.15)" } : {}}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "var(--ink3)" }}>
                          {p.images?.[0] ? (
                            <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl" style={{ color: "var(--text-muted)" }}>🏠</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                            {p.isVerified && (
                              <span className="badge-verified text-[9px]">✓ Verified</span>
                            )}
                            {!p.isActive && (
                              <span className="badge-dark text-[9px]" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}>Delisted</span>
                            )}
                          </div>
                          <p className="text-xs capitalize flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              </svg>
                              {p.city}
                            </span>
                            <span>·</span>
                            <span>{p.gender?.charAt(0) + p.gender?.slice(1).toLowerCase()}</span>
                            <span>·</span>
                            <Link href={`/properties/${p.city?.toLowerCase()}/${p.id}`}
                              className="font-medium transition-colors" style={{ color: "var(--gold)" }}>
                              View →
                            </Link>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0 pl-20 sm:pl-0">
                          <button onClick={() => toggleVerified(p.id, p.isVerified)}
                            className="text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                            style={p.isVerified ? { background: "var(--glass-bg)", border: "1px solid var(--border)", color: "var(--text-muted)" } : { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399" }}>
                            {p.isVerified ? "Unverify" : "Verify"}
                          </button>
                          <button onClick={() => toggleActive(p.id, p.isActive)}
                            className="text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                            style={p.isActive ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" } : { background: "var(--gold-dim)", border: "1px solid var(--border-gold)", color: "var(--gold)" }}>
                            {p.isActive ? "Delist" : "Relist"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
