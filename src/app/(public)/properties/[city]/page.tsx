import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import PropertyCard from "@/components/properties/PropertyCard"
import FilterPanel from "@/components/properties/FilterPanel"

interface Props {
  params: { city: string }
  searchParams: { gender?: string; minRent?: string; maxRent?: string; amenities?: string; sort?: string }
}

export default async function PropertiesPage({ params, searchParams }: Props) {
  const city = decodeURIComponent(params.city)
  const { gender, minRent, maxRent, amenities, sort } = searchParams
  const amenityList = amenities?.split(",").filter(Boolean) || []

  const where: any = { isActive: true, city: { equals: city, mode: "insensitive" } }
  if (gender) where.gender = gender
  if (amenityList.length) where.amenities = { some: { name: { in: amenityList } } }
  if (minRent || maxRent) {
    where.rooms = { some: { rent: {
      ...(minRent && { gte: parseInt(minRent) }),
      ...(maxRent && { lte: parseInt(maxRent) }),
    }}}
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: sort === "price_asc" ? { rooms: { _count: "asc" } } : { createdAt: "desc" },
    include: { images: true, rooms: true, reviews: { select: { rating: true } }, amenities: true },
  })

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <a href="/" className="hover:text-[#1B3B6F] transition-colors">Home</a>
              <span>/</span>
              <span className="capitalize text-gray-700 font-medium">{city}</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#1B3B6F] capitalize">
                  PGs in {city}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {properties.length} listing{properties.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex gap-2">
                {[["newest", "Newest"], ["price_asc", "Lowest Price"]].map(([val, label]) => (
                  <a key={val} href={`?${new URLSearchParams({ ...searchParams, sort: val })}`}
                    className={`text-xs px-4 py-2 rounded-xl border transition-all ${
                      (!sort && val === "newest") || sort === val
                        ? "bg-[#1B3B6F] text-white border-[#1B3B6F]"
                        : "border-gray-200 text-gray-600 hover:border-[#1B3B6F]/30 bg-white"
                    }`}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-72 shrink-0">
              <FilterPanel city={city.toLowerCase()} />
            </aside>
            <div className="flex-1">
              {properties.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="font-serif text-xl text-[#1B3B6F] mb-2">No PGs found in {city}</h3>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or search a nearby city</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
