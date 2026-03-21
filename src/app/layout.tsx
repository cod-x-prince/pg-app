import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import PageLoader from "@/components/ui/PageLoader";

const BASE = process.env.NEXTAUTH_URL ?? "https://pglife.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "PGLife — Find Your Perfect PG in India",
    template: "%s | PGLife",
  },
  description:
    "India's trusted PG booking platform. Verified listings, real photos, direct booking. Zero broker fees.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE,
    siteName: "PGLife",
    title: "PGLife — Find Your Perfect PG in India",
    description:
      "Verified PG listings across India. Real photos, direct booking, no brokerage.",
    images: [{ url: `${BASE}/og-image.svg`, width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f0eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FM435ELBD1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FM435ELBD1', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `}
        </Script>
      </head>
      <body>
        <PageLoader />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
