"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import type { PropertyListItem } from "@/types"

interface Props { property: PropertyListItem }

const GENDER: Record<string, string> = {
  MALE:   "Boys",
  FEMALE: "Girls",
  UNISEX: "Unisex",
}

export default function PropertyCard({ property }: Props) {
  const [saved, setSaved] = useState(false)

  const img     = property.images.find(i => i.isPrimary)?.url || property.images[0]?.url
  const avail   = property.rooms.filter(r => r.isAvailable)
  const minRent = avail.length ? Math.min(...avail.map(r => r.rent)) : null
  const rating  = property.reviews.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null

  return (
    <Link href={`/properties/${property.city.toLowerCase()}/${property.id}`} className="block group">
      <div className="prop-card flex flex-col gap-3">
        {/* Image Area */}
        <div className="prop-card-img relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
          {img ? (
            <Image
              src={img}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              🏠
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {property.isVerified && (
                <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-900 shadow-sm">
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Save Button */}
            <button
              className="p-2 transition-transform hover:scale-110 active:scale-95 z-10"
              onClick={e => { e.preventDefault(); setSaved(s => !s) }}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <svg
                className="w-6 h-6 transition-colors"
                fill={saved ? "#E25A3B" : "rgba(0,0,0,0.5)"}
                stroke={saved ? "#E25A3B" : "white"}
                strokeWidth={saved ? "0" : "2"}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col">
          {/* Title & Rating */}
          <div className="flex justify-between items-start gap-2 mb-0.5">
            <h3 className="font-semibold text-[15px] text-gray-900 truncate">
              {property.name}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 shrink-0 text-[14px]">
                <svg className="w-3.5 h-3.5" fill="#222222" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="font-medium text-gray-900">{rating}</span>
              </div>
            )}
          </div>

          <p className="text-[14px] text-gray-500 truncate mb-0.5">
            {property.city} • {GENDER[property.gender] ?? "Unisex"}
          </p>
          
          <p className="text-[14px] text-gray-500 truncate mb-1.5">
            {property.address}
          </p>

          <div className="mt-1">
            {avail.length === 0 ? (
              <span className="text-[14px] font-medium text-red-500">All rooms occupied</span>
            ) : minRent ? (
              <span className="text-[15px] text-gray-900">
                <span className="font-semibold">₹{minRent.toLocaleString("en-IN")}</span> / month
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
