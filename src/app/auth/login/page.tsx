"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { ...form, redirect: false })
    setLoading(false)
    if (res?.error) setError("Invalid email or password")
    else router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ink)" }}>

      {/* Left — Premium Visual Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=90"
          alt="Premium PG living"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.6) 60%, rgba(201,168,76,0.05) 100%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <Link href="/" className="flex items-center gap-3 reveal">
            <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center">
              <span className="font-serif text-sm font-semibold" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PG</span>
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: "var(--text-primary)" }}>PGLife</span>
          </Link>

          <div className="reveal reveal-d2">
            <div className="gold-line mb-8 w-16" />
            <blockquote className="font-serif text-3xl leading-tight mb-4 italic" style={{ color: "var(--text-primary)" }}>
              &ldquo;Your perfect home<br />
              <span style={{ color: "var(--gold)" }}>awaits you.</span>&rdquo;
            </blockquote>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
              Join thousands of tenants who found their ideal PG through PGLife.
              Verified listings. Real reviews. Zero broker fees.
            </p>
          </div>

          <div className="flex items-center gap-4 reveal reveal-d3">
            <div className="flex -space-x-2">
              {["A","B","C"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-serif text-xs font-semibold" style={{ background: "var(--gold-dim)", borderColor: "var(--border-gold)", color: "var(--gold)" }}>
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-primary)" }}>2,400+</span> tenants found their home this month
            </p>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16" style={{ background: "var(--ink2)" }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl glass-gold flex items-center justify-center">
              <span className="font-serif text-sm font-semibold" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PG</span>
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: "var(--text-primary)" }}>PGLife</span>
          </Link>

          <div className="reveal mb-10">
            <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl text-sm reveal" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 reveal reveal-d1">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Email address
              </label>
              <input
                type="email"
                className="input-dark"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Password
                </label>
                <Link href="#" className="text-xs transition-colors" style={{ color: "var(--gold)" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="input-dark"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Google OAuth */}
          <div className="mt-6 reveal reveal-d2">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid var(--border)" }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-xs" style={{ background: "var(--ink2)", color: "var(--text-muted)" }}>or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all cursor-pointer"
              style={{ border: "1px solid var(--border)", background: "var(--glass-bg)", color: "var(--text-secondary)" }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-gold)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)" }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm reveal reveal-d2" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold transition-colors" style={{ color: "var(--gold)" }}>
              Sign up free
            </Link>
          </p>

          <div className="mt-12 pt-8 reveal reveal-d3" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-center text-xs mb-4 tracking-[3px] uppercase" style={{ color: "var(--text-muted)" }}>Trusted by</p>
            <div className="flex items-center justify-center gap-6">
              {["IIT Students", "IT Professionals", "Working Women"].map((t, i) => (
                <span key={i} className="text-xs" style={{ color: "var(--text-muted)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
