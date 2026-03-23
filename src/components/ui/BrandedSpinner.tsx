/**
 * BrandedSpinner — orange dot-pulse loader that matches Gharam brand.
 * Replaces all generic blue animate-spin SVGs across the app.
 */
export default function BrandedSpinner({ size = "sm" }: { size?: "sm" | "md" }) {
  const dot = size === "md" ? "w-2 h-2" : "w-1.5 h-1.5"
  const gap = size === "md" ? "gap-1.5" : "gap-1"

  return (
    <span className={`inline-flex items-center ${gap}`} role="status" aria-label="Loading">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`${dot} rounded-full bg-current dot-pulse`}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}
