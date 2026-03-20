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
    if (res.ok) setProperties(prev => prev.filter(p => p.id !== id))
    else alert("Failed to delete listing. Please try again.")
  }

  if (user && !user.isApproved) {
    return (
      <>
        <Navbar />
        <main>
          <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
          <div className="rounded-2xl bg-popover shadow-elevated max-w-md w-full p-10 text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-3">Account Under Review</h1>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Your owner account is pending admin approval. You&apos;ll receive an email once approved — usually within 24 hours.
            </p>
          </div>
        </div>
        </main>
        <Footer />
      </>
    )
  }

  const pendingCount = bookings.filter(b => b.status === "PENDING").length

  return (
    <>
      <Navbar />
      <main>
      <div className="min-h-screen bg-background pt-16">

        {/* Header */}
        <div className="bg-popover border-b border-border">
          <div className="section-wrap py-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="avatar h-14 w-14 bg-secondary text-secondary-foreground font-display font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="font-display font-bold text-2xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
                      {user?.name?.split(" ")[0]}&apos;s Dashboard
                    </h1>
                    <span className="badge-primary">Owner</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Link href="/owner/listings/new" className="btn-primary shrink-0">+ Add Listing</Link>
            </div>
          </div>
        </div>

        <div className="section-wrap py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "My Listings",       value: properties.length },
              { label: "Total Bookings",     value: bookings.length },
              { label: "Pending Bookings",   value: pendingCount },
              { label: "Confirmed Bookings", value: bookings.filter(b => b.status === "CONFIRMED").length },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="font-display font-bold text-3xl text-foreground tabular-nums block mb-1">{s.value}</span>
                <p className="font-body text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
            <button onClick={() => setTab("listings")} className={tab === "listings" ? "tab-btn-active" : "tab-btn-inactive"}>
              My Listings ({properties.length})
            </button>
            <button onClick={() => setTab("bookings")} className={tab === "bookings" ? "tab-btn-active" : "tab-btn-inactive"}>
              Bookings {pendingCount > 0 && <span className="badge-danger ml-1 text-[10px]">{pendingCount}</span>}
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="rounded-xl h-24 skeleton" />)}
            </div>
          ) : tab === "listings" ? (
            properties.length === 0 ? (
              <div className="rounded-xl bg-popover shadow-soft p-12 text-center">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">No listings yet</h3>
                <p className="font-body text-sm text-muted-foreground mb-6">Create your first PG listing to start receiving bookings.</p>
                <Link href="/owner/listings/new" className="btn-primary">Create Listing</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map(p => {
                  const img = p.images?.[0]?.url
                  return (
                    <div key={p.id} className="rounded-xl bg-popover shadow-soft overflow-hidden">
                      {img && (
                        <div className="relative h-40 overflow-hidden">
                          <Image src={img} alt={p.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1">{p.name}</h3>
                          {p.isVerified && <span className="badge-verified text-[10px] shrink-0">Verified</span>}
                        </div>
                        <p className="font-body text-xs text-muted-foreground mb-3">{p.city}</p>
                        <div className="flex gap-2">
                          <button onClick={() => deleteListing(p.id)}
                            className="btn-danger btn-sm flex-1">Delete</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            bookings.length === 0 ? (
              <div className="rounded-xl bg-popover shadow-soft p-12 text-center">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">No bookings yet</h3>
                <p className="font-body text-sm text-muted-foreground">Bookings from tenants will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => {
                  const s = STATUS[b.status] ?? STATUS.PENDING
                  return (
                    <div key={b.id} className="rounded-xl bg-popover shadow-soft p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-semibold text-base text-foreground truncate">
                              {b.tenant?.name}
                            </h3>
                            <span className={s.cls}>{s.label}</span>
                            {b.tokenPaid && <span className="badge-success text-[10px]">Token Paid</span>}
                          </div>
                          <p className="font-body text-sm text-muted-foreground">{b.property?.name} · {b.room?.type}</p>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            Move-in: {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        {b.status === "PENDING" && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => updateBooking(b.id, "CONFIRMED")} className="btn-primary btn-sm">Confirm</button>
                            <button onClick={() => updateBooking(b.id, "CANCELLED")} className="btn-outline btn-sm">Decline</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
      </main>
      <Footer />
    </>
  )
}
