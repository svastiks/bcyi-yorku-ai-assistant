"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"

function useScrollFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-in")
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function LandingPage() {
  const featuresRef = useScrollFadeIn()
  const card1Ref = useScrollFadeIn()
  const card2Ref = useScrollFadeIn()
  const card3Ref = useScrollFadeIn()
  const card4Ref = useScrollFadeIn()
  const footerRef = useScrollFadeIn()

  return (
    <>
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-up-delay-1 { transition-delay: 0.1s; }
        .fade-up-delay-2 { transition-delay: 0.25s; }
        .fade-up-delay-3 { transition-delay: 0.4s; }
        .fade-up-delay-4 { transition-delay: 0.55s; }
      `}</style>

      <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2">
            <Image src="/icons/aorta-heart.png" alt="Aorta logo" width={28} height={28} />
            <span className="font-semibold text-gray-900 text-base">Aorta</span>
          </div>
          <Link
            href="/chat"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-medium px-5 py-2 rounded-full text-sm transition-colors shadow-sm"
          >
            Try Aorta
          </Link>
        </nav>

        {/* Hero */}
        <section className="relative flex flex-col items-center text-center px-8 pt-12 pb-40 overflow-hidden">
          {/* Coral glow blob — large enough to cover all hero text */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "900px",
              height: "700px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -45%)",
              background:
                "radial-gradient(ellipse at center, #d9635a 0%, #e8837a 25%, #f4a89e 50%, #fad4ce 70%, transparent 88%)",
              borderRadius: "50%",
            }}
          />

          {/* Badge */}
          <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/40 px-4 py-1.5 rounded-full text-sm text-white mb-8">
            Keep Ideas Flowing
          </div>

          {/* Headline */}
          <h1 className="relative z-10 text-6xl font-bold text-white leading-tight max-w-2xl">
            Keep your mission<br />moving with Aorta
          </h1>

          {/* Subtext */}
          <p className="relative z-10 mt-5 text-white/75 max-w-md text-sm leading-relaxed">
            Streamline your organization&apos;s communication and reporting with our AI assistant designed for community-focused work.
          </p>

          {/* CTA */}
          <Link
            href="/chat"
            className="relative z-10 mt-8 bg-white hover:bg-white/90 text-gray-800 font-medium px-8 py-3 rounded-full text-sm transition-colors shadow-sm"
          >
            Try Aorta
          </Link>
        </section>

        {/* === FEATURES — scroll animated === */}
        <section className="px-8 pb-24 -mt-16">

          {/* Section header */}
          <div ref={featuresRef} className="fade-up flex flex-col items-center mb-14">
            <div className="bg-[#f4a090]/20 border border-[#f4a090]/40 px-4 py-1.5 rounded-full text-sm text-[#c45a50] mb-6">
              Our Capabilities
            </div>
            <h2 className="text-5xl font-bold text-gray-900 text-center leading-tight">
              The Heartbeat Behind<br />Your Cause
            </h2>
          </div>

          {/* App screenshot — full width */}
          <div ref={card1Ref} className="fade-up max-w-5xl mx-auto mb-4 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/chat-screenshot.png"
              alt="Aorta chat interface"
              width={1200}
              height={700}
              className="w-full h-auto"
            />
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">

            {/* Card 1: Chat With Aorta */}
            <div ref={card2Ref} className="fade-up fade-up-delay-1 rounded-3xl p-8 flex flex-col justify-center" style={{ backgroundColor: "#e8756a", minHeight: "220px" }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Image src="/icons/aorta-heart.png" alt="" width={22} height={22} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Chat With Aorta</h3>
              <p className="text-white/85 leading-relaxed text-sm">
                Aorta responds like a teammate, generating newsletters, blog posts, donor emails, social media captions and more in moments.
              </p>
            </div>

            {/* Card 2: Content Types */}
            <div ref={card3Ref} className="fade-up fade-up-delay-2 rounded-3xl bg-[#f9c84a] p-8 flex flex-col justify-center" style={{ minHeight: "220px" }}>
              <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center mb-4">
                <Image src="/icons/blog-post.png" alt="" width={22} height={22} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Types</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Aorta creates polished, on-brand content for every format your team needs — newsletters, blog posts, donor emails and more.
              </p>
            </div>

            {/* Card 3: Integrate Your Data */}
            <div ref={card4Ref} className="fade-up fade-up-delay-3 rounded-3xl bg-[#f9c84a] p-8 flex flex-col justify-between" style={{ minHeight: "220px" }}>
              <div>
                <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center mb-4">
                  <svg width="22" height="18" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Integrate Your Data</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Aorta integrates directly with Google Drive — pulling context from your files and organizing your documents.
                </p>
              </div>
            </div>

            {/* Card 4: Track Your Impact */}
            <div className="fade-up fade-up-delay-4 rounded-3xl p-8 flex flex-col justify-center" style={{ backgroundColor: "#e8756a", minHeight: "220px" }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Image src="/icons/social-media.png" alt="" width={22} height={22} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Your Impact</h3>
              <p className="text-white/85 leading-relaxed text-sm">
                See how your content performs across platforms with built-in social media stats, so you always know what&apos;s resonating with your community.
              </p>
            </div>

          </div>
        </section>

        {/* About + Footer */}
        <div ref={footerRef} className="fade-up bg-white border-t border-gray-100">
          <footer className="px-8 py-14 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/aorta-heart.png" alt="Aorta" width={24} height={24} />
              <span className="font-semibold text-gray-900">Aorta</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
              Aorta is an AI writing assistant built for small, youth-led nonprofits dedicated to supporting their local communities. It handles the heavy lifting of writing — from newsletters and program reports to donor outreach and social media — so your team spends less time at a desk and more time with the people who matter.
            </p>
          </footer>
        </div>

      </div>
    </>
  )
}
