"use client"
import { useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card max-w-sm w-full p-10 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[#1B3B6F] mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-6">We couldn&apos;t load this page. Please try again.</p>
          <div className="flex flex-col gap-3">
            <button onClick={reset} className="btn-primary w-full justify-center py-3">Try again</button>
            <Link href="/" className="btn-outline w-full justify-center py-3">Go home</Link>
          </div>
        </div>
      </div>
    </>
  )
}
