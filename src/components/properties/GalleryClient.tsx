"use client"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface Props { images: string[]; name: string }

export default function GalleryClient({ images, name }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % images.length : null), [images.length])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      close()
      else if (e.key === "ArrowLeft")  prev()
      else if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightbox, close, prev, next])

  if (images.length === 0) {
    return (
      <div className="h-72 bg-gray-100 flex items-center justify-center">
        <span className="text-6xl opacity-20">🏠</span>
      </div>
    )
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className={`grid gap-2 rounded-2xl overflow-hidden ${images.length === 1 ? "grid-cols-1 h-80" : images.length === 2 ? "grid-cols-2 h-80" : "grid-cols-4 grid-rows-2 h-80"}`}>

          {images.length === 1 && (
            <div className="relative cursor-pointer group" onClick={() => setLightbox(0)}>
              <Image src={images[0]} alt={name} fill className="object-cover group-hover:brightness-95 transition-all" />
              <GalleryOverlay total={images.length} />
            </div>
          )}

          {images.length === 2 && images.map((url, i) => (
            <div key={i} className="relative cursor-pointer group" onClick={() => setLightbox(i)}>
              <Image src={url} alt={`${name} ${i + 1}`} fill className="object-cover group-hover:brightness-95 transition-all" />
              {i === 1 && <GalleryOverlay total={images.length} />}
            </div>
          ))}

          {images.length >= 3 && (
            <>
              {/* Large left image */}
              <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => setLightbox(0)}>
                <Image src={images[0]} alt={name} fill className="object-cover group-hover:brightness-95 transition-all" />
              </div>
              {/* Right 4 grid */}
              {images.slice(1, 5).map((url, i) => (
                <div key={i} className="relative cursor-pointer group" onClick={() => setLightbox(i + 1)}>
                  <Image src={url} alt={`${name} ${i + 2}`} fill className="object-cover group-hover:brightness-95 transition-all" />
                  {i === 3 && images.length > 5 && <GalleryOverlay total={images.length} />}
                </div>
              ))}
            </>
          )}
        </div>

        {images.length > 1 && (
          <button onClick={() => setLightbox(0)}
            className="mt-2 text-xs text-gray-500 hover:text-[#1B3B6F] transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            View all {images.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={close}>
          {/* Image */}
        {/* Image — kept as <img> intentionally: fullscreen overlay with percentage-based sizing */}
        <img
          src={images[lightbox]}
          alt={`${name} ${lightbox + 1}`}
          className="max-h-[85vh] max-w-[90vw] object-contain select-none"
          onClick={e => e.stopPropagation()}
        />

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-2 rounded-full">
            {lightbox + 1} / {images.length}
          </div>

          {/* Close - Fix P3-12: Add accessibility label */}
          <button onClick={close} aria-label="Close gallery"
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Prev - Fix P3-12: Add accessibility label */}
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          )}

          {/* Next - Fix P3-12: Add accessibility label */}
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }} aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-xs overflow-x-auto">
              {images.map((url, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-12 h-9 rounded-lg overflow-hidden shrink-0 transition-all border-2 relative ${
                    i === lightbox ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                  }`}>
                  <Image src={url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function GalleryOverlay({ total }: { total: number }) {
  if (total <= 5) return null
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <span className="text-white font-semibold text-lg">+{total - 5} more</span>
    </div>
  )
}
