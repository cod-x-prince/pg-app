/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              process.env.NODE_ENV === "development"
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://checkout.razorpay.com"
                : "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://browser.sentry-cdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              process.env.NODE_ENV === "development"
                ? "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com"
                : "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://o4504.ingest.sentry.io https://o4505.ingest.sentry.io https://o4506.ingest.sentry.io https://*.upstash.io",
              "frame-src https://api.razorpay.com",
            ].join("; "),
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress verbose Sentry build output
  silent: true,

  // Only upload source maps when auth token is present
  // Without this, missing token causes build failure
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Don't fail the build if source map upload fails
  errorHandler(err, invokeErr, compilation) {
    compilation.warnings.push("Sentry: " + err.message);
  },

  // Hide source maps from public JS bundle
  hideSourceMaps: true,

  // Disable Sentry telemetry during CI/build
  telemetry: false,
});
