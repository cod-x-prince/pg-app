"use client"
import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(160deg,#FFF8F5 0%,#FFE8DA 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1.5rem",fontFamily:"'DM Sans',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes gh-bolt{0%,100%{opacity:.3;transform:scale(.9)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes gh-spark{0%{opacity:1;transform:translate(0,0)}100%{opacity:0}}
        @keyframes gh-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .gh-e-content{animation:gh-up .6s ease .2s both;text-align:center;display:flex;flex-direction:column;align-items:center}
        .gh-spark{position:absolute;border-radius:50%;animation:gh-spark 1.2s ease-out infinite}
        .gh-bolt{animation:gh-bolt 1.8s ease-in-out infinite}
        .gh-badge-err{display:inline-flex;align-items:center;gap:6px;background:#FDECEA;color:#9B2C2C;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(196,54,42,.2);marginBottom:"1rem"}
        .gh-e-btn-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:1.25rem}
        .gh-e-btn-r{background:transparent;color:#0F172A;font-weight:600;font-size:14px;padding:10px 22px;border-radius:10px;border:1.5px solid #0F172A;cursor:pointer;transition:background .15s}
        .gh-e-btn-r:hover{background:#FFF0E8}
        .gh-e-btn-o{background:#FF7A3D;color:#fff;font-weight:600;font-size:14px;padding:11px 24px;border-radius:10px;border:none;cursor:pointer;text-decoration:none;display:inline-block;transition:opacity .15s}
        .gh-e-btn-o:hover{opacity:.9}
        .gh-chips{display:flex;gap:8px;justify-content:center;margin-top:1rem;flex-wrap:wrap}
        .gh-chip{font-size:11px;font-weight:500;padding:4px 10px;border-radius:6px}
        .gh-chip-ok{background:#EAF7EA;color:#166534}
        .gh-chip-err{background:#FDECEA;color:#9B2C2C}
      `}</style>

      <div style={{position:"absolute",top:20,left:40,animation:"gh-bolt 1.8s ease-in-out infinite"}}>
        <svg width="28" height="36" viewBox="0 0 24 32"><path d="M14 2L4 18h8l-2 12 12-18h-8l2-10z" fill="#FF7A3D"/></svg>
      </div>
      <div style={{position:"absolute",top:30,right:50,animation:"gh-bolt 1.8s ease-in-out .9s infinite"}}>
        <svg width="20" height="26" viewBox="0 0 24 32"><path d="M14 2L4 18h8l-2 12 12-18h-8l2-10z" fill="#FFD580"/></svg>
      </div>
      {[{bg:"#FF7A3D",t:"60px",l:"80px",d:"0s"},{bg:"#FFD580",t:"50px",l:"105px",d:".3s",s:4},{bg:"#FF7A3D",t:"70px",l:"58px",d:".6s",s:5},{bg:"#FFB38A",t:"55px",l:"125px",d:".9s",s:4}].map((s,i)=>(
        <div key={i} className="gh-spark" style={{background:s.bg,top:s.t,left:s.l,animationDelay:s.d,width:s.s??6,height:s.s??6}}/>
      ))}

      <svg width="260" height="160" viewBox="0 0 260 160" style={{marginBottom:"1.5rem"}}>
        <rect x="80" y="60" width="100" height="60" rx="8" fill="#0F172A"/>
        <rect x="88" y="68" width="84" height="44" rx="5" fill="#1E2D4A"/>
        <circle cx="100" cy="82" r="8" fill="#FF7A3D" opacity=".9"/>
        <circle cx="130" cy="82" r="8" fill="#FFD580" opacity=".9"/>
        <circle cx="160" cy="82" r="8" fill="#4CAF50" opacity=".9"/>
        <circle cx="100" cy="100" r="4" fill="#E8E2DB" opacity=".5"/>
        <circle cx="115" cy="100" r="4" fill="#E8E2DB" opacity=".5"/>
        <circle cx="130" cy="100" r="4" fill="#FF7A3D" opacity=".8"/>
        <circle cx="145" cy="100" r="4" fill="#E8E2DB" opacity=".5"/>
        <circle cx="160" cy="100" r="4" fill="#E8E2DB" opacity=".5"/>
        <rect x="110" y="30" width="40" height="32" rx="4" fill="#E05E22"/>
        <text x="130" y="50" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">!</text>
        <polygon points="130,22 118,32 142,32" fill="#E05E22"/>
        <rect x="30" y="90" width="50" height="18" rx="9" fill="#0F172A"/>
        <rect x="180" y="90" width="50" height="18" rx="9" fill="#0F172A"/>
        <rect x="0" y="118" width="260" height="6" rx="3" fill="#EDE8E2"/>
        <text x="130" y="148" textAnchor="middle" fill="#C4362A" fontSize="60" fontWeight="700" opacity=".1" fontFamily="DM Sans,system-ui">500</text>
      </svg>

      <div className="gh-e-content">
        <div className="gh-badge-err" style={{marginBottom:"1rem"}}>500 — Server error</div>
        <h1 style={{fontSize:"clamp(1.5rem,4vw,2.1rem)",fontWeight:700,color:"#0F172A",letterSpacing:"-.025em",marginBottom:".75rem",lineHeight:1.2}}>Something broke on our end</h1>
        <p style={{fontSize:15,color:"#6B7280",maxWidth:310,lineHeight:1.7,margin:"0 auto"}}>Our engineers have been alerted automatically. Your data is completely safe — this usually resolves in a few minutes.</p>
        <div className="gh-e-btn-row">
          <button className="gh-e-btn-r" onClick={reset}>Try again</button>
          <a href="/" className="gh-e-btn-o">Go home</a>
        </div>
        <div className="gh-chips">
          <span className="gh-chip gh-chip-ok">Database — online</span>
          <span className="gh-chip gh-chip-err">App server — error</span>
          <span className="gh-chip gh-chip-ok">Payments — online</span>
        </div>
      </div>
    </main>
  )
}
