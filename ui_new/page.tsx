export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSearch from "@/components/home/HeroSearch"

export const revalidate = 3600

const CITIES = [
  { name: "Bangalore",  slug: "bangalore",  img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80",  tag: "IT Hub",    span: "col-span-2 row-span-2" },
  { name: "Mumbai",     slug: "mumbai",     img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",  tag: "Finance",   span: "col-span-2" },
  { name: "Delhi",      slug: "delhi",      img: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=400&q=80",  tag: "Capital",   span: "" },
  { name: "Hyderabad",  slug: "hyderabad",  img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80",  tag: "Tech",      span: "" },
  { name: "Pune",       slug: "pune",       img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80",  tag: "Education", span: "" },
  { name: "Jammu",      slug: "jammu",      img: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=400&q=80",  tag: "Heritage",  span: "" },
]

const HOW = [
  {
    n: "01",
    title: "Search Your City",
    body: "Browse verified PGs across India. Filter by rent, gender, and amenities to find exactly what you need.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
  },
  {
    n: "02",
    title: "Explore & Compare",
    body: "View real photos, genuine reviews from verified tenants, and detailed amenity lists before deciding.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    n: "03",
    title: "Book Directly",
    body: "Pay a small token (₹500) to hold your room instantly. No broker, no hidden charges, direct contact with owner.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1800&q=80"
            alt="Warm home"
            fill priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
        </div>

        <div className="relative z-10 section-wrap text-center py-24">
          {/* Label */}
          <div className="reveal flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-primary/60" />
            <span className="section-label" style={{ color: "hsl(var(--accent))" }}>India&apos;s Trusted PG Platform</span>
            <div className="h-px w-12 bg-primary/60" />
          </div>

          {/* Headline */}
          <h1
            className="reveal reveal-d1 font-display font-bold text-balance mb-6"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "white",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            Find Your Perfect<br />
            <span style={{ color: "hsl(var(--accent))" }}>Home Away</span><br />
            from Home
          </h1>

          <p className="reveal reveal-d2 font-body text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}>
            Verified PGs across India. Real photos, genuine reviews, and direct booking — zero broker fees.
          </p>

          {/* Search */}
          <div className="reveal reveal-d3 max-w-2xl mx-auto mb-8">
            <HeroSearch />
          </div>

          {/* City pills */}
          <div className="reveal reveal-d4 flex flex-wrap items-center justify-center gap-2">
            <span className="font-body text-xs text-white/50 mr-1">Popular:</span>
            {["Bangalore","Mumbai","Delhi","Hyderabad","Jammu"].map(city => (
              <Link key={city} href={`/properties/${city.toLowerCase()}`}
                className="badge-default hover:bg-white hover:text-foreground transition-all cursor-pointer text-xs"
                style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section style={{ background: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }}>
        <div className="section-wrap py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${stats.totalProperties}+`, label: "Verified PGs" },
              { value: `${stats.totalTenants}+`,    label: "Happy Tenants" },
              { value: `${stats.citiesCount}`,       label: "Cities" },
              { value: `${stats.avgRating.toFixed(1)}★`, label: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-display font-bold text-3xl md:text-4xl tabular-nums mb-1"
                  style={{ color: "hsl(var(--primary))" }}>{s.value}</p>
                <p className="font-body text-sm opacity-60 tracking-wide uppercase" style={{ letterSpacing: "2px" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="section-wrap">
          <div className="text-center mb-16">
            <span className="section-label reveal">How it works</span>
            <h2 className="reveal reveal-d1 font-display font-bold mt-4 text-balance"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em", color: "hsl(var(--foreground))" }}>
              Three steps to your new home
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW.map((h, i) => (
              <div key={i}
                className={`rounded-xl p-8 shadow-soft reveal reveal-d${i + 2} transition-all duration-200 hover:shadow-elevated`}
                style={{ background: "hsl(var(--popover))" }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  {h.icon}
                </div>
                <p className="font-display font-bold text-4xl mb-4 tabular-nums"
                  style={{ color: "hsl(var(--muted-foreground)/0.2)", letterSpacing: "-0.04em" }}>{h.n}</p>
                <h3 className="font-display font-semibold text-lg mb-3 text-foreground">{h.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES — Bento Grid ──────────────────────────────────── */}
      <section className="py-24" style={{ background: "hsl(var(--card))" }}>
        <div className="section-wrap">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="section-label reveal">Explore cities</span>
              <h2 className="reveal reveal-d1 font-display font-bold mt-4"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em" }}>
                PGs across India
              </h2>
            </div>
            <Link href="/properties/bangalore" className="btn-outline hidden md:inline-flex">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CITIES.map((city, i) => (
              <Link key={city.slug} href={`/properties/${city.slug}`}
                className={`relative overflow-hidden rounded-xl group cursor-pointer reveal reveal-d${i + 1} ${city.span}`}
                style={{ minHeight: 160 }}
              >
                <Image src={city.img} alt={city.name} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                  opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="badge-primary text-[9px] mb-2 inline-block" style={{ background: "hsl(var(--primary)/0.9)" }}>
                    {city.tag}
                  </span>
                  <p className="font-display font-semibold text-white text-base tracking-tight">{city.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-background">
          <div className="section-wrap">
            <div className="text-center mb-14">
              <span className="section-label reveal">Testimonials</span>
              <h2 className="reveal reveal-d1 font-display font-bold mt-4"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em" }}>
                Loved by tenants
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(testimonials as any[]).map((t, i) => (
                <div key={t.id}
                  className={`rounded-xl p-7 shadow-soft reveal reveal-d${i + 2} hover:shadow-elevated transition-all duration-200`}
                  style={{ background: "hsl(var(--popover))" }}
                >
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="avatar h-9 w-9 bg-primary/10 text-primary text-sm">
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

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "hsl(var(--primary))" }}>
        <div className="section-wrap-narrow text-center">
          <h2 className="reveal font-display font-bold text-primary-foreground text-balance mb-5"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}>
            Ready to find your perfect PG?
          </h2>
          <p className="reveal reveal-d1 font-body text-primary-foreground/75 text-base mb-10 max-w-md mx-auto">
            Join thousands of tenants who found their home away from home.
          </p>
          <div className="reveal reveal-d2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties/bangalore"
              className="inline-flex items-center justify-center gap-2 font-display font-semibold text-sm
                         bg-white text-primary rounded-lg px-8 h-12 shadow-elevated
                         hover:bg-white/95 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              Browse PGs
            </Link>
            <Link href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 font-display font-medium text-sm
                         border-2 border-white/40 text-white rounded-lg px-8 h-12
                         hover:bg-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              List your PG →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
