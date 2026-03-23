export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSearch from "@/components/home/HeroSearch"

export const revalidate = 3600

const CITIES = [
  { name: "Bangalore",  slug: "bangalore",  img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80",  tag: "IT Hub" },
  { name: "Mumbai",     slug: "mumbai",     img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",  tag: "Finance" },
  { name: "Delhi",      slug: "delhi",      img: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=400&q=80",  tag: "Capital" },
  { name: "Hyderabad",  slug: "hyderabad",  img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80",  tag: "Tech" },
  { name: "Pune",       slug: "pune",       img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80",  tag: "Education" },
  { name: "Jammu",      slug: "jammu",      img: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=400&q=80",  tag: "Heritage" },
]

const HOW = [
  {
    title: "Search your city",
    body: "Browse verified PGs across India. Filter by rent, gender, and amenities.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
  },
  {
    title: "Explore & compare",
    body: "Real photos, genuine reviews from verified tenants, detailed amenity lists.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
    ),
  },
  {
    title: "Book directly",
    body: "Pay ₹500 to hold your room instantly. No broker, no hidden charges.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

async function getStats() {
  try {
    const [totalProperties, totalTenants, ratingAgg, cities] = await Promise.all([
      prisma.property.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "TENANT" } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.property.groupBy({ by: ["city"], where: { isActive: true }, _count: true }),
    ])
    return { totalProperties, totalTenants, avgRating: ratingAgg._avg.rating ?? 0, citiesCount: cities.length }
  } catch {
    return { totalProperties: 7, totalTenants: 3, avgRating: 4.8, citiesCount: 5 }
  }
}

async function getTestimonials() {
  try {
    return prisma.review.findMany({
      where: { rating: 5, comment: { not: null } },
      include: { tenant: { select: { name: true } }, property: { select: { city: true } } },
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
      <main>

      {/* ── HERO — Airbnb style: full bleed image, search centered ─── */}
      <section className="relative h-[580px] md:h-[640px] flex flex-col items-center justify-center overflow-hidden bg-[#0F172A]">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1800&q=80"
          alt="Find your perfect PG"
          fill priority className="object-cover"
          sizes="100vw"
        />
        {/* Light gradient overlay — not too dark */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/50" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center">
          <h1
            className="font-display font-bold text-white mb-3 text-balance"
            style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "-0.03em", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
          >
            Find your perfect PG in India
          </h1>
          <p className="font-body text-white/80 text-base md:text-lg mb-8">
            Verified listings · Zero broker fees · Direct booking
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <HeroSearch />
          </div>

          {/* City pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {["Bangalore","Mumbai","Delhi","Hyderabad","Pune","Jammu"].map(city => (
              <Link key={city} href={`/properties/${city.toLowerCase()}`}
                className="font-body text-xs text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm
                           border border-white/30 px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer">
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="section-wrap py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {[
              { value: `${stats.totalProperties}+`, label: "Verified PGs" },
              { value: `${stats.totalTenants}+`,    label: "Happy Tenants" },
              { value: `${stats.citiesCount}`,       label: "Cities" },
              { value: `${stats.avgRating.toFixed(1)}★`, label: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="text-center md:px-8">
                <p className="font-display font-bold text-2xl md:text-3xl text-primary tabular-nums">{s.value}</p>
                <p className="font-body text-sm text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="section-wrap">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2"
            style={{ letterSpacing: "-0.02em" }}>How Gharam works</h2>
          <p className="font-body text-muted-foreground mb-12">Simple. Fast. No broker.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW.map((h, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  {h.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-foreground mb-1.5">{h.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPLORE CITIES ──────────────────────────────────────── */}
      <section className="py-20 bg-background border-t border-border">
        <div className="section-wrap">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground"
                style={{ letterSpacing: "-0.02em" }}>Explore cities</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Find PGs near where you work or study</p>
            </div>
            <Link href="/properties/bangalore" className="font-body text-sm text-primary hover:underline font-medium hidden md:block">
              View all →
            </Link>
          </div>

          {/* Airbnb-style grid — equal cards, no bento weirdness */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CITIES.map((city, i) => (
              <Link key={city.slug} href={`/properties/${city.slug}`}
                className="group cursor-pointer reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="relative rounded-2xl overflow-hidden mb-2.5" style={{ aspectRatio: "1" }}>
                  <Image src={city.img} alt={city.name} fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 font-display font-semibold text-white text-sm">
                    {city.name}
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground">{city.tag}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="section-wrap">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2"
              style={{ letterSpacing: "-0.02em" }}>What tenants say</h2>
            <p className="font-body text-sm text-muted-foreground mb-10">Only verified bookings can leave reviews</p>

            <div className="grid md:grid-cols-3 gap-6">
              {(testimonials as any[]).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="avatar h-9 w-9 bg-primary/10 text-primary text-sm font-display font-semibold">
                      {t.tenant?.name?.[0] ?? "T"}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">{t.tenant?.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{t.property?.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="section-wrap text-center">
          <h2 className="font-display font-bold text-2xl md:text-4xl text-foreground mb-3 text-balance"
            style={{ letterSpacing: "-0.02em" }}>
            Ready to find your home away from home?
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of tenants across India who found their perfect PG on Gharam.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/properties/bangalore" className="btn-primary btn-lg">
              Browse PGs
            </Link>
            <Link href="/auth/signup" className="btn-outline btn-lg">
              List your PG →
            </Link>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </>
  )
}
