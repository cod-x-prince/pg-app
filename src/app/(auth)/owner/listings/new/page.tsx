"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jammu",
  "Srinagar",
];
const AMENITIES_LIST = [
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
const AMENITY_ICONS: Record<string, string> = {
  WiFi: "📶",
  AC: "❄️",
  Parking: "🅿️",
  CCTV: "📷",
  Gym: "🏋️",
  Laundry: "🧺",
  Geyser: "🚿",
  TV: "📺",
  "Power Backup": "🔋",
  "RO Water": "💧",
  Dining: "🍽️",
  Lift: "🛗",
};

const STEPS = [
  { label: "Basic Info", icon: "🏠", desc: "Name, city, address" },
  { label: "Rooms", icon: "🛏️", desc: "Types & pricing" },
  { label: "Photos & Video", icon: "📸", desc: "Upload media" },
  { label: "Amenities", icon: "✨", desc: "Facilities offered" },
  { label: "Preview", icon: "👀", desc: "Review & publish" },
];

const GENDER_OPTIONS = [
  { value: "UNISEX", label: "Unisex", icon: "👥", desc: "Open to all" },
  { value: "MALE", label: "Boys Only", icon: "👦", desc: "Male tenants" },
  { value: "FEMALE", label: "Girls Only", icon: "👧", desc: "Female tenants" },
];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    address: "",
    gender: "UNISEX",
    whatsapp: "",
  });
  const [rooms, setRooms] = useState([
    { type: "Single", rent: "", deposit: "" },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addRoom = () =>
    setRooms((r) => [...r, { type: "Single", rent: "", deposit: "" }]);
  const removeRoom = (i: number) =>
    setRooms((r) => r.filter((_, idx) => idx !== i));
  const setRoom = (i: number, k: string, v: string) =>
    setRooms((r) =>
      r.map((room, idx) => (idx === i ? { ...room, [k]: v } : room)),
    );

  const uploadFile = async (file: File, isVideo = false) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (isVideo) setVideo(data.url);
    else setImages((prev) => [...prev, data.url]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingImg(true);
    await Promise.all(files.map((f) => uploadFile(f)));
    setUploadingImg(false);
  };

  const toggleAmenity = (a: string) =>
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.name.trim()) return "PG name is required";
      if (!form.city) return "Please select a city";
      if (!form.address.trim()) return "Full address is required";
    }
    if (step === 1) {
      for (const r of rooms) {
        if (!r.rent || parseInt(r.rent) < 500)
          return "Each room needs a valid rent (min ₹500)";
        if (!r.deposit || parseInt(r.deposit) < 0)
          return "Each room needs a valid deposit";
      }
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError("Failed to create listing. Please try again.");
        setLoading(false);
        return;
      }
      const property = await res.json();

      await Promise.all([
        ...rooms.map((room) =>
          fetch(`/api/properties/${property.id}/rooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(room),
          }),
        ),
        ...images.map((url, i) =>
          fetch(`/api/properties/${property.id}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, isPrimary: i === 0 }),
          }),
        ),
        ...amenities.map((name) =>
          fetch(`/api/properties/${property.id}/amenities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          }),
        ),
        ...(video
          ? [
              fetch(`/api/properties/${property.id}/videos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: video }),
              }),
            ]
          : []),
      ]);

      router.push("/owner/dashboard?listed=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const completionPct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F]">
                  List Your PG
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Step {step + 1} of {STEPS.length} — {STEPS[step].desc}
                </p>
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl font-semibold text-[#1B3B6F]">
                  {completionPct}%
                </p>
                <p className="text-xs text-gray-400">complete</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Step sidebar */}
            <div className="hidden md:flex flex-col gap-1 w-44 shrink-0 pt-1">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    i === step ? "bg-[#EEF3FB]" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                          ? "bg-[#1B3B6F] text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium leading-none mb-0.5 ${i === step ? "text-[#1B3B6F]" : i < step ? "text-green-600" : "text-gray-400"}`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-none">
                      {s.icon}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
                {/* ── STEP 0: Basic Info ─────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        PG Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        className="input"
                        placeholder="e.g. Sunrise PG for Girls"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        className="input min-h-28 resize-none"
                        placeholder="Describe your PG — rules, nearby landmarks, what makes it special..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          City <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={form.city}
                          onChange={(e) => set("city", e.target.value)}
                          className="input"
                        >
                          <option value="">Select city</option>
                          {CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          WhatsApp
                        </label>
                        <input
                          value={form.whatsapp}
                          onChange={(e) => set("whatsapp", e.target.value)}
                          className="input"
                          placeholder="9876543210"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Full Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        className="input"
                        placeholder="Street, locality, landmark"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-3">
                        PG For
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {GENDER_OPTIONS.map((g) => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => set("gender", g.value)}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                              form.gender === g.value
                                ? "border-[#1B3B6F] bg-[#EEF3FB]"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <span className="text-2xl">{g.icon}</span>
                            <span
                              className={`text-xs font-semibold ${form.gender === g.value ? "text-[#1B3B6F]" : "text-gray-600"}`}
                            >
                              {g.label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {g.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Rooms ──────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Add all room types available in your PG with their
                      pricing.
                    </p>
                    {rooms.map((room, i) => (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-xl p-5 bg-gray-50/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#1B3B6F] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Room Type {i + 1}
                            </span>
                          </div>
                          {rooms.length > 1 && (
                            <button
                              onClick={() => removeRoom(i)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1.5">
                              Type
                            </label>
                            <select
                              value={room.type}
                              onChange={(e) =>
                                setRoom(i, "type", e.target.value)
                              }
                              className="input text-sm"
                            >
                              {["Single", "Double", "Triple"].map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1.5">
                              Rent (₹/mo)
                            </label>
                            <input
                              type="number"
                              value={room.rent}
                              onChange={(e) =>
                                setRoom(i, "rent", e.target.value)
                              }
                              className="input text-sm"
                              placeholder="8000"
                              min="500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1.5">
                              Deposit (₹)
                            </label>
                            <input
                              type="number"
                              value={room.deposit}
                              onChange={(e) =>
                                setRoom(i, "deposit", e.target.value)
                              }
                              className="input text-sm"
                              placeholder="16000"
                              min="0"
                            />
                          </div>
                        </div>
                        {room.rent && (
                          <p className="text-xs text-[#1B3B6F] mt-3 font-medium">
                            ₹{parseInt(room.rent).toLocaleString()}/mo · ₹
                            {parseInt(room.deposit || "0").toLocaleString()}{" "}
                            deposit
                          </p>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addRoom}
                      className="w-full border-2 border-dashed border-gray-200 hover:border-[#1B3B6F]/30 hover:bg-[#EEF3FB]/50 text-gray-500 hover:text-[#1B3B6F] text-sm font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Another Room Type
                    </button>
                  </div>
                )}

                {/* ── STEP 2: Photos & Video ─────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-medium text-gray-600">
                          Photos{" "}
                          <span className="text-gray-400 font-normal">
                            (first photo = cover)
                          </span>
                        </label>
                        {images.length > 0 && (
                          <span className="text-xs text-[#1B3B6F] font-medium">
                            {images.length} uploaded
                          </span>
                        )}
                      </div>

                      <label
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                          uploadingImg
                            ? "border-[#1B3B6F] bg-[#EEF3FB]"
                            : "border-gray-200 hover:border-[#1B3B6F]/40 hover:bg-gray-50"
                        }`}
                      >
                        {uploadingImg ? (
                          <>
                            <div className="w-8 h-8 border-2 border-[#1B3B6F] border-t-transparent rounded-full animate-spin mb-3" />
                            <span className="text-sm text-[#1B3B6F] font-medium">
                              Uploading photos...
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-[#EEF3FB] rounded-2xl flex items-center justify-center mb-3">
                              <svg
                                className="w-6 h-6 text-[#1B3B6F]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 mb-1">
                              Click to upload photos
                            </span>
                            <span className="text-xs text-gray-400">
                              JPG, PNG, WebP · Max 10MB each
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImg}
                        />
                      </label>

                      {images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {images.map((url, i) => (
                            <div
                              key={i}
                              className="relative group h-20 rounded-xl overflow-hidden border border-gray-100"
                            >
                              <Image
                                src={url}
                                alt=""
                                fill
                                className="object-cover"
                              />
                              {i === 0 && (
                                <span className="absolute bottom-1 left-1 bg-[#F59E0B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                  Cover
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  setImages((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  )
                                }
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-3">
                        Virtual Tour Video{" "}
                        <span className="text-gray-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                          video
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 hover:border-[#1B3B6F]/40 hover:bg-gray-50"
                        }`}
                      >
                        {video ? (
                          <>
                            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-green-700">
                              Video uploaded successfully
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setVideo(null);
                              }}
                              className="text-xs text-red-400 hover:text-red-600 mt-1"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-[#EEF3FB] rounded-2xl flex items-center justify-center mb-3">
                              <svg
                                className="w-6 h-6 text-[#1B3B6F]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 mb-1">
                              Upload a walkthrough video
                            </span>
                            <span className="text-xs text-gray-400">
                              MP4, WebM · Max 100MB
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            uploadFile(e.target.files[0], true)
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Amenities ──────────────────────────── */}
                {step === 3 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-5">
                      Select all amenities available at your PG.
                      <span className="ml-1 text-[#1B3B6F] font-medium">
                        {amenities.length} selected
                      </span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {AMENITIES_LIST.map((a) => (
                        <button
                          key={a}
                          onClick={() => toggleAmenity(a)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            amenities.includes(a)
                              ? "border-[#1B3B6F] bg-[#EEF3FB]"
                              : "border-gray-100 hover:border-gray-200 bg-gray-50"
                          }`}
                        >
                          <span className="text-xl">
                            {AMENITY_ICONS[a] || "✓"}
                          </span>
                          <div>
                            <p
                              className={`text-xs font-semibold ${amenities.includes(a) ? "text-[#1B3B6F]" : "text-gray-600"}`}
                            >
                              {a}
                            </p>
                            {amenities.includes(a) && (
                              <p className="text-[10px] text-[#1B3B6F]/60">
                                Selected
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Preview ────────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <p className="text-sm text-gray-500">
                      Review all details before publishing your listing.
                    </p>

                    {/* Cover photo preview */}
                    {images[0] && (
                      <div className="relative h-40 rounded-2xl overflow-hidden">
                        <Image
                          src={images[0]}
                          alt="Cover"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B6F]/60 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <p className="font-serif text-white font-semibold text-lg">
                            {form.name || "Unnamed PG"}
                          </p>
                          <p className="text-white/70 text-xs capitalize">
                            {form.city}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {[
                        { label: "PG Name", value: form.name || "—" },
                        { label: "City", value: form.city || "—" },
                        { label: "Address", value: form.address || "—" },
                        {
                          label: "For",
                          value:
                            form.gender === "MALE"
                              ? "Boys Only"
                              : form.gender === "FEMALE"
                                ? "Girls Only"
                                : "Unisex",
                        },
                        {
                          label: "WhatsApp",
                          value: form.whatsapp || "Not provided",
                        },
                        {
                          label: "Room types",
                          value: `${rooms.length} type(s) — ${rooms.map((r) => `${r.type} ₹${parseInt(r.rent || "0").toLocaleString()}/mo`).join(", ")}`,
                        },
                        {
                          label: "Photos",
                          value: `${images.length} uploaded${images.length === 0 ? " (consider adding photos)" : ""}`,
                        },
                        {
                          label: "Video",
                          value: video ? "✅ Uploaded" : "Not uploaded",
                        },
                        {
                          label: "Amenities",
                          value:
                            amenities.length > 0
                              ? amenities.join(", ")
                              : "None selected",
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <span className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">
                            {row.label}
                          </span>
                          <span className="text-sm text-gray-700 flex-1">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-light border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                      ⏳ Your listing will be visible immediately but will
                      receive a <strong>Verified</strong> badge after admin
                      review.
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-50">
                  {step > 0 && (
                    <button
                      onClick={() => {
                        setError("");
                        setStep((s) => s - 1);
                      }}
                      className="btn-outline flex-1 py-3"
                    >
                      ← Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button onClick={next} className="btn-primary flex-1 py-3">
                      Continue →
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={loading}
                      className="flex-1 bg-[#F59E0B] hover:bg-amber-500 disabled:opacity-60 text-[#1B3B6F] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#1B3B6F]/30 border-t-[#1B3B6F] rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "🚀 Publish Listing"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
