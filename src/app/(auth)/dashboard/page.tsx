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
  const [cancelModal, setCancelModal] = useState<{ booking: any; refundInfo: any } | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch("/api/bookings")
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const calculateRefund = (moveInDate: string) => {
    const moveIn = new Date(moveInDate)
    const now = new Date()
    const daysUntil = Math.ceil((moveIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil > 7) return { amount: 500, percentage: 100, days: daysUntil }
    if (daysUntil >= 2) return { amount: 250, percentage: 50, days: daysUntil }
    return { amount: 0, percentage: 0, days: daysUntil }
  }

  const handleCancelClick = (booking: any) => {
    const refundInfo = calculateRefund(booking.moveInDate)
    setCancelModal({ booking, refundInfo })
  }

  const confirmCancel = async () => {
    if (!cancelModal) return
    setCancelling(true)

    try {
      const res = await fetch(`/api/bookings/${cancelModal.booking.id}/cancel`, {
        method: "POST",
      })

      const data = await res.json()

      if (res.ok) {
        showToast("Booking cancelled successfully")
        setCancelModal(null)
        // Refresh bookings
        setBookings(prev => prev.map(b =>
          b.id === cancelModal.booking.id ? { ...b, status: "CANCELLED" } : b
        ))
      } else {
        showToast(data.error || "Failed to cancel booking", false)
      }
    } catch {
      showToast("Network error. Please try again.", false)
    } finally {
      setCancelling(false)
    }
  }

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
                const canCancel = b.status !== "CANCELLED" && b.status !== "COMPLETED"
                return (
                  <div key={b.id} className="rounded-xl bg-popover shadow-soft p-5">
                    <div className="flex items-center gap-5">
                      {img && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <Image src={img} alt={b.property.name} fill className="object-cover" sizes="80px" unoptimized />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-display font-semibold text-base text-foreground truncate">{b.property?.name}</h3>
                          <span className={`${s.cls} shrink-0`}>{s.label}</span>
                        </div>
                        <p className="font-body text-sm text-muted-foreground mb-1">{b.property?.city}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-body text-xs text-muted-foreground">{b.room?.type}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="font-display font-semibold text-sm text-foreground">
                            ₹{b.room?.rent?.toLocaleString("en-IN")}/mo
                          </span>
                          {b.tokenPaid && <span className="badge-success text-[10px]">Token Paid</span>}
                          <span className="text-muted-foreground">·</span>
                          <span className="font-body text-xs text-muted-foreground">
                            Move-in: {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Link href={`/properties/${b.property?.city?.toLowerCase()}/${b.property?.id}`}
                        className="btn-outline btn-sm">View Property</Link>
                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(b)}
                          className="btn-secondary btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 rounded-xl p-4 shadow-lg border ${
          toast.ok ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
        }`} style={{ zIndex: 9999 }}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {toast.ok ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              )}
            </svg>
            <p className="font-medium text-sm">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground">Cancel Booking?</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Are you sure you want to cancel your booking for <strong>{cancelModal.booking.property?.name}</strong>?
            </p>

            {/* Refund Info */}
            <div className={`rounded-lg p-4 mb-4 ${
              cancelModal.refundInfo.percentage === 100 ? "bg-green-50 border border-green-200" :
              cancelModal.refundInfo.percentage === 50 ? "bg-yellow-50 border border-yellow-200" :
              "bg-red-50 border border-red-200"
            }`}>
              <h4 className="font-semibold text-sm mb-2">Refund Details</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Days until move-in:</strong> {cancelModal.refundInfo.days} days</p>
                <p><strong>Refund amount:</strong> ₹{cancelModal.refundInfo.amount} ({cancelModal.refundInfo.percentage}%)</p>
                {cancelModal.refundInfo.amount > 0 && (
                  <p className="text-xs mt-2 opacity-75">Refund will be processed within 5-7 business days</p>
                )}
                {cancelModal.refundInfo.amount === 0 && (
                  <p className="text-xs mt-2 opacity-75">No refund applicable (less than 2 days before move-in)</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
                className="btn-outline flex-1"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="btn-danger flex-1"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
