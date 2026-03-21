"use client"
import { useState, useEffect } from "react"

export default function Maintenance() {
  const [secs, setSecs] = useState(14 * 60 + 38)
  const [pct] = useState(65)

  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  const m = Math.floor(secs / 60)
  const s = String(secs % 60).padStart(2, "0")

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(160deg,#F0FDF4 0%,#EAF7EA 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1.5rem",fontFamily:"'DM Sans',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes gh-gear-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gh-gear-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes gh-worker{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes gh-hammer{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(20deg)}}
        @keyframes gh-spark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.2)}}
        @keyframes gh-prog{from{width:60%}to{width:72%}}
        @keyframes gh-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gh-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
        .gh-gear-big{animation:gh-gear-cw 5s linear infinite;transform-origin:45px 47px}
        .gh-gear-sm{animation:gh-gear-ccw 2.5s linear infinite;transform-origin:27px 29px}
        .gh-worker-l{animation:gh-worker 1.2s ease-in-out infinite}
        .gh-worker-r{animation:gh-worker 1.2s ease-in-out .6s infinite}
        .gh-hammer-l{transform-origin:bottom center;animation:gh-hammer 1.2s ease-in-out infinite}
        .gh-hammer-r{transform-origin:bottom center;animation:gh-hammer 1.2s ease-in-out .6s infinite}
        .gh-spark{position:absolute;border-radius:50%;animation:gh-spark 1.2s ease-out infinite}
        .gh-prog-fill{height:100%;border-radius:6px;background:#4CAF50;animation:gh-prog 3s ease-in-out infinite alternate}
        .gh-badge-maint{display:inline-flex;align-items:center;gap:8px;background:#EAF7EA;color:#166534;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid #C3E6C3;margin-bottom:1rem}
        .gh-dot-live{width:7px;height:7px;border-radius:50%;background:#4CAF50;animation:gh-pulse 1.5s ease-in-out infinite}
        .gh-content{text-align:center;display:flex;flex-direction:column;align-items:center;animation:gh-up .6s ease .2s both}
        .gh-status-list{display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px}
        .gh-status-item{display:flex;align-items:center;justify-content:space-between;background:white;border-radius:10px;padding:10px 14px;border:.5px solid #E8E2DB}
        .gh-sname{font-size:13px;font-weight:500;color:#0F172A}
        .gh-sb{font-size:11px;font-weight:600;padding:3px 8px;border-radius:5px}
        .gh-sb-ok{background:#EAF7EA;color:#166534}
        .gh-sb-prog{background:#FFF0E8;color:#C4690E}
        .gh-meta-row{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-bottom:1rem}
        .gh-meta-val{font-size:24px;font-weight:700;color:#0F172A;letter-spacing:-.02em;text-align:center}
        .gh-meta-label{font-size:11px;color:#6B7280;margin-top:2px;text-align:center}
      `}</style>

      <div style={{position:"relative",width:280,height:200,marginBottom:"1.5rem"}}>
        {[{bg:"#FF7A3D",t:80,l:88,d:"0s","--tx":"-15px","--ty":"-22px"},{bg:"#FFD580",t:72,l:112,d:".3s","--tx":"14px","--ty":"-28px",s:4},{bg:"#FF7A3D",t:88,l:66,d:".6s","--tx":"-12px","--ty":"-18px",s:5}].map((sp,i)=>(
          <div key={i} className="gh-spark" style={{background:sp.bg,top:sp.t,left:sp.l,animationDelay:sp.d,width:sp.s??6,height:sp.s??6,"--tx":sp["--tx"],"--ty":sp["--ty"]} as React.CSSProperties}/>
        ))}

        <svg className="gh-gear-big" width="90" height="90" viewBox="0 0 90 94" style={{position:"absolute",top:10,left:"50%",marginLeft:-45}}>
          <path d="M45 10L50 20 60 15 60 25 70 22 67 32 78 33 72 41 80 47 72 53 78 61 67 62 70 72 60 69 60 79 50 74 45 84 40 74 30 79 30 69 20 72 23 62 12 61 18 53 10 47 18 41 12 33 23 32 20 22 30 25 30 15 40 20Z" fill="#E8E2DB" stroke="#D0C8BE" strokeWidth="1"/>
          <circle cx="45" cy="47" r="16" fill="#F8F5F2" stroke="#D0C8BE" strokeWidth="1.5"/>
          <circle cx="45" cy="47" r="8" fill="#0F172A"/>
        </svg>

        <svg width="54" height="54" viewBox="0 0 54 58" style={{position:"absolute",top:42,right:22}}>
          <g className="gh-gear-sm">
            <path d="M27 6L30 12 36 9 36 15 42 13 40 19 47 20 43 25 48 29 43 33 47 38 40 39 42 45 36 43 36 49 30 46 27 52 24 46 18 49 18 43 12 45 14 39 7 38 11 33 6 29 11 25 7 20 14 19 12 13 18 15 18 9 24 12Z" fill="#E8E2DB" stroke="#D0C8BE" strokeWidth="1"/>
            <circle cx="27" cy="29" r="9" fill="#F8F5F2" stroke="#D0C8BE" strokeWidth="1"/>
            <circle cx="27" cy="29" r="4" fill="#FF7A3D"/>
          </g>
        </svg>

        <svg className="gh-worker-l" width="36" height="70" viewBox="0 0 36 70" style={{position:"absolute",bottom:40,left:22}}>
          <g className="gh-hammer-l" style={{transformOrigin:"10px 42px"}}>
            <rect x="6" y="30" width="10" height="14" rx="3" fill="#0F172A"/>
            <rect x="9" y="44" width="4" height="10" rx="2" fill="#6B4226"/>
          </g>
          <circle cx="18" cy="14" r="10" fill="#FFD580"/>
          <rect x="10" y="22" width="16" height="24" rx="4" fill="#FF7A3D"/>
          <rect x="6" y="24" width="8" height="18" rx="4" fill="#FFB38A"/>
          <rect x="22" y="24" width="8" height="18" rx="4" fill="#FFB38A"/>
          <rect x="12" y="44" width="6" height="16" rx="3" fill="#0F172A"/>
          <rect x="20" y="44" width="6" height="16" rx="3" fill="#0F172A"/>
        </svg>

        <svg className="gh-worker-r" width="36" height="70" viewBox="0 0 36 70" style={{position:"absolute",bottom:40,right:22}}>
          <g className="gh-hammer-r" style={{transformOrigin:"26px 42px"}}>
            <rect x="20" y="30" width="10" height="14" rx="3" fill="#0F172A"/>
            <rect x="23" y="44" width="4" height="10" rx="2" fill="#6B4226"/>
          </g>
          <circle cx="18" cy="14" r="10" fill="#FFB38A"/>
          <rect x="10" y="22" width="16" height="24" rx="4" fill="#0F172A"/>
          <rect x="6" y="24" width="8" height="18" rx="4" fill="#D4A574"/>
          <rect x="22" y="24" width="8" height="18" rx="4" fill="#D4A574"/>
          <rect x="12" y="44" width="6" height="16" rx="3" fill="#1E2D4A"/>
          <rect x="20" y="44" width="6" height="16" rx="3" fill="#1E2D4A"/>
        </svg>

        <svg width="280" height="50" viewBox="0 0 280 50" style={{position:"absolute",bottom:0,left:0}}>
          <rect x="0" y="24" width="280" height="26" rx="4" fill="#EDE8E2"/>
          <rect x="0" y="46" width="280" height="4" rx="2" fill="#D0C8BE"/>
        </svg>
      </div>

      <div className="gh-content">
        <div className="gh-badge-maint"><div className="gh-dot-live"/>Scheduled maintenance</div>
        <h1 style={{fontSize:"clamp(1.5rem,4vw,2.1rem)",fontWeight:700,color:"#0F172A",letterSpacing:"-.025em",marginBottom:".75rem",lineHeight:1.2}}>We&apos;ll be right back</h1>
        <p style={{fontSize:15,color:"#6B7280",maxWidth:310,lineHeight:1.7,textAlign:"center",margin:"0 auto 1.25rem"}}>Our team is upgrading Gharam to make it faster and more reliable. Everything will be better when we return.</p>

        <div className="gh-meta-row">
          <div><div className="gh-meta-val">{m}:{s}</div><div className="gh-meta-label">Estimated time</div></div>
          <div><div className="gh-meta-val">{pct}%</div><div className="gh-meta-label">Complete</div></div>
        </div>

        <div style={{width:260,background:"rgba(0,0,0,.08)",borderRadius:6,height:8,overflow:"hidden",marginBottom:".875rem"}}>
          <div className="gh-prog-fill"/>
        </div>

        <div className="gh-status-list">
          {[{name:"Database",ok:true},{name:"Search engine",ok:false},{name:"Payments",ok:true},{name:"Image delivery",ok:true}].map(item=>(
            <div key={item.name} className="gh-status-item">
              <span className="gh-sname">{item.name}</span>
              <span className={`gh-sb ${item.ok?"gh-sb-ok":"gh-sb-prog"}`}>{item.ok?"Online":"Upgrading"}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
