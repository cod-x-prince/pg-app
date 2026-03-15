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
    <div className="min-h-screen flex">

      {/* Left — Premium Visual Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=90"
          alt="Premium PG living"
          fill
          className="object-cover"
          priority
        />
        {/* Rich overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2347]/85 via-[#1B3B6F]/70 to-[#0F2347]/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <Link href="/" className="flex items-center gap-3 reveal">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="font-serif text-2xl font-semibold text-white tracking-tight">PGLife</span>
          </Link>

          <div className="reveal reveal-d2">
            <div className="divider-gold mb-8 w-16">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1" />
            </div>
            <blockquote className="font-serif text-3xl text-white leading-tight mb-4 italic">
              &ldquo;Your perfect home<br />
              <span className="text-[#F59E0B]">awaits you.</span>&rdquo;
            </blockquote>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Join thousands of tenants who found their ideal PG through PGLife.
              Verified listings. Real reviews. Zero broker fees.
            </p>
          </div>

          <div className="flex items-center gap-4 reveal reveal-d3">
            <div className="flex -space-x-2">
              {["A","B","C"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-[#1B3B6F] border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-white/60 text-xs">
              <span className="text-white font-medium">2,400+</span> tenants found their home this month
            </p>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-[#1B3B6F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="font-serif text-xl font-semibold text-[#1B3B6F]">PGLife</span>
          </Link>

          <div className="reveal mb-10">
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm reveal">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 reveal reveal-d1">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-xs text-[#1B3B6F] hover:text-[#F59E0B] transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="input"
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
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
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

          <p className="mt-8 text-center text-sm text-gray-400 reveal reveal-d2">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[#1B3B6F] font-semibold hover:text-[#F59E0B] transition-colors">
              Sign up free
            </Link>
          </p>

          {/* Trust signals */}
          <div className="mt-12 pt-8 border-t border-gray-100 reveal reveal-d3">
            <p className="text-center text-xs text-gray-300 mb-4">TRUSTED BY</p>
            <div className="flex items-center justify-center gap-6">
              {["IIT Students", "IT Professionals", "Working Women"].map((t, i) => (
                <span key={i} className="text-xs text-gray-400 font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
