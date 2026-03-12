export const ALLOWED_CITIES = [
  "mumbai",
  "delhi",
  "bangalore",
  "hyderabad",
  "chennai",
  "kolkata",
  "pune",
  "jammu",
  "srinagar",
];

export const ALLOWED_GENDERS = ["MALE", "FEMALE", "UNISEX"];
export const ALLOWED_ROLES = ["TENANT", "OWNER", "BROKER"];
export const ALLOWED_BOOKING_STATUSES = ["CONFIRMED", "CANCELLED"];
export const ALLOWED_AMENITIES = [
  "WiFi",
  "AC",
  "Parking",
  "CCTV",
  "Gym",
  "Laundry",
  "Geyser",
  "TV",
  "Power Backup",
  "RO Water",
  "Dining",
  "Lift",
];
export const ALLOWED_ROOM_TYPES = ["Single", "Double", "Triple"];

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password too long";
  return null;
}

export function validateName(name: string): string | null {
  if (!name || name.trim().length < 2)
    return "Name must be at least 2 characters";
  if (name.length > 100) return "Name too long";
  if (/<|>|script/i.test(name)) return "Invalid characters in name";
  return null;
}

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function sanitizeString(str: string, maxLen = 500): string {
  return str.trim().slice(0, maxLen);
}

export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function validateRent(rent: number): boolean {
  return Number.isInteger(rent) && rent >= 500 && rent <= 500000;
}

export function validateDeposit(deposit: number): boolean {
  return Number.isInteger(deposit) && deposit >= 0 && deposit <= 1000000;
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
