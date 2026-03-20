import { z } from "zod"
import {
  ALLOWED_CITIES, ALLOWED_GENDERS, ALLOWED_ROLES,
  ALLOWED_ROOM_TYPES, ALLOWED_AMENITIES, ALLOWED_BOOKING_STATUSES,
} from "@/lib/validation"

// ── Reusable primitives ──────────────────────────────────────────────────────

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number").optional()

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")

const urlSchema = z
  .string()
  .url("Invalid URL")
  .max(2048, "URL too long")
  .refine(u => u.startsWith("https://"), "Only HTTPS URLs allowed")

// ── Auth ─────────────────────────────────────────────────────────────────────

export const SignupSchema = z.object({
  name:           z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email:          z.string().email("Invalid email").max(254).toLowerCase().trim(),
  password:       passwordSchema,
  phone:          phoneSchema,
  role:           z.enum(ALLOWED_ROLES as [string, ...string[]]).default("TENANT"),
  turnstileToken: z.string().optional(), // CAPTCHA token — validated separately
})

// ── Properties ───────────────────────────────────────────────────────────────

export const ALLOWED_FOOD_PLANS = ["NONE","BREAKFAST","TWO_MEALS","THREE_MEALS","CUSTOM"]

export const CreatePropertySchema = z.object({
  name:        z.string().min(2, "PG name required").max(150).trim(),
  description: z.string().max(2000).trim().optional().default(""),
  city:        z.string().min(1, "City required").max(100).trim(),
  address:     z.string().min(5, "Full address required").max(300).trim(),
  gender:      z.enum(ALLOWED_GENDERS as [string, ...string[]]),
  whatsapp:    z.string().regex(/^\d{10}$/, "Invalid WhatsApp number").optional().nullable(),
  lat:           z.number().min(-90).max(90).optional().nullable(),
  lng:           z.number().min(-180).max(180).optional().nullable(),
  houseRules:    z.string().max(2000).trim().optional().nullable(),
  foodPlan:      z.enum(ALLOWED_FOOD_PLANS as [string, ...string[]]).optional().default("NONE"),
  neighbourhood: z.string().max(100).trim().optional().nullable(),
})

export const UpdatePropertySchema = z.object({
  name:        z.string().min(2).max(150).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  address:     z.string().min(5).max(300).trim().optional(),
  gender:      z.enum(ALLOWED_GENDERS as [string, ...string[]]).optional(),
  whatsapp:    z.string().regex(/^\d{10}$/).optional().nullable(),
  lat:           z.number().min(-90).max(90).optional().nullable(),
  lng:           z.number().min(-180).max(180).optional().nullable(),
  houseRules:    z.string().max(2000).trim().optional().nullable(),
  foodPlan:      z.enum(ALLOWED_FOOD_PLANS as [string, ...string[]]).optional(),
  neighbourhood: z.string().max(100).trim().optional().nullable(),
}).strict() // rejects any extra fields like isVerified, isActive, ownerId

// ── Rooms ─────────────────────────────────────────────────────────────────────

export const CreateRoomSchema = z.object({
  type:          z.enum(ALLOWED_ROOM_TYPES as [string, ...string[]]),
  rent:          z.coerce.number().int().min(500, "Min rent ₹500").max(500000, "Max rent ₹5,00,000"),
  deposit:       z.coerce.number().int().min(0).max(1000000),
  availableFrom: z.string().datetime({ offset: true }).optional().nullable(),
})

// ── Bookings ──────────────────────────────────────────────────────────────────

export const CreateBookingSchema = z.object({
  propertyId: z.string().min(1, "Invalid property ID"),
  roomId:     z.string().min(1, "Invalid room ID"),
  // Accept both YYYY-MM-DD (from date input) and ISO datetime strings
  // Use UTC date comparison to avoid timezone-induced off-by-one errors
  moveInDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "Date must be YYYY-MM-DD or ISO datetime")
    .refine(d => {
      const dateStr = d.slice(0, 10) // Take only YYYY-MM-DD
      const todayStr = new Date().toISOString().slice(0, 10)
      return dateStr >= todayStr
    }, "Move-in date must be today or in the future"),
  type:       z.enum(["ENQUIRY", "DIRECT"]).default("ENQUIRY"),
})

export const UpdateBookingSchema = z.object({
  status: z.enum(ALLOWED_BOOKING_STATUSES as [string, ...string[]]),
})

// ── Reviews ───────────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  propertyId: z.string().min(1, "Invalid property ID"),
  rating:     z.coerce.number().int().min(1).max(5),
  comment:    z.string().max(1000).trim().optional().nullable(),
})

// ── Media ─────────────────────────────────────────────────────────────────────

export const CreateImageSchema = z.object({
  url:       urlSchema,
  isPrimary: z.boolean().default(false),
})

export const CreateVideoSchema = z.object({
  url: urlSchema,
})

// ── Amenities ─────────────────────────────────────────────────────────────────

export const CreateAmenitySchema = z.object({
  name: z.enum(ALLOWED_AMENITIES as [string, ...string[]]),
})

// ── Admin ─────────────────────────────────────────────────────────────────────

export const ApproveOwnerSchema = z.object({
  approved: z.boolean(),
})

export const AdminPropertySchema = z.object({
  isVerified: z.boolean().optional(),
  isActive:   z.boolean().optional(),
}).refine(d => d.isVerified !== undefined || d.isActive !== undefined, {
  message: "At least one field required",
})

// ── Helper ────────────────────────────────────────────────────────────────────

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const first = result.error.issues[0]
    return { success: false, error: first?.message ?? "Invalid request" }
  }
  return { success: true, data: result.data }
}
