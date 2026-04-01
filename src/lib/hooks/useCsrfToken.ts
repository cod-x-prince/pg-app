"use client"

import { useEffect, useState } from "react"

/**
 * React hook to get and manage CSRF token
 * Automatically refreshes token from cookie
 */
export function useCsrfToken(): string | null {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Get token from cookie
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
      return match?.[2] ?? null
    }

    const csrfToken = getCookie("csrf-token")
    setToken(csrfToken)

    // Listen for cookie changes (when token is refreshed)
    const interval = setInterval(() => {
      const newToken = getCookie("csrf-token")
      if (newToken !== token) {
        setToken(newToken)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [token])

  return token
}

/**
 * Enhanced fetch wrapper with automatic CSRF token injection
 * Use this instead of raw fetch for all API calls
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1]

  // Add CSRF token to headers for unsafe methods
  const method = (options.method || "GET").toUpperCase()
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && token) {
    options.headers = {
      ...options.headers,
      "x-csrf-token": token,
    }
  }

  return fetch(url, options)
}
