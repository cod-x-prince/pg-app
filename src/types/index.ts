export type Role = "TENANT" | "OWNER" | "BROKER" | "ADMIN"
export type Gender = "MALE" | "FEMALE" | "UNISEX"
export type BookingType = "ENQUIRY" | "DIRECT"
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  isApproved: boolean
}

export interface PropertyWithDetails {
  id: string
  name: string
  description: string
  city: string
  address: string
  lat: number | null
  lng: number | null
  gender: Gender
  whatsapp: string | null
  isVerified: boolean
  isActive: boolean
  createdAt: string
  owner: { id: string; name: string; email: string }
  rooms: Room[]
  images: Image[]
  videos: Video[]
  amenities: Amenity[]
  reviews: ReviewWithUser[]
  _count: { likes: number; bookings: number }
  avgRating?: number
}

export interface Room {
  id: string
  type: string
  rent: number
  deposit: number
  isAvailable: boolean
}

export interface Image {
  id: string
  url: string
  isPrimary: boolean
}

export interface Video {
  id: string
  url: string
}

export interface Amenity {
  id: string
  name: string
}

export interface ReviewWithUser {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  tenant: { name: string }
}
