import Link from "next/link"

const CITIES = ["Bangalore","Mumbai","Delhi","Hyderabad","Pune","Chennai","Jammu"]

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="section-wrap py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-xs text-white">PG</span>
              </div>
              <span className="font-display font-bold text-lg">PGLife</span>
            </div>
            <p className="font-body text-sm leading-relaxed opacity-60 max-w-xs">
              India&apos;s trusted PG booking platform. Verified listings, real photos, direct booking. Zero broker fees.
            </p>
          </div>

          <div>
            <p className="font-display text-xs font-semibold tracking-[3px] uppercase mb-4 text-primary">Cities</p>
            <ul className="space-y-2.5">
              {CITIES.map(c => (
                <li key={c}>
                  <Link href={`/properties/${c.toLowerCase()}`}
                    className="font-body text-sm opacity-60 hover:opacity-100 transition-opacity">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-xs font-semibold tracking-[3px] uppercase mb-4 text-primary">Tenants</p>
            <ul className="space-y-2.5">
              {[
                { href: "/auth/signup", label: "Create Account" },
                { href: "/dashboard",   label: "My Bookings" },
                { href: "/",            label: "How it Works" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="font-body text-sm opacity-60 hover:opacity-100 transition-opacity">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-xs font-semibold tracking-[3px] uppercase mb-4 text-primary">Legal</p>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms",   label: "Terms of Service" },
                { href: "mailto:support@pglife.in", label: "Contact" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="font-body text-sm opacity-60 hover:opacity-100 transition-opacity">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs opacity-40">&copy; {new Date().getFullYear()} PGLife. All rights reserved.</p>
          <p className="font-body text-xs opacity-40">Built with care in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
