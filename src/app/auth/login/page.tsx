"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BrandedSpinner from "@/components/ui/BrandedSpinner";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password. Please try again.");
    else router.push("/dashboard");
  }

  return (
    <main>
      <div className="min-h-screen flex bg-background">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=90"
            alt="Warm home"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/70 to-secondary/50" />
          <div className="relative z-10 flex flex-col justify-between p-14 w-full">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-elevated">
                <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
                  <path d="M13 2L22 8V22H16V15H13V22H4V8L13 2Z" fill="white" opacity=".95"/>
                  <rect x="13" y="15" width="4" height="7" rx="1.5" fill="white"/>
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Gharam
              </span>
            </Link>

            <div>
              <h2
                className="font-display font-bold text-4xl text-white mb-4 leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                Your perfect home
                <br />
                is waiting for you.
              </h2>
              <p className="font-body text-white/60 text-base mb-10 leading-relaxed">
                Thousands of verified PGs across India. Zero broker, direct
                booking.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "7+", label: "Verified PGs" },
                  { value: "5+", label: "Cities" },
                  { value: "4.8★", label: "Avg Rating" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <p className="font-display font-bold text-2xl text-white tabular-nums">
                      {s.value}
                    </p>
                    <p className="font-body text-xs text-white/50 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
                  <path d="M13 2L22 8V22H16V15H13V22H4V8L13 2Z" fill="white" opacity=".95"/>
                  <rect x="13" y="15" width="4" height="7" rx="1.5" fill="white"/>
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Gharam
              </span>
            </Link>

            <div className="mb-8">
              <h1
                className="font-display font-bold text-2xl text-foreground mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Welcome back
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-display text-sm font-medium text-foreground">
                    Password
                  </label>
                  {/* Fix P1-5: Replace dead forgot-password link with valid route */}
                  <Link
                    href="/auth/forgot-password"
                    className="font-body text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              {error && (
                <div className="rounded-lg p-3 bg-destructive/8 border border-destructive/20">
                  <p className="font-body text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <BrandedSpinner size="sm" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="divider flex-1" />
                <span className="font-body text-xs text-muted-foreground">
                  or
                </span>
                <div className="divider flex-1" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="btn-outline w-full h-12 gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            <p className="mt-8 text-center font-body text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
