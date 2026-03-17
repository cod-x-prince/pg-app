"use client"
import Link from "next/link"
import Image from "next/image"
import { useRef, useState } from "react"
import type { PropertyListItem } from "@/types"

interface Props { property: PropertyListItem }

const GENDER_BADGE: Record<string, { label: string; style: string }> = {
  MALE:   { label: "Boys",   style: "bg-blue-50 text-[#1B3B6F] border border-blue-100" },
  FEMALE: { label: "Girls",  style: "bg-pink-50 text-pink-700 border border-pink-100" },
  UNISEX: { label: "Unisex", style: "bg-amber-50 text-amber-700 border border-amber-100" },
}

export default function PropertyCard({ property }: Props) {
  const cardRef    = useRef<HTMLDivElement>(null)
  const [saved, setSaved] = useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale3d(1.02,1.02,1.02)`
  }

  const onLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)"
    }
  }

  const primaryImg     = property.images.find(i => i.isPrimary)?.url || property.images[0]?.url
  const availableRooms = property.rooms.filter(r => r.isAvailable)
  const minRent        = availableRooms.length ? Math.min(...availableRooms.map(r => r.rent)) : null
  const avgRating      = property.reviews.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null
  const gender = GENDER_BADGE[property.gender] ?? GENDER_BADGE.UNISEX

  return (
    <Link href={`/properties/${property.city.toLowerCase()}/${property.id}`} className="block">
      <div
        ref={cardRef}
        className="property-card group cursor-pointer"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transition: "transform 0.15s ease", transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Image container */}
        <div className="property-card-image mb-3.5">
          {primaryImg ? (
            <>
              <Image
                src={primaryImg}
                alt={property.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="property-card-shimmer" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#EEF3FB]">
              <svg className="w-12 h-12 text-[#1B3B6F]/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          )}

          {/* Verified badge */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {property.isVerified && (
              <span className="glass flex items-center gap-1 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Verified
              </span>
            )}
          </div>

          {/* Save button — instant fill on click */}
          <button
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              saved
                ? "bg-red-500 opacity-100 scale-110"
                : "glass opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105"
            }`}
            onClick={e => { e.preventDefault(); setSaved(s => !s) }}
            aria-label={saved ? "Unsave property" : "Save property"}
          >
            <svg
              className={`w-4 h-4 transition-all duration-200 ${saved ? "text-white" : "text-gray-600"}`}
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent rounded-b-[20px]" />

          {/* Price badge */}
          {minRent && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-[#1B3B6F] text-white text-sm font-semibold px-3 py-1.5 rounded-xl shadow-lg">
                ₹{minRent.toLocaleString("en-IN")}
                <span className="text-white/60 font-normal text-xs">/mo</span>
              </span>
            </div>
          )}

          {/* Rating badge */}
          {avgRating && (
            <div className="absolute bottom-3 left-3">
              <span className="glass flex items-center gap-1 text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {avgRating}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-0.5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif font-medium text-gray-900 text-[15px] leading-snug group-hover:text-[#1B3B6F] transition-colors line-clamp-1">
              {property.name}
            </h3>
            <span className={`badge shrink-0 text-[10px] ${gender.style}`}>
              {gender.label}
            </span>
          </div>
          <p className="text-gray-400 text-xs flex items-center gap-1.5">
            <svg className="w-3 h-3 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span className="truncate">{property.address}</span>
          </p>
          {availableRooms.length === 0 && (
            <p className="text-xs text-red-400 mt-1.5 font-medium">All rooms occupied</p>
          )}
        </div>
      </div>
    </Link>
  )
}
