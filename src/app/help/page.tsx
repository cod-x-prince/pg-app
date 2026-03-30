"use client"
import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is Gharam (PGLife)?",
        a: "Gharam is a verified PG (Paying Guest) accommodation marketplace that connects property owners with tenants across India. We offer transparent, broker-free listings with verified photos and secure token booking.",
      },
      {
        q: "How is Gharam different from other PG platforms?",
        a: "We verify all property photos, offer no-brokerage direct bookings, provide secure token payments via Razorpay, and show transparent pricing with no hidden fees. Plus, all owners are KYC-verified for safety.",
      },
      {
        q: "Is Gharam free to use?",
        a: "Yes! Searching and browsing properties is completely free. Tenants only pay a ₹500 token amount to secure a booking. Property owners can list for free and pay a small commission only on confirmed bookings.",
      },
    ],
  },
  {
    category: "For Tenants",
    questions: [
      {
        q: "How do I book a PG?",
        a: "1) Browse properties in your city 2) View details and photos 3) Click 'Book Now' 4) Pay ₹500 token via Razorpay 5) Owner confirms booking 6) Move in on your selected date. It's that simple!",
      },
      {
        q: "What is the ₹500 token for?",
        a: "The ₹500 token secures your booking and shows commitment to the owner. It's deducted from your first month's rent when you move in. If the owner cancels, you get a full refund automatically.",
      },
      {
        q: "Can I cancel my booking?",
        a: "Yes. If you cancel more than 7 days before move-in, you get a full refund. 2-7 days before: 50% refund. Less than 2 days: no refund. See our Refund Policy for details.",
      },
      {
        q: "Are the property photos verified?",
        a: "Yes! All property owners must upload real photos. We have a verification process, and misleading listings are removed. You can also check reviews from previous tenants.",
      },
      {
        q: "How do I contact the owner?",
        a: "After viewing a property, use the 'Contact Owner' button to send a WhatsApp message with your inquiry. For serious inquiries, book first to unlock direct contact details.",
      },
    ],
  },
  {
    category: "For Property Owners",
    questions: [
      {
        q: "How do I list my PG?",
        a: "1) Sign up as an Owner 2) Complete KYC verification 3) Create a listing with photos, amenities, and pricing 4) Submit for admin approval 5) Once approved, your property goes live!",
      },
      {
        q: "How much does it cost to list?",
        a: "Listing is FREE! You only pay a 5% commission on confirmed bookings. No upfront fees, no hidden charges. You only pay when you successfully rent out a room.",
      },
      {
        q: "How long does approval take?",
        a: "Most listings are reviewed within 24-48 hours. Make sure your photos are clear and your description is accurate to speed up approval. You'll receive an email once approved.",
      },
      {
        q: "When do I receive payment?",
        a: "The ₹500 token is held in escrow. When the tenant moves in, the token is deducted from their first month's rent, which they pay you directly. Gharam doesn't handle monthly rent payments.",
      },
      {
        q: "Can I reject a booking?",
        a: "Yes, you can review booking requests and accept or reject them within 24 hours. However, frequent rejections may affect your visibility in search results.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    questions: [
      {
        q: "Is payment secure?",
        a: "Absolutely! All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details. Your financial information is 100% secure.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets via Razorpay. Choose the method that's most convenient for you.",
      },
      {
        q: "How do refunds work?",
        a: "Refunds are processed automatically based on our cancellation policy. Full refund if owner cancels or if you cancel 7+ days before move-in. Partial refund for 2-7 days notice. Refunds take 5-7 business days to reflect in your account.",
      },
      {
        q: "What if the property is not as shown?",
        a: "If the property significantly differs from the listing, contact support immediately. We'll investigate and may issue a full refund. We take false listings very seriously.",
      },
    ],
  },
  {
    category: "Safety & Trust",
    questions: [
      {
        q: "Are property owners verified?",
        a: "Yes! All owners must complete KYC verification (Aadhaar/PAN) before listing. This ensures accountability and protects tenants from fraud.",
      },
      {
        q: "Can I trust the reviews?",
        a: "All reviews are from verified tenants who completed bookings. We don't allow fake reviews. You can report suspicious reviews, and we'll investigate.",
      },
      {
        q: "What if I face issues after moving in?",
        a: "Contact the owner first to resolve the issue. If unresolved, reach out to our support team at support@gharam.in. We'll mediate and help find a solution.",
      },
      {
        q: "How is my personal data protected?",
        a: "We comply with India's DPDP Act 2023. Your data is encrypted, never sold, and only used for booking purposes. Read our Privacy Policy for full details.",
      },
    ],
  },
  {
    category: "Account & Technical",
    questions: [
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Forgot Password' on the login page, enter your email, and we'll send a reset link. If you don't receive it within 5 minutes, check your spam folder or contact support.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Profile → Settings → Delete Account. This will permanently remove your data (except legally required records). This action cannot be undone.",
      },
      {
        q: "The website is not loading properly. What should I do?",
        a: "Try clearing your browser cache, using an incognito window, or switching browsers. If issues persist, contact support with details about your browser and device.",
      },
      {
        q: "Do you have a mobile app?",
        a: "Not yet! Our website is mobile-optimized for now. A native mobile app is in development and will launch soon. Follow us on social media for updates!",
      },
    ],
  },
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqs.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0)

  return (
    <>
      <Navbar forceWhite />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl text-foreground mb-4">Help Center</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Find answers to common questions
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="input w-full pl-12 pr-4 py-3 text-base"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* FAQs */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category) => (
                <div key={category.category}>
                  <h2 className="font-display font-semibold text-2xl text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    {category.category}
                  </h2>
                  <div className="space-y-3">
                    {category.questions.map((faq, idx) => {
                      const key = `${category.category}-${idx}`
                      const isOpen = openIndex === key
                      return (
                        <div
                          key={key}
                          className="bg-white rounded-lg border border-border overflow-hidden shadow-sm"
                        >
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : key)}
                            className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
                          >
                            <span className="font-medium text-foreground pr-4">{faq.q}</span>
                            <svg
                              className={`w-5 h-5 text-primary shrink-0 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-0 text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
                              <p className="pt-3">{faq.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="btn-primary">
                Contact Support
              </Link>
              <a href="mailto:support@gharam.in" className="btn-secondary">
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
