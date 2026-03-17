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
  { step: "01", title: "Search Your City", body: "Browse verified PGs across India. Filter by rent, gender, and amenities." },
  { step: "02", title: "Explore & Compare", body: "View real photos, genuine reviews, and detailed amenities from verified tenants." },
  { step: "03", title: "Book Directly", body: "Pay a small token to hold your room. No broker. No hidden charges." },
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

      {/* ═══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "var(--ink)" }}>
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1800&q=80"
            alt="Premium living"
            fill
            className="object-cover opacity-20"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0.95) 100%)" }} />
        </div>

        {/* Ambient blobs */}
        <div className="ambient-blob" style={{ width: 600, height: 600, top: "-20%", left: "-10%", background: "rgba(201,168,76,0.04)" }} />
        <div className="ambient-blob" style={{ width: 500, height: 500, bottom: "-10%", right: "-5%", background: "rgba(59,130,246,0.04)", animationDelay: "3s" }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Label */}
          <div className="reveal flex items-center justify-center gap-4 mb-10">
            <div className="gold-line flex-1 max-w-[80px]" />
            <span className="section-label">India&apos;s Premium PG Platform</span>
            <div className="gold-line flex-1 max-w-[80px]" />
          </div>

          {/* Headline — Cinzel exaggerated */}
          <h1 className="reveal reveal-d1 font-serif font-700 leading-none tracking-tight mb-8" style={{
            fontSize: "clamp(3rem, 10vw, 7rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            Find Your{" "}
            <span className="text-shimmer italic">Perfect</span>
            <br />
            Home Away
            <br />
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>from Home</span>
          </h1>

          <p className="reveal reveal-d2 text-base max-w-lg mx-auto mb-12 leading-relaxed" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            Verified PGs · Real photos · Direct booking · Zero broker fees
          </p>

          {/* Search */}
          <div className="reveal reveal-d3 max-w-2xl mx-auto mb-10">
            <HeroSearch />
          </div>

          {/* City pills */}
          <div className="reveal reveal-d4 flex flex-wrap items-center justify-center gap-2">
            {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Jammu"].map(city => (
              <Link
                key={city}
                href={`/properties/${city.toLowerCase()}`}
                className="badge-dark hover:border-gold hover:text-gold transition-all duration-200 cursor-pointer"
                style={{ "--tw-border-opacity": 1 } as React.CSSProperties}
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 reveal reveal-d6">
          <span className="text-[10px] tracking-[4px] uppercase" style={{ color: "var(--text-muted)" }}>Scroll</span>
          <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, var(--gold), transparent)" }} />
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--ink2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
            {[
              { value: `${stats.totalProperties}+`, label: "Verified PGs" },
              { value: `${stats.totalTenants}+`,    label: "Happy Tenants" },
              { value: `${stats.citiesCount}`,       label: "Cities" },
              { value: `${stats.avgRating.toFixed(1)}★`, label: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ borderRadius: 0, border: "none" }}>
                <p className="font-serif text-3xl md:text-4xl font-600 mb-1 text-shimmer">{s.value}</p>
                <p className="text-xs tracking-[3px] uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--ink)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="section-label reveal">How it works</span>
            <h2 className="reveal reveal-d1 font-serif text-4xl md:text-5xl font-600 mt-5" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Three steps to<br />your new home
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW.map((h, i) => (
              <div key={i} className={`glass-card rounded-3xl p-8 reveal reveal-d${i + 2}`}>
                <span className="font-serif text-6xl font-700 mb-6 block" style={{ color: "var(--border)", lineHeight: 1 }}>{h.step}</span>
                <div className="gold-line mb-5 w-12" />
                <h3 className="font-serif text-lg font-500 mb-3" style={{ color: "var(--text-primary)" }}>{h.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CITIES — Bento Grid ═════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--ink2)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="section-label reveal">Explore cities</span>
              <h2 className="reveal reveal-d1 font-serif text-4xl md:text-5xl font-600 mt-5" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                PGs across<br />
                <span className="text-gold-gradient" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>India</span>
              </h2>
            </div>
            <Link href="/properties/bangalore" className="btn-ghost reveal reveal-d2 hidden md:inline-flex">
              View all →
            </Link>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CITIES.map((city, i) => (
              <Link
                key={city.slug}
                href={`/properties/${city.slug}`}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer reveal reveal-d${i + 1} ${
                  i === 0 ? "col-span-2 row-span-2" :
                  i === 1 ? "col-span-2" : ""
                }`}
                style={{ aspectRatio: i === 0 ? "1" : i === 1 ? "2/1" : "1", minHeight: 160 }}
              >
                <Image
                  src={city.img}
                  alt={city.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.2) 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="badge-gold text-[9px] mb-1.5 inline-block">{city.tag}</span>
                  <p className="font-serif text-white font-500 text-base" style={{ letterSpacing: "0.03em" }}>{city.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="py-32 relative overflow-hidden" style={{ background: "var(--ink)" }}>
          <div className="ambient-blob" style={{ width: 400, height: 400, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(201,168,76,0.03)" }} />
          <div className="relative max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="section-label reveal">Testimonials</span>
              <h2 className="reveal reveal-d1 font-serif text-4xl md:text-5xl font-600 mt-5" style={{ color: "var(--text-primary)" }}>
                What tenants say
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {(testimonials as any[]).map((t, i: number) => (
                <div key={t.id} className={`glass-card rounded-3xl p-7 reveal reveal-d${i + 2}`}>
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-3.5 h-3.5" fill="#C9A84C" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-6 italic" style={{ color: "var(--text-secondary)" }}>
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm font-600" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)", color: "var(--gold)" }}>
                      {t.tenant?.name?.[0] ?? "T"}
                    </div>
                    <div>
                      <p className="text-xs font-600 tracking-wide" style={{ color: "var(--text-primary)" }}>{t.tenant?.name}</p>
                      <p className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>{t.property?.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA ═════════════════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--ink2)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="section-label reveal">Get started</span>
          <h2 className="reveal reveal-d1 font-serif text-4xl md:text-6xl font-600 mt-5 mb-6 leading-tight" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Ready to find your<br />
            <span className="text-shimmer italic">perfect PG?</span>
          </h2>
          <p className="reveal reveal-d2 text-base mb-12" style={{ color: "var(--text-muted)", letterSpacing: "0.03em" }}>
            Join thousands of tenants who found their home away from home.
          </p>
          <div className="reveal reveal-d3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties/bangalore" className="btn-gold">
              Browse PGs
            </Link>
            <Link href="/auth/signup" className="btn-ghost">
              List your PG →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
