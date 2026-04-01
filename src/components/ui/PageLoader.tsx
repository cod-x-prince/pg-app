"use client";
import { useEffect, useRef, useState } from "react";

export default function PageLoader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Fix P2-9: Gate loader to first load only via sessionStorage
    const hasLoaded = sessionStorage.getItem('page-loaded')
    if (hasLoaded) {
      setHidden(true)
      return
    }

    const DURATION = 1200 // Reduced from 2600ms to 1200ms
    
    // Fix P2-9: Respect reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCount(100)
      setDone(true)
      setTimeout(() => {
        setHidden(true)
        sessionStorage.setItem('page-loaded', 'true')
      }, 300)
      return
    }

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      setCount(Math.round(easeInOut(t) * 100));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => {
          setDone(true);
          setTimeout(() => {
            setHidden(true)
            sessionStorage.setItem('page-loaded', 'true')
          }, 700);
        }, 80);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#FBF8F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes gh-bounce {
          0% { transform: translateX(-50%) translateY(0) scale(1.15, 0.85); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          5% { transform: translateX(-50%) translateY(0) scale(0.9, 1.1); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          35% { transform: translateX(-50%) translateY(-120px) scale(1, 1); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          47% { transform: translateX(-50%) translateY(0) scale(0.95, 1.05); animation-timing-function: cubic-bezier(0, 0, 1, 1); }
          50% { transform: translateX(-50%) translateY(0) scale(1.15, 0.85); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          55% { transform: translateX(-50%) translateY(0) scale(0.95, 1.05); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          85% { transform: translateX(-50%) translateY(-120px) scale(1, 1); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          97% { transform: translateX(-50%) translateY(0) scale(0.95, 1.05); animation-timing-function: cubic-bezier(0, 0, 1, 1); }
          100% { transform: translateX(-50%) translateY(0) scale(1.15, 0.85); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
        }
        @keyframes gh-shadow {
          0%, 50%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.35; filter: blur(2px); }
          5%, 47%, 55%, 97% { transform: translateX(-50%) scaleX(1.1); opacity: 0.2; filter: blur(4px); }
          35%, 85% { transform: translateX(-50%) scaleX(2.5); opacity: 0.02; filter: blur(12px); }
        }
        @keyframes gh-burst {
          0%   { transform: translateX(-50%) scale(1);  opacity: 1; }
          100% { transform: translateX(-50%) scale(50); opacity: 1; }
        }
        @keyframes gh-fade-down {
          from { opacity: 1; }
          to   { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes gh-brand-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: .5; transform: translateY(0); }
        }
        .gh-ball        { animation: gh-bounce 1.05s ease-in-out infinite; }
        .gh-ball-shadow { animation: gh-shadow 1.05s ease-in-out infinite; }
        .gh-brand       { animation: gh-brand-in .5s ease .2s both; }
        .gh-num-exit    { animation: gh-fade-down .3s ease forwards; }
        .gh-burst-go    { animation: gh-burst .65s cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>

      {/* Warm radial tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 28% 40%,rgba(255,122,61,.055) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Number — bottom right */}
      <div
        className={done ? "gh-num-exit" : ""}
        style={{
          position: "absolute",
          bottom: 28,
          right: 36,
          display: "flex",
          alignItems: "baseline",
          gap: 0,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: "clamp(120px,18vw,200px)",
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: "#0F172A", // Brand dark blue
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {count}
        </span>
        <span
          style={{
            fontSize: "clamp(120px,18vw,200px)",
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: "#FF7A3D", // Brand orange
            lineHeight: 1,
          }}
        >
          .
        </span>
      </div>

      {/* Ball in center */}
      <div
        style={{
          position: "relative",
          width: 120,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Shadow */}
        {!done && (
          <div
            className="gh-ball-shadow"
            style={{
              position: "absolute",
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 40,
              height: 10,
              borderRadius: "50%",
              background: "#FF7A3D",
            }}
          />
        )}

        {/* Ball */}
        {!done ? (
          <div
            className="gh-ball"
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              transformOrigin: "center bottom",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 32%, #FF9A5C, #FF7A3D)",
              boxShadow: "0 2px 12px rgba(255,122,61,.28)",
            }}
          />
        ) : (
          /* Burst on complete */
          <div
            className="gh-burst-go"
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              transformOrigin: "center center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#FBF8F4",
              boxShadow: "0 0 0 3px rgba(255,122,61,.12)",
            }}
          />
        )}
      </div>

      {/* Brand mark — bottom left */}
      <div
        className="gh-brand"
        style={{
          position: "absolute",
          bottom: 28,
          left: 36,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#FF7A3D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 2L22 8V22H16V15H13V22H4V8L13 2Z"
              fill="white"
              opacity=".95"
            />
            <rect x="13" y="15" width="4" height="7" rx="1.5" fill="white" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "-.02em",
            color: "#0F172A",
          }}
        >
          Gharam
        </span>
      </div>
    </div>
  );
}
