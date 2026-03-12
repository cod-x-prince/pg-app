import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSearch from "@/components/home/HeroSearch"

export const revalidate = 3600

const CITY_IMAGES: Record<string, string> = {
  bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80",
  mumbai:    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80",
  delhi:     "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=400&q=80",
  hyderabad: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80",
  pune:      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80",
  chennai:   "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80",
  kolkata:   "https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80",
  jammu:     "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=400&q=80",
  srinagar:  "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80",
}

const HOW_IT_WORKS = [
  { step: "01", icon: "🔍", title: "Search Your City", desc: "Browse verified PGs across India. Filter by rent, gender preference, and amenities." },
  { step: "02", icon: "🏠", title: "Explore & Compare", desc: "View real photos, amenities, and genuine reviews from verified tenants." },
  { step: "03", icon: "✅", title: "Book Instantly",    desc: "Send an enquiry or book directly. No broker, no hidden charges." },
]

async function getStats() {
  const [totalProperties, totalBookings, totalTenants, ratingAgg, cities] = await Promise.all([
    prisma.property.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } }),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.property.groupBy({
      by: ["city"],
      where: { isActive: true },
      _count: true,
      orderBy: { _count: { city: "desc" } },
    }),
  ])
  return { totalProperties, totalBookings, totalTenants, avgRating: ratingAgg._avg.rating ?? 0, cities }
}

async function getTestimonials() {
  return prisma.review.findMany({
    where:   { rating: 5, comment: { not: null } },
    include: { tenant: { select: { name: true } }, property: { select: { city: true } } },
    orderBy: { createdAt: "desc" },
    take:    3,
  })
}

export default async function HomePage() {
  const [stats, testimonials] = await Promise.all([getStats(), getTestimonials()])

  const STATS = [
    { value: stats.totalProperties > 0 ? `${stats.totalProperties.toLocaleString()}+` : "—", label: "Verified PGs" },
    { value: stats.totalTenants    > 0 ? `${stats.totalTenants.toLocaleString()}+`    : "—", label: "Happy Tenants" },
    { value: stats.cities.length   > 0 ? `${stats.cities.length}`                    : "—", label: "Cities" },
    { value: stats.avgRating       > 0 ? `${stats.avgRating.toFixed(1)}★`            : "—", label: "Avg Rating" },
  ]

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=90"
            alt="PG living"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B3B6F]/70 via-[#1B3B6F]/50 to-[#1B3B6F]/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          {stats.totalProperties > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-pulse" />
              {stats.totalProperties.toLocaleString()}+ verified PGs across India
            </div>
          )}

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight mb-4">
            Find Your<br />
            <span className="italic text-[#F59E0B]">Perfect Home</span><br />
            Away from Home
          </h1>

          <p className="text-white/75 text-base md:text-lg mb-10 font-light">
            Verified PGs. Real photos. Direct booking. Zero broker fees.
          </p>

          <HeroSearch />

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {stats.cities.slice(0, 5).map(c => (
              <Link key={c.city} href={`/properties/${c.city.toLowerCase()}`}
                className="text-white/70 hover:text-white text-xs border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm hover:bg-white/10 capitalize">
                {c.city}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────── */}
      {stats.totalProperties > 0 && (
        <section className="bg-[#1B3B6F] py-8">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="font-serif text-3xl font-semibold text-[#F59E0B]">{s.value}</p>
                <p className="text-white/60 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── BROWSE BY CITY ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="section-label">Explore</p>
          <h2 className="section-title">Browse by City</h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Verified PGs across India&apos;s top cities
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(CITY_IMAGES).map(([cityKey, imgUrl]) => {
            const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1)
            const dbCity   = stats.cities.find(c => c.city.toLowerCase() === cityKey)
            const count    = dbCity?._count ?? 0
            return (
              <Link key={cityKey} href={`/properties/${cityKey}`}>
                <div className="group relative rounded-2xl overflow-hidden aspect-[3/2] cursor-pointer">
                  <Image
                    src={imgUrl}
                    alt={cityName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B6F]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-serif text-white font-semibold text-base capitalize">{cityName}</p>
                    {count > 0 ? (
                      <p className="text-white/60 text-xs">{count}+ PGs</p>
                    ) : (
                      <p className="text-[#F59E0B]/80 text-xs font-medium">Coming Soon</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="bg-[#EEF3FB] py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label">Simple Process</p>
            <h2 className="section-title">How PGLife Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="font-serif text-4xl font-bold text-[#1B3B6F]/10">{step.step}</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1B3B6F] mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — only shown if real reviews exist ──────────── */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <p className="section-label">Reviews</p>
            <h2 className="section-title">Loved by Tenants</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, s) => <span key={s} className="text-[#F59E0B] text-sm">★</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.comment}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1B3B6F] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {t.tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.tenant.name}</p>
                    <p className="text-gray-400 text-xs capitalize">{t.property.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── OWNER CTA ────────────────────────────────────────────────── */}
      <section className="mx-4 mb-20 rounded-3xl overflow-hidden bg-[#1B3B6F] relative">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #F59E0B 0%, transparent 50%)" }} />
        <div className="relative max-w-4xl mx-auto px-8 py-16 text-center">
          <p className="section-label text-[#F59E0B]">For PG Owners</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-4">
            Start Getting Direct Bookings
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm">
            List your PG for free. Reach thousands of verified tenants. No middlemen, no commission at launch.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="btn-amber px-8 py-3 text-base shadow-amber">
              List Your PG Free →
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-medium py-3 px-8 rounded-xl transition-all text-base">
              Already listed? Login
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-white/40 text-xs">
            <span>✓ Free listing</span>
            <span>✓ Verified badge</span>
            <span>✓ WhatsApp enquiries</span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
