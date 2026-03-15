/**
 * Force-seed reviews and bookings for existing properties.
 * Run: npx tsx prisma/seed-reviews.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("📝 Seeding reviews for existing properties...\n");

  const tenants = await prisma.user.findMany({
    where: { role: "TENANT" },
    take: 3,
  });

  const properties = await prisma.property.findMany({
    include: { rooms: { take: 1 } },
    where: { isActive: true },
  });

  const reviews = [
    { rating: 5, comment: "Amazing place! Very safe and the food is great." },
    { rating: 4, comment: "Good location, clean rooms. WiFi could be faster." },
    { rating: 5, comment: "Feels like home. Highly recommend!" },
  ];

  let created = 0;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const room = property.rooms[0];
    if (!room) continue;

    const tenant = tenants[i % tenants.length];

    // Create booking if not exists
    const existingBooking = await prisma.booking.findFirst({
      where: { tenantId: tenant.id, propertyId: property.id },
    });

    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          roomId: room.id,
          type: "DIRECT",
          status: "CONFIRMED",
          moveInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          tokenPaid: true,
        },
      });
    }

    // Create review if not exists
    const existingReview = await prisma.review.findUnique({
      where: {
        tenantId_propertyId: { tenantId: tenant.id, propertyId: property.id },
      },
    });

    if (!existingReview) {
      const review = reviews[i % reviews.length];
      await prisma.review.create({
        data: { tenantId: tenant.id, propertyId: property.id, ...review },
      });
      console.log(`✓ Review for ${property.name}`);
      created++;
    }
  }

  console.log(`\n✅ Created ${created} reviews`);
  await prisma.$disconnect();
}

main().catch(console.error);
