"use client"
import { useEffect, useState } from "react"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2500)
    const t2 = setTimeout(() => setVisible(false), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`page-loader ${leaving ? "page-loader-out" : ""}`} aria-hidden="true">
      <style>{`
        @keyframes gh2-walk    {0%{transform:translateX(-10px)}100%{transform:translateX(98px)}}
        @keyframes gh2-bob     {0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}
        @keyframes gh2-ll      {0%,100%{transform:rotate(-32deg)}50%{transform:rotate(32deg)}}
        @keyframes gh2-rl      {0%,100%{transform:rotate(32deg)}50%{transform:rotate(-32deg)}}
        @keyframes gh2-la      {0%,100%{transform:rotate(26deg)}50%{transform:rotate(-26deg)}}
        @keyframes gh2-ra      {0%,100%{transform:rotate(-26deg)}50%{transform:rotate(26deg)}}
        @keyframes gh2-door    {0%,68%{transform:perspective(80px) rotateY(0deg)}100%{transform:perspective(80px) rotateY(-75deg)}}
        @keyframes gh2-enter   {0%,72%{opacity:1;transform:translateX(98px) scale(1)}100%{opacity:0;transform:translateX(116px) scale(0.45)}}
        @keyframes gh2-winglow {0%,74%{opacity:0}90%,100%{opacity:1}}
        @keyframes gh2-smoke   {0%{transform:translateY(0) scale(1);opacity:.6}100%{transform:translateY(-18px) scale(1.6);opacity:0}}
        @keyframes gh2-bar     {0%{width:0}55%{width:62%}100%{width:100%}}
        @keyframes gh2-fadeup  {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gh2-shadow  {0%,100%{transform:scaleX(1);opacity:.18}50%{transform:scaleX(.7);opacity:.1}}
        @keyframes gh2-lantern {0%,100%{opacity:.8}50%{opacity:1}}
        .gh2-pw  {animation:gh2-walk 2.2s cubic-bezier(.42,0,.58,1) forwards,gh2-bob .42s ease-in-out infinite}
        .gh2-pf  {animation:gh2-enter .55s ease forwards;animation-delay:1.9s;animation-fill-mode:both}
        .gh2-ll  {transform-origin:50% 2%;animation:gh2-ll .42s ease-in-out infinite}
        .gh2-rl  {transform-origin:50% 2%;animation:gh2-rl .42s ease-in-out infinite}
        .gh2-la  {transform-origin:50% 5%;animation:gh2-la .42s ease-in-out infinite}
        .gh2-ra  {transform-origin:50% 5%;animation:gh2-ra .42s ease-in-out infinite}
        .gh2-door{transform-origin:left center;animation:gh2-door .6s cubic-bezier(.4,0,.2,1) forwards;animation-delay:1.82s}
        .gh2-wg  {opacity:0;animation:gh2-winglow .45s ease forwards;animation-delay:2.08s}
        .gh2-s1  {animation:gh2-smoke 2.2s ease-in-out 0s infinite}
        .gh2-s2  {animation:gh2-smoke 2.2s ease-in-out .55s infinite}
        .gh2-s3  {animation:gh2-smoke 2.2s ease-in-out 1.1s infinite}
        .gh2-bar {height:100%;background:linear-gradient(90deg,#FF7A3D,#FF9A5C);border-radius:99px;animation:gh2-bar 2.4s cubic-bezier(.16,1,.3,1) forwards}
        .gh2-sh  {animation:gh2-shadow .42s ease-in-out infinite}
        .gh2-ln  {animation:gh2-lantern 1.8s ease-in-out infinite}
        .gh2-lbl {animation:gh2-fadeup .4s ease .1s both}
      `}</style>

      <div className="gh2-lbl" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>

        <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1f35"/><stop offset="100%" stopColor="#2d3a5e"/></linearGradient>
            <linearGradient id="g2hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#243354"/><stop offset="100%" stopColor="#1a2744"/></linearGradient>
            <linearGradient id="g2hs" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#141d30"/><stop offset="100%" stopColor="#1a2744"/></linearGradient>
            <linearGradient id="g2rt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff9550"/><stop offset="100%" stopColor="#e05e1a"/></linearGradient>
            <linearGradient id="g2rs" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b8420e"/><stop offset="100%" stopColor="#9a3509"/></linearGradient>
            <linearGradient id="g2wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffe066"/><stop offset="100%" stopColor="#ffb830"/></linearGradient>
            <linearGradient id="g2dg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3d5a8a"/><stop offset="100%" stopColor="#2d4268"/></linearGradient>
            <radialGradient id="g2wr" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffe066" stopOpacity="0.35"/><stop offset="100%" stopColor="#ffe066" stopOpacity="0"/></radialGradient>
            <radialGradient id="g2lg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffcc44" stopOpacity="0.5"/><stop offset="100%" stopColor="#ffcc44" stopOpacity="0"/></radialGradient>
          </defs>

          <rect width="280" height="160" fill="url(#g2sky)"/>
          {[{x:20,y:18,r:1,o:.6},{x:45,y:10,r:.8,o:.5},{x:70,y:22,r:1.2,o:.7},{x:30,y:35,r:.7,o:.4},{x:90,y:8,r:1,o:.6},{x:108,y:14,r:.9,o:.5},{x:240,y:12,r:1,o:.5},{x:258,y:28,r:.7,o:.4},{x:228,y:7,r:.8,o:.6}].map((s,i)=>
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o}/>
          )}
          <circle cx="248" cy="22" r="14" fill="#f5e6a0"/>
          <circle cx="254" cy="16" r="11" fill="#2d3a5e"/>

          <rect x="0" y="130" width="280" height="30" fill="#1e1a14"/>
          <rect x="0" y="128" width="280" height="6" fill="#2a2218"/>
          <path d="M0 138 Q60 132 148 135" stroke="#3a3228" strokeWidth="10" strokeLinecap="round" fill="none"/>
          <path d="M20 136 L40 135.5" stroke="#5a5040" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" fill="none"/>
          <path d="M55 135 L80 134.5" stroke="#5a5040" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" fill="none"/>

          <rect x="5" y="100" width="6" height="30" fill="#1a2a14"/>
          <ellipse cx="8" cy="95" rx="12" ry="14" fill="#1e3a18"/>
          <ellipse cx="8" cy="88" rx="9" ry="11" fill="#254d1e"/>
          <rect x="22" y="108" width="5" height="22" fill="#1a2a14"/>
          <ellipse cx="24.5" cy="103" rx="9" ry="11" fill="#1e3a18"/>
          <ellipse cx="24.5" cy="97" rx="7" ry="9" fill="#254d1e"/>

          <polygon points="218,132 240,120 240,62 218,74" fill="url(#g2hs)"/>
          <rect x="148" y="74" width="70" height="58" fill="url(#g2hf)"/>
          {[86,98,110,122].map(y=><line key={y} x1="148" y1={y} x2="218" y2={y} stroke="rgba(255,255,255,.04)" strokeWidth="1"/>)}
          <polygon points="144,76 183,48 222,76" fill="url(#g2rt)"/>
          <polygon points="222,76 240,64 240,62 221,50 183,48" fill="url(#g2rs)"/>
          <line x1="183" y1="48" x2="221" y2="50" stroke="#ff7a3d" strokeWidth="1.5" opacity=".6"/>

          <rect x="200" y="34" width="14" height="22" fill="#0f172a"/>
          <rect x="200" y="34" width="14" height="4" rx="1" fill="#1e2d4a"/>
          <polygon points="214,34 218,30 218,52 214,56" fill="#0a1020"/>
          <circle cx="207" cy="32" r="4" fill="#8a9ab0" opacity=".5" className="gh2-s1"/>
          <circle cx="208" cy="24" r="5.5" fill="#7a8a9e" opacity=".4" className="gh2-s2"/>
          <circle cx="206" cy="16" r="7" fill="#6a7a8e" opacity=".25" className="gh2-s3"/>

          <rect x="156" y="84" width="24" height="20" rx="2" fill="#2d4a7a" opacity=".4"/>
          <rect x="155" y="83" width="26" height="22" rx="2" fill="none" stroke="#4a6a9a" strokeWidth="1.5"/>
          <line x1="168" y1="83" x2="168" y2="105" stroke="#4a6a9a" strokeWidth="1"/>
          <line x1="155" y1="94" x2="181" y2="94" stroke="#4a6a9a" strokeWidth="1"/>
          <rect className="gh2-wg" x="155" y="83" width="26" height="22" rx="2" fill="url(#g2wl)" opacity=".85"/>
          <ellipse className="gh2-wg" cx="168" cy="94" rx="22" ry="18" fill="url(#g2wr)"/>

          <polygon points="224,88 236,82 236,96 224,102" fill="#2d4a7a" opacity=".5"/>
          <polygon points="223,87 237,81 237,97 223,103" fill="none" stroke="#4a6a9a" strokeWidth="1"/>

          <rect x="178" y="100" width="24" height="32" rx="10" fill="none" stroke="#4a6a9a" strokeWidth="1.5"/>
          <rect x="179" y="101" width="22" height="31" rx="9" fill="#141e30"/>
          <g className="gh2-door">
            <rect x="179" y="101" width="22" height="31" rx="9" fill="url(#g2dg)"/>
            <rect x="181" y="103" width="8" height="13" rx="1.5" fill="rgba(255,255,255,.08)"/>
            <rect x="192" y="103" width="8" height="13" rx="1.5" fill="rgba(255,255,255,.08)"/>
            <rect x="181" y="118" width="19" height="12" rx="1.5" fill="rgba(255,255,255,.06)"/>
            <circle cx="196" cy="118" r="2.5" fill="#FF7A3D"/>
          </g>
          <rect x="176" y="130" width="28" height="4" rx="1" fill="#2d4268"/>
          <polygon points="176,130 170,132 204,132 202,130" fill="#243354"/>

          <rect x="218" y="88" width="3" height="10" fill="#2d4268"/>
          <rect x="215" y="98" width="9" height="11" rx="2" fill="#4a6a9a" className="gh2-ln"/>
          <ellipse cx="219.5" cy="97" rx="7" ry="4" fill="url(#g2lg)" className="gh2-ln"/>
          <ellipse cx="185" cy="133" rx="38" ry="4" fill="black" opacity=".2"/>

          {/* Person */}
          <g className="gh2-pw gh2-pf" style={{ transformOrigin:"20px 120px" }}>
            <ellipse cx="20" cy="133" rx="9" ry="2.5" fill="black" opacity=".18" className="gh2-sh"/>
            <g transform="translate(6,88)">
              <g className="gh2-ll" style={{ transformOrigin:"11px 28px" }}>
                <rect x="8" y="28" width="7" height="13" rx="3.5" fill="#0f172a"/>
                <rect x="8.5" y="38" width="6" height="11" rx="3" fill="#1a2744"/>
                <rect x="4" y="47" width="14" height="4" rx="2" fill="#0f172a"/>
              </g>
              <g className="gh2-rl" style={{ transformOrigin:"17px 28px" }}>
                <rect x="14" y="28" width="7" height="13" rx="3.5" fill="#0f172a"/>
                <rect x="14.5" y="38" width="6" height="11" rx="3" fill="#1a2744"/>
                <rect x="10" y="47" width="14" height="4" rx="2" fill="#0f172a"/>
              </g>
              <rect x="9" y="14" width="14" height="15" rx="4" fill="#FF7A3D"/>
              <polygon points="14,14 18,14 16,18" fill="#e05e1a"/>
              <polygon points="9,14 14,14 13,20" fill="#e05e1a" opacity=".6"/>
              <polygon points="23,14 18,14 19,20" fill="#e05e1a" opacity=".6"/>
              <circle cx="16" cy="22" r="1.5" fill="#c94b1a"/>
              <rect x="21" y="14" width="7" height="12" rx="2.5" fill="#c94b1a"/>
              <rect x="21.5" y="15" width="6" height="10" rx="2" fill="#b83d10"/>
              <g className="gh2-la" style={{ transformOrigin:"10px 15px" }}>
                <rect x="5" y="14" width="6" height="13" rx="3" fill="#FF7A3D"/>
                <circle cx="8" cy="28" r="3.5" fill="#ffb38a"/>
              </g>
              <g className="gh2-ra" style={{ transformOrigin:"22px 15px" }}>
                <rect x="21" y="14" width="6" height="13" rx="3" fill="#FF7A3D"/>
                <circle cx="24" cy="28" r="3.5" fill="#ffb38a"/>
              </g>
              <rect x="13.5" y="10" width="5" height="6" rx="2" fill="#ffb38a"/>
              <ellipse cx="16" cy="8" rx="8.5" ry="9" fill="#ffb38a"/>
              <ellipse cx="7.5" cy="8" rx="2" ry="2.8" fill="#ffb38a"/>
              <ellipse cx="24.5" cy="8" rx="2" ry="2.8" fill="#ffb38a"/>
              <path d="M7.5 4 Q16 -2.5 24.5 4" stroke="#2d1a08" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <path d="M7.5 4 Q7 7 7.5 10" stroke="#2d1a08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <ellipse cx="12.5" cy="8.5" rx="1.8" ry="2" fill="white"/>
              <circle cx="12.8" cy="9" r="1.2" fill="#2d1a08"/>
              <circle cx="13.2" cy="8.5" r=".4" fill="white"/>
              <ellipse cx="19.5" cy="8.5" rx="1.8" ry="2" fill="white"/>
              <circle cx="19.8" cy="9" r="1.2" fill="#2d1a08"/>
              <circle cx="20.2" cy="8.5" r=".4" fill="white"/>
              <path d="M11 6 Q12.5 5 14 6" stroke="#2d1a08" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <path d="M18 6 Q19.5 5 21 6" stroke="#2d1a08" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <path d="M13 12 Q16 14.5 19 12" stroke="#d4855a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <path d="M15 10 Q16 11.5 17 10" stroke="#d4855a" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </g>
          </g>
        </svg>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"#FF7A3D", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(255,122,61,.35)" }}>
              <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
                <path d="M13 2L22 8V22H16V15H13V22H4V8L13 2Z" fill="white" opacity=".95"/>
                <rect x="13" y="15" width="4" height="7" rx="1.5" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontWeight:700, fontSize:22, letterSpacing:"-.025em", color:"#0F172A" }}>Gharam</span>
          </div>
          <div style={{ width:150, height:3, background:"#EDE8E2", borderRadius:99, overflow:"hidden" }}>
            <div className="gh2-bar"/>
          </div>
          <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#9CA3AF" }}>
            Stay where it feels right
          </p>
        </div>
      </div>
    </div>
  )
}
