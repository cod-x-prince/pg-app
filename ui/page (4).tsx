"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

const CITIES = [
  { name: "Bangalore", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80", pgs: "2,400+" },
  { name: "Mumbai",    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80", pgs: "3,100+" },
  { name: "Delhi",     img: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=400&q=80", pgs: "2,800+" },
  { name: "Hyderabad", img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80", pgs: "1,600+" },
  { name: "Pune",      img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80", pgs: "1,200+" },
  { name: "Chennai",   img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80", pgs: "900+" },
  { name: "Kolkata",   img: "https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80", pgs: "700+" },
  { name: "Jammu",     img: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=400&q=80", pgs: "300+" },
]

const HOW_IT_WORKS = [
  { step: "01", icon: "🔍", title: "Search Your City", desc: "Browse thousands of verified PGs across 9 cities. Filter by rent, gender preference, and amenities." },
  { step: "02", icon: "🏠", title: "Explore & Compare", desc: "View real photos, virtual tours, amenities, and genuine reviews from verified tenants." },
  { step: "03", icon: "✅", title: "Book Instantly", desc: "Send an enquiry or book directly with a token amount. No broker, no hidden charges." },
]

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Bangalore", role: "Software Engineer", text: "Found my perfect PG in Koramangala within 2 days. The virtual tour saved me so much time — exactly as shown!", avatar: "PS" },
  { name: "Rahul Mehta",  city: "Mumbai",    role: "MBA Student",       text: "The verified badge gave me confidence. Moved in without any surprises. Owner was responsive via WhatsApp.", avatar: "RM" },
  { name: "Ananya Singh", city: "Delhi",     role: "Working Professional", text: "Best platform for girls PG. The gender filter and safety features made my parents comfortable too.", avatar: "AS" },
]

const STATS = [
  { value: "15,000+", label: "Verified PGs" },
  { value: "50,000+", label: "Happy Tenants" },
  { value: "9",       label: "Cities" },
  { value: "4.8★",    label: "Avg Rating" },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => { setHeroLoaded(true) }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/properties/${search.trim().toLowerCase()}`)
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=90"
            alt="PG living"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B3B6F]/70 via-[#1B3B6F]/50 to-[#1B3B6F]/80" />
        </div>

        {/* Hero content */}
        <div className={`relative z-10 text-center px-4 max-w-3xl mx-auto transition-all duration-1000 ${heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-pulse"></span>
            15,000+ verified PGs across India
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight mb-4">
            Find Your<br />
            <span className="italic text-[#F59E0B]">Perfect Home</span><br />
            Away from Home
          </h1>

          <p className="text-white/75 text-base md:text-lg mb-10 font-light">
            Verified PGs. Real photos. Direct booking. Zero broker fees.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-3">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Enter city — Bangalore, Mumbai, Delhi..."
                className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none py-2"
              />
            </div>
            <button type="submit" className="bg-[#1B3B6F] hover:bg-[#254E99] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shrink-0">
              Search PGs
            </button>
          </form>

          {/* Quick city links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune"].map(city => (
              <Link key={city} href={`/properties/${city.toLowerCase()}`}
                className="text-white/70 hover:text-white text-xs border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm hover:bg-white/10">
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
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

      {/* ── BROWSE BY CITY ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="section-label">Explore</p>
          <h2 className="section-title">Browse by City</h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">Thousands of verified PGs across India&apos;s top cities — from metros to emerging hubs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CITIES.map(city => (
            <Link key={city.name} href={`/properties/${city.name.toLowerCase()}`}>
              <div className="group relative rounded-2xl overflow-hidden aspect-[3/2] cursor-pointer">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B6F]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-white font-semibold text-base">{city.name}</p>
                  <p className="text-white/60 text-xs">{city.pgs} PGs</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="bg-[#EEF3FB] py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label">Simple Process</p>
            <h2 className="section-title">How PGLife Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-[#1B3B6F]/20 z-0" style={{ width: "calc(100% - 4rem)", left: "calc(100% - 2rem)" }} />
                )}
                <div className="relative bg-white rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{step.icon}</span>
                    <span className="font-serif text-4xl font-bold text-[#1B3B6F]/10">{step.step}</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#1B3B6F] mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="section-label">Reviews</p>
          <h2 className="section-title">Loved by Tenants</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, s) => <span key={s} className="text-[#F59E0B] text-sm">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B3B6F] rounded-full flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role} · {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OWNER CTA ───────────────────────────────────────────────────── */}
      <section className="mx-4 mb-20 rounded-3xl overflow-hidden bg-[#1B3B6F] relative">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #F59E0B 0%, transparent 50%), radial-gradient(circle at 80% 20%, #254E99 0%, transparent 50%)" }} />
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
            <span>✓ Virtual tour support</span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
