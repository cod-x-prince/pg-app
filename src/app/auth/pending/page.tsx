import Link from "next/link"

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#EEF3FB] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-card max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-amber-light rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F] mb-3">
          Application Under Review
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your owner/broker account is being reviewed by our team. You&apos;ll receive an email once approved — usually within 24 hours.
        </p>
        <div className="bg-[#EEF3FB] rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            "Account created successfully",
            "Identity verification in progress",
            "Approval pending",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < 2 ? "bg-green-100 text-green-600" : "bg-amber-light text-amber-600"
              }`}>
                {i < 2 ? "✓" : "…"}
              </div>
              <span className={i < 2 ? "text-gray-700" : "text-amber-600 font-medium"}>{step}</span>
            </div>
          ))}
        </div>
        <Link href="/" className="btn-primary w-full justify-center py-3">
          Back to Homepage
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          Questions? Contact us at{" "}
          <a href="mailto:support@gharam.in" className="text-[#1B3B6F] hover:underline">support@gharam.in</a>
        </p>
      </div>
    </div>
  )
}
