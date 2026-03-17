"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const AMENITIES = [
  "WiFi",
  "AC",
  "Parking",
  "CCTV",
  "Gym",
  "Laundry",
  "Geyser",
  "TV",
  "Power Backup",
  "RO Water",
  "Dining",
  "Lift",
];

interface Props {
  city: string;
}

export default function FilterPanel({ city }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  // Initialize state directly from URL parameters so back-button navigation works perfectly
  const [gender, setGender] = useState(params.get("gender") || "");
  const [minRent, setMinRent] = useState(params.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(params.get("maxRent") || "");
  const [amenities, setAmenities] = useState<string[]>(
    params.get("amenities")?.split(",").filter(Boolean) || [],
  );

  const apply = () => {
    const q = new URLSearchParams();
    if (gender) q.set("gender", gender);
    if (minRent) q.set("minRent", minRent);
    if (maxRent) q.set("maxRent", maxRent);
    if (amenities.length) q.set("amenities", amenities.join(","));

    // { scroll: false } prevents the page from jumping to the top when filters are applied
    router.push(`/properties/${city}?${q.toString()}`, { scroll: false });
  };

  const reset = () => {
    setGender("");
    setMinRent("");
    setMaxRent("");
    setAmenities([]);
    router.push(`/properties/${city}`, { scroll: false });
  };

  const toggleAmenity = (a: string) =>
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  return (
    <div className="card p-6 space-y-8 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold text-primary">
          Filters
        </h3>
        {/* Only show the quick-clear button if filters are actively applied */}
        {(gender || minRent || maxRent || amenities.length > 0) && (
          <button
            onClick={reset}
            className="text-xs text-secondary hover:text-primary transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Gender Selection */}
      <div>
        <span className="section-label">Tenant Preference</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { val: "", label: "Any" },
            { val: "MALE", label: "Boys" },
            { val: "FEMALE", label: "Girls" },
            { val: "UNISEX", label: "Unisex" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setGender(val)}
              className={`text-xs px-4 py-2 rounded-full font-medium border transition-all duration-300 ${
                gender === val
                  ? "bg-accent text-background border-accent shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  : "bg-surfaceHover border-border text-secondary hover:text-primary hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rent Range */}
      <div>
        <span className="section-label">Monthly Rent (₹)</span>
        <div className="flex gap-3 mt-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">
              ₹
            </span>
            <input
              type="number"
              placeholder="Min"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              className="input pl-8"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">
              ₹
            </span>
            <input
              type="number"
              placeholder="Max"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="input pl-8"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <span className="section-label">Amenities</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-300 ${
                amenities.includes(a)
                  ? "bg-primary text-background border-primary"
                  : "bg-surfaceHover border-border text-secondary hover:text-primary hover:border-white/20"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={reset} className="btn-outline flex-1">
          Reset
        </button>
        <button onClick={apply} className="btn-accent flex-1 halation">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
