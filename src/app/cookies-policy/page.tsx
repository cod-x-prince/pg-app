import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
  title: "Cookie Policy | Gharam",
  description: "Learn about how we use cookies and similar technologies on Gharam.",
}

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar forceWhite />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          
          <h1 className="font-display font-bold text-4xl text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="prose prose-slate max-w-none">
            
            {/* Introduction */}
            <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
              <p className="text-muted-foreground mb-0">
                This Cookie Policy explains how Gharam ("we", "us", or "our") uses cookies and similar technologies 
                when you visit our website. This policy helps you understand what cookies are, how we use them, 
                and your choices regarding their use.
              </p>
            </section>

            {/* What are cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                1. What Are Cookies?
              </h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                <p className="text-blue-900 text-sm mb-0">
                  <strong>💡 Example:</strong> When you log in to Gharam, a cookie remembers your session so you don't have to 
                  log in again on every page.
                </p>
              </div>
            </section>

            {/* Types of cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                2. Types of Cookies We Use
              </h2>

              <div className="space-y-4">
                {/* Necessary */}
                <div className="border border-border rounded-lg p-5 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mb-0">Necessary Cookies</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    These cookies are essential for the website to function properly. They enable core features like 
                    authentication, security, and basic navigation. <strong>You cannot opt out of these cookies</strong> 
                    as they are necessary for the site to work.
                  </p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-0">
                      <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">next-auth.session-token</code> - Stores your login session (expires after 24 hours)</li>
                      <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">next-auth.csrf-token</code> - Prevents cross-site request forgery attacks</li>
                      <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">cookie-consent</code> - Stores your cookie consent preferences</li>
                    </ul>
                  </div>
                </div>

                {/* Analytics */}
                <div className="border border-border rounded-lg p-5 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Optional
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mb-0">Analytics Cookies</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    These cookies help us understand how visitors interact with our website by collecting and reporting 
                    information anonymously. We use this data to improve user experience and fix issues.
                  </p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-0">
                      <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">_ga</code> - Google Analytics: Distinguishes users (expires after 2 years)</li>
                      <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">_gid</code> - Google Analytics: Distinguishes users (expires after 24 hours)</li>
                      <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">_gat</code> - Google Analytics: Throttles request rate (expires after 1 minute)</li>
                    </ul>
                  </div>
                  <p className="text-sm text-blue-700 mt-3 mb-0">
                    ℹ️ You can <strong>opt out</strong> of analytics cookies via our cookie banner or browser settings.
                  </p>
                </div>

                {/* Performance */}
                <div className="border border-border rounded-lg p-5 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Optional
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mb-0">Performance Cookies</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    These cookies help us monitor and improve website performance by collecting data on page load times, 
                    errors, and user navigation patterns.
                  </p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-0">
                      <li>Vercel Analytics - Tracks page views and performance metrics</li>
                      <li>Sentry - Captures error logs to help us fix bugs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Third-party cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                3. Third-Party Cookies
              </h2>
              <p className="text-muted-foreground">
                We use services from trusted third parties that may set their own cookies. These services help us 
                provide features like payment processing, analytics, and error monitoring.
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">Google Analytics (GA4)</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Helps us understand user behavior and improve our website.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="text-primary hover:underline">policies.google.com/privacy</a>
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">Razorpay</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Processes secure payments for booking tokens. Sets cookies during checkout.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Privacy Policy: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener" className="text-primary hover:underline">razorpay.com/privacy</a>
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">Cloudflare Turnstile</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Protects our signup forms from bots and spam.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Privacy Policy: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener" className="text-primary hover:underline">cloudflare.com/privacypolicy</a>
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">Cloudinary</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Hosts and optimizes property images for faster loading.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Privacy Policy: <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener" className="text-primary hover:underline">cloudinary.com/privacy</a>
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">Sentry</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Monitors errors and performance issues to improve reliability.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Privacy Policy: <a href="https://sentry.io/privacy/" target="_blank" rel="noopener" className="text-primary hover:underline">sentry.io/privacy</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Managing cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                4. Managing Your Cookie Preferences
              </h2>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">On Gharam:</h3>
              <p className="text-muted-foreground mb-3">
                When you first visit our website, you'll see a cookie consent banner with three options:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <strong>Accept All:</strong> Allows all cookies (necessary + analytics + performance)
                </li>
                <li>
                  <strong>Reject All:</strong> Only necessary cookies (required for the site to work)
                </li>
                <li>
                  <strong>Necessary Only:</strong> Same as "Reject All" (only essential cookies)
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You can change your preferences anytime by clearing your browser cookies and revisiting the site. 
                The banner will appear again, allowing you to make a new choice.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">In Your Browser:</h3>
              <p className="text-muted-foreground mb-3">
                Most web browsers allow you to control cookies through their settings. Here's how:
              </p>
              <div className="bg-white border border-border rounded-lg p-4">
                <ul className="text-sm text-muted-foreground space-y-2 mb-0">
                  <li>
                    <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                  </li>
                  <li>
                    <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                  </li>
                  <li>
                    <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
                  </li>
                </ul>
              </div>
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3 mt-3 mb-0">
                ⚠️ <strong>Note:</strong> Blocking all cookies may prevent you from using certain features on our website, 
                such as logging in or making bookings.
              </p>
            </section>

            {/* Do Not Track */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                5. Do Not Track (DNT)
              </h2>
              <p className="text-muted-foreground">
                Some browsers have a "Do Not Track" feature that signals websites you don't want to be tracked. 
                Currently, there is no industry-wide standard for honoring DNT signals. However, if you reject analytics 
                cookies via our banner, we will not track your behavior.
              </p>
            </section>

            {/* Data retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                6. How Long Do Cookies Last?
              </h2>
              <p className="text-muted-foreground mb-3">
                Cookies have different lifespans:
              </p>
              <div className="bg-white border border-border rounded-lg p-4">
                <ul className="text-muted-foreground space-y-2 mb-0">
                  <li>
                    <strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser 
                    (e.g., CSRF token)
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them 
                    (e.g., login session: 24 hours, Google Analytics: up to 2 years)
                  </li>
                </ul>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                7. Updates to This Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
                Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this 
                policy periodically.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                8. Contact Us
              </h2>
              <p className="text-muted-foreground mb-3">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="bg-white border border-border rounded-lg p-4">
                <p className="mb-2">
                  <strong>Email:</strong> <a href="mailto:privacy@gharam.in" className="text-primary hover:underline">privacy@gharam.in</a>
                </p>
                <p className="mb-0">
                  <strong>Support:</strong> <a href="mailto:support@gharam.in" className="text-primary hover:underline">support@gharam.in</a>
                </p>
              </div>
            </section>

            {/* Summary table */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                9. Cookie Summary Table
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border px-4 py-2 text-left">Cookie Name</th>
                      <th className="border border-border px-4 py-2 text-left">Type</th>
                      <th className="border border-border px-4 py-2 text-left">Purpose</th>
                      <th className="border border-border px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2"><code>next-auth.session-token</code></td>
                      <td className="border border-border px-4 py-2">Necessary</td>
                      <td className="border border-border px-4 py-2">Stores login session</td>
                      <td className="border border-border px-4 py-2">24 hours</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2"><code>next-auth.csrf-token</code></td>
                      <td className="border border-border px-4 py-2">Necessary</td>
                      <td className="border border-border px-4 py-2">Prevents CSRF attacks</td>
                      <td className="border border-border px-4 py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2"><code>cookie-consent</code></td>
                      <td className="border border-border px-4 py-2">Necessary</td>
                      <td className="border border-border px-4 py-2">Stores consent preferences</td>
                      <td className="border border-border px-4 py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2"><code>_ga</code></td>
                      <td className="border border-border px-4 py-2">Analytics</td>
                      <td className="border border-border px-4 py-2">Distinguishes users</td>
                      <td className="border border-border px-4 py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2"><code>_gid</code></td>
                      <td className="border border-border px-4 py-2">Analytics</td>
                      <td className="border border-border px-4 py-2">Distinguishes users</td>
                      <td className="border border-border px-4 py-2">24 hours</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2"><code>_gat</code></td>
                      <td className="border border-border px-4 py-2">Analytics</td>
                      <td className="border border-border px-4 py-2">Throttles requests</td>
                      <td className="border border-border px-4 py-2">1 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Related Links */}
            <div className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">Related Policies</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-primary hover:underline text-sm">
                  → Privacy Policy
                </Link>
                <Link href="/terms" className="block text-primary hover:underline text-sm">
                  → Terms of Service
                </Link>
                <Link href="/refund-policy" className="block text-primary hover:underline text-sm">
                  → Refund Policy
                </Link>
                <Link href="/contact" className="block text-primary hover:underline text-sm">
                  → Contact Us
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
