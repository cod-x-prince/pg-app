import Link from "next/link"

const CITIES = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jammu", "Srinagar"]

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#1B3B6F] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
              <span className="font-serif text-xl font-semibold text-white">PGLife</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-4">
              India&apos;s most trusted PG booking platform. Verified listings, real photos, zero brokers.
            </p>
            <p className="text-xs text-gray-600">Made with ❤️ in India</p>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Cities</h4>
            <ul className="space-y-2">
              {CITIES.map(city => (
                <li key={city}>
                  <Link href={`/properties/${city.toLowerCase()}`}
                    className="text-sm hover:text-white transition-colors">{city}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">For Tenants</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">For Owners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">List Your PG</Link></li>
              <li><Link href="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} PGLife. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
