"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const AMENITIES = ["WiFi", "AC", "Parking", "CCTV", "Gym", "Laundry", "Geyser", "TV", "Power Backup", "RO Water", "Dining", "Lift"]

interface Props { city: string }

export default function FilterPanel({ city }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [gender, setGender] = useState(params.get("gender") || "")
  const [minRent, setMinRent] = useState(params.get("minRent") || "")
  const [maxRent, setMaxRent] = useState(params.get("maxRent") || "")
  const [amenities, setAmenities] = useState<string[]>(params.get("amenities")?.split(",").filter(Boolean) || [])

  const apply = () => {
    const q = new URLSearchParams()
    if (gender) q.set("gender", gender)
    if (minRent) q.set("minRent", minRent)
    if (maxRent) q.set("maxRent", maxRent)
    if (amenities.length) q.set("amenities", amenities.join(","))
    router.push(`/properties/${city}?${q.toString()}`)
  }

  const reset = () => {
    setGender(""); setMinRent(""); setMaxRent(""); setAmenities([])
    router.push(`/properties/${city}`)
  }

  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 shadow-sm">
      <h3 className="font-semibold text-gray-900">Filters</h3>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Gender</label>
        <div className="flex flex-wrap gap-2">
          {[["", "All"], ["MALE", "Boys"], ["FEMALE", "Girls"], ["UNISEX", "Unisex"]].map(([val, label]) => (
            <button key={val} onClick={() => setGender(val)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${gender === val ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Rent Range (₹/month)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minRent} onChange={e => setMinRent(e.target.value)} className="input text-sm" />
          <input type="number" placeholder="Max" value={maxRent} onChange={e => setMaxRent(e.target.value)} className="input text-sm" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => (
            <button key={a} onClick={() => toggleAmenity(a)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${amenities.includes(a) ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="btn-primary flex-1 text-sm">Apply</button>
        <button onClick={reset} className="btn-outline flex-1 text-sm">Reset</button>
      </div>
    </div>
  )
}
