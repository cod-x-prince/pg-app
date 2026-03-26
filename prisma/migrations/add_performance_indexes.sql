-- Add composite indexes for common query patterns
-- These improve query performance significantly as data grows

-- Properties table indexes
-- Query: Find active properties in a city filtered by gender
CREATE INDEX IF NOT EXISTS "idx_properties_city_active_gender" ON "Property"("city", "isActive", "gender");

-- Query: Find properties by owner with active status
CREATE INDEX IF NOT EXISTS "idx_properties_owner_active" ON "Property"("ownerId", "isActive");

-- Query: Find verified and active properties (admin queries)
CREATE INDEX IF NOT EXISTS "idx_properties_verified_active" ON "Property"("isVerified", "isActive");

-- Query: Recent properties (homepage, feeds)
CREATE INDEX IF NOT EXISTS "idx_properties_created_active" ON "Property"("createdAt" DESC, "isActive");

-- Rooms table indexes
-- Query: Find available rooms for a property
CREATE INDEX IF NOT EXISTS "idx_rooms_property_available" ON "Room"("propertyId", "isAvailable");

-- Query: Find rooms by price range
CREATE INDEX IF NOT EXISTS "idx_rooms_rent" ON "Room"("rent");

-- Bookings table indexes
-- Query: Find user's active bookings
CREATE INDEX IF NOT EXISTS "idx_bookings_tenant_status" ON "Booking"("tenantId", "status");

-- Query: Find property bookings (owner dashboard)
CREATE INDEX IF NOT EXISTS "idx_bookings_property_status" ON "Booking"("propertyId", "status");

-- Query: Find unpaid bookings for reminder system
CREATE INDEX IF NOT EXISTS "idx_bookings_token_paid" ON "Booking"("tokenPaid", "createdAt");

-- Query: Recent bookings
CREATE INDEX IF NOT EXISTS "idx_bookings_created" ON "Booking"("createdAt" DESC);

-- User table indexes
-- Query: Find users by role and approval status (admin panel)
CREATE INDEX IF NOT EXISTS "idx_users_role_approved" ON "User"("role", "isApproved");

-- Query: Find users by KYC status (compliance)
CREATE INDEX IF NOT EXISTS "idx_users_kyc_status" ON "User"("kycStatus");

-- Reviews table indexes
-- Query: Find reviews for a property
CREATE INDEX IF NOT EXISTS "idx_reviews_property" ON "Review"("propertyId", "createdAt" DESC);

-- Query: Find user's reviews
CREATE INDEX IF NOT EXISTS "idx_reviews_tenant" ON "Review"("tenantId");

-- Likes table indexes
-- Query: Check if user liked a property
CREATE INDEX IF NOT EXISTS "idx_likes_user_property" ON "Like"("userId", "propertyId");

-- Query: Find user's liked properties
CREATE INDEX IF NOT EXISTS "idx_likes_user" ON "Like"("userId", "createdAt" DESC);

-- Images table indexes
-- Query: Find primary image for properties
CREATE INDEX IF NOT EXISTS "idx_images_property_primary" ON "Image"("propertyId", "isPrimary");

-- Amenities table indexes
-- Query: Find amenities for a property
CREATE INDEX IF NOT EXISTS "idx_amenities_property" ON "Amenity"("propertyId");

-- Performance monitoring
-- Run ANALYZE after creating indexes to update statistics
ANALYZE;

-- Note: These indexes will be created when you run:
-- npx prisma db execute --file prisma/migrations/add_performance_indexes.sql
