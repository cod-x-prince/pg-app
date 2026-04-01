-- Schema Improvements V1
-- 1. Add cascade deletes to all foreign keys
-- 2. Remove duplicate KYC fields from User (kycDocUrl, licenseUrl, kycStatus)
-- 3. Add price history fields to Booking (tokenAmount, monthlyRent)

-- ==============================================================================
-- Step 1: Migrate existing User KYC data to KYCDocument table
-- ==============================================================================

-- Migrate kycDocUrl to KYCDocument
INSERT INTO "KYCDocument" (id, "userId", type, "fileUrl", status, "uploadedAt", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'identity',
  "kycDocUrl",
  "kycStatus",
  "createdAt",
  "createdAt",
  "updatedAt"
FROM "User"
WHERE "kycDocUrl" IS NOT NULL;

-- Migrate licenseUrl to KYCDocument
INSERT INTO "KYCDocument" (id, "userId", type, "fileUrl", status, "uploadedAt", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'license',
  "licenseUrl",
  "kycStatus",
  "createdAt",
  "createdAt",
  "updatedAt"
FROM "User"
WHERE "licenseUrl" IS NOT NULL;

-- ==============================================================================
-- Step 2: Add price history fields to Booking
-- ==============================================================================

-- Add tokenAmount column (default 500)
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "tokenAmount" INTEGER NOT NULL DEFAULT 500;

-- Add monthlyRent column (backfill from Room.rent)
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "monthlyRent" INTEGER;

-- Backfill monthlyRent from Room table
UPDATE "Booking" b
SET "monthlyRent" = r.rent
FROM "Room" r
WHERE b."roomId" = r.id
AND b."monthlyRent" IS NULL;

-- Make monthlyRent NOT NULL after backfill
ALTER TABLE "Booking" ALTER COLUMN "monthlyRent" SET NOT NULL;

-- ==============================================================================
-- Step 3: Add CASCADE to all foreign key constraints
-- ==============================================================================

-- Property.ownerId → User.id (CASCADE)
ALTER TABLE "Property" DROP CONSTRAINT IF EXISTS "Property_ownerId_fkey";
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" 
  FOREIGN KEY ("ownerId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Room.propertyId → Property.id (CASCADE)
ALTER TABLE "Room" DROP CONSTRAINT IF EXISTS "Room_propertyId_fkey";
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- Booking.tenantId → User.id (CASCADE)
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_tenantId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Booking.propertyId → Property.id (CASCADE)
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_propertyId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- Booking.roomId → Room.id (CASCADE)
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_roomId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" 
  FOREIGN KEY ("roomId") REFERENCES "Room"(id) ON DELETE CASCADE;

-- Review.tenantId → User.id (CASCADE)
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_tenantId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Review.propertyId → Property.id (CASCADE)
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_propertyId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- Image.propertyId → Property.id (CASCADE)
ALTER TABLE "Image" DROP CONSTRAINT IF EXISTS "Image_propertyId_fkey";
ALTER TABLE "Image" ADD CONSTRAINT "Image_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- Video.propertyId → Property.id (CASCADE)
ALTER TABLE "Video" DROP CONSTRAINT IF EXISTS "Video_propertyId_fkey";
ALTER TABLE "Video" ADD CONSTRAINT "Video_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- Amenity.propertyId → Property.id (CASCADE)
ALTER TABLE "Amenity" DROP CONSTRAINT IF EXISTS "Amenity_propertyId_fkey";
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- Like.userId → User.id (CASCADE)
ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "Like_userId_fkey";
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Like.propertyId → Property.id (CASCADE)
ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "Like_propertyId_fkey";
ALTER TABLE "Like" ADD CONSTRAINT "Like_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "Property"(id) ON DELETE CASCADE;

-- KYCDocument.userId → User.id (CASCADE)
ALTER TABLE "KYCDocument" DROP CONSTRAINT IF EXISTS "KYCDocument_userId_fkey";
ALTER TABLE "KYCDocument" ADD CONSTRAINT "KYCDocument_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Notification.userId → User.id (CASCADE)
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

-- ==============================================================================
-- Step 4: Remove duplicate KYC fields from User table
-- ==============================================================================

ALTER TABLE "User" DROP COLUMN IF EXISTS "kycDocUrl";
ALTER TABLE "User" DROP COLUMN IF EXISTS "licenseUrl";
ALTER TABLE "User" DROP COLUMN IF EXISTS "kycStatus";

-- ==============================================================================
-- Done! Schema improvements applied.
-- ==============================================================================
