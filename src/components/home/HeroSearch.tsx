"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HeroSearch() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/properties/${search.trim().toLowerCase()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
      <div className="flex-1 flex items-center gap-3 px-3">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Enter city — Bangalore, Mumbai, Delhi..."
          className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none py-2"
        />
      </div>
      <button type="submit"
        className="bg-[#1B3B6F] hover:bg-[#254E99] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shrink-0">
        Search PGs
      </button>
    </form>
  )
}
