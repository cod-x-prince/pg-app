"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { SessionUser } from "@/types"

interface KYCDocument {
  id: string
  type: string
  fileUrl: string
  status: string
  reason?: string
  uploadedAt: string
  reviewedAt?: string
}

export default function KYCUpload() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadDocuments()
  }, [user])

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/kyc")
      const data = await res.json()
      setDocuments(data)
    } catch (err) {
      console.error("Failed to load KYC documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (type: string, file: File) => {
    setUploading(type)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const res = await fetch("/api/kyc/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      await loadDocuments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(null)
    }
  }

  const getDocument = (type: string) => {
    return documents.find((doc) => doc.type === type)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-50"
      case "REJECTED":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved"
      case "REJECTED":
        return "Rejected"
      default:
        return "Pending Review"
    }
  }

  const DocumentUploadCard = ({ type, label }: { type: string; label: string }) => {
    const doc = getDocument(type)
    const isUploading = uploading === type

    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium text-foreground mb-1">{label}</h3>
            {doc && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(doc.status)}`}>
                {getStatusText(doc.status)}
              </span>
            )}
          </div>
          {doc && (
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              View →
            </a>
          )}
        </div>

        {doc?.status === "REJECTED" && doc.reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">
              <strong>Rejection Reason:</strong> {doc.reason}
            </p>
          </div>
        )}

        <label className="block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(type, file)
            }}
            className="hidden"
          />
          <div
            className={`btn-outline w-full text-center cursor-pointer ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Uploading...
              </span>
            ) : doc ? (
              "Replace Document"
            ) : (
              "Upload Document"
            )}
          </div>
        </label>

        {doc && (
          <p className="text-xs text-muted-foreground mt-2">
            Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>
    )
  }

  if (!user || (user.role !== "OWNER" && user.role !== "BROKER")) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-muted/30 rounded-xl p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  const allApproved = ["AADHAAR_FRONT", "AADHAAR_BACK", "PAN"].every(
    (type) => getDocument(type)?.status === "APPROVED"
  )

  return (
    <div className="bg-muted/30 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display font-semibold text-xl text-foreground mb-2">
            KYC Verification
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload your documents to verify your identity and start listing properties.
          </p>
        </div>
        {allApproved && (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Verified</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <DocumentUploadCard type="AADHAAR_FRONT" label="Aadhaar Card (Front)" />
        <DocumentUploadCard type="AADHAAR_BACK" label="Aadhaar Card (Back)" />
        <DocumentUploadCard type="PAN" label="PAN Card" />
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-sm text-foreground mb-2">Upload Guidelines:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Accepted formats: JPG, PNG, PDF</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Ensure documents are clear and readable</li>
          <li>• All details should be visible (no blur or glare)</li>
          <li>• Documents will be reviewed within 24-48 hours</li>
        </ul>
      </div>
    </div>
  )
}
