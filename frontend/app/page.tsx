"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"

function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transitionDelay = `${delay}ms`
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); obs.unobserve(el) } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return ref
}

const GDrive = () => (
  <svg width="24" height="20" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
)

export default function LandingPage() {
  const r1 = useReveal(0);   const r2 = useReveal(120); const r3 = useReveal(240)
  const r4 = useReveal(0);   const r5 = useReveal(0);   const r6 = useReveal(100)
  const r7 = useReveal(200); const r8 = useReveal(0);   const r9 = useReveal(110)
  const r10 = useReveal(220)

  return (
    <>
      <style>{`
        .in-hidden { opacity:0; transform:translateY(32px); transition:opacity .65s ease, transform .65s ease; }
        .in-hidden.in { opacity:1; transform:translateY(0); }
        @keyframes blob { 0%,100%{transform:translate(-50%,-45%) scale(1) rotate(0deg);} 50%{transform:translate(-50%,-45%) scale(1.07) rotate(4deg);} }
        .blob { animation: blob 6s ease-in-out infinite; }
        @keyframes blob2 { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12);} }
        .blob2 { animation: blob2 7s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        .float { animation: float 4s ease-in-out infinite; }
        .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
        .card-hover:hover { transform:translateY(-5px); box-shadow:0 24px 50px rgba(0,0,0,0.18); }
        .gradient-border { background: linear-gradient(white,white) padding-box, linear-gradient(135deg,#f97060,#f9c84a) border-box; border:2px solid transparent; }
      `}</style>

      <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">

        {/* ─── NAV ─── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/60">
          <div className="flex items-center gap-2">
            <Image src="/icons/aorta-heart.png" alt="Aorta" width={30} height={30} />
            <span className="font-bold text-gray-900 text-lg">Aorta</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="#how" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">How it works</Link>
            <Link href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Features</Link>
            <Link href="/chat" className="bg-[#f97060] hover:bg-[#e8604f] text-white font-semibold px-5 py-2 rounded-full text-sm transition-all shadow-md hover:shadow-lg">
              Try Aorta →
            </Link>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-20 pb-32 overflow-hidden">

          {/* Background blobs */}
          <div className="blob absolute pointer-events-none" style={{
            width:"820px", height:"680px", top:"50%", left:"50%",
            background:"radial-gradient(ellipse at center,#c8413a 0%,#e8706a 22%,#f5a09a 50%,#fbd4d0 70%,transparent 86%)",
            borderRadius:"50%", opacity:0.95
          }}/>
          <div className="blob2 absolute pointer-events-none" style={{
            width:"300px", height:"300px", top:"15%", left:"8%",
            background:"radial-gradient(circle,#f9c84a55 0%,transparent 70%)", borderRadius:"50%"
          }}/>
          <div className="blob2 absolute pointer-events-none" style={{
            width:"200px", height:"200px", bottom:"20%", right:"10%",
            background:"radial-gradient(circle,#f9706055 0%,transparent 70%)", borderRadius:"50%"
          }}/>

          {/* Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/35 px-4 py-1.5 rounded-full text-sm text-white mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
            Built for nonprofits
          </div>

          <h1 className="relative z-10 text-6xl md:text-7xl font-bold text-white leading-[1.08] max-w-3xl mb-6" style={{textShadow:"0 2px 20px rgba(0,0,0,0.1)"}}>
            Keep your mission<br/>moving with <span className="italic">Aorta</span>
          </h1>

          <p className="relative z-10 text-white/75 max-w-md text-base leading-relaxed mb-9">
            AI-powered content creation for newsletters, donor emails, blog posts, and social media — designed for community-focused organizations.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/chat" className="bg-white text-gray-900 font-bold px-8 py-3.5 rounded-full text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
              Start creating for free →
            </Link>
            <Link href="#how" className="text-white/80 hover:text-white text-sm transition-colors border border-white/30 px-6 py-3.5 rounded-full hover:bg-white/10">
              See how it works
            </Link>
          </div>

          {/* Content type pills */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-10">
            {[
              { label:"Newsletter", icon:"/icons/newsletter.png" },
              { label:"Blog Post", icon:"/icons/blog-post.png" },
              { label:"Donor Email", icon:"/icons/donor-email.png" },
              { label:"Social Media", icon:"/icons/social-media.png" },
              { label:"General", icon:"/icons/general.png" },
            ].map(t => (
              <span key={t.label} className="float flex items-center gap-1.5 bg-white/18 backdrop-blur-sm border border-white/30 text-white text-xs px-3.5 py-2 rounded-full font-medium">
                <Image src={t.icon} alt="" width={14} height={14} />
                {t.label}
              </span>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="relative z-10 absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 text-xs">
            <span>scroll</span>
            <div className="w-px h-8 bg-white/30"/>
          </div>
        </section>

        {/* ─── SOCIAL PROOF STRIP ─── */}
        <div ref={r1} className="in-hidden bg-[#fff8f7] border-y border-[#fde8e4] py-5 px-8">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            {[
              { val:"5", label:"Content Types" },
              { val:"AI", label:"Powered by Gemini" },
              { val:"∞", label:"Conversations" },
            ].map(({ val, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-bold text-xl text-[#f97060]">{val}</span>
                <span>{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2"><GDrive /><span>Google Drive</span></div>
          </div>
        </div>

        {/* ─── SCREENSHOT ─── */}
        <section className="px-8 py-24 bg-white">
          <div ref={r2} className="in-hidden max-w-5xl mx-auto">
            <div className="float rounded-3xl overflow-hidden shadow-2xl ring-4 ring-[#f97060]/15">
              <div className="bg-gradient-to-r from-[#f97060] to-[#f9c84a] px-5 py-3.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/40"/>
                <div className="w-3 h-3 rounded-full bg-white/40"/>
                <div className="w-3 h-3 rounded-full bg-white/40"/>
                <span className="ml-3 text-white/70 text-xs font-medium">Aorta — AI Content Assistant</span>
              </div>
              <Image src="/chat-screenshot.png" alt="Aorta interface" width={1200} height={700} className="w-full h-auto"/>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" className="px-8 py-24 bg-[#0f0f14]">
          <div ref={r3} className="in-hidden text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-[#f97060]/30 bg-[#f97060]/10 px-4 py-1.5 rounded-full text-sm text-[#f9a09a] mb-4">
              Simple to use
            </div>
            <h2 className="text-4xl font-bold text-white">How Aorta works</h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num:"01", title:"Choose a content type", desc:"Pick from Newsletter, Blog Post, Donor Email, Social Media, or General. Aorta adapts to your format instantly.", color:"from-[#f97060] to-[#f9c84a]" },
              { num:"02", title:"Connect Google Drive", desc:"Link your Drive and Aorta automatically pulls relevant context from your org's files to ground every piece of content.", color:"from-[#c962a0] to-[#f97060]" },
              { num:"03", title:"Chat and create", desc:"Describe what you need, refine through conversation, and get polished content ready to publish — in moments.", color:"from-[#4f8df9] to-[#c962a0]" },
            ].map((s, i) => {
              const refs = [r4, r5, r6]
              return (
                <div key={s.num} ref={refs[i]} className="in-hidden card-hover gradient-border rounded-2xl p-7 bg-white/5">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white font-bold text-sm mb-5 shadow-lg`}>
                    {s.num}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="px-8 pt-24 pb-28 bg-[#0f0f14]">
          <div ref={r7} className="in-hidden text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-[#f97060]/30 bg-[#f97060]/10 px-4 py-1.5 rounded-full text-sm text-[#f9a09a] mb-4">
              Our Capabilities
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight">The Heartbeat<br/>Behind Your Cause</h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">

            {/* Chat With Aorta — screenshot + text at bottom */}
            <div ref={r8} className="in-hidden card-hover rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{background:"rgba(255,255,255,0.1)", minHeight:"360px"}}>
              <div className="flex-1 overflow-hidden">
                <Image src="/chat-conversation.png" alt="Chat with Aorta" width={900} height={500} className="w-full object-cover object-top"/>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">Chat With Aorta</h3>
                <p className="text-white/70 text-sm leading-relaxed">Aorta responds like a teammate, generating newsletters, blog posts, donor emails, social media captions and in moments.</p>
              </div>
            </div>

            {/* Content Types — text at top + screenshot at bottom */}
            <div ref={r9} className="in-hidden card-hover rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{background:"#f9c84a", minHeight:"360px"}}>
              <div className="p-6 pb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Content Types</h3>
                <p className="text-gray-700 text-sm leading-relaxed">Aorta creates polished, on-brand content for every format your team needs.</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <Image src="/content-types-card.png" alt="Content Types" width={700} height={600} className="w-full h-full object-cover object-top"/>
              </div>
            </div>

            {/* Integrate Your Data — text + illustration */}
            <div ref={r10} className="in-hidden card-hover rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{background:"#f9c84a", minHeight:"300px"}}>
              <div className="p-6 pb-2">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Integrate Your Data</h3>
                <p className="text-gray-700 text-sm leading-relaxed">Aorta integrates directly with Google Drive — pulling context from your files and organizing your documents.</p>
              </div>
              <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
                <Image src="/drive-illustration.png" alt="Google Drive Integration" width={280} height={280} className="object-contain"/>
              </div>
            </div>

            {/* Track Your Impact — screenshot + text at bottom */}
            <div className="in-hidden card-hover rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{background:"rgba(255,255,255,0.1)", minHeight:"300px"}}>
              <div className="flex-1 overflow-hidden">
                <Image src="/social-stats.png" alt="Social Media Stats" width={900} height={400} className="w-full object-cover object-top"/>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">Track Your Impact</h3>
                <p className="text-white/70 text-sm leading-relaxed">See how your content performs across platforms with built-in social media stats, so you always know what&apos;s resonating with your community.</p>
              </div>
            </div>

          </div>
        </section>

        {/* ─── SOCIAL MEDIA ANALYTICS SECTION ─── */}
        <section className="px-8 py-24 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

              {/* Left: text */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#f97060]/10 border border-[#f97060]/20 px-4 py-1.5 rounded-full text-sm text-[#c45a50] mb-5">
                  📊 Built-in Analytics
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
                  Track your impact<br/>across every platform
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  See how your content performs in real time. Aorta connects directly to your social platforms so you always know what&apos;s resonating with your community.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon:"▶", platform:"YouTube", desc:"Subscribers, views & recent videos" },
                    { icon:"f", platform:"Facebook", desc:"Reach, engagement & post performance" },
                    { icon:"📷", platform:"Instagram", desc:"Followers, likes & story stats" },
                    { icon:"♪", platform:"TikTok", desc:"Views, shares & trending content" },
                  ].map(p => (
                    <div key={p.platform} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 bg-[#f97060]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#f97060]">{p.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{p.platform}</div>
                        <div className="text-xs text-gray-400">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: screenshot */}
              <div className="card-hover rounded-3xl overflow-hidden shadow-2xl ring-4 ring-[#f97060]/10">
                <div className="bg-gradient-to-r from-[#f97060] to-[#f9c84a] px-5 py-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"/>
                  <span className="ml-2 text-white/70 text-xs font-medium">Social Media Stats</span>
                </div>
                <Image src="/social-stats.png" alt="Social Media Stats Dashboard" width={900} height={560} className="w-full h-auto"/>
              </div>

            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="px-8 py-24 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative rounded-3xl px-10 py-16 overflow-hidden" style={{background:"linear-gradient(135deg,#f97060 0%,#f9c84a 100%)"}}>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"/>
              <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10"/>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
                <p className="text-white/80 mb-8 leading-relaxed max-w-sm mx-auto text-sm">
                  Built for small, youth-led nonprofits. Spend less time writing and more time with the people who matter.
                </p>
                <Link href="/chat" className="inline-block bg-white text-[#f97060] font-bold px-10 py-4 rounded-full text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105">
                  Try Aorta for free →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="bg-[#0f0f14] px-8 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/icons/aorta-heart.png" alt="Aorta" width={22} height={22}/>
                <span className="font-bold text-white">Aorta</span>
              </div>
              <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                AI content assistant for youth-led nonprofits. Built with Black Creek Youth Initiative & York University.
              </p>
            </div>
            <Link href="/chat" className="bg-[#f97060] hover:bg-[#e8604f] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors shadow-lg">
              Try Aorta
            </Link>
          </div>
        </footer>

      </div>
    </>
  )
}
