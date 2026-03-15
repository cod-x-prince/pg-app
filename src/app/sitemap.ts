import { MetadataRoute } from "next";

// Sitemap regenerates every 12 hours at runtime — not at build time.
// This avoids build failures when the DB isn't reachable during Vercel builds.
export const revalidate = 43200;

const BASE = process.env.NEXTAUTH_URL ?? "https://pglife.in";

const CITIES = [
  "bangalore",
  "mumbai",
  "delhi",
  "hyderabad",
  "pune",
  "chennai",
  "kolkata",
  "jammu",
  "srinagar",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch properties at runtime only
  let propertyUrls: MetadataRoute.Sitemap = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    const properties = await prisma.property.findMany({
      where: { isActive: true },
      select: { id: true, city: true, updatedAt: true },
      take: 1000,
    });

    propertyUrls = properties.map(
      (p: { id: string; city: string; updatedAt: Date }) => ({
        url: `${BASE}/properties/${p.city.toLowerCase()}/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }),
    );
  } catch {
    // DB not available at build time — return static URLs only
    // Properties will be added on next revalidation (12 hrs)
  }

  const cityUrls: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE}/properties/${city}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...cityUrls,
    ...propertyUrls,
  ];
}
