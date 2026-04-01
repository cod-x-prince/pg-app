import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
  title: "Refund Policy | Gharam",
  description: "Understand our token refund policy for booking cancellations.",
}

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar forceWhite />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          
          <h1 className="font-display font-bold text-4xl text-foreground mb-4">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="prose prose-slate max-w-none">
            
            {/* Introduction */}
            <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-display font-semibold text-foreground mt-0 mb-3">
                Token Booking Refunds
              </h2>
              <p className="text-muted-foreground mb-0">
                When you book a PG on Gharam, you pay a <strong>₹500 token amount</strong> to secure your reservation. 
                This token is deducted from your first month's rent upon move-in. This policy outlines when and how refunds are processed.
              </p>
            </section>

            {/* Cancellation by Tenant */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                1. Cancellation by Tenant
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">
                    Full Refund (100%)
                  </h3>
                  <p className="text-green-800 mb-2">
                    You'll receive a <strong>full ₹500 refund</strong> if:
                  </p>
                  <ul className="text-green-800 space-y-1 mb-0">
                    <li>You cancel <strong>more than 7 days</strong> before your scheduled move-in date</li>
                    <li>The property owner cancels the booking</li>
                    <li>The property is found to be significantly different from the listing</li>
                    <li>The property is no longer available due to unforeseen circumstances</li>
                  </ul>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                    Partial Refund (50%)
                  </h3>
                  <p className="text-yellow-800 mb-2">
                    You'll receive a <strong>₹250 refund</strong> if:
                  </p>
                  <ul className="text-yellow-800 space-y-1 mb-0">
                    <li>You cancel <strong>2-7 days</strong> before your scheduled move-in date</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-900 mb-1">
                    No Refund (0%)
                  </h3>
                  <p className="text-red-800 mb-2">
                    <strong>No refund</strong> will be issued if:
                  </p>
                  <ul className="text-red-800 space-y-1 mb-0">
                    <li>You cancel <strong>less than 2 days (48 hours)</strong> before move-in</li>
                    <li>You fail to show up on the move-in date without prior cancellation (no-show)</li>
                    <li>You violate the property's house rules or terms after moving in</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm mb-0">
                  <strong>💡 Pro Tip:</strong> To ensure a full refund, cancel at least 7 days before your move-in date. 
                  We recommend confirming your plans before booking.
                </p>
              </div>
            </section>

            {/* Cancellation by Owner */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                2. Cancellation by Property Owner
              </h2>
              <p className="text-muted-foreground">
                If the property owner cancels your confirmed booking for any reason, you will receive a <strong>full refund (₹500)</strong> automatically. 
                Additionally:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>The refund is processed immediately and will reflect in your account within <strong>5-7 business days</strong></li>
                <li>We will notify you via email and in-app notification</li>
                <li>You can search for alternative properties without any penalty</li>
                <li>Frequent cancellations by owners affect their listing visibility and reputation</li>
              </ul>
            </section>

            {/* Special Circumstances */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                3. Special Circumstances (Force Majeure)
              </h2>
              <p className="text-muted-foreground">
                In case of unforeseen events beyond anyone's control (natural disasters, government lockdowns, medical emergencies), 
                we will evaluate refund requests on a <strong>case-by-case basis</strong>. Contact our support team with relevant documentation.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                <p className="text-gray-700 text-sm mb-0">
                  Examples: COVID-19 lockdowns, floods, earthquakes, sudden hospitalization (with medical certificate).
                </p>
              </div>
            </section>

            {/* Refund Process */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                4. Refund Process & Timeline
              </h2>
              
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">How Refunds Work:</h3>
                <ol className="text-muted-foreground space-y-3 list-decimal list-inside mb-0">
                  <li>
                    <strong>Initiate Cancellation:</strong> Go to your Dashboard → My Bookings → Click "Cancel Booking"
                  </li>
                  <li>
                    <strong>Confirm Cancellation:</strong> Review the refund amount and confirm your cancellation
                  </li>
                  <li>
                    <strong>Automatic Processing:</strong> Our system automatically calculates the refund based on the cancellation policy
                  </li>
                  <li>
                    <strong>Razorpay Refund:</strong> The refund is initiated through Razorpay to your original payment method
                  </li>
                  <li>
                    <strong>Bank Processing:</strong> Refunds typically take <strong>5-7 business days</strong> to reflect in your account (depends on your bank)
                  </li>
                </ol>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 text-sm mb-0">
                  <strong>⚠️ Note:</strong> Refund timelines depend on your bank's processing time. Razorpay processes refunds immediately, 
                  but banks may take 5-7 business days. If you don't receive your refund within 10 days, contact support.
                </p>
              </div>
            </section>

            {/* Monthly Rent */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                5. Monthly Rent Payments (Not Covered)
              </h2>
              <p className="text-muted-foreground">
                This refund policy applies <strong>only to the ₹500 token booking amount</strong>. Monthly rent payments are made directly to the property owner 
                and are governed by the rental agreement between you and the owner.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>The ₹500 token is <strong>deducted from your first month's rent</strong> when you move in</li>
                <li>Disputes regarding monthly rent refunds should be resolved directly with the owner</li>
                <li>Gharam does not handle monthly rent payments or refunds</li>
              </ul>
            </section>

            {/* False Listings */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                6. Property Not As Described
              </h2>
              <p className="text-muted-foreground">
                If the property you booked is significantly different from the listing (misleading photos, missing amenities, incorrect location), 
                you are entitled to a <strong>full refund</strong>. Here's what to do:
              </p>
              <ol className="text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Take photos/videos of the discrepancies</li>
                <li>Contact the owner first to resolve the issue</li>
                <li>If unresolved, email <a href="mailto:support@gharam.in" className="text-primary hover:underline">support@gharam.in</a> with evidence within <strong>24 hours of move-in</strong></li>
                <li>Our team will investigate and issue a refund if the claim is valid</li>
              </ol>
              <p className="text-muted-foreground mt-3">
                We take false listings very seriously. Verified photos and accurate descriptions are mandatory. Misleading listings are removed immediately.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                7. Questions or Disputes
              </h2>
              <p className="text-muted-foreground">
                If you have any questions about our refund policy or need assistance with a refund, please contact us:
              </p>
              <div className="bg-white border border-border rounded-lg p-4 mt-3">
                <p className="mb-2">
                  <strong>Email:</strong> <a href="mailto:support@gharam.in" className="text-primary hover:underline">support@gharam.in</a>
                </p>
                <p className="mb-2">
                  <strong>Response Time:</strong> Within 24-48 hours
                </p>
                <p className="mb-0">
                  <strong>Support Hours:</strong> Monday - Saturday, 9 AM - 6 PM IST
                </p>
              </div>
            </section>

            {/* Example Scenarios */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                8. Example Scenarios
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">
                    Scenario 1: Tenant cancels 10 days before move-in
                  </p>
                  <p className="text-muted-foreground text-sm mb-0">
                    ✅ <strong>Full refund:</strong> ₹500 refunded (more than 7 days notice)
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">
                    Scenario 2: Tenant cancels 5 days before move-in
                  </p>
                  <p className="text-muted-foreground text-sm mb-0">
                    ⚠️ <strong>Partial refund:</strong> ₹250 refunded (2-7 days notice)
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">
                    Scenario 3: Tenant cancels 1 day before move-in
                  </p>
                  <p className="text-muted-foreground text-sm mb-0">
                    ❌ <strong>No refund:</strong> ₹0 refunded (less than 2 days notice)
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">
                    Scenario 4: Owner cancels the booking
                  </p>
                  <p className="text-muted-foreground text-sm mb-0">
                    ✅ <strong>Full refund:</strong> ₹500 refunded automatically (regardless of timing)
                  </p>
                </div>

                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">
                    Scenario 5: Property is not as described
                  </p>
                  <p className="text-muted-foreground text-sm mb-0">
                    ✅ <strong>Full refund:</strong> ₹500 refunded after investigation (with proof)
                  </p>
                </div>
              </div>
            </section>

            {/* Policy Changes */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-muted-foreground mb-0">
                We may update this refund policy from time to time. Changes will be posted on this page with an updated "Last updated" date. 
                Continued use of our platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Related Links */}
            <div className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">Related Resources</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-primary hover:underline text-sm">
                  → Terms of Service
                </Link>
                <Link href="/privacy" className="block text-primary hover:underline text-sm">
                  → Privacy Policy
                </Link>
                <Link href="/help" className="block text-primary hover:underline text-sm">
                  → Help Center & FAQs
                </Link>
                <Link href="/contact" className="block text-primary hover:underline text-sm">
                  → Contact Support
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
