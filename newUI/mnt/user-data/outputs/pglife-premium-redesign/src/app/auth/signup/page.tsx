"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"

type Role = "TENANT" | "OWNER"

const ROLES = [
  {
    value: "TENANT" as Role,
    label: "I am a Tenant",
    desc: "Looking for a PG to stay",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    value: "OWNER" as Role,
    label: "I am an Owner",
    desc: "Want to list my PG",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "details">("role")
  const [role, setRole] = useState<Role>("TENANT")
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push(role === "OWNER" ? "/auth/pending" : "/dashboard")
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=90"
          alt="Modern PG room"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2347]/80 via-[#1B3B6F]/65 to-[#F59E0B]/20" />
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <Link href="/" className="flex items-center gap-3 reveal">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="font-serif text-2xl font-semibold text-white">PGLife</span>
          </Link>

          <div className="reveal reveal-d2 space-y-6">
            <h2 className="font-serif text-4xl text-white leading-tight">
              Start your<br />
              <span className="text-[#F59E0B] italic">journey</span><br />
              today.
            </h2>
            <div className="space-y-3">
              {[
                "Zero broker fees",
                "Verified listings only",
                "Direct owner contact",
                "Real tenant reviews",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs reveal reveal-d4">
            &copy; {new Date().getFullYear()} PGLife. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">

          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-[#1B3B6F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="font-serif text-xl font-semibold text-[#1B3B6F]">PGLife</span>
          </Link>

          {step === "role" ? (
            <div className="reveal">
              <h1 className="font-serif text-3xl text-gray-900 mb-2">Create account</h1>
              <p className="text-gray-400 text-sm mb-8">Tell us who you are to get started</p>

              <div className="space-y-3 mb-8">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      role === r.value
                        ? "border-[#1B3B6F] bg-[#EEF3FB]"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      role === r.value ? "bg-[#1B3B6F] text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {r.icon}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${role === r.value ? "text-[#1B3B6F]" : "text-gray-700"}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    </div>
                    {role === r.value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[#1B3B6F] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={() => setStep("details")} className="btn-primary w-full justify-center">
                Continue as {role === "TENANT" ? "Tenant" : "Owner"} →
              </button>

              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#1B3B6F] font-semibold hover:text-[#F59E0B] transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div className="reveal">
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <h1 className="font-serif text-3xl text-gray-900 mb-2">Your details</h1>
              <p className="text-gray-400 text-sm mb-8">
                Signing up as a{" "}
                <span className="text-[#1B3B6F] font-medium">{role === "TENANT" ? "Tenant" : "PG Owner"}</span>
              </p>

              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Full name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Priya Sharma"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="priya@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Creating account...
                    </span>
                  ) : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                By signing up you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
                {" "}&amp;{" "}
                <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
