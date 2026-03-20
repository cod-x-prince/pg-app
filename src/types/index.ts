/**
 * Shared TypeScript types for PGLife
 * Import from "@/types" throughout the codebase
 */

// ── Session User ─────────────────────────────────────────────────────────────
// Extends NextAuth default session user with our custom fields
export interface SessionUser {
  id:         string
  name:       string
  email:      string
  role:       "TENANT" | "OWNER" | "BROKER" | "ADMIN"
  isApproved: boolean
  image?:     string | null
}

// ── Property types ────────────────────────────────────────────────────────────
export interface PropertyRoom {
  id:            string
  type:          string
  rent:          number
  deposit:       number
  isAvailable:   boolean
  availableFrom: string | Date | null
}

export interface PropertyImage {
  id:        string
  url:       string
  isPrimary: boolean
}

export interface PropertyAmenity {
  id:   string
  name: string
}

export interface PropertyReview {
  id:        string
  rating:    number
  comment:   string | null
  createdAt: string | Date
  tenant: {
    name:  string
    email: string
  }
}

export interface PropertyOwner {
  id:       string
  name:     string
  email:    string
  phone:    string | null
  whatsapp: string | null
}

export interface PropertyListItem {
  id:         string
  name:       string
  city:       string
  address:    string
  gender:     "MALE" | "FEMALE" | "UNISEX"
  isVerified: boolean
  isActive:   boolean
  whatsapp:   string | null
  createdAt:  string | Date
  _count?: { likes: number }
  images:     PropertyImage[]
  rooms:      Pick<PropertyRoom, "id" | "rent" | "isAvailable" | "availableFrom">[]
  reviews:    Pick<PropertyReview, "id" | "rating">[]
  amenities?: PropertyAmenity[]
}

export interface PropertyDetail extends PropertyListItem {
  description: string
  lat?:        number | null
  lng?:        number | null
  owner:       PropertyOwner
  rooms:       PropertyRoom[]
  amenities:   PropertyAmenity[]
  reviews:     PropertyReview[]
  images:      PropertyImage[]
}

// ── Booking types ─────────────────────────────────────────────────────────────
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
export type BookingType   = "ENQUIRY" | "DIRECT"

export interface Booking {
  id:         string
  status:     BookingStatus
  type:       BookingType
  moveInDate: string
  tokenPaid:  boolean
  createdAt:  string
  property: {
    id:     string
    name:   string
    city:   string
    images: PropertyImage[]
  }
  room: {
    type: string
    rent: number
  }
}

// ── Razorpay ─────────────────────────────────────────────────────────────────
export interface RazorpayResponse {
  razorpay_order_id:   string
  razorpay_payment_id: string
  razorpay_signature:  string
}
