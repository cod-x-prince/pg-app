import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-serif text-8xl font-bold text-[#1B3B6F]/10 mb-4">404</p>
        <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F] mb-3">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-8 py-3">Go Home</Link>
          <Link href="/properties/bangalore" className="btn-outline px-8 py-3">Browse PGs</Link>
        </div>
      </div>
    </div>
  )
}
