export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSearch from "@/components/home/HeroSearch"

export const revalidate = 3600

const CITY_DATA = [
  { name: "Bangalore",  slug: "bangalore",  img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80",  tag: "IT Hub" },
  { name: "Mumbai",     slug: "mumbai",     img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",  tag: "Finance" },
  { name: "Delhi",      slug: "delhi",      img: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=600&q=80",  tag: "Capital" },
  { name: "Hyderabad",  slug: "hyderabad",  img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",  tag: "Pharma" },
  { name: "Pune",       slug: "pune",       img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80",  tag: "Education" },
  { name: "Jammu",      slug: "jammu",      img: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=600&q=80",  tag: "Heritage" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search Your City",
    desc: "Browse verified PGs across India. Filter by rent, gender, and amenities.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
  },
  {
    step: "02",
    title: "Explore & Compare",
    desc: "View real photos, detailed amenities, and genuine reviews from verified tenants.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
    ),
  },
  {
    step: "03",
    title: "Book Directly",
    desc: "Contact the owner directly or send a token to hold your room. No middlemen.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

async function getStats() {
  try {
    const totalProperties = await prisma.property.count({ where: { isActive: true } })
    const totalBookings   = await prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } })
    const totalTenants    = await prisma.user.count({ where: { role: "TENANT" } })
    const ratingAgg       = await prisma.review.aggregate({ _avg: { rating: true } })
    const cities          = await prisma.property.groupBy({
      by: ["city"],
      where: { isActive: true },
      _count: true,
      orderBy: { _count: { city: "desc" } },
    })
    return { totalProperties, totalBookings, totalTenants, avgRating: ratingAgg._avg.rating ?? 0, cities }
  } catch {
    return { totalProperties: 0, totalBookings: 0, totalTenants: 0, avgRating: 0, cities: [] }
  }
}

async function getTestimonials() {
  try {
    return prisma.review.findMany({
      where:   { rating: 5, comment: { not: null } },
      include: { tenant: { select: { name: true } }, property: { select: { city: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take:    3,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const stats        = await getStats()
  const testimonials = await getTestimonials()

  const STATS = [
    {
      value: stats.totalProperties > 0 ? `${stats.totalProperties.toLocaleString()}+` : "7+",
      label: "Verified PGs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
    },
    {
      value: stats.totalTenants > 0 ? `${stats.totalTenants.toLocaleString()}+` : "3+",
      label: "Happy Tenants",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
    {
      value: stats.cities.length > 0 ? `${stats.cities.length}` : "5+",
      label: "Cities",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        </svg>
      ),
    },
    {
      value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}` : "4.8",
      label: "Avg Rating",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      <Navbar />

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1800&q=90"
            alt="Premium living space"
            fill
            className="object-cover scale-105"
            priority
            sizes="100vw"
          />
          {/* Layered gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2347]/80 via-[#1B3B6F]/60 to-[#0F2347]/85" />
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E\")",
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="reveal flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
            <span className="text-[#F59E0B] text-xs font-semibold tracking-[3px] uppercase">
              India&#39;s Premium PG Platform
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          {/* Headline */}
          <h1 className="reveal reveal-d1 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-6">
            Find Your<br />
            <span className="italic text-[#F59E0B]">Perfect Home</span><br />
            Away from Home
          </h1>

          <p className="reveal reveal-d2 text-white/60 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Verified PGs. Real photos. Direct booking.<br className="hidden sm:block" /> Zero broker fees.
          </p>

          {/* Search bar */}
          <div className="reveal reveal-d3 max-w-2xl mx-auto">
            <HeroSearch />
          </div>

          {/* City quick links */}
          <div className="reveal reveal-d4 flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Jammu"].map(city => (
              <Link
                key={city}
                href={`/properties/${city.toLowerCase()}`}
                className="glass-dark px-4 py-2 rounded-full text-white/80 text-xs font-medium hover:text-white hover:border-white/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 reveal reveal-d5">
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════ */}
      <section className="bg-[#0F2347] py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/10">
            {STATS.map((s, i) => (
              <div key={i} className={`stat-card flex flex-col items-center text-center px-8 py-4 reveal reveal-d${i + 1}`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F59E0B] mb-3">
                  {s.icon}
                </div>
                <span className="font-serif text-3xl font-bold text-white mb-1">{s.value}</span>
                <span className="text-white/40 text-xs uppercase tracking-wider font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════ */}
      <section className="py-28 mesh-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-label reveal">How it works</span>
            <h2 className="reveal reveal-d1 font-serif text-4xl md:text-5xl text-gray-900 mt-4 mb-4">
              Find your PG in<br />
              <span className="italic text-[#1B3B6F]">3 simple steps</span>
            </h2>
            <p className="reveal reveal-d2 text-gray-400 text-base max-w-md mx-auto">
              From search to move-in in days, not weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className={`reveal reveal-d${i + 2} relative`}>
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] right-0 h-px bg-gradient-to-r from-gray-200 to-transparent z-0" />
                )}
                <div className="card hover-lift p-8 text-center relative z-10">
                  <div className="w-14 h-14 bg-[#EEF3FB] rounded-2xl flex items-center justify-center text-[#1B3B6F] mx-auto mb-5">
                    {step.icon}
                  </div>
                  <div className="font-serif text-5xl font-bold text-gray-100 mb-3 select-none">{step.step}</div>
                  <h3 className="font-serif text-xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CITIES
      ═══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="section-label reveal">Explore cities</span>
              <h2 className="reveal reveal-d1 font-serif text-4xl md:text-5xl text-gray-900 mt-4">
                PGs across<br />
                <span className="italic text-[#1B3B6F]">India</span>
              </h2>
            </div>
            <Link href="/properties/bangalore" className="reveal reveal-d2 btn-outline mt-4 md:mt-0 self-start md:self-auto">
              View all cities →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CITY_DATA.map((city, i) => (
              <Link
                key={city.slug}
                href={`/properties/${city.slug}`}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer reveal reveal-d${i + 1}`}
                style={{ aspectRatio: i < 2 ? "3/4" : "4/5" }}
              >
                <Image
                  src={city.img}
                  alt={city.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block text-[10px] text-amber-300 font-semibold uppercase tracking-wider mb-1">{city.tag}</span>
                  <p className="font-serif text-white font-semibold text-base leading-tight">{city.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="py-28 bg-[#0F2347] overflow-hidden relative">
          {/* Decorative */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#1B3B6F] rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2" />

          <div className="relative max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="section-label reveal">Testimonials</span>
              <h2 className="reveal reveal-d1 font-serif text-4xl md:text-5xl text-white mt-4">
                What tenants say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t: any, i: number) => (
                <div key={t.id} className={`reveal reveal-d${i + 2} glass-dark rounded-3xl p-7`}>
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.tenant?.name?.[0] ?? "T"}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.tenant?.name ?? "Tenant"}</p>
                      <p className="text-white/40 text-xs">{t.property?.city ?? "India"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-28 mesh-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="section-label reveal">Get started</span>
          <h2 className="reveal reveal-d1 font-serif text-4xl md:text-6xl text-gray-900 mt-4 mb-6 leading-tight">
            Ready to find your<br />
            <span className="italic text-[#1B3B6F]">perfect PG?</span>
          </h2>
          <p className="reveal reveal-d2 text-gray-400 text-lg mb-10 max-w-md mx-auto">
            Join thousands of tenants who found their ideal home away from home.
          </p>
          <div className="reveal reveal-d3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties/bangalore" className="btn-primary text-base py-4 px-10 shadow-blue">
              Browse PGs
            </Link>
            <Link href="/auth/signup" className="btn-outline text-base py-4 px-10">
              List your PG →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
