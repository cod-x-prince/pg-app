"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

type Role = "TENANT" | "OWNER";

const ROLES = [
  {
    value: "TENANT" as Role,
    label: "I'm a Tenant",
    desc: "Looking for a PG to stay",
    perks: ["Browse verified PGs", "Direct owner contact", "Token booking"],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    value: "OWNER" as Role,
    label: "I'm an Owner",
    desc: "Want to list my PG",
    perks: ["List for free", "Manage bookings", "Direct tenant contact"],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<Role>("TENANT");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role, turnstileToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }
    const sr = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (sr?.error) {
      router.push("/auth/login");
      return;
    }
    router.push(role === "TENANT" ? "/dashboard" : "/owner/dashboard");
  }

  return (
    <main>
      <div className="min-h-screen flex bg-background">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=90"
            alt="Cozy room"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/75 to-secondary/50" />
          <div className="relative z-10 flex flex-col justify-between p-14 w-full">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-elevated">
                <span className="font-display font-bold text-sm text-white">
                  PG
                </span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                PGLife
              </span>
            </Link>
            <div>
              <h2
                className="font-display font-bold text-4xl text-white mb-4 leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                Join 3,000+
                <br />
                happy tenants.
              </h2>
              <p className="font-body text-white/60 text-base mb-10">
                No broker fees. No fake listings. Just real homes, real owners.
              </p>
              <ul className="space-y-3">
                {[
                  "100% verified listings",
                  "Direct owner contact via WhatsApp",
                  "Token booking — hold your room in 2 min",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 text-primary"
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
                    <span className="font-body text-sm text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-xs text-white">
                  PG
                </span>
              </div>
              <span className="font-display font-bold text-lg">PGLife</span>
            </Link>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              {["Choose role", "Your details"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`h-px flex-1 w-8 transition-colors ${step === "details" ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-1.5 text-xs font-display font-medium transition-colors ${
                      (i === 0 && step === "role") ||
                      (i === 1 && step === "details")
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                        i === 0 && step === "details"
                          ? "bg-success text-white"
                          : (i === 0 && step === "role") ||
                              (i === 1 && step === "details")
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i === 0 && step === "details" ? "✓" : i + 1}
                    </div>
                    {s}
                  </div>
                </div>
              ))}
            </div>

            {step === "role" && (
              <div>
                <h1
                  className="font-display font-bold text-2xl text-foreground mb-2"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  How will you use PGLife?
                </h1>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  Choose your role to get started
                </p>

                <div className="space-y-3 mb-8">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className="w-full rounded-xl p-5 text-left transition-all duration-200 cursor-pointer"
                      style={{
                        border: `2px solid ${role === r.value ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                        background:
                          role === r.value
                            ? "hsl(var(--primary)/0.05)"
                            : "hsl(var(--popover))",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            role === r.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-display font-semibold text-base text-foreground">
                              {r.label}
                            </p>
                            {role === r.value && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
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
                            )}
                          </div>
                          <p className="font-body text-sm text-muted-foreground mt-0.5">
                            {r.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep("details")}
                  className="btn-primary w-full h-12"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === "details" && (
              <div>
                <button
                  onClick={() => setStep("role")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>

                <h1
                  className="font-display font-bold text-2xl text-foreground mb-2"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Create your account
                </h1>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  Signing up as a{" "}
                  <span className="text-primary font-medium">
                    {role === "TENANT" ? "Tenant" : "PG Owner"}
                  </span>
                </p>

                <form onSubmit={handleSignup} className="space-y-4">
                  {[
                    {
                      key: "name",
                      label: "Full Name",
                      type: "text",
                      placeholder: "Rahul Sharma",
                      autoComplete: "name",
                    },
                    {
                      key: "email",
                      label: "Email",
                      type: "email",
                      placeholder: "rahul@example.com",
                      autoComplete: "email",
                    },
                    {
                      key: "phone",
                      label: "Phone",
                      type: "tel",
                      placeholder: "+91 9876543210",
                    },
                    {
                      key: "password",
                      label: "Password",
                      type: "password",
                      placeholder: "Min 8 characters",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="font-display text-sm font-medium text-foreground block mb-1.5">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="input"
                      />
                    </div>
                  ))}

                  <TurnstileWidget onVerify={setTurnstileToken} />

                  {error && (
                    <div className="rounded-lg p-3 bg-destructive/8 border border-destructive/20">
                      <p className="font-body text-sm text-destructive">
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-12 mt-2"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              </div>
            )}

            <p className="mt-8 text-center font-body text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
