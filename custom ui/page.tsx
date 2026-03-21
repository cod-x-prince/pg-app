"use client"
import { useState } from "react"

export default function ComingSoon() {
  const [email, setEmail] = useState("")
  const [done, setDone]   = useState(false)
  const [busy, setBusy]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    await new Promise(r => setTimeout(r, 700))
    setDone(true)
    setBusy(false)
  }

  return (
    <main style={{minHeight:"100vh",background:"#0F172A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2.5rem 1.5rem",fontFamily:"'DM Sans',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes gh-win-blink{0%,85%,100%{opacity:.9}87%,98%{opacity:.2}}
        @keyframes gh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes gh-twinkle{0%,100%{opacity:.15}50%{opacity:1}}
        @keyframes gh-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gh-ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:.5}}
        .gh-win-blink{animation:gh-win-blink 4s ease-in-out infinite}
        .gh-cs-logo{display:flex;align-items:center;gap:10px;margin-bottom:2rem;text-decoration:none;animation:gh-up .4s ease both}
        .gh-cs-brand{font-size:20px;font-weight:700;color:white;letter-spacing:-.02em}
        .gh-cs-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,122,61,.15);color:#FFB38A;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(255,122,61,.3);margin-bottom:1.25rem;animation:gh-up .4s ease .1s both}
        .gh-cs-h1{font-size:clamp(1.6rem,5vw,2.25rem);font-weight:700;color:white;letter-spacing:-.03em;line-height:1.15;text-align:center;margin-bottom:.875rem;animation:gh-up .4s ease .2s both;max-width:360px}
        .gh-cs-orange{color:#FF7A3D}
        .gh-cs-sub{font-size:14px;color:rgba(255,255,255,.5);max-width:300px;line-height:1.7;text-align:center;margin-bottom:1.75rem;animation:gh-up .4s ease .3s both}
        .gh-cs-form{display:flex;gap:8px;width:100%;max-width:340px;flex-wrap:wrap;justify-content:center;animation:gh-up .4s ease .4s both}
        .gh-cs-inp{flex:1;min-width:160px;padding:11px 16px;border-radius:10px;border:1.5px solid rgba(255,255,255,.15);font-family:inherit;font-size:14px;background:rgba(255,255,255,.08);color:white;outline:none;transition:border-color .15s}
        .gh-cs-inp::placeholder{color:rgba(255,255,255,.3)}
        .gh-cs-inp:focus{border-color:#FF7A3D}
        .gh-cs-btn{background:#FF7A3D;color:#fff;font-family:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:none;cursor:pointer;white-space:nowrap;transition:opacity .15s}
        .gh-cs-btn:hover{opacity:.9}
        .gh-cs-btn:disabled{opacity:.6}
        .gh-cs-done{background:rgba(74,175,80,.15);color:#81C784;font-size:13px;font-weight:500;padding:10px 20px;border-radius:10px;border:1px solid rgba(74,175,80,.3);animation:gh-up .3s ease both}
        .gh-cs-cities{display:flex;gap:16px;align-items:center;margin-top:1.5rem;flex-wrap:wrap;justify-content:center;animation:gh-up .4s ease .5s both}
        .gh-city-dot{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,.4)}
        .gh-city-dot.active{color:rgba(255,255,255,.7)}
        .gh-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2)}
        .gh-dot.active{background:#FF7A3D;animation:gh-ping 1.5s ease-in-out infinite}
        .gh-dot.live{background:#4CAF50;animation:gh-ping 1.5s ease-in-out infinite}
        .gh-moon{animation:gh-float 5s ease-in-out infinite}
      `}</style>

      <div id="gh-stars" style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        {Array.from({length:50}).map((_,i)=>{
          const size = Math.random()*2.5+1
          return <div key={i} style={{position:"absolute",width:size,height:size,borderRadius:"50%",background:"white",top:`${Math.random()*75}%`,left:`${Math.random()*100}%`,animation:`gh-twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite`}}/>
        })}
      </div>

      <svg className="gh-moon" width="60" height="60" viewBox="0 0 60 60" style={{position:"absolute",top:28,right:60}}>
        <circle cx="30" cy="30" r="24" fill="#FFD580"/>
        <circle cx="40" cy="20" r="16" fill="#0F172A"/>
      </svg>

      <svg width="680" height="130" viewBox="0 0 680 130" preserveAspectRatio="xMidYMax meet" style={{position:"absolute",bottom:0,left:0,right:0,width:"100%"}}>
        <rect x="0" y="70" width="680" height="60" fill="#1a2744"/>
        <rect x="20" y="30" width="50" height="70" rx="2" fill="#1a2744"/>
        <rect x="80" y="10" width="80" height="90" rx="3" fill="#243454"/>
        <rect x="170" y="40" width="60" height="60" rx="2" fill="#1a2744"/>
        <rect x="240" y="20" width="44" height="80" rx="2" fill="#1e3358"/>
        <rect x="295" y="30" width="70" height="70" rx="3" fill="#243454"/>
        <rect x="375" y="15" width="55" height="85" rx="2" fill="#1a2744"/>
        <rect x="440" y="35" width="70" height="65" rx="3" fill="#1e3358"/>
        <rect x="520" y="25" width="40" height="75" rx="2" fill="#243454"/>
        <rect x="570" y="45" width="110" height="55" fill="#1a2744"/>
        {[90,110,132,158,185,210,248,270,300,322,348,386,408,450,472,528,578,600].map((x,i)=>(
          <rect key={i} x={x} y={i%2===0?50:65} width={10} height={i%2===0?12:10} rx="1" fill="#FFD580" className="gh-win-blink" style={{animationDelay:`${(i*0.3)%2}s`}}/>
        ))}
        <rect x="0" y="126" width="680" height="4" rx="2" fill="#243454"/>
      </svg>

      <a href="/" className="gh-cs-logo">
        <div style={{width:36,height:36,borderRadius:10,background:"#FF7A3D",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 26 26" fill="none"><path d="M13 2L22 8V22H16V15H13V22H4V8L13 2Z" fill="white" opacity=".95"/><rect x="13" y="15" width="4" height="7" rx="1.5" fill="white"/></svg>
        </div>
        <span className="gh-cs-brand">Gharam</span>
      </a>

      <div className="gh-cs-pill">Coming Soon</div>
      <h1 className="gh-cs-h1">The best PG experience<br />is <span className="gh-cs-orange">on its way.</span></h1>
      <p className="gh-cs-sub">We&apos;re building something that makes finding a home in a new city feel easy, safe, and honest. Be the first to know.</p>

      {!done ? (
        <form onSubmit={submit} className="gh-cs-form">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" autoComplete="email" className="gh-cs-inp" />
          <button type="submit" className="gh-cs-btn" disabled={busy}>{busy ? "Saving..." : "Notify me"}</button>
        </form>
      ) : (
        <div className="gh-cs-done">You&apos;re on the list — we&apos;ll reach out when we launch!</div>
      )}

      <div className="gh-cs-cities">
        {[{city:"Bangalore",active:true,live:false},{city:"Mumbai",active:false,live:false},{city:"Pune",active:false,live:false},{city:"Hyderabad",active:false,live:false}].map(c=>(
          <div key={c.city} className={`gh-city-dot${c.active?" active":""}`}>
            <div className={`gh-dot${c.active?" active":c.live?" live":""}`}/>
            <span>{c.city}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
