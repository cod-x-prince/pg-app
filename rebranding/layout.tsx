import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { Analytics } from "@vercel/analytics/next"
import PageLoader from "@/components/ui/PageLoader"

const BASE = process.env.NEXTAUTH_URL ?? "https://gharam.in"

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: "Gharam — Stay where it feels right", template: "%s | Gharam" },
  description: "Verified PGs across India. No brokers, no surprises. Just honest stays.",
  openGraph: {
    type: "website", locale: "en_IN", url: BASE, siteName: "Gharam",
    title: "Gharam — Stay where it feels right",
    description: "Verified PGs across India. No brokers, no surprises. Just honest stays.",
    images: [{ url: `${BASE}/og-image.svg`, width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, themeColor: "#0F172A",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* GA4 inline bootstrap — detectable by Google verification bot */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FM435ELBD1',{anonymize_ip:true});`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PageLoader />
        <Providers>{children}</Providers>
        <Analytics />
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FM435ELBD1"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
