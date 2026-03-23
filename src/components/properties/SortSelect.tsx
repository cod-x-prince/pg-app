"use client"
import { useRouter } from "next/navigation"

export default function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href)
    url.searchParams.set("sort", e.target.value)
    router.push(url.pathname + "?" + url.searchParams.toString())
  }

  return (
    <select
      defaultValue={currentSort || "newest"}
      onChange={handleChange}
      className="input h-10 w-auto text-sm pr-8 cursor-pointer"
    >
      <option value="newest">Newest first</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="top_rated">Top Rated</option>
    </select>
  )
}
