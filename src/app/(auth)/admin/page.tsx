"use client"
import type { SessionUser } from "@/types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import Image from "next/image"

const ROLE_BADGE: Record<string, string> = {
  OWNER:  "bg-blue-light text-[#1B3B6F]",
  BROKER: "bg-amber-light text-amber-700",
}

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
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-card max-w-sm w-full p-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🚫</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F] mb-2">Access Denied</h1>
            <p className="text-gray-400 text-sm mb-6">This page is only accessible to platform admins.</p>
            <Link href="/" className="btn-primary w-full justify-center py-3">Go Home</Link>
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
    { label: "Pending Approvals", value: pending.length,      icon: "⏳", style: pending.length > 0 ? "bg-amber-light" : "bg-white",  alert: pending.length > 0 },
    { label: "Total Listings",    value: properties.length,   icon: "🏠", style: "bg-white",     alert: false },
    { label: "Verified PGs",      value: verifiedCount,       icon: "✅", style: "bg-green-50",  alert: false },
    { label: "Delisted",          value: delistedCount,       icon: "🚫", style: delistedCount > 0 ? "bg-red-50" : "bg-white", alert: false },
  ]

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1B3B6F] rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F]">Admin Panel</h1>
                <p className="text-gray-400 text-sm">Platform management · Logged in as {user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STATS.map(s => (
              <div key={s.label} className={`${s.style} rounded-2xl border ${s.alert ? "border-amber-200" : "border-gray-100"} p-5 shadow-card relative`}>
                {s.alert && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="font-serif text-3xl font-semibold text-[#1B3B6F]">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit mb-6">
            {(["approvals", "properties"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  tab === t ? "bg-white text-[#1B3B6F] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
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
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="font-serif text-lg text-[#1B3B6F] mb-2">All caught up!</h3>
                <p className="text-gray-400 text-sm">No pending owner or broker approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(u => (
                  <div key={u.id} className="bg-white rounded-2xl border border-amber-100 shadow-card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-[#1B3B6F] rounded-xl flex items-center justify-center text-white font-serif text-lg font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <span className={`badge text-xs ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                              {u.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{u.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
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
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                          Approve
                        </button>
                        <button onClick={() => approveOwner(u.id, false)}
                          className="flex items-center gap-1.5 bg-red-400 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
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
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or city..."
                  className="input pl-10 max-w-sm"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    Clear
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
                  <p className="text-gray-400 text-sm">No properties found{search ? ` for "${search}"` : ""}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 mb-2">
                    Showing {filteredProperties.length} of {properties.length} listings
                  </p>
                  {filteredProperties.map(p => (
                    <div key={p.id} className={`bg-white rounded-2xl border shadow-card p-5 transition-colors ${
                      !p.isActive ? "border-red-100 opacity-70" : "border-gray-100"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                          {p.images?.[0] ? (
                            <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">🏠</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                            {p.isVerified && (
                              <span className="badge bg-green-50 text-green-700 text-xs">✓ Verified</span>
                            )}
                            {!p.isActive && (
                              <span className="badge bg-red-50 text-red-500 text-xs">Delisted</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 capitalize flex items-center gap-2">
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
                              className="text-[#1B3B6F] hover:underline font-medium">
                              View →
                            </Link>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0 pl-20 sm:pl-0">
                          <button onClick={() => toggleVerified(p.id, p.isVerified)}
                            className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                              p.isVerified
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}>
                            {p.isVerified ? "Unverify" : "Verify"}
                          </button>
                          <button onClick={() => toggleActive(p.id, p.isActive)}
                            className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                              p.isActive
                                ? "bg-red-400 text-white hover:bg-red-500"
                                : "bg-[#1B3B6F] text-white hover:bg-[#254E99]"
                            }`}>
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
