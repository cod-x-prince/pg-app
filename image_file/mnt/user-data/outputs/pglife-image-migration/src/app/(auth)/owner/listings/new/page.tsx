"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Image from "next/image"

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jammu", "Srinagar"]
const AMENITIES_LIST = ["WiFi", "AC", "Parking", "CCTV", "Gym", "Laundry", "Geyser", "TV", "Power Backup", "RO Water", "Dining", "Lift"]

const STEPS = ["Basic Info", "Rooms", "Photos & Video", "Amenities", "Preview"]

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)

  const [form, setForm] = useState({
    name: "", description: "", city: "", address: "", gender: "UNISEX", whatsapp: "",
  })
  const [rooms, setRooms] = useState([{ type: "Single", rent: "", deposit: "" }])
  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState<string | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const addRoom = () => setRooms(r => [...r, { type: "Single", rent: "", deposit: "" }])
  const removeRoom = (i: number) => setRooms(r => r.filter((_, idx) => idx !== i))
  const setRoom = (i: number, k: string, v: string) =>
    setRooms(r => r.map((room, idx) => idx === i ? { ...room, [k]: v } : room))

  const uploadFile = async (file: File, isVideo = false) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (isVideo) setVideo(data.url)
    else setImages(prev => [...prev, data.url])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadingImg(true)
    await Promise.all(files.map(f => uploadFile(f)))
    setUploadingImg(false)
  }

  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const submit = async () => {
    setLoading(true)
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setLoading(false); return }
    const property = await res.json()

    // Add rooms
    for (const room of rooms) {
      await fetch(`/api/properties/${property.id}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      })
    }

    // Add images
    for (let i = 0; i < images.length; i++) {
      await fetch(`/api/properties/${property.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: images[i], isPrimary: i === 0 }),
      })
    }

    // Add video
    if (video) {
      await fetch(`/api/properties/${property.id}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: video }),
      })
    }

    // Add amenities
    for (const name of amenities) {
      await fetch(`/api/properties/${property.id}/amenities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
    }

    router.push("/owner/dashboard")
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">List Your PG</h1>
        <p className="text-gray-500 text-sm mb-8">Fill in the details below to get your PG live on PGLife</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-5">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">PG Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} className="input" placeholder="e.g. Sunrise PG for Girls" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} className="input min-h-24 resize-none" placeholder="Describe your PG, rules, facilities, nearby landmarks..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">City *</label>
                  <select value={form.city} onChange={e => set("city", e.target.value)} className="input">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">For</label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} className="input">
                    <option value="UNISEX">Unisex</option>
                    <option value="MALE">Boys Only</option>
                    <option value="FEMALE">Girls Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Address *</label>
                <input value={form.address} onChange={e => set("address", e.target.value)} className="input" placeholder="Street, locality, landmark" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">WhatsApp Number (for tenant enquiries)</label>
                <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} className="input" placeholder="9876543210 (without +91)" />
              </div>
            </>
          )}

          {/* Step 1: Rooms */}
          {step === 1 && (
            <>
              <div className="space-y-4">
                {rooms.map((room, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-700">Room {i + 1}</h4>
                      {rooms.length > 1 && (
                        <button onClick={() => removeRoom(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Type</label>
                        <select value={room.type} onChange={e => setRoom(i, "type", e.target.value)} className="input text-sm">
                          {["Single", "Double", "Triple"].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Rent (₹/mo)</label>
                        <input type="number" value={room.rent} onChange={e => setRoom(i, "rent", e.target.value)} className="input text-sm" placeholder="8000" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Deposit (₹)</label>
                        <input type="number" value={room.deposit} onChange={e => setRoom(i, "deposit", e.target.value)} className="input text-sm" placeholder="16000" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addRoom} className="btn-outline w-full text-sm">+ Add Another Room Type</button>
            </>
          )}

          {/* Step 2: Photos & Video */}
          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Photos (upload multiple)</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-sm text-gray-500">{uploadingImg ? "Uploading..." : "Click to upload photos"}</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map((url, i) => (
                      <div key={i} className="relative group h-20 rounded-lg overflow-hidden">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Virtual Tour Video (optional)</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
                  <span className="text-3xl mb-2">🎥</span>
                  <span className="text-sm text-gray-500">{video ? "Video uploaded ✅" : "Click to upload a walkthrough video"}</span>
                  <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], true)} />
                </label>
              </div>
            </>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Select all amenities available at your PG:</p>
              <div className="grid grid-cols-3 gap-2">
                {AMENITIES_LIST.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${amenities.includes(a) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-gray-900">Review before submitting</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p><span className="font-medium">Name:</span> {form.name}</p>
                <p><span className="font-medium">City:</span> {form.city}</p>
                <p><span className="font-medium">Address:</span> {form.address}</p>
                <p><span className="font-medium">For:</span> {form.gender}</p>
                <p><span className="font-medium">Rooms:</span> {rooms.length} type(s)</p>
                <p><span className="font-medium">Photos:</span> {images.length} uploaded</p>
                <p><span className="font-medium">Video:</span> {video ? "✅ Uploaded" : "None"}</p>
                <p><span className="font-medium">Amenities:</span> {amenities.join(", ") || "None"}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-outline flex-1">← Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">Continue →</button>
            ) : (
              <button onClick={submit} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? "Publishing..." : "🚀 Publish Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
