export const dynamic = "force-dynamic"
import type { PropertyListItem } from "@/types"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import PropertyCard from "@/components/properties/PropertyCard"
import FilterPanel from "@/components/properties/FilterPanel"
import SortSelect from "@/components/properties/SortSelect"
import Link from "next/link"

interface Props {
  params: { city: string }
  searchParams: { gender?: string; minRent?: string; maxRent?: string; amenities?: string; sort?: string; moveIn?: string; foodPlan?: string }
}

export default async function PropertiesPage({ params, searchParams }: Props) {
  const city = decodeURIComponent(params.city)
  const { gender, minRent, maxRent, amenities, sort, moveIn, foodPlan } = searchParams
  const amenityList = amenities?.split(",").filter(Boolean) || []

  const where: Record<string, unknown> = { isActive: true, city: { equals: city, mode: "insensitive" } }
  if (gender) where.gender = gender
  if (foodPlan) where.foodPlan = foodPlan
  if (moveIn) {
    where.rooms = {
      some: {
        isAvailable: true,
        OR: [
          { availableFrom: null },
          { availableFrom: { lte: new Date(moveIn) } },
        ],
      },
    }
  }
  if (amenityList.length) where.amenities = { some: { name: { in: amenityList } } }
  if (minRent || maxRent) {
    where.rooms = { some: { rent: {
      ...(minRent && { gte: parseInt(minRent) }),
      ...(maxRent && { lte: parseInt(maxRent) }),
    }}}
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy:
      sort === "price_asc"  ? { rooms: { _count: "asc" } } :
      sort === "price_desc" ? { rooms: { _count: "desc" } } :
      sort === "top_rated"  ? { reviews: { _count: "desc" } } :
      { createdAt: "desc" },
    include: { images: true, rooms: true, reviews: { select: { id: true, rating: true } }, amenities: true },
  })

  return (
    <>
      <Navbar />
      <main>
      <div className="min-h-screen bg-background pt-16">

        {/* Page header */}
        <div className="bg-popover border-b border-border">
          <div className="section-wrap py-8">
            <nav className="font-body text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="capitalize text-foreground font-medium">{city}</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground capitalize"
                  style={{ letterSpacing: "-0.02em" }}>
                  PGs in {city.charAt(0).toUpperCase() + city.slice(1)}
                </h1>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {properties.length} {properties.length === 1 ? "listing" : "listings"} found
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SortSelect currentSort={sort} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="section-wrap py-8">
          <div className="flex gap-6">

            {/* Desktop filter sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterPanel city={city} />
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {properties.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">No PGs found</h3>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    No PGs match your filters in {city}. Try adjusting your search.
                  </p>
                  <Link href={`/properties/${city}`} className="btn-outline">Clear Filters</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map((p: PropertyListItem) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </>
  )
}
