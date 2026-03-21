"use client";
import { useEffect, useState } from "react";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2800);
    const t2 = setTimeout(() => setVisible(false), 3300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  // Generate stable star positions (seeded, no random on every render)
  const stars = Array.from({ length: 120 }, (_, i) => {
    const x = (i * 137.5) % 100;
    const y = (i * 89.3) % 72;
    const sz = ((i * 53.7) % 2) + 0.5;
    const delay = (i * 41.1) % 4;
    const dur = 2 + ((i * 67.3) % 3);
    return { x, y, sz, delay, dur };
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0c1120",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
        paddingBottom: 56,
        opacity: leaving ? 0 : 1,
        transition: leaving ? "opacity 0.5s ease" : "none",
        pointerEvents: leaving ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes gh3-twinkle  {0%,100%{opacity:.12;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes gh3-moon     {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes gh3-walk     {0%{left:-70px}100%{left:calc(62% - 26px)}}
        @keyframes gh3-bob      {0%,100%{bottom:0px}50%{bottom:3px}}
        @keyframes gh3-ll       {0%,100%{transform:rotate(-30deg)}50%{transform:rotate(30deg)}}
        @keyframes gh3-rl       {0%,100%{transform:rotate(30deg)}50%{transform:rotate(-30deg)}}
        @keyframes gh3-la       {0%,100%{transform:rotate(24deg)}50%{transform:rotate(-24deg)}}
        @keyframes gh3-ra       {0%,100%{transform:rotate(-24deg)}50%{transform:rotate(24deg)}}
        @keyframes gh3-enter    {0%,76%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.3) translateX(28px)}}
        @keyframes gh3-door     {0%,70%{transform:perspective(120px) rotateY(0)}100%{transform:perspective(120px) rotateY(-80deg)}}
        @keyframes gh3-winglow  {0%,74%{opacity:0}90%,100%{opacity:1}}
        @keyframes gh3-smoke    {0%{transform:translateY(0) scale(1);opacity:.5}100%{transform:translateY(-28px) scale(2);opacity:0}}
        @keyframes gh3-shadow   {0%,100%{transform:scaleX(1);opacity:.22}50%{transform:scaleX(.65);opacity:.08}}
        @keyframes gh3-lantern  {0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes gh3-bar      {0%{width:0}55%{width:60%}100%{width:100%}}
        @keyframes gh3-label-in {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gh3-glow     {0%,100%{opacity:.5}50%{opacity:.9}}
        .gh3-person { position:absolute; bottom:0; animation:gh3-walk 2.4s cubic-bezier(.42,0,.58,1) forwards,gh3-bob .42s ease-in-out infinite; }
        .gh3-exit   { animation:gh3-enter .6s ease forwards; animation-delay:2.05s; animation-fill-mode:both; }
        .gh3-ll     { transform-origin:50% 0; animation:gh3-ll .42s ease-in-out infinite; }
        .gh3-rl     { transform-origin:50% 0; animation:gh3-rl .42s ease-in-out infinite; }
        .gh3-la     { transform-origin:50% 8%; animation:gh3-la .42s ease-in-out infinite; }
        .gh3-ra     { transform-origin:50% 8%; animation:gh3-ra .42s ease-in-out infinite; }
        .gh3-door   { transform-origin:left center; animation:gh3-door .65s cubic-bezier(.4,0,.2,1) forwards; animation-delay:1.95s; }
        .gh3-wg     { opacity:0; animation:gh3-winglow .5s ease forwards; animation-delay:2.18s; }
        .gh3-s1     { animation:gh3-smoke 2.4s ease-in-out 0s infinite; }
        .gh3-s2     { animation:gh3-smoke 2.4s ease-in-out .6s infinite; }
        .gh3-s3     { animation:gh3-smoke 2.4s ease-in-out 1.2s infinite; }
        .gh3-sh     { animation:gh3-shadow .42s ease-in-out infinite; }
        .gh3-ln     { animation:gh3-lantern 2s ease-in-out infinite; }
        .gh3-ui     { animation:gh3-label-in .5s ease .15s both; }
        .gh3-bar    { height:100%; border-radius:99px; background:linear-gradient(90deg,#FF7A3D,#ff9a5c); animation:gh3-bar 2.6s cubic-bezier(.16,1,.3,1) forwards; }
        .gh3-moon   { animation:gh3-moon 6s ease-in-out infinite; }
      `}</style>

      {/* Sky */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#07091a 0%,#0f1835 40%,#1a2550 70%,#2a3a6a 100%)",
        }}
      />

      {/* Stars */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {stars.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "white",
              width: s.sz,
              height: s.sz,
              top: `${s.y}%`,
              left: `${s.x}%`,
              animation: `gh3-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <div
        className="gh3-moon"
        style={{
          position: "absolute",
          top: "7%",
          right: "12%",
          width: 72,
          height: 72,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%,#fff8d0,#f5e080)",
            position: "absolute",
          }}
        />
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "#0f1835",
            position: "absolute",
            top: 4,
            right: -6,
          }}
        />
      </div>

      {/* City skyline SVG */}
      <svg
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          width: "100%",
          height: 160,
          opacity: 0.45,
          pointerEvents: "none",
        }}
        viewBox="0 0 800 160"
        preserveAspectRatio="xMidYMax meet"
      >
        {[
          [0, 80, 45, 80],
          [10, 50, 30, 110],
          [50, 90, 55, 70],
          [65, 60, 28, 100],
          [110, 70, 60, 90],
          [125, 40, 20, 120],
          [180, 85, 50, 75],
          [190, 55, 35, 105],
          [245, 75, 65, 85],
          [260, 45, 22, 115],
          [320, 90, 55, 70],
          [335, 62, 30, 98],
          [420, 85, 70, 75],
          [440, 55, 25, 105],
          [500, 75, 65, 85],
          [518, 45, 20, 115],
          [575, 88, 55, 72],
          [590, 58, 32, 102],
          [640, 80, 70, 80],
          [660, 50, 28, 110],
          [720, 90, 80, 70],
          [740, 60, 30, 100],
        ].map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={i % 3 === 0 ? "#0d1828" : i % 3 === 1 ? "#0f1a2e" : "#0c1622"}
          />
        ))}
        {[
          [14, 58],
          [22, 58],
          [14, 70],
          [69, 68],
          [80, 68],
          [69, 82],
          [130, 48],
          [130, 62],
          [194, 62],
          [204, 62],
          [264, 52],
          [264, 66],
          [339, 70],
          [444, 62],
          [454, 62],
          [522, 52],
          [522, 66],
          [594, 65],
          [604, 65],
          [664, 57],
          [664, 70],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="5"
            height="6"
            rx="1"
            fill="#ffe066"
            opacity={0.35 + ((i * 37) % 4) * 0.12}
          />
        ))}
        <rect x="0" y="155" width="800" height="5" fill="#151008" />
      </svg>

      {/* Ground */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 130,
          background: "linear-gradient(180deg,#151008 0%,#1a1410 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 128,
          left: 0,
          right: 0,
          height: 6,
          background: "#211a10",
        }}
      />

      {/* Road */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: 130,
          pointerEvents: "none",
        }}
        viewBox="0 0 800 130"
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width="800" height="130" fill="#1c1610" />
        <path
          d="M0 20 Q400 10 800 20"
          stroke="#252015"
          strokeWidth="16"
          fill="none"
        />
        <rect x="0" y="2" width="800" height="5" rx="2" fill="#2a2218" />
        <line
          x1="50"
          y1="12"
          x2="100"
          y2="11"
          stroke="#3a3020"
          strokeWidth="2"
          strokeDasharray="18 14"
        />
        <line
          x1="140"
          y1="10"
          x2="220"
          y2="9"
          stroke="#3a3020"
          strokeWidth="2"
          strokeDasharray="18 14"
        />
        <line
          x1="260"
          y1="9"
          x2="380"
          y2="8"
          stroke="#3a3020"
          strokeWidth="2"
          strokeDasharray="18 14"
        />
      </svg>

      {/* Street lamp */}
      <svg
        style={{
          position: "absolute",
          bottom: 118,
          left: "18%",
          width: 24,
          height: 90,
          pointerEvents: "none",
        }}
        viewBox="0 0 24 90"
      >
        <rect x="11" y="20" width="3" height="70" fill="#1e2a3a" />
        <path
          d="M12 20 Q6 10 4 4"
          stroke="#1e2a3a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="4"
          cy="5"
          rx="4"
          ry="2"
          fill="#ffe066"
          opacity=".9"
          className="gh3-ln"
        />
        <ellipse cx="4" cy="10" rx="14" ry="8" fill="#ffcc44" opacity=".08" />
      </svg>

      {/* Trees */}
      <svg
        style={{
          position: "absolute",
          bottom: 116,
          right: "30%",
          width: 50,
          height: 90,
          pointerEvents: "none",
        }}
        viewBox="0 0 50 90"
      >
        <rect x="22" y="50" width="6" height="40" fill="#1a2a14" />
        <ellipse cx="25" cy="44" rx="18" ry="22" fill="#1a3318" />
        <ellipse cx="25" cy="32" rx="14" ry="18" fill="#1e3d1e" />
        <ellipse cx="25" cy="22" rx="10" ry="14" fill="#224422" />
      </svg>
      <svg
        style={{
          position: "absolute",
          bottom: 116,
          right: "26%",
          width: 38,
          height: 70,
          pointerEvents: "none",
        }}
        viewBox="0 0 38 70"
      >
        <rect x="16" y="38" width="5" height="32" fill="#1a2a14" />
        <ellipse cx="18.5" cy="33" rx="14" ry="17" fill="#1a3318" />
        <ellipse cx="18.5" cy="23" rx="11" ry="14" fill="#224422" />
      </svg>

      {/* House */}
      <svg
        style={{
          position: "absolute",
          bottom: 118,
          right: "7%",
          width: 240,
          height: 210,
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,.6))",
          pointerEvents: "none",
        }}
        viewBox="0 0 240 210"
      >
        <defs>
          <linearGradient id="gh3hf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#243354" />
            <stop offset="100%" stopColor="#1a2744" />
          </linearGradient>
          <linearGradient id="gh3hs" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#111c2e" />
            <stop offset="100%" stopColor="#1a2744" />
          </linearGradient>
          <linearGradient id="gh3rt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9550" />
            <stop offset="100%" stopColor="#d85510" />
          </linearGradient>
          <linearGradient id="gh3rs" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a3008" />
            <stop offset="100%" stopColor="#6e2404" />
          </linearGradient>
          <linearGradient id="gh3wl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff3a0" />
            <stop offset="100%" stopColor="#ffc830" />
          </linearGradient>
          <radialGradient id="gh3wr" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#ffe566" stopOpacity=".5" />
            <stop offset="100%" stopColor="#ffe566" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gh3dg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d5a8a" />
            <stop offset="100%" stopColor="#2d4268" />
          </linearGradient>
        </defs>
        <polygon points="198,208 228,192 228,96 198,112" fill="url(#gh3hs)" />
        <rect x="38" y="112" width="160" height="98" fill="url(#gh3hf)" />
        {[126, 140, 154, 168, 182, 196].map((y) => (
          <line
            key={y}
            x1="38"
            y1={y}
            x2="198"
            y2={y}
            stroke="rgba(255,255,255,.03)"
            strokeWidth="1.5"
          />
        ))}
        <polygon points="30,114 119,62 208,114" fill="url(#gh3rt)" />
        <polygon
          points="208,114 228,102 228,92 220,88 119,62 208,114"
          fill="url(#gh3rs)"
        />
        <line
          x1="119"
          y1="62"
          x2="220"
          y2="88"
          stroke="#ff7a3d"
          strokeWidth="1.5"
          opacity=".5"
        />
        <polygon
          points="30,114 208,114 208,120 30,120"
          fill="rgba(0,0,0,.25)"
        />
        <rect x="172" y="44" width="18" height="28" fill="#0f172a" />
        <rect x="172" y="44" width="18" height="5" rx="1" fill="#1e2d4a" />
        <polygon points="190,44 200,38 200,72 190,72" fill="#0a1020" />
        <circle
          cx="181"
          cy="42"
          r="5"
          fill="#8a9ab0"
          opacity=".45"
          className="gh3-s1"
        />
        <circle
          cx="182"
          cy="32"
          r="7"
          fill="#7a8a9e"
          opacity=".3"
          className="gh3-s2"
        />
        <circle
          cx="180"
          cy="20"
          r="9"
          fill="#6a7a8e"
          opacity=".18"
          className="gh3-s3"
        />
        <rect
          x="46"
          y="124"
          width="44"
          height="36"
          rx="3"
          fill="#2d4a7a"
          opacity=".35"
        />
        <rect
          x="45"
          y="123"
          width="46"
          height="38"
          rx="3"
          fill="none"
          stroke="#3d5a8a"
          strokeWidth="1.5"
        />
        <line
          x1="68"
          y1="123"
          x2="68"
          y2="161"
          stroke="#3d5a8a"
          strokeWidth="1.2"
        />
        <line
          x1="45"
          y1="142"
          x2="91"
          y2="142"
          stroke="#3d5a8a"
          strokeWidth="1.2"
        />
        <rect
          className="gh3-wg"
          x="45"
          y="123"
          width="46"
          height="38"
          rx="3"
          fill="url(#gh3wl)"
          opacity=".8"
        />
        <ellipse
          className="gh3-wg"
          cx="68"
          cy="142"
          rx="36"
          ry="28"
          fill="url(#gh3wr)"
        />
        <rect
          x="112"
          y="124"
          width="44"
          height="36"
          rx="3"
          fill="#2d4a7a"
          opacity=".35"
        />
        <rect
          x="111"
          y="123"
          width="46"
          height="38"
          rx="3"
          fill="none"
          stroke="#3d5a8a"
          strokeWidth="1.5"
        />
        <line
          x1="134"
          y1="123"
          x2="134"
          y2="161"
          stroke="#3d5a8a"
          strokeWidth="1.2"
        />
        <line
          x1="111"
          y1="142"
          x2="157"
          y2="142"
          stroke="#3d5a8a"
          strokeWidth="1.2"
        />
        <polygon
          points="206,132 224,124 224,148 206,156"
          fill="#2d4a7a"
          opacity=".4"
        />
        <polygon
          points="205,131 225,123 225,149 205,157"
          fill="none"
          stroke="#3d5a8a"
          strokeWidth="1"
        />
        <rect
          x="148"
          y="158"
          width="38"
          height="52"
          rx="16"
          fill="none"
          stroke="#3d5a8a"
          strokeWidth="1.5"
        />
        <rect x="149" y="159" width="36" height="51" rx="15" fill="#0f1626" />
        <g className="gh3-door">
          <rect
            x="149"
            y="159"
            width="36"
            height="51"
            rx="15"
            fill="url(#gh3dg)"
          />
          <rect
            x="152"
            y="162"
            width="13"
            height="21"
            rx="2"
            fill="rgba(255,255,255,.07)"
          />
          <rect
            x="169"
            y="162"
            width="13"
            height="21"
            rx="2"
            fill="rgba(255,255,255,.07)"
          />
          <rect
            x="152"
            y="186"
            width="30"
            height="20"
            rx="2"
            fill="rgba(255,255,255,.05)"
          />
          <circle cx="175" cy="188" r="3.5" fill="#FF7A3D" />
        </g>
        <rect x="144" y="208" width="48" height="6" rx="2" fill="#1e2d4a" />
        <polygon points="144,208 136,212 192,212 186,208" fill="#162238" />
        <rect x="140" y="158" width="4" height="16" fill="#1e2a3a" />
        <rect
          x="135"
          y="174"
          width="14"
          height="18"
          rx="3"
          fill="#2d4268"
          className="gh3-ln"
        />
        <rect
          x="135"
          y="174"
          width="14"
          height="18"
          rx="3"
          fill="#ffe066"
          opacity=".2"
          className="gh3-ln"
        />
        <rect
          x="38"
          y="206"
          width="160"
          height="4"
          rx="1"
          fill="#FF7A3D"
          opacity=".15"
        />
      </svg>

      {/* Walk area */}
      <div
        style={{
          position: "absolute",
          bottom: 128,
          left: 0,
          right: 0,
          height: 80,
          pointerEvents: "none",
        }}
      >
        <div className="gh3-person gh3-exit" style={{ width: 52, height: 80 }}>
          <svg width="52" height="80" viewBox="0 0 52 80" fill="none">
            <ellipse
              cx="26"
              cy="76"
              rx="12"
              ry="4"
              fill="black"
              opacity=".2"
              className="gh3-sh"
            />
            <g className="gh3-ll" style={{ transformOrigin: "21px 40px" }}>
              <rect
                x="17"
                y="40"
                width="9"
                height="18"
                rx="4.5"
                fill="#0f172a"
              />
              <rect x="17" y="54" width="8" height="14" rx="4" fill="#1a2744" />
              <rect x="12" y="64" width="17" height="6" rx="3" fill="#111827" />
            </g>
            <g className="gh3-rl" style={{ transformOrigin: "29px 40px" }}>
              <rect
                x="26"
                y="40"
                width="9"
                height="18"
                rx="4.5"
                fill="#0f172a"
              />
              <rect x="26" y="54" width="8" height="14" rx="4" fill="#1a2744" />
              <rect x="23" y="64" width="17" height="6" rx="3" fill="#111827" />
            </g>
            <rect x="16" y="20" width="20" height="22" rx="6" fill="#FF7A3D" />
            <polygon points="22,20 28,20 26,27" fill="#e05e1a" />
            <polygon points="16,20 22,20 20,28" fill="#e05e1a" opacity=".65" />
            <polygon points="36,20 28,20 31,28" fill="#e05e1a" opacity=".65" />
            <circle cx="26" cy="34" r="2" fill="#c44a15" />
            <rect
              x="34"
              y="20"
              width="10"
              height="18"
              rx="3.5"
              fill="#c44a15"
            />
            <rect x="34.5" y="21" width="9" height="15" rx="3" fill="#b03a10" />
            <g className="gh3-la" style={{ transformOrigin: "17px 22px" }}>
              <rect
                x="9"
                y="21"
                width="9"
                height="18"
                rx="4.5"
                fill="#FF7A3D"
              />
              <ellipse cx="13.5" cy="40" rx="5" ry="5" fill="#ffb38a" />
            </g>
            <g className="gh3-ra" style={{ transformOrigin: "35px 22px" }}>
              <rect
                x="34"
                y="21"
                width="9"
                height="18"
                rx="4.5"
                fill="#FF7A3D"
              />
              <ellipse cx="38.5" cy="40" rx="5" ry="5" fill="#ffb38a" />
            </g>
            <rect x="22" y="14" width="8" height="8" rx="4" fill="#ffb38a" />
            <ellipse cx="26" cy="11" rx="12" ry="13" fill="#ffb38a" />
            <ellipse cx="14.5" cy="11" rx="3" ry="4" fill="#ffb38a" />
            <ellipse cx="37.5" cy="11" rx="3" ry="4" fill="#ffb38a" />
            <path
              d="M14 6 Q26 -2 38 6"
              stroke="#1a0e04"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M14 6 Q13 10 14 14"
              stroke="#1a0e04"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="21" cy="11.5" rx="2.5" ry="3" fill="white" />
            <circle cx="21.4" cy="12" r="1.8" fill="#1a0e04" />
            <circle cx="21.9" cy="11.2" r=".6" fill="white" />
            <ellipse cx="31" cy="11.5" rx="2.5" ry="3" fill="white" />
            <circle cx="31.4" cy="12" r="1.8" fill="#1a0e04" />
            <circle cx="31.9" cy="11.2" r=".6" fill="white" />
            <path
              d="M18.5 8 Q21 6.5 23.5 8"
              stroke="#1a0e04"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M28.5 8 Q31 6.5 33.5 8"
              stroke="#1a0e04"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M21 16.5 Q26 20 31 16.5"
              stroke="#d08050"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M24 14 Q26 16 28 14"
              stroke="#d08050"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom UI */}
      <div
        className="gh3-ui"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "#FF7A3D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 28px rgba(255,122,61,.5)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
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
              fontFamily: "'DM Sans',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "-.03em",
              color: "white",
            }}
          >
            Gharam
          </span>
        </div>
        <div
          style={{
            width: 180,
            height: 3,
            background: "rgba(255,255,255,.1)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div className="gh3-bar" />
        </div>
        <span
          style={{
            fontFamily: "'DM Sans',system-ui,sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.35)",
          }}
        >
          Stay where it feels right
        </span>
      </div>
    </div>
  );
}
