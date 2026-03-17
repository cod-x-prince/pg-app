"use client"
import { useEffect, useRef } from "react"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef    = useRef<HTMLDivElement>(null)
  const posRef    = useRef({ x: -100, y: -100 })
  const curRef    = useRef({ x: -100, y: -100 })

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(pointer: coarse)").matches) return // skip on mobile

    const move = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    const enter = () => cursorRef.current?.classList.add("cursor-expanded")
    const leave = () => cursorRef.current?.classList.remove("cursor-expanded")

    let raf: number
    const animate = () => {
      curRef.current.x += (posRef.current.x - curRef.current.x) * 0.12
      curRef.current.y += (posRef.current.y - curRef.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${curRef.current.x - 20}px, ${curRef.current.y - 20}px)`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    document.addEventListener("mousemove", move)
    document.querySelectorAll("a, button, [role='button'], input, select, textarea, label").forEach(el => {
      el.addEventListener("mouseenter", enter)
      el.addEventListener("mouseleave", leave)
    })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("mousemove", move)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
      <div ref={dotRef}    className="cursor-dot"    aria-hidden="true" />
    </>
  )
}
