"use client"
import type { SessionUser } from "@/types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

type Tab = "approvals" | "properties" | "kyc"

export default function AdminPanel() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined

  const [tab, setTab]                 = useState<Tab>("approvals")
  const [pending, setPending]         = useState<any[]>([])
  const [properties, setProperties]   = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [kycOwners, setKycOwners]     = useState<any[]>([])
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (user?.role !== "ADMIN") return
    Promise.all([
      fetch("/api/admin/owners").then(r => r.json()),
      fetch("/api/properties?limit=200").then(r => r.json()),
      fetch("/api/admin/owners?kycStatus=PENDING").then(r => r.json()).catch(() => []),
    ]).then(([owners, props, kyc]) => {
      setKycOwners(Array.isArray(kyc) ? kyc : [])
      setPending(Array.isArray(owners) ? owners : [])
      const list = props?.properties ?? props
      setProperties(Array.isArray(list) ? list : [])
      setLoading(false)
    })
  }, [session, user?.role])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const approveOwner = async (id: string, approved: boolean) => {
    const res = await fetch(`/api/admin/owners/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    })
    if (res.ok) {
      setPending(prev => prev.filter(u => u.id !== id))
      showToast(approved ? "Owner approved" : "Owner rejected")
    } else showToast("Action failed", "error")
  }

  const toggleVerified = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current }),
    })
    if (res.ok) {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, isVerified: !current } : p))
      showToast(!current ? "Property verified" : "Verification removed")
    } else showToast("Action failed", "error")
  }

  if (user?.role !== "ADMIN") {
    return (
      <>
        <Navbar />
      <main>
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">Access Denied</h1>
            <p className="font-body text-sm text-muted-foreground">Admin access required.</p>
          </div>
        </div>
            {tab === "kyc" && (
            kycOwners.length === 0 ? (
              <div className="rounded-xl bg-popover shadow-soft p-12 text-center">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">No pending KYC</h3>
                <p className="font-body text-sm text-muted-foreground">No owners have submitted KYC documents.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kycOwners.map((owner: any) => (
                  <div key={owner.id} className="rounded-xl bg-popover shadow-soft p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display font-semibold text-base text-foreground">{owner.name}</h3>
                        <p className="font-body text-sm text-muted-foreground">{owner.email}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {owner.kycDocUrl && (
                          <a href={owner.kycDocUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-outline btn-sm">View ID</a>
                        )}
                        {owner.licenseUrl && (
                          <a href={owner.licenseUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-outline btn-sm">View License</a>
                        )}
                        <button className="btn-primary btn-sm"
                          onClick={async () => {
                            await fetch(`/api/admin/owners/${owner.id}`, {
                              method: "PUT", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ kycStatus: "APPROVED" }),
                            })
                            setKycOwners(prev => prev.filter(o => o.id !== owner.id))
                            showToast("KYC approved")
                          }}>
                          Approve KYC
                        </button>
                        <button className="btn-danger btn-sm"
                          onClick={async () => {
                            await fetch(`/api/admin/owners/${owner.id}`, {
                              method: "PUT", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ kycStatus: "REJECTED" }),
                            })
                            setKycOwners(prev => prev.filter(o => o.id !== owner.id))
                            showToast("KYC rejected")
                          }}>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

      </main>
      <Footer />
      </>
    )
  }

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <main>
      <div className="min-h-screen bg-background pt-16">

        {/* Header */}
        <div className="bg-popover border-b border-border">
          <div className="section-wrap py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
                  Admin Panel
                </h1>
                <p className="font-body text-sm text-muted-foreground">Logged in as {user?.name}</p>
              </div>
              {pending.length > 0 && (
                <span className="badge-danger text-sm">
                  {pending.length} pending approval{pending.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="section-wrap py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Pending Approvals", value: pending.length },
              { label: "Total Listings",    value: properties.length },
              { label: "Verified PGs",      value: properties.filter(p => p.isVerified).length },
              { label: "Active Listings",   value: properties.filter(p => p.isActive).length },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="font-display font-bold text-3xl text-foreground tabular-nums block mb-1">{s.value}</span>
                <p className="font-body text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
            <button onClick={() => setTab("approvals")} className={tab === "approvals" ? "tab-btn-active" : "tab-btn-inactive"}>
              Pending Approvals {pending.length > 0 && <span className="badge-danger ml-1 text-[10px]">{pending.length}</span>}
            </button>
            <button onClick={() => setTab("properties")} className={tab === "properties" ? "tab-btn-active" : "tab-btn-inactive"}>
              All Listings ({properties.length})
            </button>
            <button onClick={() => setTab("kyc")} className={tab === "kyc" ? "tab-btn-active" : "tab-btn-inactive"}>
              KYC Review
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl h-24 skeleton" />)}
            </div>
          ) : tab === "approvals" ? (
            pending.length === 0 ? (
              <div className="rounded-xl bg-popover shadow-soft p-12 text-center">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">All caught up!</h3>
                <p className="font-body text-sm text-muted-foreground">No pending owner approvals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(owner => (
                  <div key={owner.id} className="rounded-xl bg-popover shadow-soft p-5 flex items-center gap-4">
                    <div className="avatar h-12 w-12 bg-primary/10 text-primary font-display font-bold text-lg shrink-0">
                      {owner.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display font-semibold text-base text-foreground">{owner.name}</h3>
                        <span className={`badge text-[10px] ${owner.role === "BROKER" ? "badge-pending" : "badge-default"}`}>
                          {owner.role}
                        </span>
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{owner.email}</p>
                      {owner.phone && <p className="font-body text-xs text-muted-foreground">{owner.phone}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveOwner(owner.id, true)} className="btn-primary btn-sm">Approve</button>
                      <button onClick={() => approveOwner(owner.id, false)} className="btn-outline btn-sm">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or city..."
                className="input mb-5 max-w-sm"
              />
              <div className="space-y-3">
                {filtered.map(p => (
                  <div key={p.id} className="rounded-xl bg-popover shadow-soft p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display font-semibold text-base text-foreground truncate">{p.name}</h3>
                        {p.isVerified && <span className="badge-verified text-[10px]">Verified</span>}
                        {!p.isActive && <span className="badge-danger text-[10px]">Inactive</span>}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{p.city} · {p.owner?.name}</p>
                    </div>
                    <button
                      onClick={() => toggleVerified(p.id, p.isVerified)}
                      className={p.isVerified ? "btn-outline btn-sm" : "btn-primary btn-sm"}
                    >
                      {p.isVerified ? "Remove Verify" : "Verify"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3.5 shadow-elevated font-display font-medium text-sm
          ${toast.type === "success" ? "bg-success text-white" : "bg-destructive text-white"}`}>
          {toast.msg}
        </div>
      )}

          {tab === "kyc" && (
            kycOwners.length === 0 ? (
              <div className="rounded-xl bg-popover shadow-soft p-12 text-center">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">No pending KYC</h3>
                <p className="font-body text-sm text-muted-foreground">No owners have submitted KYC documents.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kycOwners.map((owner: any) => (
                  <div key={owner.id} className="rounded-xl bg-popover shadow-soft p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display font-semibold text-base text-foreground">{owner.name}</h3>
                        <p className="font-body text-sm text-muted-foreground">{owner.email}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {owner.kycDocUrl && (
                          <a href={owner.kycDocUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-outline btn-sm">View ID</a>
                        )}
                        {owner.licenseUrl && (
                          <a href={owner.licenseUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-outline btn-sm">View License</a>
                        )}
                        <button className="btn-primary btn-sm"
                          onClick={async () => {
                            await fetch(`/api/admin/owners/${owner.id}`, {
                              method: "PUT", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ kycStatus: "APPROVED" }),
                            })
                            setKycOwners(prev => prev.filter(o => o.id !== owner.id))
                            showToast("KYC approved")
                          }}>
                          Approve KYC
                        </button>
                        <button className="btn-danger btn-sm"
                          onClick={async () => {
                            await fetch(`/api/admin/owners/${owner.id}`, {
                              method: "PUT", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ kycStatus: "REJECTED" }),
                            })
                            setKycOwners(prev => prev.filter(o => o.id !== owner.id))
                            showToast("KYC rejected")
                          }}>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

      </main>
      <Footer />
    </>
  )
}
