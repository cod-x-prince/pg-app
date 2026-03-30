import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

export async function generateMetadata({ params }: { params: { id: string; city: string } }): Promise<Metadata> {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true } },
      rooms: { select: { type: true, rent: true } },
      images: { select: { url: true }, take: 1 },
    },
  })

  if (!property) {
    return { title: "Property Not Found" }
  }

  const minRent = Math.min(...property.rooms.map(r => r.rent))
  const maxRent = Math.max(...property.rooms.map(r => r.rent))
  const priceRange = minRent === maxRent ? `₹${minRent}` : `₹${minRent} - ₹${maxRent}`

  const title = `${property.name} - PG in ${property.locality || property.city} | ${priceRange}/month`
  const description = `${property.description.slice(0, 150)}... Book PG accommodation in ${property.city}. ${property.gender} hostel with ${property.rooms.length} room types. Owner: ${property.owner.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${process.env.NEXTAUTH_URL}/properties/${params.city}/${params.id}`,
      images: property.images[0]?.url ? [{ url: property.images[0].url }] : [],
      siteName: "PGLife - Find Your Perfect PG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: property.images[0]?.url ? [property.images[0].url] : [],
    },
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/properties/${params.city}/${params.id}`,
    },
  }
}
