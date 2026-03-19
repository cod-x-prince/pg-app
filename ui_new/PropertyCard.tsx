"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import type { PropertyListItem } from "@/types"

interface Props { property: PropertyListItem }

const GENDER: Record<string, { label: string; cls: string }> = {
  MALE:   { label: "Boys",   cls: "badge-boys" },
  FEMALE: { label: "Girls",  cls: "badge-girls" },
  UNISEX: { label: "Unisex", cls: "badge-unisex" },
}

export default function PropertyCard({ property }: Props) {
  const [saved, setSaved] = useState(false)

  const img     = property.images.find(i => i.isPrimary)?.url || property.images[0]?.url
  const avail   = property.rooms.filter(r => r.isAvailable)
  const minRent = avail.length ? Math.min(...avail.map(r => r.rent)) : null
  const rating  = property.reviews.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null
  const gender  = GENDER[property.gender] ?? GENDER.UNISEX

  return (
    <Link href={`/properties/${property.city.toLowerCase()}/${property.id}`} className="block">
      <div className="prop-card group">

        {/* Image */}
        <div className="prop-card-img">
          {img ? (
            <Image src={img} alt={property.name} fill
              className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <svg className="w-10 h-10 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {property.isVerified && (
                <span className="badge-verified text-[10px] flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Verified
                </span>
              )}
              <span className={`badge ${gender.cls} text-[10px]`}>{gender.label}</span>
            </div>

            {/* Save button */}
            <button
              onClick={e => { e.preventDefault(); setSaved(s => !s) }}
              aria-label={saved ? "Unsave" : "Save"}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{
                background: saved ? "hsl(var(--destructive))" : "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                transform: saved ? "scale(1.1)" : "scale(1)",
                opacity: saved ? 1 : 0,
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = "1")}
              // Show on group hover via CSS
            >
              <svg className="w-3.5 h-3.5" fill={saved ? "white" : "none"} stroke={saved ? "white" : "currentColor"}
                style={{ color: saved ? "white" : "hsl(var(--foreground))" }}
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          {/* Bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            {rating && (
              <span className="badge-default flex items-center gap-1 text-[10px]"
                style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
                <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-foreground font-display font-semibold">{rating}</span>
              </span>
            )}
            {minRent && (
              <span className="font-display font-bold text-sm text-white"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                ₹{minRent.toLocaleString("en-IN")}
                <span className="font-body font-normal text-xs text-white/70">/mo</span>
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-1">
          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1" style={{ letterSpacing: "-0.01em" }}>
            {property.name}
          </h3>
          <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span className="truncate">{property.address}</span>
          </p>
          {avail.length === 0 && (
            <p className="font-body text-xs text-destructive font-medium">All rooms occupied</p>
          )}
        </div>
      </div>
    </Link>
  )
}
