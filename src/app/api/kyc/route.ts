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

  const uploadFile = async (file: File, folder: string) => {
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`
    const result = await cloudinary.uploader.upload(base64, {
      folder: `pglife/kyc/${user.id}/${folder}`,
      resource_type: "image",
      allowed_formats: ["jpg","jpeg","png","pdf","webp"],
    })
    return result.secure_url
  }

  const updateData: Record<string, unknown> = { kycStatus: "PENDING" }
  if (kycFile)     updateData.kycDocUrl   = await uploadFile(kycFile, "identity")
  if (licenseFile) updateData.licenseUrl  = await uploadFile(licenseFile, "license")

  await prisma.user.update({ where: { id: user.id }, data: updateData })
  return NextResponse.json({ success: true })
})
