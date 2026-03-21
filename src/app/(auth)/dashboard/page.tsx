"use client"
import type { SessionUser } from "@/types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import Image from "next/image"

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Pending",   cls: "badge-pending" },
  CONFIRMED: { label: "Confirmed", cls: "badge-success" },
  CANCELLED: { label: "Cancelled", cls: "badge-danger" },
  COMPLETED: { label: "Completed", cls: "badge-default" },
}

export default function TenantDashboard() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch("/api/bookings")
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length
  const pending   = bookings.filter(b => b.status === "PENDING").length

  return (
    <>
      <Navbar forceWhite />
      <main>
      <div className="min-h-screen bg-background pt-16">

        {/* Header */}
        <div className="bg-popover border-b border-border">
          <div className="section-wrap py-8">
            <div className="flex items-center gap-4">
              <div className="avatar h-14 w-14 bg-primary text-primary-foreground font-display font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
                  Welcome back, {user?.name?.split(" ")[0]}
                </h1>
                <p className="font-body text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-wrap py-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: bookings.length, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              )},
              { label: "Confirmed",      value: confirmed,        icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )},
              { label: "Pending",        value: pending,          icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )},
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-3xl text-foreground tabular-nums">{s.value}</span>
                  <span className="text-muted-foreground">{s.icon}</span>
                </div>
                <p className="font-body text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bookings list */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-xl text-foreground">My Bookings</h2>
            <Link href="/" className="btn-outline btn-sm">Find More PGs</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl h-24 skeleton" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl bg-popover shadow-soft p-12 text-center">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">No bookings yet</h3>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Start exploring PGs in your city.
              </p>
              <Link href="/properties/bangalore" className="btn-primary">Browse PGs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const s = STATUS[b.status] ?? STATUS.PENDING
                const img = b.property?.images?.[0]?.url
                return (
                  <div key={b.id} className="rounded-xl bg-popover shadow-soft p-5 flex items-center gap-5">
                    {img && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <Image src={img} alt={b.property.name} fill className="object-cover" sizes="80px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display font-semibold text-base text-foreground truncate">{b.property?.name}</h3>
                        <span className={`${s.cls} shrink-0`}>{s.label}</span>
                      </div>
                      <p className="font-body text-sm text-muted-foreground mb-1">{b.property?.city}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-body text-xs text-muted-foreground">{b.room?.type}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-display font-semibold text-sm text-foreground">
                          ₹{b.room?.rent?.toLocaleString("en-IN")}/mo
                        </span>
                        {b.tokenPaid && <span className="badge-success text-[10px]">Token Paid</span>}
                      </div>
                    </div>
                    <Link href={`/properties/${b.property?.city?.toLowerCase()}/${b.property?.id}`}
                      className="btn-outline btn-sm shrink-0">View</Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </>
  )
}
