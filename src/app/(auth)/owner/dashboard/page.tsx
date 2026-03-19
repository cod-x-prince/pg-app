"use client"
import type { SessionUser } from "@/types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import Image from "next/image"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Pending",   color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  CONFIRMED: { label: "Confirmed", color: "#34D399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
  CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  COMPLETED: { label: "Completed", color: "#C9A84C", bg: "rgba(201,168,76,0.08)",  border: "rgba(201,168,76,0.2)"  },
}

export default function OwnerDashboard() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<"listings" | "bookings">("listings")

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch("/api/properties?ownerId=" + user?.id).then(r => r.json()),
      fetch("/api/owner/bookings").then(r => r.json()),
    ]).then(([props, books]) => {
      setProperties(Array.isArray(props?.properties) ? props.properties : Array.isArray(props) ? props : [])
      setBookings(Array.isArray(books) ? books : [])
      setLoading(false)
    })
  }, [session, user?.id])

  const updateBooking = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const deleteListing = async (id: string) => {
    if (!confirm("Remove this listing? This cannot be undone.")) return
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" })
    if (res.ok) {
      setProperties(prev => prev.filter(p => p.id !== id))
    } else {
      alert("Failed to delete listing. Please try again.")
    }
  }

  // Unapproved state
  if (user && !user.isApproved) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: "var(--ink)" }}>
          <div className="glass-card rounded-3xl max-w-md w-full p-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Account Under Review</h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Your account is pending admin approval. You&apos;ll receive an email once approved — usually within 24 hours.
            </p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const pendingCount = bookings.filter(b => b.status === "PENDING").length

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen" style={{ background: "var(--ink)" }}>

        {/* Header */}
        <div style={{ background: "var(--ink2)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 reveal">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--ink)" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Owner Dashboard</h1>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.name} · {user?.email}</p>
                </div>
              </div>
              <Link href="/owner/listings/new" className="btn-gold text-xs py-2.5 px-6">
                + Add New PG
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Listings", value: properties.length,                                      icon: "🏠" },
              { label: "Total Bookings", value: bookings.length,                                        icon: "📋" },
              { label: "Pending Review", value: pendingCount,                                           icon: "⏳" },
              { label: "Confirmed",      value: bookings.filter(b => b.status === "CONFIRMED").length,  icon: "✓"  },
            ].map((s, i) => (
              <div key={s.label} className={`stat-card reveal reveal-d${i + 1}`} style={s.label === "Pending Review" && pendingCount > 0 ? { borderColor: "rgba(245,158,11,0.3)" } : {}}>
                {s.label === "Pending Review" && pendingCount > 0 && (
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
            {(["listings", "bookings"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="relative px-6 py-2.5 text-sm font-medium rounded-xl transition-all capitalize cursor-pointer"
                style={{
                  background: tab === t ? "var(--gold-dim)" : "transparent",
                  border: tab === t ? "1px solid var(--border-gold)" : "1px solid transparent",
                  color: tab === t ? "var(--gold)" : "var(--text-muted)",
                }}>
                {t}
                {t === "bookings" && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <div className="h-44 skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 skeleton rounded w-2/3" />
                    <div className="h-3 skeleton rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "listings" ? (
            properties.length === 0 ? (
              <div className="glass-card rounded-3xl py-20 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--gold)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <h3 className="font-serif text-lg mb-2" style={{ color: "var(--text-primary)" }}>No listings yet</h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Add your first PG and start receiving bookings</p>
                <Link href="/owner/listings/new" className="btn-gold">Add Your First PG</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((p) => (
                  <div key={p.id} className="glass-card rounded-2xl overflow-hidden transition-all">
                    <div className="h-44 relative" style={{ background: "var(--ink3)" }}>
                      {p.images?.[0] ? (
                        <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)", fontSize: "2rem" }}>🏠</div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {p.isVerified && (
                          <span className="badge-verified">✓ Verified</span>
                        )}
                        {!p.isActive && (
                          <span className="badge-dark" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}>Delisted</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-medium truncate mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                      <p className="text-xs capitalize mb-3 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        {p.city}
                      </p>
                      <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                        <Link href={`/properties/${p.city.toLowerCase()}/${p.id}`}
                          className="text-xs font-medium transition-colors" style={{ color: "var(--gold)" }}>
                          View Listing
                        </Link>
                        <span style={{ color: "var(--border)" }}>|</span>
                        <button onClick={() => deleteListing(p.id)}
                          className="text-xs transition-colors cursor-pointer" style={{ color: "#EF4444" }}>
                          Delist
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            bookings.length === 0 ? (
              <div className="glass-card rounded-3xl py-20 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-serif text-lg mb-2" style={{ color: "var(--text-primary)" }}>No bookings yet</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bookings from tenants will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const status = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING
                  return (
                    <div key={b.id} className="glass-card rounded-2xl p-5" style={b.status === "PENDING" ? { borderColor: "rgba(245,158,11,0.2)" } : {}}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          {/* Tenant info */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif text-xs font-bold shrink-0"
                              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--ink)" }}>
                              {b.tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{b.tenant.name}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{b.tenant.email}{b.tenant.phone ? ` · ${b.tenant.phone}` : ""}</p>
                            </div>
                          </div>
                          {/* Booking details */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pl-12" style={{ color: "var(--text-muted)" }}>
                            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{b.property.name}</span>
                            <span>{b.room.type} Room · ₹{b.room.rent.toLocaleString()}/mo</span>
                            <span>Move-in: {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span className="capitalize">{b.type.toLowerCase()}</span>
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                            {status.label}
                          </span>
                          {b.status === "PENDING" && (
                            <>
                              <button onClick={() => updateBooking(b.id, "CONFIRMED")}
                                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl transition-colors font-medium cursor-pointer">
                                Confirm
                              </button>
                              <button onClick={() => updateBooking(b.id, "CANCELLED")}
                                className="text-xs bg-red-400 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl transition-colors font-medium cursor-pointer">
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
