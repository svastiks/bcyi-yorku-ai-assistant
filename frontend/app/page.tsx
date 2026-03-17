"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"

function useScrollFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transitionDelay = `${delay}ms`
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible")
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return ref
}

const GoogleDriveIcon = () => (
  <svg width="28" height="24" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
)

export default function LandingPage() {
  const s1 = useScrollFadeIn(0)
  const s2 = useScrollFadeIn(100)
  const s3 = useScrollFadeIn(200)
  const s4 = useScrollFadeIn(0)
  const s5 = useScrollFadeIn(120)
  const s6 = useScrollFadeIn(240)
  const s7 = useScrollFadeIn(0)
  const s8 = useScrollFadeIn(100)
  const s9 = useScrollFadeIn(200)
  const s10 = useScrollFadeIn(0)
  const s11 = useScrollFadeIn(0)

  return (
    <>
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes pulse-glow {
          0%, 100% { transform: translate(-50%, -45%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -45%) scale(1.06); opacity: 0.85; }
        }
        .glow-blob {
          animation: pulse-glow 5s ease-in-out infinite;
        }
        .feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        .step-dot {
          background: linear-gradient(135deg, #f4736b, #f9a8a2);
        }
      `}</style>

      <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">

        {/* ── Navbar ── */}
        <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto relative z-20">
          <div className="flex items-center gap-2">
            <Image src="/icons/aorta-heart.png" alt="Aorta" width={30} height={30} />
            <span className="font-bold text-gray-900 text-lg tracking-tight">Aorta</span>
          </div>
          <Link
            href="/chat"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-medium px-5 py-2 rounded-full text-sm transition-all shadow-sm hover:shadow-md"
          >
            Try Aorta →
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center text-center px-8 pt-10 pb-44 overflow-hidden">
          {/* Animated coral glow */}
          <div
            className="glow-blob absolute pointer-events-none"
            style={{
              width: "920px",
              height: "720px",
              top: "50%",
              left: "50%",
              background: "radial-gradient(ellipse at center, #d9635a 0%, #e8837a 22%, #f4a89e 48%, #fad4ce 68%, transparent 86%)",
              borderRadius: "50%",
            }}
          />

          {/* Badge */}
          <div className="relative z-10 flex items-center gap-2 bg-white/25 backdrop-blur-md border border-white/40 px-4 py-1.5 rounded-full text-sm text-white mb-8">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Keep Ideas Flowing
          </div>

          <h1 className="relative z-10 text-6xl md:text-7xl font-bold text-white leading-[1.1] max-w-3xl">
            Keep your mission<br />moving with Aorta
          </h1>

          <p className="relative z-10 mt-6 text-white/75 max-w-lg text-base leading-relaxed">
            Streamline your organization&apos;s communication and reporting with our AI assistant designed for community-focused work.
          </p>

          <div className="relative z-10 flex items-center gap-3 mt-8">
            <Link
              href="/chat"
              className="bg-white hover:bg-white/90 text-gray-900 font-semibold px-8 py-3 rounded-full text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Try Aorta for free
            </Link>
            <Link
              href="#features"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              See how it works ↓
            </Link>
          </div>

          {/* Floating pills */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-10">
            {["Newsletter", "Blog Post", "Donor Email", "Social Media", "General"].map((t) => (
              <span key={t} className="bg-white/20 border border-white/30 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Social proof strip ── */}
        <div ref={s1} className="reveal bg-[#fdf4f3] border-y border-[#f9d5d0] py-5 px-8">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-[#e8756a] font-bold text-lg">5</span> Content Types
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <GoogleDriveIcon /> Google Drive Integration
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-[#e8756a] font-bold text-lg">AI</span> Powered by Gemini
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-[#e8756a] font-bold text-lg">∞</span> Conversations
            </div>
          </div>
        </div>

        {/* ── App Screenshot ── */}
        <section id="features" className="px-8 py-20 bg-white">
          <div ref={s2} className="reveal max-w-5xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 ring-1 ring-black/5">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <Image
                src="/chat-screenshot.png"
                alt="Aorta chat interface"
                width={1200}
                height={700}
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-8 py-20 bg-[#fdf4f3]">
          <div ref={s3} className="reveal text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#f4736b]/10 border border-[#f4736b]/20 px-4 py-1.5 rounded-full text-sm text-[#c45a50] mb-4">
              Simple to use
            </div>
            <h2 className="text-4xl font-bold text-gray-900">How Aorta works</h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Choose a content type", desc: "Pick from Newsletter, Blog Post, Donor Email, Social Media, or General — Aorta adapts to your format." },
              { num: "02", title: "Connect your Drive", desc: "Link your Google Drive and Aorta pulls relevant files to ground every piece of content in your real work." },
              { num: "03", title: "Chat & create", desc: "Describe what you need, refine through conversation, and get polished content ready to publish in moments." },
            ].map((step, i) => {
              const refs = [s4, s5, s6]
              return (
                <div key={step.num} ref={refs[i]} className="reveal text-center">
                  <div className="w-12 h-12 step-dot rounded-2xl flex items-center justify-center text-white font-bold text-sm mx-auto mb-4 shadow-md">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Features bento ── */}
        <section className="px-8 pt-20 pb-24" style={{ backgroundColor: "#e8756a" }}>
          <div ref={s7} className="reveal flex flex-col items-center mb-14">
            <div className="bg-white/20 border border-white/30 px-4 py-1.5 rounded-full text-sm text-white mb-5">
              Our Capabilities
            </div>
            <h2 className="text-5xl font-bold text-white text-center leading-tight">
              The Heartbeat Behind<br />Your Cause
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">

            <div ref={s8} className="reveal feature-card bg-white rounded-3xl overflow-hidden shadow-lg row-span-1" style={{ minHeight: "280px" }}>
              <Image src="/chat-conversation.png" alt="Aorta chat" width={900} height={560} className="w-full h-full object-cover object-top" />
            </div>

            <div ref={s9} className="reveal feature-card rounded-3xl bg-[#f9c84a] p-8 flex flex-col justify-center" style={{ minHeight: "280px" }}>
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
                <Image src="/icons/blog-post.png" alt="" width={22} height={22} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Types</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Aorta creates polished, on-brand content for every format your team needs — newsletters, blog posts, donor emails and more.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {["Newsletter", "Blog Post", "Donor Email", "Social Media"].map((t) => (
                  <span key={t} className="bg-white/60 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">{t}</span>
                ))}
              </div>
            </div>

            <div ref={s10} className="reveal feature-card rounded-3xl p-8 flex flex-col justify-end" style={{ backgroundColor: "#d96a5e", minHeight: "260px" }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Image src="/icons/aorta-heart.png" alt="" width={22} height={22} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Chat With Aorta</h3>
              <p className="text-white/85 leading-relaxed text-sm">
                Aorta responds like a teammate, generating newsletters, blog posts, donor emails, and social media captions in moments.
              </p>
            </div>

            <div className="reveal feature-card bg-white rounded-3xl overflow-hidden shadow-lg" style={{ minHeight: "260px" }}>
              <Image src="/chat-screenshot.png" alt="Aorta app" width={900} height={560} className="w-full h-full object-cover object-top" />
            </div>

            <div ref={s11} className="reveal feature-card rounded-3xl bg-[#f9c84a] p-8 flex flex-col justify-between" style={{ minHeight: "240px" }}>
              <div>
                <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
                  <GoogleDriveIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Integrate Your Data</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Aorta integrates directly with Google Drive — pulling context from your files and organizing your documents automatically.
                </p>
              </div>
            </div>

            <div className="reveal feature-card rounded-3xl p-8 flex flex-col justify-end" style={{ backgroundColor: "#d96a5e", minHeight: "240px" }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Image src="/icons/social-media.png" alt="" width={22} height={22} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Your Impact</h3>
              <p className="text-white/85 leading-relaxed text-sm">
                See how your content performs across platforms with built-in social media stats, so you always know what&apos;s resonating.
              </p>
            </div>

          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-8 py-24 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="rounded-3xl px-10 py-16 relative overflow-hidden"
              style={{ background: "radial-gradient(ellipse 120% 100% at 50% 120%, #f4a09a 0%, #fad4ce 50%, #fff5f4 100%)" }}
            >
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Ready to get started?
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                  Aorta is built for small, youth-led nonprofits. Spend less time writing and more time with the people who matter.
                </p>
                <Link
                  href="/chat"
                  className="inline-block bg-[#e8756a] hover:bg-[#d96a5e] text-white font-bold px-10 py-4 rounded-full text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Try Aorta for free →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-8 py-10 border-t border-gray-100">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/icons/aorta-heart.png" alt="Aorta" width={22} height={22} />
                <span className="font-bold text-gray-900">Aorta</span>
              </div>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                AI-powered content assistant for youth-led nonprofits. Built in partnership with Black Creek Youth Initiative & York University.
              </p>
            </div>
            <Link
              href="/chat"
              className="bg-[#e8756a] hover:bg-[#d96a5e] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Try Aorta
            </Link>
          </div>
        </footer>

      </div>
    </>
  )
}
