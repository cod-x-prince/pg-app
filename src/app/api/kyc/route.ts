export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"
import cloudinary from "@/lib/cloudinary"
import type { SessionUser } from "@/types"

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user || !["OWNER","BROKER"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const kycFile     = formData.get("kycDoc") as File | null
  const licenseFile = formData.get("license") as File | null

  if (!kycFile && !licenseFile)
    return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const uploadFile = async (file: File, type: string) => {
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`
    const result = await cloudinary.uploader.upload(base64, {
      folder: `pglife/kyc/${user.id}/${type}`,
      resource_type: "image",
      allowed_formats: ["jpg","jpeg","png","pdf","webp"],
    } as any)
    return result.secure_url
  }

  // Upload files and create KYCDocument records
  const uploads = []
  
  if (kycFile) {
    const url = await uploadFile(kycFile, "identity")
    uploads.push(
      prisma.kYCDocument.create({
        data: {
          userId: user.id,
          type: "identity",
          fileUrl: url,
          status: "PENDING",
        }
      })
    )
  }
  
  if (licenseFile) {
    const url = await uploadFile(licenseFile, "license")
    uploads.push(
      prisma.kYCDocument.create({
        data: {
          userId: user.id,
          type: "license",
          fileUrl: url,
          status: "PENDING",
        }
      })
    )
  }

  await Promise.all(uploads)
  return NextResponse.json({ success: true })
})
