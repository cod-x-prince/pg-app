import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "@/lib/validation"
import { rateLimit } from "@/lib/rateLimit"
import { withHandler } from "@/lib/handler"

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!user || !["OWNER", "BROKER", "ADMIN"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!user.isApproved)
    return NextResponse.json({ error: "Account pending approval" }, { status: 403 })

  const rl = await rateLimit(`upload:${user.id}`, 30, 60 * 60 * 1000)
  if (!rl.success)
    return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 })

  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
  if (!isImage && !isVideo)
    return NextResponse.json({ error: "Only JPG, PNG, WebP images and MP4/WebM videos are allowed" }, { status: 400 })

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (file.size > maxSize)
    return NextResponse.json({ error: `File too large. Max ${isImage ? "10MB" : "100MB"}.` }, { status: 400 })

  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

  const result = await cloudinary.uploader.upload(base64, {
    folder:        `pglife/${user.id}`,
    resource_type: isVideo ? "video" : "image",
    allowed_formats: isImage ? ["jpg", "jpeg", "png", "webp"] : ["mp4", "webm", "mov"],
    transformation: isImage ? [{ quality: "auto", fetch_format: "auto", strip: true }] : undefined,
  })

  return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
})
