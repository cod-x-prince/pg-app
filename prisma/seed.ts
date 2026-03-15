/**
 * PGLife Database Seed Script
 * Creates realistic test data: admin, owners, tenants, properties, rooms,
 * images, amenities, bookings, and reviews.
 *
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 * Or:  npm run db:seed
 *
 * SAFE TO RUN MULTIPLE TIMES — checks for existing data before inserting.
 * To wipe and reseed: npx prisma db push --force-reset && npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

const hash = (password: string) => bcrypt.hash(password, 12);

const CLOUDINARY_SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
];

const randomImages = (count: number) =>
  CLOUDINARY_SAMPLE_IMAGES.slice(0, count);

// ── Users ────────────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("👤 Seeding users...");

  const users = await prisma.$transaction([
    // Admin
    prisma.user.upsert({
      where: { email: "admin@pglife.in" },
      update: {},
      create: {
        name: "PGLife Admin",
        email: "admin@pglife.in",
        passwordHash: await hash("Admin@2026"),
        role: "ADMIN",
        isApproved: true,
        phone: "9876543210",
      },
    }),

    // Owners
    prisma.user.upsert({
      where: { email: "owner1@pglife.in" },
      update: {},
      create: {
        name: "Ravi Kumar",
        email: "owner1@pglife.in",
        passwordHash: await hash("Owner@2026"),
        role: "OWNER",
        isApproved: true,
        phone: "9845012345",
      },
    }),
    prisma.user.upsert({
      where: { email: "owner2@pglife.in" },
      update: {},
      create: {
        name: "Sunita Sharma",
        email: "owner2@pglife.in",
        passwordHash: await hash("Owner@2026"),
        role: "OWNER",
        isApproved: true,
        phone: "9845098765",
      },
    }),
    prisma.user.upsert({
      where: { email: "owner3@pglife.in" },
      update: {},
      create: {
        name: "Arjun Mehta",
        email: "owner3@pglife.in",
        passwordHash: await hash("Owner@2026"),
        role: "OWNER",
        isApproved: true,
        phone: "9900112233",
      },
    }),

    // Tenants
    prisma.user.upsert({
      where: { email: "tenant1@pglife.in" },
      update: {},
      create: {
        name: "Priya Nair",
        email: "tenant1@pglife.in",
        passwordHash: await hash("Tenant@2026"),
        role: "TENANT",
        isApproved: true,
        phone: "9611223344",
      },
    }),
    prisma.user.upsert({
      where: { email: "tenant2@pglife.in" },
      update: {},
      create: {
        name: "Rohit Singh",
        email: "tenant2@pglife.in",
        passwordHash: await hash("Tenant@2026"),
        role: "TENANT",
        isApproved: true,
        phone: "9722334455",
      },
    }),
    prisma.user.upsert({
      where: { email: "tenant3@pglife.in" },
      update: {},
      create: {
        name: "Ananya Das",
        email: "tenant3@pglife.in",
        passwordHash: await hash("Tenant@2026"),
        role: "TENANT",
        isApproved: true,
        phone: "9833445566",
      },
    }),
  ]);

  console.log(`   ✓ ${users.length} users created`);
  return {
    admin: users[0],
    owners: [users[1], users[2], users[3]],
    tenants: [users[4], users[5], users[6]],
  };
}

// ── Properties ───────────────────────────────────────────────────────────────

async function seedProperties(owners: any[]) {
  console.log("🏠 Seeding properties...");

  const propertyData = [
    // Bangalore properties
    {
      ownerId: owners[0].id,
      name: "Sunrise Girls PG",
      description:
        "A premium girls-only PG in the heart of Koramangala. Walking distance to tech parks, restaurants, and metro station. 24/7 security, CCTV surveillance, and a friendly warden.",
      city: "Bangalore",
      address: "12th Main, Koramangala 5th Block, Bangalore - 560095",
      gender: "FEMALE" as const,
      whatsapp: "9845012345",
      isVerified: true,
      isActive: true,
      rooms: [
        { type: "Single", rent: 12000, deposit: 24000 },
        { type: "Double", rent: 8000, deposit: 16000 },
        { type: "Triple", rent: 6000, deposit: 12000 },
      ],
      amenities: [
        "WiFi",
        "AC",
        "CCTV",
        "Laundry",
        "RO Water",
        "Geyser",
        "Dining",
      ],
      images: randomImages(4),
      reviews: [
        {
          rating: 5,
          comment:
            "Amazing place! Very safe and the food is great. The owner is very responsive.",
        },
        {
          rating: 4,
          comment:
            "Good location, clean rooms. WiFi could be faster but overall great value.",
        },
        {
          rating: 5,
          comment:
            "Been here for 6 months. Feels like home. Highly recommend to working women.",
        },
      ],
    },
    {
      ownerId: owners[0].id,
      name: "Tech Hub PG for Boys",
      description:
        "Specially designed for IT professionals near Electronic City. High-speed WiFi, AC rooms, and fully furnished. 5 mins from Infosys and Wipro campus.",
      city: "Bangalore",
      address: "Phase 1, Electronic City, Bangalore - 560100",
      gender: "MALE" as const,
      whatsapp: "9845012345",
      isVerified: true,
      isActive: true,
      rooms: [
        { type: "Single", rent: 10000, deposit: 20000 },
        { type: "Double", rent: 7000, deposit: 14000 },
      ],
      amenities: ["WiFi", "AC", "CCTV", "Gym", "Parking", "Power Backup", "TV"],
      images: randomImages(3),
      reviews: [
        {
          rating: 4,
          comment: "Perfect for IT folks. Fast internet and clean rooms.",
        },
        {
          rating: 5,
          comment: "Best PG near Electronic City. Worth every rupee.",
        },
      ],
    },
    {
      ownerId: owners[1].id,
      name: "Green Valley Unisex PG",
      description:
        "Modern unisex PG with separate floors for boys and girls. Located in Indiranagar with easy access to 100 Feet Road and metro. Rooftop terrace and community events.",
      city: "Bangalore",
      address: "6th Cross, Indiranagar, Bangalore - 560038",
      gender: "UNISEX" as const,
      whatsapp: "9845098765",
      isVerified: false,
      isActive: true,
      rooms: [
        { type: "Single", rent: 15000, deposit: 30000 },
        { type: "Double", rent: 10000, deposit: 20000 },
      ],
      amenities: [
        "WiFi",
        "AC",
        "Lift",
        "CCTV",
        "Laundry",
        "RO Water",
        "Dining",
      ],
      images: randomImages(5),
      reviews: [
        {
          rating: 5,
          comment: "Love the vibe here! Great community, clean and modern.",
        },
        {
          rating: 3,
          comment: "Good location but a bit pricey. Food could be better.",
        },
      ],
    },

    // Mumbai property
    {
      ownerId: owners[1].id,
      name: "Andheri Boys Hostel",
      description:
        "Affordable and comfortable boys PG near Andheri Station. Perfect for students and young professionals. Homely atmosphere with home-cooked food.",
      city: "Mumbai",
      address: "Near D-Mart, Andheri West, Mumbai - 400058",
      gender: "MALE" as const,
      whatsapp: "9845098765",
      isVerified: true,
      isActive: true,
      rooms: [
        { type: "Double", rent: 9000, deposit: 18000 },
        { type: "Triple", rent: 7000, deposit: 14000 },
      ],
      amenities: ["WiFi", "Geyser", "TV", "RO Water", "Dining", "CCTV"],
      images: randomImages(3),
      reviews: [
        {
          rating: 4,
          comment:
            "Affordable and good food. Location is perfect for commuters.",
        },
      ],
    },

    // Delhi property
    {
      ownerId: owners[2].id,
      name: "Capital Girls Residency",
      description:
        "Premium girls PG in South Delhi near metro station. 24/7 security, home-cooked meals, and a peaceful environment. Walking distance to GK market.",
      city: "Delhi",
      address: "Greater Kailash 1, South Delhi - 110048",
      gender: "FEMALE" as const,
      whatsapp: "9900112233",
      isVerified: true,
      isActive: true,
      rooms: [
        { type: "Single", rent: 14000, deposit: 28000 },
        { type: "Double", rent: 9000, deposit: 18000 },
      ],
      amenities: [
        "WiFi",
        "AC",
        "CCTV",
        "Laundry",
        "Geyser",
        "RO Water",
        "Dining",
        "Lift",
      ],
      images: randomImages(4),
      reviews: [
        {
          rating: 5,
          comment: "Very safe and homely. The aunty who runs it is so caring.",
        },
        {
          rating: 5,
          comment: "Best girls PG in GK! Clean, safe, and great food.",
        },
        {
          rating: 4,
          comment: "Good place overall. AC works well. Would recommend.",
        },
      ],
    },

    // Hyderabad property
    {
      ownerId: owners[2].id,
      name: "Cyber Pearl PG",
      description:
        "Comfortable co-living space near HITEC City. Designed for IT professionals with high-speed internet, ergonomic workspace, and modern amenities.",
      city: "Hyderabad",
      address: "Madhapur, HITEC City, Hyderabad - 500081",
      gender: "UNISEX" as const,
      whatsapp: "9900112233",
      isVerified: false,
      isActive: true,
      rooms: [
        { type: "Single", rent: 11000, deposit: 22000 },
        { type: "Double", rent: 7500, deposit: 15000 },
      ],
      amenities: [
        "WiFi",
        "AC",
        "Gym",
        "CCTV",
        "Parking",
        "Power Backup",
        "Laundry",
      ],
      images: randomImages(3),
      reviews: [
        {
          rating: 4,
          comment: "Great for IT folks. Fast internet and well maintained.",
        },
      ],
    },

    // Jammu property (your home city!)
    {
      ownerId: owners[0].id,
      name: "Shiv Niwas PG",
      description:
        "Homely PG accommodation in the heart of Jammu city. Perfect for students appearing for competitive exams or working professionals. Sattvic meals available.",
      city: "Jammu",
      address: "Gandhi Nagar, Jammu - 180004",
      gender: "MALE" as const,
      whatsapp: "9845012345",
      isVerified: true,
      isActive: true,
      rooms: [
        { type: "Single", rent: 6000, deposit: 12000 },
        { type: "Double", rent: 4000, deposit: 8000 },
        { type: "Triple", rent: 3000, deposit: 6000 },
      ],
      amenities: ["WiFi", "Geyser", "RO Water", "TV", "Dining", "CCTV"],
      images: randomImages(2),
      reviews: [
        {
          rating: 5,
          comment: "Best PG in Gandhi Nagar. Uncle is very helpful.",
        },
        {
          rating: 4,
          comment: "Good value for money. Clean and quiet environment.",
        },
      ],
    },
  ];

  const createdProperties = [];

  for (const data of propertyData) {
    // Check if property already exists
    const existing = await prisma.property.findFirst({
      where: { name: data.name, city: data.city },
    });
    if (existing) {
      console.log(`   ↳ Skipping existing: ${data.name}`);
      createdProperties.push(existing);
      continue;
    }

    const property = await prisma.property.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        description: data.description,
        city: data.city,
        address: data.address,
        gender: data.gender,
        whatsapp: data.whatsapp,
        isVerified: data.isVerified,
        isActive: data.isActive,

        rooms: {
          create: data.rooms.map((r) => ({
            type: r.type,
            rent: r.rent,
            deposit: r.deposit,
            isAvailable: true,
          })),
        },

        amenities: {
          create: data.amenities.map((name) => ({ name })),
        },

        images: {
          create: data.images.map((url, i) => ({
            url,
            isPrimary: i === 0,
          })),
        },
      },
    });

    createdProperties.push(property);
    console.log(`   ✓ ${data.name} (${data.city})`);
  }

  return { properties: createdProperties, propertyData };
}

// ── Bookings & Reviews ───────────────────────────────────────────────────────

async function seedBookingsAndReviews(
  properties: any[],
  propertyData: any[],
  tenants: any[],
) {
  console.log("📅 Seeding bookings and reviews...");

  let bookingCount = 0;
  let reviewCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const data = propertyData[i];

    if (!data.reviews?.length) continue;

    // Get the first room of this property
    const room = await prisma.room.findFirst({
      where: { propertyId: property.id },
    });
    if (!room) continue;

    for (let j = 0; j < Math.min(data.reviews.length, tenants.length); j++) {
      const tenant = tenants[j % tenants.length];
      const reviewData = data.reviews[j];

      // Check if booking exists
      const existingBooking = await prisma.booking.findFirst({
        where: { tenantId: tenant.id, propertyId: property.id },
      });

      let booking = existingBooking;

      if (!existingBooking) {
        booking = await prisma.booking.create({
          data: {
            tenantId: tenant.id,
            propertyId: property.id,
            roomId: room.id,
            type: "DIRECT",
            status: "CONFIRMED",
            moveInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            tokenPaid: true,
          },
        });
        bookingCount++;
      }

      // Check if review exists
      const existingReview = await prisma.review.findUnique({
        where: {
          tenantId_propertyId: { tenantId: tenant.id, propertyId: property.id },
        },
      });

      if (!existingReview) {
        await prisma.review.create({
          data: {
            tenantId: tenant.id,
            propertyId: property.id,
            rating: reviewData.rating,
            comment: reviewData.comment,
          },
        });
        reviewCount++;
      }
    }
  }

  console.log(`   ✓ ${bookingCount} bookings, ${reviewCount} reviews created`);
}

// ── Pending Owner (for admin panel testing) ──────────────────────────────────

async function seedPendingOwner() {
  console.log("⏳ Seeding pending owner (for admin panel test)...");

  await prisma.user.upsert({
    where: { email: "pending@pglife.in" },
    update: {},
    create: {
      name: "Vikram Patel",
      email: "pending@pglife.in",
      passwordHash: await hash("Pending@2026"),
      role: "OWNER",
      isApproved: false,
      phone: "9955667788",
    },
  });

  console.log("   ✓ Pending owner created (visible in admin panel)");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 PGLife Seed Script");
  console.log("═══════════════════════════════\n");

  try {
    const { owners, tenants } = await seedUsers();
    const { properties, propertyData } = await seedProperties(owners);
    await seedBookingsAndReviews(properties, propertyData, tenants);
    await seedPendingOwner();

    console.log("\n═══════════════════════════════");
    console.log("✅ Seeding complete!\n");
    console.log("Test accounts (password same for all of type):");
    console.log("  Admin:   admin@pglife.in    / Admin@2026");
    console.log("  Owner:   owner1@pglife.in   / Owner@2026");
    console.log("  Owner:   owner2@pglife.in   / Owner@2026");
    console.log("  Owner:   owner3@pglife.in   / Owner@2026");
    console.log("  Tenant:  tenant1@pglife.in  / Tenant@2026");
    console.log("  Tenant:  tenant2@pglife.in  / Tenant@2026");
    console.log("  Pending: pending@pglife.in  / Pending@2026");
    console.log("\nProperties seeded:");
    console.log(
      "  Bangalore: 3 properties (Koramangala, Electronic City, Indiranagar)",
    );
    console.log("  Mumbai:    1 property  (Andheri)");
    console.log("  Delhi:     1 property  (Greater Kailash)");
    console.log("  Hyderabad: 1 property  (HITEC City)");
    console.log("  Jammu:     1 property  (Gandhi Nagar)");
    console.log("\nNow visit: http://localhost:3000\n");
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
