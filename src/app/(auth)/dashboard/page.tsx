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

export default function TenantDashboard() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bookings")
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const confirmed  = bookings.filter(b => b.status === "CONFIRMED").length
  const pending    = bookings.filter(b => b.status === "PENDING").length

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen" style={{ background: "var(--ink)" }}>

        {/* Header */}
        <div style={{ background: "var(--ink2)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 reveal">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--ink)" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  Welcome back, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: bookings.length,  icon: "🏠" },
              { label: "Confirmed",      value: confirmed,         icon: "✓"  },
              { label: "Pending",        value: pending,           icon: "⏳" },
            ].map((s, i) => (
              <div key={s.label} className={`stat-card reveal reveal-d${i + 1}`}>
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="font-serif text-3xl font-semibold mb-1 text-shimmer">{s.value}</p>
                <p className="text-xs tracking-[2px] uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bookings */}
          <div className="flex items-center justify-between mb-5 reveal">
            <h2 className="font-serif text-xl font-semibold" style={{ color: "var(--text-primary)" }}>My Bookings</h2>
            <Link href="/" className="btn-ghost text-xs py-2 px-5">Find More PGs</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl skeleton shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-1/2" />
                      <div className="h-3 skeleton rounded w-1/3" />
                      <div className="h-3 skeleton rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-card rounded-3xl py-20 text-center reveal">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--gold)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 className="font-serif text-lg mb-2" style={{ color: "var(--text-primary)" }}>No bookings yet</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Find your perfect PG and book your first stay</p>
              <Link href="/" className="btn-gold">Explore PGs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const status = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING
                return (
                  <div key={b.id} className="glass-card rounded-2xl p-5 flex gap-5 transition-all reveal">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "var(--ink3)" }}>
                      {b.property.images[0] ? (
                        <Image src={b.property.images[0].url} alt={b.property.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-serif font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.property.name}</h3>
                        <span className="text-xs shrink-0 px-2.5 py-1 rounded-full font-semibold"
                          style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs flex items-center gap-1 mb-1" style={{ color: "var(--text-muted)" }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        <span className="capitalize">{b.property.city}</span>
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span>{b.room.type} Room — ₹{b.room.rent.toLocaleString()}/mo</span>
                        <span>•</span>
                        <span>Move-in: {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span className="capitalize">{b.type.toLowerCase()}</span>
                      </div>
                    </div>

                    {/* View link */}
                    <Link href={`/properties/${b.property.city.toLowerCase()}/${b.property.id}`}
                      className="shrink-0 self-center text-xs font-medium transition-colors"
                      style={{ color: "var(--gold)" }}>
                      View →
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
