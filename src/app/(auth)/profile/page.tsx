"use client"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import type { SessionUser } from "@/types"
import BrandedSpinner from "@/components/ui/BrandedSpinner"

const KYC_STATUS: Record<string, { label: string; cls: string }> = {
  NONE:     { label: "Not submitted", cls: "badge-default" },
  PENDING:  { label: "Under review",  cls: "badge-pending" },
  APPROVED: { label: "KYC Verified",  cls: "badge-verified" },
  REJECTED: { label: "Rejected",      cls: "badge-danger" },
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const user        = session?.user as SessionUser | undefined
  const fileRef     = useRef<HTMLInputElement>(null)

  const [profile,      setProfile]      = useState<any>(null)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [form,         setForm]         = useState({ name: "", phone: "", whatsapp: "" })
  const [uploading,    setUploading]    = useState(false)
  const [kycUploading, setKycUploading] = useState(false)
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setForm({ name: data.name || "", phone: data.phone || "", whatsapp: data.whatsapp || "" })
        setLoading(false)
      })
  }, [])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const save = async () => {
    setSaving(true)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setProfile((p: any) => ({ ...p, ...updated }))
      showToast("Profile updated successfully")
    } else {
      const err = await res.json()
      showToast(err.error || "Failed to save", false)
    }
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const compressed = await new Promise<File>((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const SIZE = 400
        const canvas = document.createElement("canvas")
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext("2d")!
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file), "image/jpeg", 0.85)
      }
      img.src = url
    })
    const fd = new FormData()
    fd.append("file", compressed)
    const up = await fetch("/api/upload", { method: "POST", body: fd })
    if (up.ok) {
      const { url } = await up.json()
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      })
      setProfile((p: any) => ({ ...p, avatar: url }))
      showToast("Photo updated")
    } else {
      showToast("Upload failed — image may be too large", false)
    }
    setUploading(false)
    e.target.value = ""
  }

  const uploadKyc = async () => {
    setKycUploading(true)
    // Simulate DigiLocker popup sequence
    setTimeout(async () => {
      try {
        const res = await fetch("/api/kyc/digilocker", { method: "POST" })
        if (res.ok) {
          setProfile((p: any) => ({ ...p, kycStatus: "APPROVED" }))
          showToast("Successfully verified with DigiLocker!")
        } else {
          showToast("DigiLocker verification failed.", false)
        }
      } catch {
        showToast("Network error during verification.", false)
      } finally {
        setKycUploading(false)
      }
    }, 1200)
  }

  if (loading) {
    return (
      <>
        <Navbar forceWhite />
        <main>
          <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="space-y-3 w-full max-w-lg px-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        </div>
        </main>
      </>
    )
  }

  const isOwner  = user?.role === "OWNER" || user?.role === "BROKER"
  const kycSt    = KYC_STATUS[profile?.kycStatus || "NONE"]
  const initials = profile?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?"

  return (
    <>
      <Navbar forceWhite />
      <main>
      <div className="min-h-screen bg-background pt-16">

        {/* Page header */}
        <div className="bg-popover border-b border-border">
          <div className="section-wrap-narrow py-8">
            <h1 className="font-display font-bold text-2xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
              My Profile
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Manage your account details and verification</p>
          </div>
        </div>

        <div className="section-wrap-narrow py-8 space-y-5">

          {/* ── Avatar ──────────────────────────────────────────── */}
          <div className="rounded-2xl bg-popover border border-border p-6">
            <h2 className="font-display font-semibold text-base text-foreground mb-5">Profile Photo</h2>
            <div className="flex items-center gap-5">
              {/* Avatar circle */}
              <div className="relative w-20 h-20 shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                  {profile?.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt="avatar"
                      fill
                      className="object-cover rounded-full"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <span className="font-display font-bold text-2xl text-primary-foreground">{initials}</span>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white">
                    <BrandedSpinner size="md" />
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-outline btn-sm mb-1.5"
                >
                  {uploading ? "Uploading..." : "Change photo"}
                </button>
                <p className="font-body text-xs text-muted-foreground">JPG or PNG · Max 5MB</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </div>
            </div>
          </div>

          {/* ── Personal info ────────────────────────────────────── */}
          <div className="rounded-2xl bg-popover border border-border p-6">
            <h2 className="font-display font-semibold text-base text-foreground mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">Email</label>
                <input
                  value={profile?.email || ""}
                  disabled
                  className="input opacity-50 cursor-not-allowed"
                />
                <p className="font-body text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">Phone</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-muted border border-r-0 border-input rounded-l-lg font-body text-sm text-muted-foreground shrink-0">
                    +91
                  </span>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input rounded-l-none"
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="font-display text-sm font-medium text-foreground block mb-1.5">WhatsApp Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-muted border border-r-0 border-input rounded-l-lg font-body text-sm text-muted-foreground shrink-0">
                    +91
                  </span>
                  <input
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    className="input rounded-l-none"
                    placeholder="Shown to tenants for direct contact"
                    maxLength={10}
                  />
                </div>
              </div>

              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <BrandedSpinner size="sm" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ── Account details ──────────────────────────────────── */}
          <div className="rounded-2xl bg-popover border border-border p-6">
            <h2 className="font-display font-semibold text-base text-foreground mb-5">Account Details</h2>
            <dl className="space-y-0 divide-y divide-border">
              {[
                { label: "Role",         value: user?.role || "—" },
                { label: "Status",       value: user?.isApproved ? "Approved" : "Pending approval" },
                { label: "Member since", value: profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : "—" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3.5">
                  <dt className="font-body text-sm text-muted-foreground">{item.label}</dt>
                  <dd className="font-display font-semibold text-sm text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── KYC — owners only ────────────────────────────────── */}
          {isOwner && (
            <div className="rounded-2xl bg-popover border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-base text-foreground">KYC Verification</h2>
                <span className={kycSt.cls}>{kycSt.label}</span>
              </div>

              {profile?.kycStatus === "APPROVED" ? (
                <div className="rounded-xl bg-success/8 border border-success/20 p-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="font-body text-sm text-success font-medium">
                    Identity verified. Your listings show a KYC Verified badge.
                  </p>
                </div>

              ) : profile?.kycStatus === "PENDING" ? (
                <div className="rounded-xl bg-accent/10 border border-border p-4">
                  <p className="font-body text-sm text-foreground">
                    Documents submitted — our team will review within 24 hours.
                  </p>
                </div>

              ) : (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.14l7-3.11v7.96z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-slate-800">Secure Government Verification</h4>
                      <p className="font-body text-sm text-slate-600 leading-relaxed mt-1">
                        Link your DigiLocker account to securely fetch your Aadhaar or PAN card. KYC-verified owners get a badge on all listings and higher tenant trust.
                      </p>
                    </div>
                  </div>

                  <button onClick={uploadKyc} disabled={kycUploading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {kycUploading ? (
                      <>
                        <BrandedSpinner size="sm" />
                        Connecting to DigiLocker...
                      </>
                    ) : "Verify with DigiLocker"}
                  </button>
                  {profile?.kycStatus === "REJECTED" && (
                    <div className="rounded-xl bg-destructive/8 border border-destructive/20 p-4 mt-2">
                      <p className="font-body text-sm text-destructive font-medium">
                        Previous submission was rejected. Please re-initiate DigiLocker verification.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Danger zone ───────────────────────────────────── */}
          <div className="rounded-2xl border border-destructive/30 p-6">
            <h2 className="font-display font-semibold text-base text-destructive mb-2">Danger Zone</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Permanently delete your account and all personal data. Your bookings and reviews will be anonymised.
            </p>
            <button
              disabled={deleting}
              onClick={async () => {
                if (!confirm("Are you sure? This action is irreversible. Your account, personal data, and listings will be permanently removed.")) return
                setDeleting(true)
                try {
                  const res = await fetch("/api/profile/delete", { method: "DELETE" })
                  if (res.ok) {
                    signOut({ callbackUrl: "/auth/login" })
                  } else {
                    const d = await res.json()
                    setToast({ msg: d.error || "Failed to delete account", ok: false })
                    setDeleting(false)
                  }
                } catch {
                  setToast({ msg: "Network error", ok: false })
                  setDeleting(false)
                }
              }}
              className="btn-danger btn-sm"
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>
          </div>


        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3.5 shadow-elevated font-display font-medium text-sm animate-fade-up"
          style={{ background: toast.ok ? "hsl(var(--success))" : "hsl(var(--destructive))", color: "white" }}
        >
          {toast.msg}
        </div>
      )}

      </main>
      <Footer />
    </>
  )
}
