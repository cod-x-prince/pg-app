"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import type { SessionUser } from "@/types"

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
  const kycRef      = useRef<HTMLInputElement>(null)
  const licenseRef  = useRef<HTMLInputElement>(null)

  const [profile,      setProfile]      = useState<any>(null)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [form,         setForm]         = useState({ name: "", phone: "", whatsapp: "" })
  const [uploading,    setUploading]    = useState(false)
  const [kycUploading, setKycUploading] = useState(false)
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)

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
    const kycFile     = kycRef.current?.files?.[0]
    const licenseFile = licenseRef.current?.files?.[0]
    if (!kycFile && !licenseFile) { showToast("Select at least one document", false); return }
    setKycUploading(true)
    const fd = new FormData()
    if (kycFile)     fd.append("kycDoc", kycFile)
    if (licenseFile) fd.append("license", licenseFile)
    const res = await fetch("/api/kyc", { method: "POST", body: fd })
    setKycUploading(false)
    if (res.ok) {
      setProfile((p: any) => ({ ...p, kycStatus: "PENDING" }))
      showToast("Documents submitted for review")
      if (kycRef.current)     kycRef.current.value = ""
      if (licenseRef.current) licenseRef.current.value = ""
    } else {
      showToast("Upload failed. Try again.", false)
    }
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
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
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
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
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
                <div className="space-y-5">
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Upload your Aadhaar or PAN card and optionally your PG registration certificate.
                    KYC-verified owners get a badge on all listings and higher tenant trust.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="font-display text-sm font-medium text-foreground block mb-2">
                        Identity Document <span className="text-primary">*</span>
                        <span className="font-body font-normal text-muted-foreground ml-1">(Aadhaar / PAN)</span>
                      </label>
                      <input ref={kycRef} type="file" accept="image/*,.pdf"
                        className="block w-full font-body text-sm text-muted-foreground
                          file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                          file:font-display file:font-medium file:text-sm
                          file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20 cursor-pointer" />
                    </div>

                    <div>
                      <label className="font-display text-sm font-medium text-foreground block mb-2">
                        PG / Business License
                        <span className="font-body font-normal text-muted-foreground ml-1">(optional)</span>
                      </label>
                      <input ref={licenseRef} type="file" accept="image/*,.pdf"
                        className="block w-full font-body text-sm text-muted-foreground
                          file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                          file:font-display file:font-medium file:text-sm
                          file:bg-muted file:text-muted-foreground
                          hover:file:bg-muted/80 cursor-pointer" />
                    </div>

                    <button onClick={uploadKyc} disabled={kycUploading} className="btn-primary">
                      {kycUploading ? "Submitting..." : "Submit for Verification"}
                    </button>
                  </div>

                  {profile?.kycStatus === "REJECTED" && (
                    <div className="rounded-xl bg-destructive/8 border border-destructive/20 p-4 mt-2">
                      <p className="font-body text-sm text-destructive font-medium">
                        Previous submission was rejected. Please re-upload clearer documents.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
