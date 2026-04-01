export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { SessionUser } from "@/types";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { withHandler } from "@/lib/handler";

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !["OWNER", "BROKER", "ADMIN"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isApproved)
    return NextResponse.json(
      { error: "Account pending approval" },
      { status: 403 },
    );

  const rl = await rateLimit(`upload:${user.id}`, 30, 60 * 60 * 1000);
  if (!rl.success)
    return NextResponse.json(
      { error: "Upload limit reached. Try again later." },
      { status: 429 },
    );

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo)
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP images and MP4/WebM videos are allowed" },
      { status: 400 },
    );

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize)
    return NextResponse.json(
      { error: `File too large. Max ${isImage ? "10MB" : "100MB"}.` },
      { status: 400 },
    );

  // IMAGE DIMENSION VALIDATION - Security and UX improvement
  if (isImage) {
    try {
      const bytes = await file.arrayBuffer();
      const dimensions = await getImageDimensions(bytes, file.type);

      // Minimum dimensions to prevent 1x1 pixel spam
      if (dimensions.width < 400 || dimensions.height < 300) {
        return NextResponse.json(
          { error: "Image too small. Minimum 400x300 pixels required." },
          { status: 400 },
        );
      }

      // Maximum dimensions to prevent abuse (20MP max)
      if (dimensions.width * dimensions.height > 20_000_000) {
        return NextResponse.json(
          { error: "Image resolution too high. Maximum 20 megapixels." },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid image file or corrupted data" },
        { status: 400 },
      );
    }
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: `pglife/${user.id}`,
    resource_type: isVideo ? "video" : "image",
    allowed_formats: isImage
      ? ["jpg", "jpeg", "png", "webp"]
      : ["mp4", "webm", "mov"],
    transformation: isImage
      ? [{ quality: "auto" as const, fetch_format: "auto" as const, strip: true }]
      : undefined,
  } as any);

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
  });
});

/**
 * Extract image dimensions from buffer without loading full image
 * Supports JPEG, PNG, WebP
 */
async function getImageDimensions(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<{ width: number; height: number }> {
  const bytes = new Uint8Array(buffer);

  // JPEG dimensions
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) break;
      offset++;
      const marker = bytes[offset];
      offset++;

      if (marker === 0xc0 || marker === 0xc2) {
        // SOF0 or SOF2
        const height = (bytes[offset + 3]! << 8) | bytes[offset + 4]!;
        const width = (bytes[offset + 5]! << 8) | bytes[offset + 6]!;
        return { width, height };
      }

      const length = (bytes[offset]! << 8) | bytes[offset + 1]!;
      offset += length;
    }
  }

  // PNG dimensions
  if (mimeType === "image/png") {
    const width =
      (bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!;
    const height =
      (bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!;
    return { width, height };
  }

  // WebP dimensions
  if (mimeType === "image/webp") {
    // Simple WebP VP8 format
    if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38) {
      const width = ((bytes[26]! | (bytes[27]! << 8)) & 0x3fff) + 1;
      const height = ((bytes[28]! | (bytes[29]! << 8)) & 0x3fff) + 1;
      return { width, height };
    }
  }

  throw new Error("Unsupported image format for dimension extraction");
}
