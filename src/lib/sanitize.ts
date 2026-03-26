/**
 * Sanitization utilities to prevent XSS attacks
 * Use these functions before rendering user-generated content
 */

/**
 * Basic HTML sanitization - removes script tags and dangerous attributes
 * For rich text, use DOMPurify library instead
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Sanitize property names and user-generated text
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/[<>'"]/g, "") // Remove dangerous characters
    .trim();
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "";
  }
  
  return url.trim();
}

/**
 * Escape HTML entities for safe rendering
 */
export function escapeHtml(input: string): string {
  const entityMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };
  
  return input.replace(/[&<>"'\/]/g, (char) => entityMap[char] || char);
}

/**
 * Validate and sanitize WhatsApp numbers (Indian format)
 */
export function sanitizeWhatsAppNumber(input: string): string {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, "");
  
  // Indian mobile numbers: 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  
  // If prefixed with +91 or 91
  if (digits.length === 12 && digits.startsWith("91")) {
    const mobile = digits.slice(2);
    if (/^[6-9]\d{9}$/.test(mobile)) {
      return mobile;
    }
  }
  
  return "";
}
