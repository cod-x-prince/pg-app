"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import BrandedSpinner from "@/components/ui/BrandedSpinner"

const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Jammu","Srinagar"]
const AMENITIES_LIST = ["WiFi","AC","Parking","CCTV","Gym","Laundry","Geyser","TV","Power Backup","RO Water","Dining","Lift"]
const AMENITY_ICONS: Record<string, string> = {
  WiFi:"📶", AC:"❄️", Parking:"🅿️", CCTV:"📷", Gym:"🏋️", Laundry:"🧺",
  Geyser:"🚿", TV:"📺", "Power Backup":"🔋", "RO Water":"💧", Dining:"🍽️", Lift:"🛗",
}

const STEPS = [
  { label: "Basic Info",     desc: "Name, city, address" },
  { label: "Rooms & Rules",  desc: "Pricing & house rules" },
  { label: "Food & Details", desc: "Meal plan & neighbourhood" },
  { label: "Photos",         desc: "Upload photos" },
  { label: "Amenities",      desc: "Facilities offered" },
  { label: "Preview",        desc: "Review & publish" },
]

const GENDER_OPTIONS = [
  { value: "UNISEX", label: "Unisex",     desc: "Open to all" },
  { value: "MALE",   label: "Boys Only",  desc: "Male tenants" },
  { value: "FEMALE", label: "Girls Only", desc: "Female tenants" },
]

const FOOD_OPTIONS = [
  { value: "NONE",         label: "No Food",         desc: "Self-catering only", icon: "❌" },
  { value: "BREAKFAST",    label: "Breakfast Only",   desc: "Morning meal included", icon: "🌅" },
  { value: "TWO_MEALS",    label: "2 Meals",          desc: "Breakfast + dinner", icon: "🍽️" },
  { value: "THREE_MEALS",  label: "3 Meals",          desc: "All meals included", icon: "🥗" },
  { value: "CUSTOM",       label: "Custom Plan",      desc: "Flexible meal options", icon: "🍱" },
]

