"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import Image from "next/image"

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  PENDING:   { label: "Pending",   style: "bg-amber-light text-amber-700" },
  CONFIRMED: { label: "Confirmed", style: "bg-green-50 text-green-700" },
  CANCELLED: { label: "Cancelled", style: "bg-red-50 text-red-500" },
  COMPLETED: { label: "Completed", style: "bg-blue-light text-[#1B3B6F]" },
}

export default function OwnerDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
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
    await fetch(`/api/properties/${id}`, { method: "DELETE" })
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  // Unapproved state
  if (user && !user.isApproved) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-card max-w-md w-full p-10 text-center">
            <div className="w-16 h-16 bg-amber-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F] mb-3">Account Under Review</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
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
      <div className="pt-16 min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1B3B6F] rounded-2xl flex items-center justify-center text-white font-serif text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F]">Owner Dashboard</h1>
                  <p className="text-gray-400 text-sm">{user?.name} · {user?.email}</p>
                </div>
              </div>
              <Link href="/owner/listings/new" className="btn-amber px-6 py-2.5">
                + Add New PG
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Listings", value: properties.length,                                          icon: "🏠", style: "bg-white" },
              { label: "Total Bookings", value: bookings.length,                                            icon: "📋", style: "bg-white" },
              { label: "Pending Review", value: pendingCount,                                               icon: "⏳", style: pendingCount > 0 ? "bg-amber-light" : "bg-white" },
              { label: "Confirmed",      value: bookings.filter(b => b.status === "CONFIRMED").length,     icon: "✅", style: "bg-green-50" },
            ].map(s => (
              <div key={s.label} className={`${s.style} rounded-2xl border border-gray-100 p-5 shadow-card`}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="font-serif text-3xl font-semibold text-[#1B3B6F]">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit mb-6">
            {(["listings", "bookings"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative px-6 py-2.5 text-sm font-medium rounded-xl transition-all capitalize ${
                  tab === t ? "bg-white text-[#1B3B6F] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
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
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "listings" ? (
            properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 text-center">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="font-serif text-lg text-[#1B3B6F] mb-2">No listings yet</h3>
                <p className="text-gray-400 text-sm mb-6">Add your first PG and start receiving bookings</p>
                <Link href="/owner/listings/new" className="btn-primary px-8 py-3">Add Your First PG</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((p: any) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:border-[#1B3B6F]/20 hover:shadow-card-hover transition-all">
                    <div className="h-44 bg-gray-100 relative">
                      {p.images?.[0] ? (
                        <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🏠</div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {p.isVerified && (
                          <span className="bg-white/95 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Verified</span>
                        )}
                        {!p.isActive && (
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Delisted</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-semibold text-gray-900 truncate mb-1">{p.name}</h3>
                      <p className="text-xs text-gray-400 capitalize mb-3 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        {p.city}
                      </p>
                      <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                        <Link href={`/properties/${p.city.toLowerCase()}/${p.id}`}
                          className="text-xs text-[#1B3B6F] font-medium hover:underline">
                          View Listing
                        </Link>
                        <span className="text-gray-200">|</span>
                        <button onClick={() => deleteListing(p.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors">
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
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-serif text-lg text-[#1B3B6F] mb-2">No bookings yet</h3>
                <p className="text-gray-400 text-sm">Bookings from tenants will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => {
                  const status = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING
                  return (
                    <div key={b.id} className={`bg-white rounded-2xl border shadow-card p-5 transition-colors ${
                      b.status === "PENDING" ? "border-amber-200" : "border-gray-100"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          {/* Tenant info */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 bg-[#1B3B6F] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {b.tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{b.tenant.name}</p>
                              <p className="text-xs text-gray-400">{b.tenant.email}{b.tenant.phone ? ` · ${b.tenant.phone}` : ""}</p>
                            </div>
                          </div>
                          {/* Booking details */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 pl-12">
                            <span className="font-medium text-gray-600">{b.property.name}</span>
                            <span>{b.room.type} Room · ₹{b.room.rent.toLocaleString()}/mo</span>
                            <span>Move-in: {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span className="capitalize">{b.type.toLowerCase()}</span>
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                          <span className={`badge text-xs ${status.style}`}>{status.label}</span>
                          {b.status === "PENDING" && (
                            <>
                              <button onClick={() => updateBooking(b.id, "CONFIRMED")}
                                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl transition-colors font-medium">
                                Confirm
                              </button>
                              <button onClick={() => updateBooking(b.id, "CANCELLED")}
                                className="text-xs bg-red-400 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl transition-colors font-medium">
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
