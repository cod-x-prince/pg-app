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

export default function TenantDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
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
      <div className="pt-16 min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1B3B6F] rounded-2xl flex items-center justify-center text-white font-serif text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F]">
                  Welcome back, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: bookings.length, icon: "🏠", style: "bg-white" },
              { label: "Confirmed",      value: confirmed,        icon: "✅", style: "bg-green-50" },
              { label: "Pending",        value: pending,          icon: "⏳", style: "bg-amber-light" },
            ].map(s => (
              <div key={s.label} className={`${s.style} rounded-2xl border border-gray-100 p-5 shadow-card`}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="font-serif text-3xl font-semibold text-[#1B3B6F]">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bookings */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-semibold text-[#1B3B6F]">My Bookings</h2>
            <Link href="/" className="btn-outline text-xs py-2 px-4">Find More PGs</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-serif text-lg text-[#1B3B6F] mb-2">No bookings yet</h3>
              <p className="text-gray-400 text-sm mb-6">Find your perfect PG and book your first stay</p>
              <Link href="/" className="btn-primary px-8 py-3">Explore PGs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b: any) => {
                const status = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex gap-5 hover:border-[#1B3B6F]/20 transition-colors">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                      {b.property.images[0] ? (
                        <Image src={b.property.images[0].url} alt={b.property.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-serif font-medium text-gray-900 truncate">{b.property.name}</h3>
                        <span className={`badge text-xs shrink-0 ${status.style}`}>{status.label}</span>
                      </div>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mb-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        <span className="capitalize">{b.property.city}</span>
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>{b.room.type} Room — ₹{b.room.rent.toLocaleString()}/mo</span>
                        <span>•</span>
                        <span>Move-in: {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span className="capitalize">{b.type.toLowerCase()}</span>
                      </div>
                    </div>

                    {/* View link */}
                    <Link href={`/properties/${b.property.city.toLowerCase()}/${b.property.id}`}
                      className="shrink-0 self-center text-xs text-[#1B3B6F] hover:underline font-medium">
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
