"use client"
import type { RazorpayResponse } from "@/types"
import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import BrandedSpinner from "@/components/ui/BrandedSpinner"

interface Room { id: string; type: string; rent: number; deposit: number; isAvailable: boolean }
interface Props { propertyId: string; rooms: Room[]; whatsapp?: string | null; propertyName?: string }

declare global {
  interface Window {
    Razorpay: new (opts: object) => { open: () => void }
  }
}

export default function BookingForm({ propertyId, rooms, whatsapp, propertyName = "PG" }: Props) {
  const { data: session } = useSession()
  const router   = useRouter()
  const [tab, setTab]           = useState<"token" | "enquiry">("token")
  const [roomId, setRoomId]     = useState("")
  const [moveInDate, setMoveInDate] = useState("")
  const [loading, setLoading]   = useState(false)
  const [rzpReady, setRzpReady]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState("")

  const availableRooms = rooms.filter(r => r.isAvailable)
  const selectedRoom   = rooms.find(r => r.id === roomId)

  const handleEnquiry = async () => {
    if (!session) { router.push("/auth/login"); return }
    if (!roomId || !moveInDate) { setError("Please select a room and move-in date."); return }
    setLoading(true); setError("")

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, roomId, moveInDate, type: "ENQUIRY" }),
    })

    if (res.ok) setSuccess(true)
    else { const d = await res.json(); setError(d.error || "Something went wrong.") }
    setLoading(false)
  }

  const handleTokenBooking = async () => {
    if (!session) { router.push("/auth/login"); return }
    if (!roomId || !moveInDate) { setError("Please select a room and move-in date."); return }
    setLoading(true); setError("")

    try {
      // Step 1: Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, roomId, moveInDate, type: "DIRECT" }),
      })
      if (!bookingRes.ok) {
        const d = await bookingRes.json()
        setError(d.error || "Could not create booking.")
        setLoading(false)
        return
      }
      const booking = await bookingRes.json()

      // Step 2: Create Razorpay order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      })
      if (!orderRes.ok) {
        const d = await orderRes.json()
        setError(d.error || "Payment setup failed.")
        setLoading(false)
        return
      }
      const order = await orderRes.json()

      // Step 3: Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        "Gharam",
        description: `Token for ${propertyName} — ${selectedRoom?.type}`,
        order_id:    order.orderId,
        prefill: {
          name:  session?.user?.name ?? "",
          email: session?.user?.email ?? "",
        },
        theme: { color: "#1B3B6F" },
        handler: async (response: RazorpayResponse) => {
          // Step 4: Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId:           booking.id,
            }),
          })
          if (verifyRes.ok) {
            setSuccess(true)
          } else {
            setError("Payment verification failed. Contact support@gharam.in with your payment ID.")
          }
          setLoading(false)
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch {
      setError("Payment failed. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="font-serif text-xl text-gray-900 mb-2">
          {tab === "token" ? "Token Paid! Room Held." : "Enquiry Sent!"}
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          {tab === "token"
            ? "Your ₹500 token has been received. The owner will contact you within 24 hours."
            : "Your enquiry has been sent. The owner will contact you soon."}
        </p>
        {whatsapp && (
          <a
            href={`https://wa.me/91${whatsapp}?text=Hi%2C+I+just+booked+${encodeURIComponent(propertyName)}+on+Gharam.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center mb-3 bg-[#25D366] hover:bg-green-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.85L.057 23.514a.5.5 0 00.609.61l5.74-1.497A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.628-.5-5.147-1.375l-.369-.218-3.823.997.988-3.739-.24-.385A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Message Owner on WhatsApp
          </a>
        )}
        <button onClick={() => router.push("/dashboard")} className="btn-outline w-full justify-center">
          View My Bookings
        </button>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRzpReady(true)}
        onError={() => console.warn("Razorpay script failed to load")}
      />

      <div className="card p-6">
        {/* Tab switcher */}
        <div className="flex bg-gray-50 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setTab("token")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              tab === "token"
                ? "bg-[#1B3B6F] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🔒 Pay Token (₹500)
          </button>
          <button
            onClick={() => setTab("enquiry")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              tab === "enquiry"
                ? "bg-[#1B3B6F] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            💬 Free Enquiry
          </button>
        </div>

        {tab === "token" && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
            <p className="text-amber-800 text-xs font-medium">
              ₹500 token holds your room instantly. Amount adjusts against first month rent.
            </p>
          </div>
        )}

        {/* Room selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Select Room
          </label>
          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="input"
          >
            <option value="">Choose room type</option>
            {availableRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.type} — ₹{r.rent.toLocaleString("en-IN")}/mo
              </option>
            ))}
          </select>
          {availableRooms.length === 0 && (
            <p className="text-red-400 text-xs mt-1.5">No rooms currently available</p>
          )}
        </div>

        {/* Move-in date */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Move-in Date
          </label>
          <input
            type="date"
            value={moveInDate}
            onChange={e => setMoveInDate(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
            className="input"
          />
        </div>

        {/* Selected room summary */}
        {selectedRoom && (
          <div className="bg-[#EEF3FB] rounded-2xl p-4 mb-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Selected room</p>
                <p className="font-medium text-[#1B3B6F] text-sm">{selectedRoom.type}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Monthly rent</p>
                <p className="font-semibold text-[#1B3B6F]">₹{selectedRoom.rent.toLocaleString("en-IN")}</p>
              </div>
            </div>
            {selectedRoom.deposit > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Security deposit: ₹{selectedRoom.deposit.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">{error}</p>
        )}

        <button
          onClick={tab === "token" ? handleTokenBooking : handleEnquiry}
          disabled={loading || availableRooms.length === 0 || (tab === "token" && !rzpReady)}
          className={`w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed ${
            tab === "token" ? "btn-amber" : "btn-primary"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <BrandedSpinner size="sm" />
              Processing...
            </span>
          ) : tab === "token" ? "Pay ₹500 Token & Hold Room" : "Send Free Enquiry"}
        </button>

        {/* WhatsApp direct */}
        {whatsapp && (
          <a
            href={`https://wa.me/91${whatsapp}?text=Hi%2C+I+am+interested+in+${encodeURIComponent(propertyName)}+listed+on+Gharam.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-2xl border border-gray-100 text-gray-500 text-sm hover:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Or message directly on WhatsApp
          </a>
        )}

        <p className="text-center text-xs text-gray-300 mt-4">
          🔒 Payments secured by Razorpay
        </p>
      </div>
    </>
  )
}
