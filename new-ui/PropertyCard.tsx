"use client"
import Link from "next/link"
import Image from "next/image"
import { useRef, useState } from "react"
import type { PropertyListItem } from "@/types"

interface Props { property: PropertyListItem }

const GENDER: Record<string, string> = {
  MALE:   "Boys",
  FEMALE: "Girls",
  UNISEX: "Unisex",
}

export default function PropertyCard({ property }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [saved, setSaved] = useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale3d(1.015,1.015,1.015)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0) scale3d(1,1,1)"
  }

  const img     = property.images.find(i => i.isPrimary)?.url || property.images[0]?.url
  const avail   = property.rooms.filter(r => r.isAvailable)
  const minRent = avail.length ? Math.min(...avail.map(r => r.rent)) : null
  const rating  = property.reviews.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null

  return (
    <Link href={`/properties/${property.city.toLowerCase()}/${property.id}`} className="block">
      <div
        ref={ref}
        className="prop-card"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transition: "transform 0.2s ease", transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Image */}
        <div className="prop-card-img">
          {img ? (
            <Image
              src={img}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--ink3)" }}>
              <svg className="w-10 h-10 opacity-20" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--gold)" }}>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Top row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex gap-1.5">
              {property.isVerified && (
                <span className="badge-verified">
                  <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Verified
                </span>
              )}
              <span className="badge-dark">{GENDER[property.gender] ?? "Unisex"}</span>
            </div>

            {/* Save button */}
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
              style={{
                background: saved ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)",
                border: saved ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                transform: saved ? "scale(1.1)" : "scale(1)",
              }}
              onClick={e => { e.preventDefault(); setSaved(s => !s) }}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <svg
                className="w-3.5 h-3.5"
                fill={saved ? "white" : "none"}
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          {/* Bottom row */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            {rating && (
              <span className="badge-dark flex items-center gap-1">
                <svg className="w-3 h-3" fill="#C9A84C" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {rating}
              </span>
            )}
            {minRent && (
              <span className="badge-gold text-xs font-600">
                ₹{minRent.toLocaleString("en-IN")}<span className="opacity-60 font-400">/mo</span>
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif text-sm font-500 mb-1 line-clamp-1 transition-colors duration-200" style={{ color: "var(--text-primary)", letterSpacing: "0.03em" }}>
            {property.name}
          </h3>
          <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span className="truncate">{property.address}</span>
          </p>
          {avail.length === 0 && (
            <p className="text-xs mt-1.5 font-500" style={{ color: "#EF4444" }}>All rooms occupied</p>
          )}
        </div>
      </div>
    </Link>
  )
}
