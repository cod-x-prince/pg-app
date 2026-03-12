import Link from "next/link"
import Image from "next/image"

interface Props {
  property: {
    id: string
    name: string
    city: string
    address: string
    gender: string
    isVerified: boolean
    images: { url: string; isPrimary: boolean }[]
    rooms: { rent: number; isAvailable: boolean }[]
    reviews: { rating: number }[]
  }
}

const GENDER_BADGE: Record<string, { label: string; style: string }> = {
  MALE:   { label: "Boys",   style: "bg-blue-light text-[#1B3B6F]" },
  FEMALE: { label: "Girls",  style: "bg-pink-50 text-pink-700" },
  UNISEX: { label: "Unisex", style: "bg-amber-light text-amber-700" },
}

export default function PropertyCard({ property }: Props) {
  const primaryImg = property.images.find(i => i.isPrimary)?.url || property.images[0]?.url
  const availableRooms = property.rooms.filter(r => r.isAvailable)
  const minRent = availableRooms.length ? Math.min(...availableRooms.map(r => r.rent)) : null
  const avgRating = property.reviews.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null
  const gender = GENDER_BADGE[property.gender] ?? GENDER_BADGE.UNISEX

  return (
    <Link href={`/properties/${property.city.toLowerCase()}/${property.id}`}>
      <div className="group cursor-pointer">
        {/* Image container */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 mb-3">
          {primaryImg ? (
            <Image
              src={primaryImg}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-20">🏠</span>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.isVerified && (
              <span className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Verified
              </span>
            )}
          </div>

          {/* Price badge bottom right */}
          {minRent && (
            <div className="absolute bottom-3 right-3 bg-[#1B3B6F] text-white text-sm font-semibold px-3 py-1.5 rounded-xl shadow-lg">
              ₹{minRent.toLocaleString()}<span className="text-white/70 font-normal text-xs">/mo</span>
            </div>
          )}

          {/* Rating badge bottom left */}
          {avgRating && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <span className="text-[#F59E0B]">★</span> {avgRating}
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif font-medium text-gray-900 text-[15px] leading-snug group-hover:text-[#1B3B6F] transition-colors line-clamp-1">
              {property.name}
            </h3>
            <span className={`badge shrink-0 text-[11px] ${gender.style}`}>{gender.label}</span>
          </div>
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span className="truncate">{property.address}</span>
          </p>
          {availableRooms.length === 0 && (
            <p className="text-xs text-red-400 mt-1 font-medium">No rooms available</p>
          )}
        </div>
      </div>
    </Link>
  )
}
