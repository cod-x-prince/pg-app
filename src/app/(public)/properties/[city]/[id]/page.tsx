// Fix P2-8: Remove force-dynamic to enable static generation with revalidation
export const revalidate = 300 // Revalidate every 5 minutes
import type { PropertyAmenity, PropertyRoom, PropertyReview } from "@/types"

import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import StarRating from "@/components/properties/StarRating"
import BookingForm from "@/components/booking/BookingForm"
import GalleryClient from "@/components/properties/GalleryClient"

const AMENITY_ICONS: Record<string, string> = {
  WiFi: "📶", AC: "❄️", Parking: "🅿️", CCTV: "📷", Gym: "🏋️", Laundry: "🧺",
  Geyser: "🚿", TV: "📺", "Power Backup": "🔋", "RO Water": "💧", Dining: "🍽️", Lift: "🛗",
}

const GENDER_BADGE: Record<string, { label: string; style: string }> = {
  MALE:   { label: "Boys PG",   style: "bg-blue-light text-[#1B3B6F]" },
  FEMALE: { label: "Girls PG",  style: "bg-pink-50 text-pink-700" },
  UNISEX: { label: "Unisex PG", style: "bg-amber-light text-amber-700" },
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { city: string; id: string }
}) {
  const property = await prisma.property.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      owner:     { select: { id: true, name: true } },
      images:    true,
      videos:    true,
      rooms:     true,
      amenities: true,
      reviews: {
        include:  { tenant: { select: { name: true, email: true } } },
        orderBy:  { createdAt: "desc" },
      },
    },
  })

  if (!property) notFound()

  const avgRating = property.reviews.length
    ? property.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / property.reviews.length
    : 0
  const minRent = property.rooms.length ? Math.min(...property.rooms.map((r: { rent: number }) => r.rent)) : null
  const availableCount = property.rooms.filter((r: { isAvailable: boolean }) => r.isAvailable).length
  const gender = GENDER_BADGE[property.gender] ?? GENDER_BADGE.UNISEX
  const imageUrls = property.images.map((i: { url: string }) => i.url)

  return (
    <>
      <Navbar />
      <main>
      <div className="pt-16 min-h-screen bg-gray-50">

        {/* ── GALLERY ──────────────────────────────────────────────────── */}
        <GalleryClient images={imageUrls} name={property.name} />

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Breadcrumb - Fix P1-6: Use Next.js Link for SPA navigation */}
          <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#1B3B6F] transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/properties/${params.city}`} className="hover:text-[#1B3B6F] transition-colors capitalize">{params.city}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-48">{property.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── LEFT COLUMN ─────────────────────────────────────── */}
            <div className="flex-1 space-y-8 min-w-0">

              {/* Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {property.isVerified && (
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          Verified
                        </span>
                      )}
                      <span className={`badge text-xs ${gender.style}`}>{gender.label}</span>
                      {availableCount > 0 ? (
                        <span className="badge bg-green-50 text-green-700 text-xs">{availableCount} room{availableCount > 1 ? "s" : ""} available</span>
                      ) : (
                        <span className="badge bg-red-50 text-red-600 text-xs">Fully occupied</span>
                      )}
                    </div>

                    <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#1B3B6F] mb-2 leading-tight">
                      {property.name}
                    </h1>

                    <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-3">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      {property.address},&nbsp;<span className="capitalize">{params.city}</span>
                    </p>

                    {avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating rating={avgRating} />
                        <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({property.reviews.length} review{property.reviews.length !== 1 ? "s" : ""})</span>
                      </div>
                    )}
                  </div>

                  {minRent && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 mb-1">Starting from</p>
                      <p className="font-serif text-3xl font-semibold text-[#1B3B6F]">
                        ₹{minRent.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-xs">per month</p>
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              {property.description && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                  <h2 className="font-serif text-xl font-semibold text-[#1B3B6F] mb-3">About this PG</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {/* Food Plan — NEW */}
              {property.foodPlan && property.foodPlan !== "NONE" && (
                <div className="border border-border rounded-xl p-5 mb-5">
                  <h3 className="font-display font-semibold text-base text-foreground mb-3 flex items-center gap-2">
                    <span>🍽️</span> Meal Plan
                  </h3>
                  <div className="inline-flex items-center gap-2 bg-success/10 text-success border border-success/20 rounded-lg px-4 py-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-display font-semibold text-sm">
                      {property.foodPlan === "BREAKFAST" ? "Breakfast Included" :
                       property.foodPlan === "TWO_MEALS" ? "2 Meals/Day Included" :
                       property.foodPlan === "THREE_MEALS" ? "3 Meals/Day Included" :
                       "Custom Meal Plan Available"}
                    </span>
                  </div>
                </div>
              )}

              {/* House Rules — NEW */}
              {property.houseRules && (
                <div className="border border-border rounded-xl p-5 mb-5">
                  <h3 className="font-display font-semibold text-base text-foreground mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    House Rules
                  </h3>
                  <ul className="space-y-2">
                    {property.houseRules.split("\n").filter((rule: string) => rule.trim()).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 font-body text-sm text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        {rule.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {property.amenities.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                  <h2 className="font-serif text-xl font-semibold text-[#1B3B6F] mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((a: PropertyAmenity) => (
                      <div key={a.id} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
                        <span className="text-lg">{AMENITY_ICONS[a.name] || "✓"}</span>
                        <span className="text-sm text-gray-700 font-medium">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                <h2 className="font-serif text-xl font-semibold text-[#1B3B6F] mb-4">Room Types & Pricing</h2>
                <div className="space-y-3">
                  {property.rooms.map((room: PropertyRoom) => (
                    <div key={room.id}
                      className={`flex items-center justify-between border rounded-xl px-5 py-4 transition-colors ${
                        room.isAvailable
                          ? "border-gray-100 hover:border-[#1B3B6F]/20 hover:bg-[#EEF3FB]/40"
                          : "border-gray-100 bg-gray-50 opacity-60"
                      }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          room.isAvailable ? "bg-[#EEF3FB]" : "bg-gray-100"
                        }`}>
                          {/* Fix P3-13: Normalize room type icon mapping */}
                          {room.type?.toUpperCase() === "SINGLE" ? "🛏️" :
                           room.type?.toUpperCase() === "DOUBLE" ? "🛏️🛏️" :
                           room.type?.toUpperCase() === "TRIPLE" ? "🏠" :
                           room.type?.toUpperCase() === "SHARED" ? "👥" :
                           "🛏️"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{room.type} Room</p>
                          <p className="text-xs text-gray-400">Security deposit: ₹{room.deposit.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-serif font-semibold text-[#1B3B6F] text-lg">₹{room.rent.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">per month</p>
                        </div>
                        <span className={`badge text-xs ${room.isAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
                          {room.isAvailable ? "Available" : "Occupied"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video tour */}
              {property.videos[0] && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                  <h2 className="font-serif text-xl font-semibold text-[#1B3B6F] mb-4">Virtual Tour</h2>
                  <video
                    src={property.videos[0].url}
                    controls
                    className="w-full rounded-xl max-h-72 bg-black"
                  />
                </div>
              )}

              {/* Location */}
              {property.lat && property.lng && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                  <h2 className="font-serif text-xl font-semibold text-[#1B3B6F] mb-4">Location</h2>
                  <a
                    href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-[#EEF3FB] hover:bg-blue-100 border border-[#1B3B6F]/10 rounded-xl p-5 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-[#1B3B6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    <span className="text-[#1B3B6F] font-medium text-sm group-hover:underline">
                      View on Google Maps — {property.address}
                    </span>
                    <svg className="w-4 h-4 text-[#1B3B6F]/50 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-xl font-semibold text-[#1B3B6F]">
                    Reviews
                    {property.reviews.length > 0 && (
                      <span className="ml-2 text-base font-sans font-normal text-gray-400">({property.reviews.length})</span>
                    )}
                  </h2>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-2 bg-[#EEF3FB] px-4 py-2 rounded-xl">
                      <span className="font-serif text-2xl font-semibold text-[#1B3B6F]">{avgRating.toFixed(1)}</span>
                      <div>
                        <StarRating rating={avgRating} size="sm" />
                        <p className="text-xs text-gray-400">{property.reviews.length} review{property.reviews.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  )}
                </div>

                {property.reviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 text-sm">No reviews yet. Book a stay and share your experience!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {property.reviews.map((r: PropertyReview) => (
                      <div key={r.id} className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#1B3B6F] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {r.tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{r.tenant.name}</span>
                          </div>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                        {r.comment && <p className="text-sm text-gray-600 leading-relaxed pl-12">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Owner info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                <h2 className="font-serif text-xl font-semibold text-[#1B3B6F] mb-4">Listed by</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#EEF3FB] rounded-2xl flex items-center justify-center text-[#1B3B6F] font-bold font-serif text-xl">
                    {property.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{property.owner.name}</p>
                    <p className="text-xs text-gray-400">PG Owner · Responds via WhatsApp</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN — BOOKING PANEL ────────────────────── */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              {/* Fix P0-3: Add booking anchor for mobile CTA */}
              <div id="booking" className="sticky top-20">
                <BookingForm
                  propertyId={property.id}
                  rooms={property.rooms}
                  whatsapp={property.whatsapp}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky mobile booking bar — full width, high contrast */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t-2 border-primary px-4 py-3 safe-bottom"
        style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Price */}
          <div className="flex-1">
            {property.rooms.filter((r: { isAvailable: boolean }) => r.isAvailable).length > 0 ? (
              <>
                <p className="font-body text-xs text-muted-foreground">Starting from</p>
                <p className="font-display font-bold text-foreground text-xl leading-tight">
                  ₹{Math.min(...property.rooms.filter((r: PropertyRoom) => r.isAvailable).map((r: PropertyRoom) => r.rent)).toLocaleString("en-IN")}
                  <span className="font-normal text-sm text-muted-foreground"> /mo</span>
                </p>
              </>
            ) : (
              <p className="font-body text-sm font-semibold text-destructive">No rooms available</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">
            {property.whatsapp && (
              <a
                href={`https://wa.me/91${property.whatsapp}?text=Hi%2C+I+am+interested+in+${encodeURIComponent(property.name)}+on+Gharam.`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 font-display font-semibold text-sm text-white rounded-xl px-4 h-12"
                style={{ background: "#25D366" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                Chat
              </a>
            )}
            <a href="#booking"
              className="flex items-center justify-center font-display font-bold text-sm text-white rounded-xl px-6 h-12 transition-all active:scale-[0.98]"
              style={{ background: "hsl(var(--primary))", boxShadow: "0 4px 12px hsl(var(--primary) / 0.4)" }}
            >
              Reserve
            </a>
          </div>
        </div>
      </div>
      {/* Bottom padding for sticky bar on mobile */}
      <div className="h-20 lg:hidden" />

      </main>
      <Footer />
    </>
  )
}
