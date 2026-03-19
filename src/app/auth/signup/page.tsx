"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import TurnstileWidget from "@/components/ui/TurnstileWidget"

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
  const [turnstileToken, setTurnstileToken] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role, turnstileToken }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push(role === "OWNER" ? "/auth/pending" : "/dashboard")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ink)" }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=90"
          alt="Modern PG room"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.6) 50%, rgba(201,168,76,0.08) 100%)" }} />
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <Link href="/" className="flex items-center gap-3 reveal">
            <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center">
              <span className="font-serif text-sm font-semibold" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PG</span>
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: "var(--text-primary)" }}>PGLife</span>
          </Link>

          <div className="reveal reveal-d2 space-y-6">
            <h2 className="font-serif text-4xl leading-tight" style={{ color: "var(--text-primary)" }}>
              Start your<br />
              <span className="text-shimmer italic">journey</span><br />
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
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--gold)" }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs reveal reveal-d4" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} PGLife. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 overflow-y-auto" style={{ background: "var(--ink2)" }}>
        <div className="w-full max-w-sm">

          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl glass-gold flex items-center justify-center">
              <span className="font-serif text-sm font-semibold" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PG</span>
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: "var(--text-primary)" }}>PGLife</span>
          </Link>

          {step === "role" ? (
            <div className="reveal">
              <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--text-primary)" }}>Create account</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Tell us who you are to get started</p>

              <div className="space-y-3 mb-8">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer"
                    style={{
                      borderColor: role === r.value ? "var(--border-gold)" : "var(--border)",
                      background: role === r.value ? "var(--gold-dim)" : "var(--glass-bg)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: role === r.value ? "var(--gold-dim)" : "transparent", border: `1px solid ${role === r.value ? "var(--border-gold)" : "var(--border)"}`, color: role === r.value ? "var(--gold)" : "var(--text-muted)" }}>
                      {r.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: role === r.value ? "var(--gold)" : "var(--text-primary)" }}>
                        {r.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{r.desc}</p>
                    </div>
                    {role === r.value && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--gold)" }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={() => setStep("details")} className="btn-gold w-full justify-center">
                Continue as {role === "TENANT" ? "Tenant" : "Owner"} →
              </button>

              <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold transition-colors" style={{ color: "var(--gold)" }}>
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div className="reveal">
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-2 text-sm mb-8 transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseOver={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--text-primary)" }}>Your details</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                Signing up as a{" "}
                <span style={{ color: "var(--gold)" }}>{role === "TENANT" ? "Tenant" : "PG Owner"}</span>
              </p>

              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Full name", key: "name", type: "text", placeholder: "Priya Sharma", autocomplete: "name" },
                  { label: "Email", key: "email", type: "email", placeholder: "priya@example.com", autocomplete: "email" },
                  { label: "Phone", key: "phone", type: "tel", placeholder: "98XXXXXXXX", autocomplete: "tel" },
                  { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters", autocomplete: "new-password" },
                ].map(({ label, key, type, placeholder, autocomplete }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input
                      type={type}
                      className="input-dark"
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      minLength={key === "password" ? 8 : undefined}
                      autoComplete={autocomplete}
                    />
                  </div>
                ))}
                <TurnstileWidget onVerify={setTurnstileToken} />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full justify-center mt-2 disabled:opacity-60"
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

              <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                By signing up you agree to our{" "}
                <Link href="/terms" className="underline transition-colors" style={{ color: "var(--text-secondary)" }}>Terms</Link>
                {" "}&amp;{" "}
                <Link href="/privacy" className="underline transition-colors" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
