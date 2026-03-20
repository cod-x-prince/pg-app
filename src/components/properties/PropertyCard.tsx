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
    <Link href={`/properties/${property.city.toLowerCase()}/${property.id}`} className="block group">
      {/* Image — Airbnb style: rounded, no border, zoom on hover */}
      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: "20/19" }}>
        {img ? (
          <Image src={img} alt={property.name} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <svg className="w-10 h-10 text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
        )}

        {/* Save heart — top right, appears on hover */}
        <button
          onClick={e => { e.preventDefault(); setSaved(s => !s) }}
          aria-label={saved ? "Unsave" : "Save"}
          className="absolute top-3 right-3 cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ opacity: saved ? 1 : undefined }}
        >
          <svg className="w-6 h-6 drop-shadow-md" viewBox="0 0 32 32"
            fill={saved ? "hsl(var(--primary))" : "rgba(0,0,0,0.5)"}
            stroke={saved ? "hsl(var(--primary))" : "white"}
            strokeWidth={2}
          >
            <path d="M16 28c7-4.733 14-10 14-17a6 6 0 0 0-12 0 6 6 0 0 0-12 0c0 7 7 12.267 14 17z"/>
          </svg>
        </button>

        {/* Verified — top left */}
        {property.isVerified && (
          <div className="absolute top-3 left-3">
            <span className="badge-verified text-[10px]">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Info — Airbnb style: clean text, no card border */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1 flex-1"
            style={{ letterSpacing: "-0.01em" }}>
            {property.name}
          </h3>
          {/* Rating inline with name */}
          {rating && (
            <span className="flex items-center gap-1 font-body text-xs text-foreground shrink-0 font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {rating}
            </span>
          )}
        </div>

        <p className="font-body text-xs text-muted-foreground truncate">{property.address}</p>

        <div className="flex items-center gap-2 pt-0.5">
          <span className={`badge ${gender.cls} text-[10px]`}>{gender.label}</span>
          {avail.length === 0 && (
            <span className="font-body text-xs text-destructive font-medium">Fully occupied</span>
          )}
        </div>

        {minRent && (
          <p className="font-body text-sm text-foreground pt-0.5">
            <span className="font-semibold">₹{minRent.toLocaleString("en-IN")}</span>
            <span className="text-muted-foreground font-normal"> / month</span>
          </p>
        )}
        {(() => {
          const futureRoom = (property.rooms as any[]).find((r) => r.isAvailable && r.availableFrom && new Date(r.availableFrom) > new Date())
          if (!futureRoom) return null
          return (
            <p className="font-body text-xs text-primary font-medium pt-0.5">
              Available from {new Date(futureRoom.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          )
        })()}
      </div>
    </Link>
  )
}
