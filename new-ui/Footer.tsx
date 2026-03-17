import Link from "next/link"

const CITIES = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Jammu"]

export default function Footer() {
  return (
    <footer style={{ background: "var(--ink2)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center glass-gold">
                <span className="font-serif text-sm font-600" style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PG</span>
              </div>
              <span className="font-serif text-lg font-600 tracking-wide" style={{ color: "var(--text-primary)" }}>PGLife</span>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              India&apos;s trusted PG booking platform. Verified listings, real photos, direct booking.
            </p>
          </div>

          {/* Cities */}
          <div>
            <p className="text-xs font-600 tracking-[3px] uppercase mb-5" style={{ color: "var(--gold)" }}>Cities</p>
            <ul className="space-y-2.5">
              {CITIES.map(c => (
                <li key={c}>
                  <Link href={`/properties/${c.toLowerCase()}`} className="text-xs transition-colors duration-200" style={{ color: "var(--text-muted)" }}
                    onMouseOver={e => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-600 tracking-[3px] uppercase mb-5" style={{ color: "var(--gold)" }}>Company</p>
            <ul className="space-y-2.5">
              {[
                { href: "/auth/signup", label: "Create Account" },
                { href: "/dashboard", label: "My Bookings" },
                { href: "/auth/signup", label: "List Your PG" },
                { href: "/owner/dashboard", label: "Owner Dashboard" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs transition-colors duration-200" style={{ color: "var(--text-muted)" }}
                    onMouseOver={e => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-600 tracking-[3px] uppercase mb-5" style={{ color: "var(--gold)" }}>Legal</p>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "mailto:support@pglife.in", label: "Contact" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs transition-colors duration-200" style={{ color: "var(--text-muted)" }}
                    onMouseOver={e => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gold-line mb-6 opacity-30" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} PGLife. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Built with care in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  )
}
