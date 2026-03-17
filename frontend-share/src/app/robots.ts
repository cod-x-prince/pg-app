import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXTAUTH_URL ?? "https://pglife.in"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/owner", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
