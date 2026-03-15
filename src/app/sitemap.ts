import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE = process.env.NEXTAUTH_URL ?? "https://pglife.in"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where:  { isActive: true },
    select: { id: true, city: true, updatedAt: true },
    take:   1000,
  })

  const propertyUrls = properties.map((p: { id: string; city: string; updatedAt: Date }) => ({
    url:          `${BASE}/properties/${p.city.toLowerCase()}/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority:     0.8,
  }))

  const CITIES = ["bangalore", "mumbai", "delhi", "hyderabad", "pune", "chennai", "kolkata", "jammu", "srinagar"]
  const cityUrls = CITIES.map(city => ({
    url:          `${BASE}/properties/${city}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority:     0.7,
  }))

  return [
    { url: BASE,              lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${BASE}/auth/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...cityUrls,
    ...propertyUrls,
  ]
}
