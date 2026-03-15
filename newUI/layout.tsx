import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { Analytics } from "@vercel/analytics/next"
import CustomCursor from "@/components/ui/CustomCursor"
import PageLoader from "@/components/ui/PageLoader"

const BASE = process.env.NEXTAUTH_URL ?? "https://pglife.in"

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "PGLife — Find Your Perfect PG in India",
    template: "%s | PGLife",
  },
  description:
    "India\'s most trusted PG booking platform. Verified listings, real photos, direct booking. Find PGs in Bangalore, Mumbai, Delhi, Hyderabad, Pune and more.",
  keywords: ["PG accommodation", "paying guest", "PG in Bangalore", "PG in Mumbai", "PG booking India", "student accommodation India"],
  authors: [{ name: "PGLife" }],
  creator: "PGLife",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE,
    siteName: "PGLife",
    title: "PGLife — Find Your Perfect PG in India",
    description: "Verified PG listings across India. Real photos, direct booking, no brokerage.",
    images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630, alt: "PGLife" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PGLife — Find Your Perfect PG in India",
    description: "Verified PG listings across India. Real photos, direct booking.",
    images: [`${BASE}/og-image.jpg`],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B3B6F",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PageLoader />
        <CustomCursor />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
