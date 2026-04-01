import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestDatabase() {
  console.log('🌱 Seeding test database...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.like.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.image.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword = await bcrypt.hash('TestPassword123!', 12);

  // 1. Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
      phone: '9000000001',
    },
  });
  console.log('✓ Created admin user');

  // 2. Approved owner
  const approvedOwner = await prisma.user.create({
    data: {
      email: 'owner@test.com',
      name: 'Approved Owner',
      passwordHash: hashedPassword,
      role: 'OWNER',
      isApproved: true,
      phone: '9000000002',
      whatsapp: '9000000002',
    },
  });
  console.log('✓ Created approved owner');

  // 3. Unapproved owner
  const unapprovedOwner = await prisma.user.create({
    data: {
      email: 'unapproved@test.com',
      name: 'Unapproved Owner',
      passwordHash: hashedPassword,
      role: 'OWNER',
      isApproved: false,
      phone: '9000000003',
    },
  });
  console.log('✓ Created unapproved owner');

  // 4. Tenant user
  const tenant = await prisma.user.create({
    data: {
      email: 'tenant@test.com',
      name: 'Test Tenant',
      passwordHash: hashedPassword,
      role: 'TENANT',
      isApproved: true,
      phone: '9000000004',
    },
  });
  console.log('✓ Created tenant user');

  // 5. Duplicate email test user (for testing duplicate detection)
  await prisma.user.create({
    data: {
      email: 'duplicate@test.com',
      name: 'Duplicate User',
      passwordHash: hashedPassword,
      role: 'TENANT',
      isApproved: true,
    },
  });

  // Create test properties
  
  // 1. Verified property (approved, public)
  const sunshineProperty = await prisma.property.create({
    data: {
      ownerId: approvedOwner.id,
      name: 'Sunshine PG for Boys',
      description: 'Comfortable PG with all modern amenities near metro station',
      city: 'delhi',
      locality: 'Connaught Place',
      address: '123 MG Road, Connaught Place, New Delhi, 110001',
      gender: 'MALE',
      whatsapp: '9876543210',
      lat: 28.6139,
      lng: 77.2090,
      foodPlan: 'TWO_MEALS',
      houseRules: 'No smoking, No pets, Visitors allowed till 9 PM',
      neighbourhood: 'Near CP Metro Station',
      isVerified: true,
      isActive: true,
      rooms: {
        create: [
          {
            type: 'Single',
            rent: 8000,
            deposit: 16000,
            isAvailable: true,
          },
          {
            type: 'Double',
            rent: 6000,
            deposit: 12000,
            isAvailable: true,
          },
        ],
      },
      amenities: {
        create: [
          { name: 'WiFi' },
          { name: 'AC' },
          { name: 'Parking' },
          { name: 'CCTV' },
          { name: 'Geyser' },
        ],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', isPrimary: false },
        ],
      },
    },
  });
  console.log('✓ Created verified property: Sunshine PG');

  // 2. Pending property (awaiting admin approval)
  const pendingProperty = await prisma.property.create({
    data: {
      ownerId: approvedOwner.id,
      name: 'Test PG Rejected',
      description: 'Test property for rejection',
      city: 'mumbai',
      address: '456 Test Street, Mumbai',
      gender: 'FEMALE',
      isVerified: false,
      isActive: false,
      rooms: {
        create: [
          {
            type: 'Double',
            rent: 7000,
            deposit: 14000,
            isAvailable: true,
          },
        ],
      },
    },
  });
  console.log('✓ Created pending property');

  // 3. Another verified property
  await prisma.property.create({
    data: {
      ownerId: approvedOwner.id,
      name: 'Email Test PG',
      description: 'For testing email notifications',
      city: 'bangalore',
      address: '789 Bangalore Street',
      gender: 'UNISEX',
      isVerified: false,
      isActive: false,
      rooms: {
        create: [
          {
            type: 'Triple',
            rent: 5000,
            deposit: 10000,
            isAvailable: true,
          },
        ],
      },
    },
  });
  console.log('✓ Created email test property');

  // Create a test booking
  const singleRoom = await prisma.room.findFirst({
    where: { propertyId: sunshineProperty.id, type: 'Single' },
  });

  if (singleRoom) {
    await prisma.booking.create({
      data: {
        tenantId: tenant.id,
        propertyId: sunshineProperty.id,
        roomId: singleRoom.id,
        moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        monthlyRent: singleRoom.rent,
        tokenAmount: 500,
        tokenPaid: true,
        status: 'CONFIRMED',
        razorpayId: 'test_razorpay_' + Date.now(),
      },
    });
    console.log('✓ Created test booking');
  }

  // Create a test review
  await prisma.review.create({
    data: {
      tenantId: tenant.id,
      propertyId: sunshineProperty.id,
      rating: 5,
      comment: 'Excellent PG with great facilities!',
    },
  });
  console.log('✓ Created test review');

  // Create a liked property
  await prisma.like.create({
    data: {
      userId: tenant.id,
      propertyId: sunshineProperty.id,
    },
  });
  console.log('✓ Created test like');

  console.log('✅ Test database seeded successfully!');
}

// Execute seeding
seedTestDatabase()
  .catch((error) => {
    console.error('❌ Error seeding test database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
