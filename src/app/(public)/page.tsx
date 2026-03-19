export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSearch from "@/components/home/HeroSearch"

export const revalidate = 3600

const CITIES = [
  { name: "Bangalore",  slug: "bangalore",  img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80",  tag: "IT Hub" },
  { name: "Mumbai",     slug: "mumbai",     img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",  tag: "Finance" },
  { name: "Delhi",      slug: "delhi",      img: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=600&q=80",  tag: "Capital" },
  { name: "Hyderabad",  slug: "hyderabad",  img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",  tag: "Pharma" },
  { name: "Pune",       slug: "pune",       img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80",  tag: "Education" },
  { name: "Jammu",      slug: "jammu",      img: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=600&q=80",  tag: "Heritage" },
]

const HOW = [
  { step: "1", title: "Search Your City", body: "Browse verified PGs across India. Filter by rent, gender, and amenities." },
  { step: "2", title: "Explore & Compare", body: "View real photos, genuine reviews, and detailed amenities from verified tenants." },
  { step: "3", title: "Book Directly", body: "Pay a small token to hold your room. No broker. No hidden charges." },
]

async function getStats() {
  try {
    const totalProperties = await prisma.property.count({ where: { isActive: true } })
    const totalTenants    = await prisma.user.count({ where: { role: "TENANT" } })
    const ratingAgg       = await prisma.review.aggregate({ _avg: { rating: true } })
    const cities          = await prisma.property.groupBy({ by: ["city"], where: { isActive: true }, _count: true })
    return { totalProperties, totalTenants, avgRating: ratingAgg._avg.rating ?? 0, citiesCount: cities.length }
  } catch {
    return { totalProperties: 7, totalTenants: 3, avgRating: 4.8, citiesCount: 5 }
  }
}

async function getTestimonials() {
  try {
    return prisma.review.findMany({
      where: { rating: 5, comment: { not: null } },
      include: { tenant: { select: { name: true } }, property: { select: { city: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
  } catch { return [] }
}

export default async function HomePage() {
  const stats        = await getStats()
  const testimonials = await getTestimonials()

  return (
    <>
      <Navbar />

      {/* ═══ MINIMAL HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white">
        {/* Clean Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800&q=80"
            alt="Beautiful home interior"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center mt-16">
          <h1 className="reveal font-serif font-bold tracking-tight mb-6 text-white text-5xl md:text-7xl">
            Find your next home
          </h1>
          <p className="reveal reveal-d1 text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 font-medium">
            Verified stays • Direct booking • Zero broker fees
          </p>

          {/* Search */}
          <div className="reveal reveal-d2 max-w-3xl mx-auto mb-10">
            <HeroSearch />
          </div>

          {/* City pills */}
          <div className="reveal reveal-d3 flex flex-wrap items-center justify-center gap-3">
            {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Jammu"].map(city => (
              <Link
                key={city}
                href={`/properties/${city.toLowerCase()}`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-sm font-semibold transition-colors border border-white/30"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${stats.totalProperties}+`, label: "Verified PGs" },
              { value: `${stats.totalTenants}+`,    label: "Happy Tenants" },
              { value: `${stats.citiesCount}`,       label: "Cities" },
              { value: `${stats.avgRating.toFixed(1)}★`, label: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-serif text-3xl md:text-5xl font-bold mb-2 text-gray-900">{s.value}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW.map((h, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6 text-gray-900">
                  {h.step}
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-gray-900">{h.title}</h3>
                <p className="text-gray-500 leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CITIES — Equal Grid ═════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Explore destinations</h2>
            </div>
            <Link href="/properties/bangalore" className="text-gray-900 font-bold hover:underline hidden md:block">
              Show all →
            </Link>
          </div>

          {/* Equal grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/properties/${city.slug}`}
                className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-square"
              >
                <Image
                  src={city.img}
                  alt={city.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 w-full text-center">
                  <p className="font-serif text-white font-bold text-2xl">{city.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">What tenants say about us</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(testimonials as any[]).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gray-100 text-gray-800">
                      {t.tenant?.name?.[0] ?? "T"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.tenant?.name}</p>
                      <p className="text-sm text-gray-500">{t.property?.city}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA ═════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Ready to find your next stay?
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            Join thousands of users booking secure PGs instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties/bangalore" className="btn-gold px-8 py-4 text-base">
              Start Exploring
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
