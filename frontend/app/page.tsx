import Link from "next/link"
import Image from "next/image"

function ChatMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full h-full">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Image src="/icons/aorta-heart.png" alt="Aorta" width={14} height={14} />
        <span style={{ fontSize: "9px" }} className="font-semibold text-gray-800">Aorta</span>
        <span style={{ fontSize: "7px" }} className="text-gray-400">BCYI X YORKU AI ASSISTANT</span>
        <div className="ml-auto flex gap-1">
          <span style={{ fontSize: "6px" }} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">Disconnect Drive</span>
          <span style={{ fontSize: "6px" }} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">List Files</span>
          <span style={{ fontSize: "6px" }} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">Sort Drive</span>
        </div>
      </div>
      <div className="flex" style={{ height: "180px" }}>
        {/* Sidebar */}
        <div className="border-r border-gray-100 p-2 flex flex-col gap-1" style={{ width: "90px" }}>
          <div className="bg-[#f4736b] text-white rounded px-2 py-1 text-center" style={{ fontSize: "7px" }}>+ New Chat</div>
          <div style={{ fontSize: "6px" }} className="text-gray-400 mt-1 font-semibold">CHAT HISTORY</div>
          <div className="bg-yellow-100 rounded px-1.5 py-1" style={{ fontSize: "6px" }}>New Chat</div>
          <div style={{ fontSize: "6px" }} className="text-gray-400 mt-1 font-semibold">CONTENT TYPES</div>
          {["Newsletter", "Blog Post", "Donor Email", "Social Media"].map((t) => (
            <div key={t} style={{ fontSize: "6px" }} className="text-gray-600 py-0.5">{t}</div>
          ))}
          <div style={{ fontSize: "6px" }} className="bg-[#f4736b] text-white rounded px-1.5 py-0.5 mt-0.5">General</div>
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Image src="/icons/aorta-heart.png" alt="" width={22} height={22} className="mb-1.5" />
          <div style={{ fontSize: "9px" }} className="font-semibold text-gray-800 mb-1">What can I help take care of?</div>
          <div style={{ fontSize: "7px" }} className="text-gray-400 mb-3">I&apos;m here to help you create engaging content for Black Creek Youth Initiative.</div>
          <div className="grid grid-cols-2 gap-1.5 w-full">
            {[
              { label: "Newsletter", sub: "Create engaging monthly updates" },
              { label: "Blog Post", sub: "Write impactful stories" },
              { label: "Donor Email", sub: "Craft compelling outreach" },
              { label: "Social Media", sub: "Engage your audience" },
            ].map((c) => (
              <div key={c.label} className="border border-gray-200 rounded-lg p-1.5 text-center">
                <div style={{ fontSize: "7px" }} className="font-medium text-gray-700">{c.label}</div>
                <div style={{ fontSize: "5.5px" }} className="text-gray-400">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatConversationMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Image src="/icons/aorta-heart.png" alt="Aorta" width={14} height={14} />
        <span style={{ fontSize: "9px" }} className="font-semibold text-gray-800">Aorta</span>
        <div className="ml-auto">
          <span style={{ fontSize: "6px" }} className="bg-gray-100 rounded px-1.5 py-0.5 text-gray-500">Hey · 10 messages</span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2" style={{ fontSize: "7px" }}>
        <div className="bg-gray-100 rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[80%] text-gray-700">
          Hello! I&apos;m BCYI&apos;s Aorta AI assistant. Just let me know what type of content you&apos;d like to create and I&apos;ll help you craft something that captures the spirit of BCYI!
        </div>
        <div className="bg-[#f4736b] text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[75%] self-end">
          Can you help me write a newsletter about this recent event we organised?
        </div>
        <div className="bg-gray-100 rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[80%] text-gray-700">
          Absolutely! I&apos;d love to help you write a newsletter about your recent event...
        </div>
        <div style={{ fontSize: "6px" }} className="text-gray-400 text-center mt-1">CONTENT TYPES</div>
        {["Newsletter", "Blog Post", "Donor Email", "Social Media", "General"].map((t) => (
          <div key={t} style={{ fontSize: "6px" }} className="text-gray-600">{t}</div>
        ))}
      </div>
    </div>
  )
}

function SocialStatsMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Image src="/icons/aorta-heart.png" alt="Aorta" width={14} height={14} />
        <span style={{ fontSize: "9px" }} className="font-semibold text-gray-800">Aorta</span>
        <div className="ml-auto">
          <span style={{ fontSize: "6px" }} className="bg-[#f4736b] text-white rounded px-2 py-0.5">Social Media Stats</span>
        </div>
      </div>
      <div className="p-3">
        <div style={{ fontSize: "7px" }} className="font-semibold text-gray-800 mb-2">📊 Social Media Stats</div>
        <div className="flex gap-1 mb-2">
          {["YouTube", "Facebook", "Instagram", "TikTok", "YouTube Stats"].map((t) => (
            <span key={t} style={{ fontSize: "5.5px" }} className="bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div>
            <div style={{ fontSize: "7px" }} className="font-semibold text-gray-800">Black Creek Youth Initiative</div>
            <div className="flex gap-2 mt-0.5">
              {[["10", "Subscribers"], ["387", "Videos"], ["12", "Views"]].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div style={{ fontSize: "7px" }} className="font-bold text-gray-900">{n}</div>
                  <div style={{ fontSize: "5px" }} className="text-gray-400">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "6px" }} className="font-semibold text-gray-700 mb-1">Recent Videos</div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-lg" style={{ height: "40px" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Image src="/icons/aorta-heart.png" alt="Aorta logo" width={30} height={30} />
          <span className="font-semibold text-gray-900 text-base">Aorta</span>
        </div>
        <Link
          href="/chat"
          className="bg-gray-900 hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-full text-sm transition-colors"
        >
          Try Aorta
        </Link>
      </nav>

      {/* Hero */}
      <section
        className="flex flex-col items-center text-center px-8 pt-20 pb-36"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 35%, #f4a09a 0%, #f9c8c0 45%, #ffffff 80%)",
        }}
      >
        {/* Badge */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/90 px-4 py-1.5 rounded-full text-sm text-gray-600 mb-8 shadow-sm">
          Keep Ideas Flowing
        </div>

        <h1 className="text-6xl font-bold text-gray-900 leading-tight max-w-2xl">
          Keep your mission moving with Aorta
        </h1>

        <p className="mt-5 text-gray-500 max-w-md text-base leading-relaxed">
          Streamline your organization&apos;s communication and reporting with our AI assistant designed for community-focused work.
        </p>

        <Link
          href="/chat"
          className="mt-8 bg-white hover:bg-gray-50 text-gray-900 font-medium px-7 py-3 rounded-full text-sm transition-colors shadow-sm border border-gray-200"
        >
          Try Aorta
        </Link>
      </section>

      {/* Features */}
      <section className="px-8 py-20" style={{ backgroundColor: "#E8716A" }}>
        <h2 className="text-5xl font-bold text-white text-center mb-14 leading-tight">
          The Heartbeat Behind<br />Your Cause
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">

          {/* Row 1: App mockup (left) + Content Types yellow card (right) */}
          <div className="rounded-3xl overflow-hidden p-4" style={{ backgroundColor: "rgba(255,255,255,0.15)", minHeight: "260px" }}>
            <ChatMockup />
          </div>

          <div className="rounded-3xl p-8 flex flex-col justify-center" style={{ backgroundColor: "#F5C84A" }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Types</h3>
            <p className="text-gray-700 leading-relaxed">
              Aorta creates polished, on-brand content for every format your team needs.
            </p>
          </div>

          {/* Row 2: Chat With Aorta (left) + conversation mockup (right) */}
          <div className="rounded-3xl p-8 flex flex-col justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <h3 className="text-2xl font-bold text-white mb-3">Chat With Aorta</h3>
            <p className="text-white/80 leading-relaxed">
              Aorta responds like a teammate, generating newsletters, blog posts, donor emails, social media captions and in moments.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden p-4" style={{ backgroundColor: "rgba(255,255,255,0.15)", minHeight: "260px" }}>
            <ChatConversationMockup />
          </div>

          {/* Row 3: Integrate Your Data (left) + Track Your Impact yellow (right) */}
          <div className="rounded-3xl p-8 flex flex-col justify-between" style={{ backgroundColor: "rgba(255,255,255,0.12)", minHeight: "240px" }}>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Integrate Your Data</h3>
              <p className="text-white/80 leading-relaxed">
                Aorta integrates directly with Google Drive — pulling context from your files and organizing your documents.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Image src="/icons/aorta-heart.png" alt="Aorta" width={32} height={32} />
              </div>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20L11 10L17 20H5Z" fill="#4285F4"/>
                <path d="M11 10L17 20L23 10H11Z" fill="#EA4335"/>
                <path d="M17 20L23 10L29 20H17Z" fill="#FBBC04"/>
                <path d="M5 20H29L23 28H11L5 20Z" fill="#34A853"/>
              </svg>
            </div>
          </div>

          <div className="rounded-3xl p-6 flex flex-col gap-3" style={{ backgroundColor: "#F5C84A", minHeight: "240px" }}>
            <div className="rounded-2xl overflow-hidden flex-1">
              <SocialStatsMockup />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Track Your Impact</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                See how your content performs across platforms with built-in social media stats, so you always know what&apos;s resonating with your community.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-14 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Image src="/icons/aorta-heart.png" alt="Aorta" width={24} height={24} />
          <span className="font-semibold text-gray-900">Aorta</span>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
          Aorta is an AI writing assistant built for small, youth-led nonprofits dedicated to supporting their local communities. It handles the heavy lifting of writing, from newsletters and program reports to donor outreach and social media, so your team spends less time at a desk and more time with the people who matter.
        </p>
      </footer>

    </div>
  )
}
