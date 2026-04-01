import { withHandler } from "@/lib/handler"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rateLimit"
import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/prisma"
import type { SessionUser } from "@/types"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Rate limit: 10 uploads per hour per user
  const rl = await rateLimit(`kyc-upload:${user.id}`, 10, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    )
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const type = formData.get("type") as string | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!type || !["AADHAAR_FRONT", "AADHAAR_BACK", "PAN"].includes(type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPG, PNG, and PDF are allowed." },
      { status: 400 }
    )
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    )
  }

  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary in secure folder
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `pglife/kyc/${user.id}`,
          resource_type: "auto",
          access_mode: "authenticated" as any, // Secure access
          tags: ["kyc", type, user.id],
        } as any,
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    // Check if document of this type already exists
    const existing = await prisma.kYCDocument.findFirst({
      where: { userId: user.id, type },
    })

    let kycDoc
    if (existing) {
      // Update existing document
      kycDoc = await prisma.kYCDocument.update({
        where: { id: existing.id },
        data: {
          fileUrl: result.secure_url,
          status: "PENDING",
          reason: null,
          reviewedAt: null,
          reviewedBy: null,
        },
      })
    } else {
      // Create new document
      kycDoc = await prisma.kYCDocument.create({
        data: {
          userId: user.id,
          type,
          fileUrl: result.secure_url,
          status: "PENDING",
        },
      })
    }

    return NextResponse.json({
      success: true,
      document: {
        id: kycDoc.id,
        type: kycDoc.type,
        status: kycDoc.status,
        uploadedAt: kycDoc.uploadedAt,
      },
    })
  } catch (error: any) {
    console.error("KYC upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload document" },
      { status: 500 }
    )
  }
})
