"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const ROLES = [
  { value: "TENANT", label: "Tenant", desc: "Looking for a PG", icon: "🔍" },
  { value: "OWNER", label: "Owner", desc: "I own a PG", icon: "🏠" },
  { value: "BROKER", label: "Broker", desc: "I manage PGs", icon: "🤝" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "TENANT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      if (!data.isApproved) router.push("/auth/pending");
      else router.push("/auth/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80"
          alt="PG room"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#1B3B6F]/70" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="font-serif text-xl font-semibold text-white">
              PGLife
            </span>
          </Link>
          <div className="space-y-4">
            {[
              "Zero broker fees",
              "Verified listings only",
              "Direct owner contact",
              "Book in minutes",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-[#F59E0B]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#1B3B6F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">PG</span>
            </div>
            <span className="font-serif text-lg font-semibold text-[#1B3B6F]">
              PGLife
            </span>
          </Link>

          <h1 className="font-serif text-3xl font-semibold text-[#1B3B6F] mb-1">
            Create account
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Join thousands finding great PGs
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
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

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs ${
                  form.role === r.value
                    ? "border-[#1B3B6F] bg-blue-light text-[#1B3B6F]"
                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                }`}
              >
                <span className="text-xl">{r.icon}</span>
                <span className="font-semibold">{r.label}</span>
                <span className="text-[10px] text-center leading-tight opacity-70">
                  {r.desc}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Rahul Sharma"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Phone{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="Min. 8 characters"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3B6F] hover:bg-[#254E99] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-1"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {form.role !== "TENANT" && (
            <p className="text-xs text-amber-600 bg-amber-light border border-amber-200 rounded-xl px-4 py-3 mt-4">
              ⏳ Owner/Broker accounts require admin approval before you can
              list PGs.
            </p>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#1B3B6F] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
