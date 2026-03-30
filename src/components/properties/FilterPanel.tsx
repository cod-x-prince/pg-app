"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function FilterContent({
  city,
  onClose,
}: {
  city: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [gender, setGender] = useState(params.get("gender") || "");
  const [foodPlan, setFoodPlan] = useState(params.get("foodPlan") || "");
  const [minRent, setMinRent] = useState(params.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(params.get("maxRent") || "");
  const [amenities, setAmenities] = useState<string[]>(
    params.get("amenities")?.split(",").filter(Boolean) || [],
  );
  const [moveIn, setMoveIn] = useState(params.get("moveIn") || "");

  const apply = () => {
    const q = new URLSearchParams();
    if (gender) q.set("gender", gender);
    if (foodPlan) q.set("foodPlan", foodPlan);
    if (minRent) q.set("minRent", minRent);
    if (maxRent) q.set("maxRent", maxRent);
    if (amenities.length) q.set("amenities", amenities.join(","));
    if (moveIn) q.set("moveIn", moveIn);
    router.push(`/properties/${city}?${q.toString()}`);
    onClose?.();
  };

  const reset = () => {
    setGender("");
    setFoodPlan("");
    setMoveIn("");
    setMinRent("");
    setMaxRent("");
    setAmenities([]);
    router.push(`/properties/${city}`);
    onClose?.();
  };

  const toggle = (a: string) =>
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const activeCount = [
    gender,
    foodPlan,
    moveIn,
    minRent,
    maxRent,
    ...amenities,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-base text-foreground">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 badge-primary text-[10px]">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="font-body text-xs text-destructive hover:underline cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Gender */}
      <div>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Gender
        </p>
        <div className="flex flex-wrap gap-2">
          {["", "MALE", "FEMALE", "UNISEX"].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`font-body text-xs px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                gender === g
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {g === ""
                ? "Any"
                : g === "MALE"
                  ? "Boys"
                  : g === "FEMALE"
                    ? "Girls"
                    : "Unisex"}
            </button>
          ))}
        </div>
      </div>

      {/* Food */}
      <div>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Meal Plan
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "Any" },
            { value: "NONE", label: "No Food" },
            { value: "BREAKFAST", label: "Breakfast" },
            { value: "TWO_MEALS", label: "2 Meals" },
            { value: "THREE_MEALS", label: "3 Meals" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFoodPlan(f.value)}
              className={`font-body text-xs px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                foodPlan === f.value
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rent */}
      <div>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Monthly Rent (₹)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
            className="input text-sm"
          />
          <span className="text-muted-foreground text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            className="input text-sm"
          />
        </div>
      </div>

      {/* Move-in date */}
      <div>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Move-in Date
        </p>
        <input
          type="date"
          value={moveIn}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setMoveIn(e.target.value)}
          className="input text-sm"
        />
        {moveIn && (
          <button
            onClick={() => setMoveIn("")}
            className="font-body text-xs text-muted-foreground hover:text-destructive mt-1 block cursor-pointer"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Amenities */}
      <div>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggle(a)}
              className={`font-body text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                amenities.includes(a)
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:border-primary/20"
              }`}
            >
              {amenities.includes(a) ? "✓ " : ""}
              {a}
            </button>
          ))}
        </div>
      </div>

      <button onClick={apply} className="btn-primary w-full">
        Apply Filters
      </button>
    </div>
  );
}

export default function FilterPanel({ city }: Props) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();
  const activeCount = ["gender", "minRent", "maxRent", "amenities"].filter(
    (k) => params.get(k),
  ).length;

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block rounded-xl bg-popover p-5 shadow-soft">
        <FilterContent city={city} />
      </div>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="btn-outline btn-sm gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zM6 10a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zM10 16a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"
            />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="badge-primary text-[10px]">{activeCount}</span>
          )}
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto safe-bottom">
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
            <FilterContent city={city} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
