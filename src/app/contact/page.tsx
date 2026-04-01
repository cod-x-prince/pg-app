"use client"
import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(true)
        setForm({ name: "", email: "", subject: "", message: "" })
      } else {
        const data = await res.json()
        setError(data.error || "Something went wrong")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar forceWhite />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl text-foreground mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Contact Form */}
            <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <h2 className="font-display font-semibold text-xl text-foreground mb-6">Send us a message</h2>
              
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="font-semibold text-green-900 mb-2">Message sent!</h3>
                  <p className="text-sm text-green-700">We'll respond within 24-48 hours.</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-sm text-green-700 hover:text-green-900 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="input w-full"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="input w-full"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                      className="input w-full"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      minLength={20}
                      maxLength={2000}
                      className="input w-full resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.message.length}/2000 characters (minimum 20)
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || form.message.length < 20}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-foreground text-sm">Email</p>
                      <a href="mailto:support@gharam.in" className="text-primary text-sm hover:underline">
                        support@gharam.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-foreground text-sm">Response Time</p>
                      <p className="text-muted-foreground text-sm">Within 24-48 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-foreground text-sm">Support Hours</p>
                      <p className="text-muted-foreground text-sm">Monday - Saturday, 9 AM - 6 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/help" className="block text-sm text-primary hover:underline">
                    → Help Center & FAQs
                  </Link>
                  <Link href="/terms" className="block text-sm text-primary hover:underline">
                    → Terms of Service
                  </Link>
                  <Link href="/privacy" className="block text-sm text-primary hover:underline">
                    → Privacy Policy
                  </Link>
                  <Link href="/refund-policy" className="block text-sm text-primary hover:underline">
                    → Refund Policy
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
                <h3 className="font-display font-semibold text-base text-foreground mb-2">Need immediate help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check our Help Center for instant answers to common questions.
                </p>
                <Link href="/help" className="btn-primary btn-sm w-full">
                  Browse Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
