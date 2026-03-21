import React from "react";

export default function BouncingLoader() {
  return (
    <div
      style={{
        position: "relative",
        width: 120,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes gh-bl-bounce {
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
        @keyframes gh-bl-shadow {
          0%, 50%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.35; filter: blur(2px); }
          5%, 47%, 55%, 97% { transform: translateX(-50%) scaleX(1.1); opacity: 0.2; filter: blur(4px); }
          35%, 85% { transform: translateX(-50%) scaleX(2.5); opacity: 0.02; filter: blur(12px); }
        }
      `}</style>

      {/* Shadow */}
      <div
        style={{
          position: "absolute",
          bottom: -4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 40,
          height: 10,
          borderRadius: "50%",
          background: "#FF7A3D",
          animation: "gh-bl-shadow 1.05s linear infinite"
        }}
      />

      {/* Ball */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          transformOrigin: "center bottom",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 32%, #FF9A5C, #FF7A3D)",
          boxShadow: "0 2px 12px rgba(255,122,61,.28)",
          animation: "gh-bl-bounce 1.05s linear infinite"
        }}
      />
    </div>
  );
}