const FOOD_LABELS: Record<string, string> = {
  NONE: "No Food", BREAKFAST: "Breakfast Only", TWO_MEALS: "2 Meals/day",
  THREE_MEALS: "3 Meals/day", CUSTOM: "Custom Meal Plan",
}

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep]               = useState(0)
  const [loading, setLoading]         = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [error, setError]             = useState("")

  const [form, setForm] = useState({
    name: "", description: "", city: "", address: "",
    gender: "UNISEX", whatsapp: "",
    houseRules: "", foodPlan: "NONE", neighbourhood: "",
  })
  const [rooms, setRooms]         = useState([{ type: "Single", rent: "", deposit: "", availableFrom: "" }])
  const [images, setImages]       = useState<string[]>([])
  const [video, setVideo]         = useState<string | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const addRoom    = () => setRooms(r => [...r, { type: "Single", rent: "", deposit: "", availableFrom: "" }])
  const removeRoom = (i: number) => setRooms(r => r.filter((_, idx) => idx !== i))
  const setRoom    = (i: number, k: string, v: string) =>
    setRooms(r => r.map((room, idx) => idx === i ? { ...room, [k]: v } : room))

  // Compress image client-side before upload to stay under Vercel 4.5MB limit
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size < 1.5 * 1024 * 1024) { resolve(file); return } // Skip if < 1.5MB
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 1600
        let w = img.width, h = img.height
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        const canvas = document.createElement("canvas")
        canvas.width = w; canvas.height = h
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file)
        }, "image/jpeg", 0.82)
      }
      img.src = url
    })
  }

  const uploadFile = async (file: File, isVideo = false) => {
    const compressed = isVideo ? file : await compressImage(file)
    const fd = new FormData()
    fd.append("file", compressed)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(err.error || "Upload failed")
    }
    const data = await res.json()
    if (isVideo) setVideo(data.url)
    else setImages(prev => [...prev, data.url])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadingImg(true)
    const failedFiles: string[] = []
    for (const file of files) {
      try { await uploadFile(file) } catch { failedFiles.push(file.name) }
    }
    setUploadingImg(false)
    e.target.value = ""
    if (failedFiles.length > 0) {
      setError(`Failed to upload: ${failedFiles.join(", ")}. Please try again.`)
    }
  }

  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.name.trim())    return "PG name is required"
      if (!form.city)           return "Please select a city"
      if (!form.address.trim()) return "Full address is required"
    }
    if (step === 1) {
      for (const r of rooms) {
        if (!r.rent || parseInt(r.rent) < 500) return "Each room needs a valid rent (min ₹500)"
        if (r.deposit === "" || parseInt(r.deposit) < 0) return "Each room needs a valid deposit"
      }
    }
    return null
  }

  const next = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError("")
    setStep(s => s + 1)
  }

  const submit = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          houseRules:    form.houseRules.trim() || null,
          neighbourhood: form.neighbourhood.trim() || null,
        }),
      })
      if (!res.ok) { setError("Failed to create listing. Please try again."); setLoading(false); return }
      const property = await res.json()

      try {
        for (const room of rooms) {
          await fetch(`/api/properties/${property.id}/rooms`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...room, availableFrom: room.availableFrom ? new Date(room.availableFrom).toISOString() : null }),
          })
        }
        for (let i = 0; i < images.length; i++) {
          await fetch(`/api/properties/${property.id}/images`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: images[i], isPrimary: i === 0 }),
          })
        }
        for (const name of amenities) {
          await fetch(`/api/properties/${property.id}/amenities`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          })
        }
        if (video) {
          await fetch(`/api/properties/${property.id}/videos`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: video }),
          })
        }
      } catch {
        await fetch(`/api/properties/${property.id}`, { method: "DELETE" }).catch(() => {})
        setError("Failed to save listing details. Please try again.")
        setLoading(false)
        return
      }

      router.push("/owner/dashboard?listed=1")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const pct = Math.round((step / (STEPS.length - 1)) * 100)

  return (
    <>
      <Navbar forceWhite />
      <div className="pt-16 min-h-screen bg-background">

        {/* Header */}
        <div className="bg-popover border-b border-border">
          <div className="section-wrap-narrow py-6">
            <h1 className="font-display font-bold text-xl text-foreground mb-1" style={{ letterSpacing: "-0.02em" }}>
              List your PG
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length} — {STEPS[step].label}
            </p>
            {/* Progress bar */}
            <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {/* Step pills */}
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
              {STEPS.map((s, i) => (
                <span key={i} className={`shrink-0 font-body text-xs px-3 py-1 rounded-full transition-all ${
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step   ? "bg-success/15 text-success" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? "✓ " : ""}{s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="section-wrap-narrow py-8">
          {error && (
            <div className="mb-5 p-4 bg-destructive/8 border border-destructive/20 rounded-xl">
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* ── STEP 0: Basic Info ─────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">PG Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="e.g. Sunrise PG for Women" className="input" />
              </div>
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">City *</label>
                <select value={form.city} onChange={e => set("city", e.target.value)} className="input">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">Full Address *</label>
                <input value={form.address} onChange={e => set("address", e.target.value)}
                  placeholder="Street, landmark, area" className="input" />
              </div>
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map(g => (
                    <button key={g.value} onClick={() => set("gender", g.value)}
                      className="p-4 rounded-xl text-left transition-all cursor-pointer border-2"
                      style={{
                        borderColor: form.gender === g.value ? "hsl(var(--primary))" : "hsl(var(--border))",
                        background: form.gender === g.value ? "hsl(var(--primary)/0.05)" : "hsl(var(--popover))",
                      }}>
                      <p className="font-display font-semibold text-sm text-foreground">{g.label}</p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">WhatsApp Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-muted border border-r-0 border-input rounded-l-lg font-body text-sm text-muted-foreground">+91</span>
                  <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)}
                    placeholder="10-digit number" className="input rounded-l-none" maxLength={10} />
                </div>
              </div>
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Tell tenants what makes your PG special..."
                  className="input min-h-[100px] resize-y" rows={4} />
              </div>
            </div>
          )}

          {/* ── STEP 1: Rooms & House Rules ───────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-semibold text-base text-foreground">Room Types</h2>
                  <button onClick={addRoom} className="btn-outline btn-sm">+ Add Room</button>
                </div>
                <div className="space-y-3">
                  {rooms.map((room, i) => (
                    <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-display font-medium text-sm text-foreground">Room {i + 1}</p>
                        {rooms.length > 1 && (
                          <button onClick={() => removeRoom(i)}
                            className="font-body text-xs text-destructive hover:underline cursor-pointer">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">Type</label>
                          <select value={room.type} onChange={e => setRoom(i, "type", e.target.value)} className="input text-sm h-10">
                            {["Single","Double","Triple","Dormitory","Private"].map(t =>
                              <option key={t} value={t}>{t}</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">Rent/mo (₹)</label>
                          <input type="number" value={room.rent} onChange={e => setRoom(i, "rent", e.target.value)}
                            placeholder="8000" className="input text-sm h-10" />
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">Deposit (₹)</label>
                          <input type="number" value={room.deposit} onChange={e => setRoom(i, "deposit", e.target.value)}
                            placeholder="16000" className="input text-sm h-10" />
                        </div>
                        <div className="col-span-3 sm:col-span-1">
                          <label className="font-body text-xs text-muted-foreground mb-1 block">Available From</label>
                          <input type="date" value={room.availableFrom}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={e => setRoom(i, "availableFrom", e.target.value)}
                            className="input text-sm h-10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules — NEW */}
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1">
                  House Rules
                </label>
                <p className="font-body text-xs text-muted-foreground mb-2">
                  List your rules clearly — tenants read this before booking. One rule per line.
                </p>
                <textarea
                  value={form.houseRules}
                  onChange={e => set("houseRules", e.target.value)}
                  placeholder="No smoking inside rooms&#10;Visitors allowed till 9 PM&#10;No pets&#10;Night curfew: 10:30 PM"
                  className="input min-h-[140px] resize-y font-body text-sm"
                  rows={6}
                />
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {form.houseRules.split("\n").filter(l => l.trim()).length} rules added
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Food & Neighbourhood ──────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Food Plan — NEW */}
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1">
                  Meal Plan
                </label>
                <p className="font-body text-xs text-muted-foreground mb-3">
                  This is the most searched filter. Be accurate — tenants make decisions based on this.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FOOD_OPTIONS.map(f => (
                    <button key={f.value} onClick={() => set("foodPlan", f.value)}
                      className="flex items-center gap-4 p-4 rounded-xl text-left transition-all cursor-pointer border-2"
                      style={{
                        borderColor: form.foodPlan === f.value ? "hsl(var(--primary))" : "hsl(var(--border))",
                        background: form.foodPlan === f.value ? "hsl(var(--primary)/0.05)" : "hsl(var(--popover))",
                      }}>
                      <span className="text-2xl shrink-0">{f.icon}</span>
                      <div>
                        <p className="font-display font-semibold text-sm text-foreground">{f.label}</p>
                        <p className="font-body text-xs text-muted-foreground">{f.desc}</p>
                      </div>
                      {form.foodPlan === f.value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighbourhood — NEW */}
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1">
                  Neighbourhood / Area
                </label>
                <p className="font-body text-xs text-muted-foreground mb-2">
                  The specific area within your city (e.g. Koramangala, Indiranagar, Bandra West)
                </p>
                <input
                  value={form.neighbourhood}
                  onChange={e => set("neighbourhood", e.target.value)}
                  placeholder="e.g. Koramangala"
                  className="input"
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Photos ────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1">Photos</label>
                <p className="font-body text-xs text-muted-foreground mb-3">
                  Upload at least 3 photos. First photo becomes the cover image. Real photos get 3x more enquiries.
                </p>
                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                  uploadingImg ? "opacity-60 cursor-not-allowed" : "hover:border-primary hover:bg-primary/2"
                }`} style={{ borderColor: "hsl(var(--border))" }}>
                  {uploadingImg ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BrandedSpinner size="md" />
                      <span className="font-body text-sm">Uploading photos...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <div className="text-center">
                        <p className="font-display font-medium text-sm text-foreground">Click to upload photos</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">JPG, PNG up to 10MB each</p>
                      </div>
                    </>
                  )}
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={handleImageUpload} disabled={uploadingImg} />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 badge-primary text-[9px] px-1.5 py-0.5">Cover</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: Amenities ─────────────────────────────── */}
          {step === 4 && (
            <div>
              <p className="font-body text-sm text-muted-foreground mb-4">Select all amenities available at your PG</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES_LIST.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className="flex items-center gap-3 p-4 rounded-xl text-left transition-all cursor-pointer border-2"
                    style={{
                      borderColor: amenities.includes(a) ? "hsl(var(--primary))" : "hsl(var(--border))",
                      background: amenities.includes(a) ? "hsl(var(--primary)/0.05)" : "hsl(var(--popover))",
                    }}>
                    <span className="text-xl">{AMENITY_ICONS[a]}</span>
                    <span className="font-body text-sm text-foreground">{a}</span>
                    {amenities.includes(a) && (
                      <svg className="w-4 h-4 text-primary ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 5: Preview ───────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="bg-muted/30 px-5 py-3 border-b border-border">
                  <p className="font-display font-semibold text-sm text-foreground">Listing Preview</p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: "Name",          value: form.name },
                    { label: "City",          value: form.city },
                    { label: "Neighbourhood", value: form.neighbourhood || "—" },
                    { label: "Address",       value: form.address },
                    { label: "Gender",        value: form.gender },
                    { label: "Meal Plan",     value: FOOD_LABELS[form.foodPlan] || "No Food" },
                    { label: "Rooms",         value: `${rooms.length} room type${rooms.length > 1 ? "s" : ""}, from ₹${Math.min(...rooms.map(r => parseInt(r.rent) || 0)).toLocaleString("en-IN")}/mo` },
                    { label: "Amenities",     value: amenities.length ? amenities.join(", ") : "None selected" },
                    { label: "Photos",        value: `${images.length} uploaded` },
                    { label: "House Rules",   value: form.houseRules ? `${form.houseRules.split("\n").filter(l => l.trim()).length} rules` : "None" },
                  ].map(item => (
                    <div key={item.label} className="flex gap-4">
                      <span className="font-display text-xs font-semibold text-muted-foreground w-28 shrink-0 pt-0.5">{item.label}</span>
                      <span className="font-body text-sm text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-success/8 border border-success/20 p-4">
                <p className="font-body text-sm text-success font-medium">
                  ✓ Your listing will go live after admin approval (usually within 24 hours)
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 0 ? (
              <button onClick={() => { setError(""); setStep(s => s - 1) }}
                className="btn-outline">← Back</button>
            ) : (
              <div />
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary">Continue →</button>
            ) : (
              <button onClick={submit} disabled={loading} className="btn-primary">
                {loading ? "Publishing..." : "Publish Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
