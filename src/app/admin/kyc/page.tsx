"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { SessionUser } from "@/types"

interface KYCSubmission {
  userId: string
  userName: string
  userEmail: string
  documents: {
    id: string
    type: string
    fileUrl: string
    status: string
    uploadedAt: string
  }[]
}

export default function AdminKYCPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as SessionUser | undefined
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<"pending" | "all">("pending")

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/")
      return
    }
    loadSubmissions()
  }, [user, router])

  const loadSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/kyc")
      const data = await res.json()
      setSubmissions(data)
    } catch (error) {
      console.error("Failed to load KYC submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (docId: string, decision: "APPROVED" | "REJECTED", reason?: string) => {
    setProcessing(docId)
    try {
      const res = await fetch(`/api/admin/kyc/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, reason }),
      })

      if (res.ok) {
        await loadSubmissions()
      } else {
        alert("Failed to update KYC status")
      }
    } catch (error) {
      console.error("Failed to review KYC:", error)
      alert("Failed to review KYC document")
    } finally {
      setProcessing(null)
    }
  }

  const filteredSubmissions = filter === "pending"
    ? submissions.filter(s => s.documents.some(d => d.status === "PENDING"))
    : submissions

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="section-wrap py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display font-bold text-2xl mb-6">KYC Verification Review</h1>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Pending ({submissions.filter(s => s.documents.some(d => d.status === "PENDING")).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            All ({submissions.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">No KYC submissions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <div key={submission.userId} className="bg-white rounded-xl border border-border p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{submission.userName}</h3>
                  <p className="text-sm text-muted-foreground">{submission.userEmail}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {submission.documents.map((doc) => (
                    <div key={doc.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-sm">{doc.type.replace(/_/g, " ")}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block mt-1 ${
                            doc.status === "APPROVED"
                              ? "bg-green-50 text-green-600"
                              : doc.status === "REJECTED"
                              ? "bg-red-50 text-red-600"
                              : "bg-yellow-50 text-yellow-600"
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          View →
                        </a>
                      </div>

                      {doc.status === "PENDING" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleReview(doc.id, "APPROVED")}
                            disabled={processing === doc.id}
                            className="btn-primary btn-sm flex-1 text-xs"
                          >
                            {processing === doc.id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Rejection reason (optional):")
                              handleReview(doc.id, "REJECTED", reason || undefined)
                            }}
                            disabled={processing === doc.id}
                            className="btn-danger btn-sm flex-1 text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
