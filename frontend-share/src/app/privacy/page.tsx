import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PGLife collects, uses, and protects your personal information.",
}

const LAST_UPDATED = "March 15, 2026"

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Information you provide directly",
        text: "When you create an account, we collect your name, email address, phone number, and password. When you list a property, we collect property details, photos, and pricing information. When you make a booking, we collect booking details and payment information processed securely through Razorpay.",
      },
      {
        subtitle: "Information collected automatically",
        text: "We collect usage data including pages visited, search queries, and time spent on the platform. We use Vercel Analytics for anonymous page view tracking and Sentry for error monitoring. We do not use third-party advertising trackers.",
      },
      {
        subtitle: "Information from third parties",
        text: "If you sign in via Google OAuth (coming soon), we receive your name, email, and profile picture from Google as permitted by your Google account settings.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "To provide our services",
        text: "We use your information to create and manage your account, connect tenants with PG owners, process bookings, send booking confirmations and notifications, and provide customer support.",
      },
      {
        subtitle: "To improve our platform",
        text: "We analyze usage patterns to improve search results, listings quality, and user experience. All analysis is done on aggregated, anonymized data where possible.",
      },
      {
        subtitle: "To communicate with you",
        text: "We send transactional emails for bookings, account updates, and security alerts. We do not send marketing emails without your explicit consent.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "3. How We Share Your Information",
    content: [
      {
        subtitle: "With other users",
        text: "When you book a PG, your name and phone number are shared with the property owner to facilitate your booking. Property owners\' contact information (WhatsApp number) is visible to logged-in tenants.",
      },
      {
        subtitle: "With service providers",
        text: "We share data with Supabase (database hosting), Cloudinary (image storage), Razorpay (payment processing), Resend (email delivery), Upstash (rate limiting), and Sentry (error monitoring). Each provider is bound by data processing agreements.",
      },
      {
        subtitle: "Legal requirements",
        text: "We may disclose your information if required by Indian law, court order, or government request, including under the Information Technology Act, 2000 and DPDP Act, 2023.",
      },
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      {
        subtitle: "How we protect your data",
        text: "Passwords are hashed using bcrypt (cost factor 12). All data is transmitted over HTTPS/TLS. Database access is restricted to application servers only. We implement rate limiting on all sensitive endpoints to prevent brute force attacks.",
      },
      {
        subtitle: "Data retention",
        text: "We retain your account data for as long as your account is active. Deleted accounts are purged within 30 days. Booking records are retained for 7 years for tax compliance under Indian law.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "5. Your Rights (DPDP Act 2023)",
    content: [
      {
        subtitle: "Rights under Indian law",
        text: "Under the Digital Personal Data Protection Act, 2023, you have the right to access your personal data, correct inaccurate data, erase your data (with certain exceptions), and withdraw consent for data processing. To exercise these rights, email us at privacy@pglife.in.",
      },
      {
        subtitle: "Account deletion",
        text: "You can request account deletion at any time by emailing privacy@pglife.in. We will delete your account and personal data within 30 days, except data we are required to retain by law.",
      },
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies",
    content: [
      {
        subtitle: "What we use",
        text: "We use session cookies for authentication (NextAuth.js) and a cookie to store your preferences. We do not use advertising cookies or third-party tracking cookies. The session cookie is httpOnly, secure, and sameSite=lax.",
      },
    ],
  },
  {
    id: "contact",
    title: "7. Contact Us",
    content: [
      {
        subtitle: "Privacy inquiries",
        text: "For privacy-related questions or to exercise your rights, contact us at privacy@pglife.in. For general support, use support@pglife.in. We aim to respond to all privacy requests within 72 hours.",
      },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">

          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1B3B6F] transition-colors mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back to PGLife
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1B3B6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-medium">Legal Document</span>
            </div>
            <h1 className="font-serif text-4xl text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">
              Last updated: <span className="text-gray-600 font-medium">{LAST_UPDATED}</span>
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed">
              PGLife (operated by PGLife Technologies) is committed to protecting your privacy. 
              This policy explains how we collect, use, and protect your personal information 
              in compliance with the Information Technology Act, 2000 and the Digital Personal 
              Data Protection Act, 2023.
            </p>
          </div>

          {/* Table of contents */}
          <div className="bg-[#F9FAFB] rounded-2xl p-6 mb-12">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contents</p>
            <div className="space-y-2">
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B3B6F] transition-colors"
                >
                  <div className="w-1 h-1 rounded-full bg-[#F59E0B]" />
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-gray-900 mb-6 pb-3 border-b border-gray-100">{s.title}</h2>
                <div className="space-y-6">
                  {s.content.map((c, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">{c.subtitle}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              This policy is governed by Indian law. Disputes are subject to the jurisdiction of courts in Bangalore, India.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Link href="/terms" className="text-sm text-[#1B3B6F] hover:text-[#F59E0B] transition-colors font-medium">
                Terms of Service →
              </Link>
              <a href="mailto:privacy@pglife.in" className="text-sm text-[#1B3B6F] hover:text-[#F59E0B] transition-colors font-medium">
                privacy@pglife.in
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
