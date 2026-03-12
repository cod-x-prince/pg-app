"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Room { id: string; type: string; rent: number; deposit: number; isAvailable: boolean }
interface Props { propertyId: string; rooms: Room[]; whatsapp?: string | null }

export default function BookingForm({ propertyId, rooms, whatsapp }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [type, setType] = useState<"ENQUIRY" | "DIRECT">("ENQUIRY")
  const [roomId, setRoomId] = useState("")
  const [moveInDate, setMoveInDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const availableRooms = rooms.filter(r => r.isAvailable)
  const selectedRoom = rooms.find(r => r.id === roomId)

  const handleSubmit = async () => {
    if (!session) { router.push("/auth/login"); return }
    if (!roomId || !moveInDate) { setError("Please select a room and move-in date."); return }
    setLoading(true); setError("")
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, roomId, moveInDate, type }),
    })
    if (res.ok) setSuccess(true)
    else { const d = await res.json(); setError(d.error || "Something went wrong.") }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="font-serif text-lg font-semibold text-[#1B3B6F] mb-2">
          {type === "ENQUIRY" ? "Enquiry Sent!" : "Booking Requested!"}
        </h3>
        <p className="text-gray-400 text-sm mb-6">The owner will contact you shortly. Check your dashboard for updates.</p>
        <button onClick={() => router.push("/dashboard")} className="btn-primary w-full justify-center py-3">
          View My Bookings
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B3B6F] px-6 py-5">
        <p className="text-white/70 text-xs mb-1">Starting from</p>
        <p className="font-serif text-2xl font-semibold text-white">
          ₹{availableRooms.length ? Math.min(...availableRooms.map(r => r.rent)).toLocaleString() : "—"}
          <span className="text-white/50 text-sm font-normal font-sans"> /month</span>
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Booking type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-100 bg-gray-50 p-1 gap-1">
          {(["ENQUIRY", "DIRECT"] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === t ? "bg-white text-[#1B3B6F] shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}>
              {t === "ENQUIRY" ? "Send Enquiry" : "Direct Book"}
            </button>
          ))}
        </div>

        {/* Room selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Room Type</label>
          <select value={roomId} onChange={e => setRoomId(e.target.value)} className="input text-sm">
            <option value="">Select a room</option>
            {availableRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.type} — ₹{r.rent.toLocaleString()}/mo
              </option>
            ))}
          </select>
          {availableRooms.length === 0 && (
            <p className="text-xs text-red-400 mt-1">No rooms available right now.</p>
          )}
        </div>

        {/* Selected room preview */}
        {selectedRoom && (
          <div className="bg-[#EEF3FB] rounded-xl px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-[#1B3B6F]">{selectedRoom.type} Room</p>
              <p className="text-xs text-gray-400">Deposit: ₹{selectedRoom.deposit.toLocaleString()}</p>
            </div>
            <p className="font-serif font-semibold text-[#1B3B6F]">₹{selectedRoom.rent.toLocaleString()}<span className="text-xs font-sans text-gray-400">/mo</span></p>
          </div>
        )}

        {/* Move-in date */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Move-in Date</label>
          <input type="date" value={moveInDate} onChange={e => setMoveInDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} className="input text-sm" />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading || availableRooms.length === 0}
          className="w-full bg-[#1B3B6F] hover:bg-[#254E99] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          {loading ? "Processing..." : type === "ENQUIRY" ? "Send Enquiry" : "Request Booking"}
        </button>

        {whatsapp && (
          <a href={`https://wa.me/91${whatsapp}?text=Hi, I'm interested in your PG listed on PGLife`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-green-400 text-green-600 hover:bg-green-50 transition-colors text-sm font-semibold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        )}

        {!session && (
          <p className="text-center text-xs text-gray-400">
            <a href="/auth/login" className="text-[#1B3B6F] font-medium hover:underline">Login</a> to send enquiry or book
          </p>
        )}
      </div>
    </div>
  )
}
