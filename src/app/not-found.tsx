import Link from "next/link"

export const metadata = { title: "Page not found — Gharam" }

export default function NotFound() {
  return (
    <main className="gh-page gh-404-bg">
      <style>{`
        .gh-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;position:relative;overflow:hidden;font-family:'DM Sans',system-ui,sans-serif}
        .gh-404-bg{background:#F8F5F2}
        .gh-scene{position:relative;width:280px;height:200px;margin-bottom:1.5rem}
        .gh-star{position:absolute;border-radius:50%;background:#FFD580;animation:gh-twinkle 2.5s ease-in-out infinite}
        @keyframes gh-twinkle{0%,100%{opacity:.2}50%{opacity:1}}
        .gh-num-bg{font-size:100px;font-weight:700;letter-spacing:-.05em;color:#0F172A;opacity:.05;position:absolute;top:-20px;left:50%;transform:translateX(-50%);white-space:nowrap;user-select:none;pointer-events:none;font-family:'DM Sans',system-ui,sans-serif}
        .gh-badge{display:inline-flex;align-items:center;gap:6px;background:#FFF0E8;color:#C4690E;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(255,122,61,.25);margin-bottom:1rem}
        .gh-h1{font-size:clamp(1.5rem,4vw,2.1rem);font-weight:700;color:#0F172A;letter-spacing:-.025em;margin-bottom:.75rem;line-height:1.2;text-align:center}
        .gh-p{font-size:15px;color:#6B7280;max-width:310px;line-height:1.7;text-align:center;margin:0 auto 1.5rem}
        .gh-btn-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .gh-btn-o{background:#FF7A3D;color:#fff;font-weight:600;font-size:14px;padding:11px 24px;border-radius:10px;text-decoration:none;transition:opacity .15s}
        .gh-btn-o:hover{opacity:.9}
        .gh-btn-n{background:transparent;color:#0F172A;font-weight:600;font-size:14px;padding:10px 22px;border-radius:10px;border:1.5px solid #0F172A;text-decoration:none;transition:background .15s}
        .gh-btn-n:hover{background:#EDE8E2}
        .gh-moon{position:absolute;top:14px;right:20px;animation:gh-float 4s ease-in-out infinite}
        @keyframes gh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .gh-cloud{position:absolute;animation:gh-drift 6s ease-in-out infinite}
        @keyframes gh-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
        .gh-smoke-puff{border-radius:50%;background:#D3CFC9;position:absolute;animation:gh-puff 2.5s ease-in-out infinite}
        @keyframes gh-puff{0%{transform:translateY(0) scale(1);opacity:.7}100%{transform:translateY(-22px) scale(1.4);opacity:0}}
        .gh-win{animation:gh-blink 3.5s ease-in-out infinite}
        @keyframes gh-blink{0%,80%,100%{opacity:1}82%,97%{opacity:.1}}
        .gh-content{text-align:center;animation:gh-up .6s ease .2s both}
        @keyframes gh-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="gh-num-bg">404</div>

      <div className="gh-scene">
        {[{t:10,l:30,d:0},{t:25,l:180,d:.4,s:3},{t:8,l:240,d:.8},{t:40,l:100,d:.2,s:3},{t:18,l:60,d:1.2,s:2}].map((s,i)=>(
          <div key={i} className="gh-star" style={{top:s.t,left:s.l,width:s.s??4,height:s.s??4,animationDelay:`${s.d}s`}}/>
        ))}
        <svg className="gh-moon" width="40" height="40" viewBox="0 0 40 40" style={{position:"absolute",top:14,right:20}}>
          <circle cx="20" cy="20" r="16" fill="#FFD580"/>
          <circle cx="26" cy="14" r="11" fill="#F8F5F2"/>
        </svg>
        <svg className="gh-cloud" width="70" height="28" viewBox="0 0 70 28" style={{position:"absolute",top:50,left:-10,animationDelay:"0s"}}>
          <ellipse cx="35" cy="20" rx="32" ry="10" fill="#E8E2DB"/>
          <ellipse cx="22" cy="16" rx="14" ry="12" fill="#E8E2DB"/>
          <ellipse cx="48" cy="18" rx="12" ry="10" fill="#E8E2DB"/>
        </svg>
        <div style={{position:"absolute",bottom:142,left:"calc(50% + 28px)"}}>
          {[{s:10,d:0},{s:14,d:.3,o:.7},{s:16,d:.6,o:.4}].map((p,i)=>(
            <div key={i} className="gh-smoke-puff" style={{width:p.s,height:p.s,bottom:i*10,left:-3,animationDelay:`${p.d}s`,opacity:p.o??1}}/>
          ))}
        </div>
        <svg style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)"}} width="180" height="160" viewBox="0 0 180 160">
          <rect x="20" y="80" width="140" height="80" rx="4" fill="#0F172A"/>
          <polygon points="90,20 8,82 172,82" fill="#FF7A3D"/>
          <polygon points="90,30 16,82 164,82" fill="#E8692A"/>
          <rect x="120" y="30" width="18" height="28" rx="3" fill="#0F172A"/>
          <rect x="32" y="100" width="32" height="28" rx="3" fill="#FFD580" className="gh-win"/>
          <rect x="80" y="100" width="32" height="28" rx="3" fill="#FFD580" className="gh-win" style={{animationDelay:"1.5s"}}/>
          <line x1="48" y1="100" x2="48" y2="128" stroke="#0F172A" strokeWidth="2"/>
          <line x1="32" y1="114" x2="64" y2="114" stroke="#0F172A" strokeWidth="2"/>
          <line x1="96" y1="100" x2="96" y2="128" stroke="#0F172A" strokeWidth="2"/>
          <line x1="80" y1="114" x2="112" y2="114" stroke="#0F172A" strokeWidth="2"/>
          <rect x="128" y="110" width="26" height="50" rx="13" fill="#1E2D4A"/>
          <circle cx="136" cy="137" r="3" fill="#FF7A3D"/>
          <rect x="0" y="158" width="180" height="4" rx="2" fill="#EDE8E2"/>
        </svg>
      </div>

      <div className="gh-content">
        <div className="gh-badge">404 — Lost</div>
        <h1 className="gh-h1">This room moved out</h1>
        <p className="gh-p">Looks like this page packed its bags and left. Let&apos;s get you back to finding a place that truly feels right.</p>
        <div className="gh-btn-row">
          <Link href="/" className="gh-btn-o">Back to home</Link>
          <Link href="/properties/bangalore" className="gh-btn-n">Browse PGs</Link>
        </div>
      </div>
    </main>
  )
}
