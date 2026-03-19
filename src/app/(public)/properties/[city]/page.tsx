export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import FilterPanel from "@/components/properties/FilterPanel";

interface Props {
  params: { city: string };
  searchParams: {
    gender?: string;
    minRent?: string;
    maxRent?: string;
    amenities?: string;
    sort?: string;
  };
}

export default async function PropertiesPage({ params, searchParams }: Props) {
  const city = decodeURIComponent(params.city);
  const { gender, minRent, maxRent, amenities, sort } = searchParams;
  const amenityList = amenities?.split(",").filter(Boolean) || [];

  const where: any = {
    isActive: true,
    city: { equals: city, mode: "insensitive" },
  };
  if (gender) where.gender = gender;
  if (amenityList.length)
    where.amenities = { some: { name: { in: amenityList } } };
  if (minRent || maxRent) {
    where.rooms = {
      some: {
        rent: {
          ...(minRent && { gte: parseInt(minRent) }),
          ...(maxRent && { lte: parseInt(maxRent) }),
        },
      },
    };
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy:
      sort === "price_asc"
        ? { rooms: { _count: "asc" } }
        : { createdAt: "desc" },
    include: {
      images: true,
      rooms: true,
      reviews: { select: { rating: true } },
      amenities: true,
    },
  });

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen" style={{ background: "var(--ink)" }}>
        {/* Page header */}
        <div style={{ background: "var(--ink2)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <nav className="text-xs mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <a href="/" className="transition-colors hover:text-white">Home</a>
              <span>/</span>
              <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{city}</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-semibold capitalize" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  PGs in {city}
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {properties.length} listing{properties.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex gap-2">
                {[
                  ["newest", "Newest"],
                  ["price_asc", "Lowest Price"],
                ].map(([val, label]) => (
                  <a
                    key={val}
                    href={`?${new URLSearchParams({ ...searchParams, sort: val })}`}
                    className="text-xs px-4 py-2 rounded-xl border transition-all"
                    style={{
                      background: (!sort && val === "newest") || sort === val ? "var(--gold-dim)" : "transparent",
                      borderColor: (!sort && val === "newest") || sort === val ? "var(--border-gold)" : "var(--border)",
                      color: (!sort && val === "newest") || sort === val ? "var(--gold)" : "var(--text-muted)",
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-72 shrink-0">
              <FilterPanel city={city.toLowerCase()} />
            </aside>
            <div className="flex-1">
              {properties.length === 0 ? (
                <div className="glass-card rounded-3xl py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--gold)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl mb-2" style={{ color: "var(--text-primary)" }}>
                    No PGs found in {city}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Try adjusting your filters or search a nearby city
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((p: any) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
