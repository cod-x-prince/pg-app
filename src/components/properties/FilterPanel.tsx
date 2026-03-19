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
    <div className="sticky top-24 rounded-2xl p-6 space-y-7" style={{ background: "var(--ink2)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Filters
        </h3>
        {(gender || minRent || maxRent || amenities.length > 0) && (
          <button
            onClick={reset}
            className="text-xs transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseOver={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Gender Selection */}
      <div>
        <span className="section-label text-[10px] mb-3 block">Tenant Preference</span>
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
              className="text-xs px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer"
              style={{
                background: gender === val ? "var(--gold-dim)" : "transparent",
                borderColor: gender === val ? "var(--border-gold)" : "var(--border)",
                color: gender === val ? "var(--gold)" : "var(--text-muted)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rent Range */}
      <div>
        <span className="section-label text-[10px] mb-3 block">Monthly Rent (₹)</span>
        <div className="flex gap-3 mt-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              className="input-dark pl-7 text-xs py-2.5"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="input-dark pl-7 text-xs py-2.5"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <span className="section-label text-[10px] mb-3 block">Amenities</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className="text-[11px] px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
              style={{
                background: amenities.includes(a) ? "var(--gold-dim)" : "transparent",
                borderColor: amenities.includes(a) ? "var(--border-gold)" : "var(--border)",
                color: amenities.includes(a) ? "var(--gold)" : "var(--text-muted)",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button onClick={reset} className="btn-ghost flex-1 text-xs py-2.5 px-4">
          Reset
        </button>
        <button onClick={apply} className="btn-gold flex-1 text-xs py-2.5 px-4">
          Apply
        </button>
      </div>
    </div>
  );
}
