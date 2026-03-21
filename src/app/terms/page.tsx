import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Gharam — India\'s PG booking platform.",
}

const LAST_UPDATED = "March 15, 2026"

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: "By accessing or using Gharam, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform. These terms constitute a legally binding agreement between you and Gharam Technologies.",
  },
  {
    id: "platform-description",
    title: "2. Platform Description",
    content: "Gharam is a two-sided marketplace that connects PG (Paying Guest) property owners with tenants in India. We provide tools for owners to list properties and for tenants to discover, compare, and book PG accommodation. Gharam is a platform intermediary and is not itself a property owner, landlord, or rental agent.",
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    items: [
      "You must be at least 18 years of age to create an account.",
      "You must provide accurate, current, and complete information during registration.",
      "You are responsible for maintaining the confidentiality of your password.",
      "You are responsible for all activities that occur under your account.",
      "You must notify us immediately at support@gharam.in of any unauthorized use of your account.",
      "Gharam reserves the right to terminate accounts that violate these terms.",
    ],
  },
  {
    id: "owner-obligations",
    title: "4. PG Owner Obligations",
    items: [
      "Owners must provide accurate and truthful property listings including real photographs.",
      "Owners must obtain Gharam admin approval before their listings go live.",
      "Owners must honor bookings confirmed through the platform.",
      "Owners must not charge tenants broker fees or hidden charges beyond the listed rent.",
      "Owners are responsible for compliance with local laws including police verification requirements.",
      "Owners must keep pricing, availability, and property information up to date.",
      "Gharam reserves the right to delist properties that receive consistent negative reviews or violate policies.",
    ],
  },
  {
    id: "tenant-obligations",
    title: "5. Tenant Obligations",
    items: [
      "Tenants must provide accurate personal information for booking purposes.",
      "Tenants must submit to police verification as required by the property owner and local law.",
      "Reviews must be honest, based on personal experience, and not defamatory.",
      "Only tenants with confirmed bookings may submit reviews for a property.",
      "Tenants must not attempt to circumvent the platform to avoid service fees.",
    ],
  },
  {
    id: "payments",
    title: "6. Payments and Fees",
    content: "Token booking payments are processed securely through Razorpay. Token amounts are set by Gharam (typically ₹500–₹2,000) and are applied toward your first month\'s rent. Token payments are non-refundable if you cancel within 48 hours of move-in date. In the event an owner cancels a confirmed booking, the full token amount will be refunded. Gharam charges no brokerage fees to tenants. Platform fees for owners will be communicated separately when introduced.",
  },
  {
    id: "prohibited",
    title: "7. Prohibited Activities",
    items: [
      "Posting fake, misleading, or fraudulent property listings.",
      "Using the platform to collect personal information for purposes other than booking.",
      "Attempting to access other users\' accounts or data.",
      "Submitting fake reviews or manipulating the review system.",
      "Using automated tools, bots, or scrapers on the platform.",
      "Listing properties you do not own or have authority to rent.",
      "Discriminating against tenants based on religion, caste, gender, or any protected characteristic.",
    ],
  },
  {
    id: "limitation",
    title: "8. Limitation of Liability",
    content: "Gharam is a platform that facilitates connections between owners and tenants. We do not guarantee the accuracy of property listings, the conduct of owners or tenants, or the quality of any accommodation. Gharam\'s liability is limited to the amount paid through our platform for the specific booking in question. We are not liable for any indirect, incidental, or consequential damages arising from use of the platform.",
  },
  {
    id: "dispute",
    title: "9. Dispute Resolution",
    content: "In the event of a dispute between a tenant and owner, you may contact Gharam support at support@gharam.in. We will attempt to mediate in good faith but are not obligated to resolve private disputes. Any unresolved disputes shall be subject to arbitration under the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Bangalore, Karnataka, India.",
  },
  {
    id: "modifications",
    title: "10. Modifications to Terms",
    content: "Gharam reserves the right to modify these terms at any time. We will provide at least 7 days notice via email before material changes take effect. Continued use of the platform after changes constitutes acceptance of the updated terms.",
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    content: "These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Bangalore, Karnataka.",
  },
  {
    id: "contact",
    title: "12. Contact",
    content: "For questions about these Terms, contact us at legal@gharam.in. Our registered address will be updated upon company incorporation.",
  },
]

export default function TermsPage() {
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
              Back to Gharam
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1B3B6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-medium">Legal Document</span>
            </div>
            <h1 className="font-serif text-4xl text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-400 text-sm">
              Last updated: <span className="text-gray-600 font-medium">{LAST_UPDATED}</span>
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed">
              Please read these Terms of Service carefully before using Gharam. By using our 
              platform, you agree to these terms. These terms apply to all users — tenants, 
              owners, and visitors.
            </p>
          </div>

          {/* Table of contents */}
          <div className="bg-[#F9FAFB] rounded-2xl p-6 mb-12">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contents</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B3B6F] transition-colors"
                >
                  <div className="w-1 h-1 rounded-full bg-[#F59E0B] shrink-0" />
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  {s.title}
                </h2>
                {"content" in s && (
                  <p className="text-gray-500 text-sm leading-relaxed">{s.content}</p>
                )}
                {"items" in s && (
                  <ul className="space-y-3">
                    {(s.items ?? []).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                        <div className="w-5 h-5 rounded-full bg-[#EEF3FB] flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1B3B6F]" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              These Terms are effective as of {LAST_UPDATED} and supersede all previous versions.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Link href="/privacy" className="text-sm text-[#1B3B6F] hover:text-[#F59E0B] transition-colors font-medium">
                Privacy Policy →
              </Link>
              <a href="mailto:legal@gharam.in" className="text-sm text-[#1B3B6F] hover:text-[#F59E0B] transition-colors font-medium">
                legal@gharam.in
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
