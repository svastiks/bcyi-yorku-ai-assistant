import Link from "next/link"
import Image from "next/image"

function FullChatMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md w-full h-full text-left">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white">
        <div className="flex gap-1 mr-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <Image src="/icons/aorta-heart.png" alt="Aorta" width={12} height={12} />
        <span style={{ fontSize: "8px" }} className="font-semibold text-gray-800">Aorta</span>
        <span style={{ fontSize: "6px" }} className="text-gray-400">BCYI X YORKU AI ASSISTANT</span>
        <div className="ml-auto flex gap-1">
          <span style={{ fontSize: "5.5px" }} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">Disconnect Drive</span>
          <span style={{ fontSize: "5.5px" }} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">List Files</span>
          <span style={{ fontSize: "5.5px" }} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">Sort Drive</span>
        </div>
      </div>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="border-r border-gray-100 p-2 flex flex-col gap-1 bg-white" style={{ width: "80px", minHeight: "200px" }}>
          <div className="bg-[#f4736b] text-white rounded px-2 py-1 text-center mb-1" style={{ fontSize: "6.5px" }}>+ New Chat</div>
          <div style={{ fontSize: "5.5px" }} className="text-gray-400 font-semibold uppercase tracking-wide">Chat History</div>
          <div className="bg-yellow-100 rounded px-1.5 py-1" style={{ fontSize: "6px" }}>New Chat</div>
          <div style={{ fontSize: "5.5px" }} className="text-gray-400 font-semibold uppercase tracking-wide mt-1">Content Types</div>
          {["Newsletter", "Blog Post", "Donor Email", "Social Media"].map((t) => (
            <div key={t} style={{ fontSize: "6px" }} className="text-gray-500 py-0.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />{t}
            </div>
          ))}
          <div style={{ fontSize: "6px" }} className="bg-[#f4736b] text-white rounded px-1.5 py-0.5 mt-0.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />General
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-3">
          <Image src="/icons/aorta-heart.png" alt="" width={24} height={24} className="mb-2" />
          <div style={{ fontSize: "10px" }} className="font-bold text-gray-800 mb-1">What can I help take care of?</div>
          <div style={{ fontSize: "7px" }} className="text-gray-400 mb-3 max-w-[180px]">
            I&apos;m here to help you create engaging content for Black Creek Youth Initiative.
          </div>
          <div className="grid grid-cols-2 gap-1.5 w-full max-w-[220px]">
            {[
              { label: "Newsletter", sub: "Create engaging monthly updates" },
              { label: "Blog Post", sub: "Write impactful stories" },
              { label: "Donor Email", sub: "Craft compelling outreach" },
              { label: "Social Media", sub: "Engage your audience" },
            ].map((c) => (
              <div key={c.label} className="border border-gray-200 rounded-xl p-2 text-center bg-white">
                <div style={{ fontSize: "7px" }} className="font-semibold text-gray-700">{c.label}</div>
                <div style={{ fontSize: "5.5px" }} className="text-gray-400 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConversationMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md w-full h-full text-left">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Image src="/icons/aorta-heart.png" alt="Aorta" width={12} height={12} />
        <span style={{ fontSize: "8px" }} className="font-semibold text-gray-800">Aorta</span>
        <div className="ml-auto">
          <span style={{ fontSize: "5.5px" }} className="bg-gray-100 rounded px-2 py-0.5 text-gray-500">Hey · 10 messages</span>
        </div>
      </div>
      <div className="flex h-full">
        <div className="border-r border-gray-100 p-2 bg-white" style={{ width: "80px" }}>
          <div style={{ fontSize: "5.5px" }} className="text-gray-400 font-semibold uppercase mb-1">Content Types</div>
          {["Newsletter", "Blog Post", "Donor Email", "Social Media", "General"].map((t) => (
            <div key={t} style={{ fontSize: "6px" }} className="text-gray-500 py-0.5">{t}</div>
          ))}
        </div>
        <div className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden">
          <div style={{ fontSize: "6px" }} className="bg-gray-100 rounded-xl rounded-tl-sm px-2 py-1.5 max-w-[85%] text-gray-700">
            Hello! I&apos;m BCYI&apos;s Aorta AI assistant. Just let me know what type of content you&apos;d like to create and I&apos;ll help you craft something!
          </div>
          <div style={{ fontSize: "6px" }} className="bg-[#f4736b] text-white rounded-xl rounded-tr-sm px-2 py-1.5 max-w-[75%] self-end">
            Can you help me write a newsletter about this recent event?
          </div>
          <div style={{ fontSize: "6px" }} className="bg-gray-100 rounded-xl rounded-tl-sm px-2 py-1.5 max-w-[85%] text-gray-700">
            Absolutely! I&apos;d love to help you write that newsletter...
          </div>
        </div>
        <div className="p-2 border-l border-gray-100" style={{ width: "70px" }}>
          <div style={{ fontSize: "5.5px" }} className="text-gray-400 font-semibold uppercase mb-1">Content Types</div>
          {["Newsletter", "Blog Post", "Donor Email", "Social Media", "General"].map((t) => (
            <div key={t} style={{ fontSize: "6px" }} className="text-gray-500 py-0.5">{t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SocialStatsMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md w-full h-full text-left">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Image src="/icons/aorta-heart.png" alt="Aorta" width={12} height={12} />
        <span style={{ fontSize: "8px" }} className="font-semibold text-gray-800">Aorta</span>
        <div className="ml-auto">
          <span style={{ fontSize: "5.5px" }} className="bg-[#f4736b] text-white rounded px-2 py-0.5">Social Media Stats</span>
        </div>
      </div>
      <div className="p-3">
        <div style={{ fontSize: "7px" }} className="font-bold text-gray-800 mb-2">📊 Social Media Stats</div>
        <div className="flex gap-1 mb-2 flex-wrap">
          {["YouTube", "Facebook", "Instagram", "TikTok"].map((t) => (
            <span key={t} style={{ fontSize: "5px" }} className="bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
          <div>
            <div style={{ fontSize: "6.5px" }} className="font-semibold text-gray-800">Black Creek Youth Initiative</div>
            <div className="flex gap-2 mt-0.5">
              {[["10", "Subs"], ["387", "Videos"], ["12", "Views"]].map(([n, l]) => (
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
            <div key={i} className="flex-1 bg-gray-200 rounded-lg" style={{ height: "36px" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen font-sans antialiased overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 10%, #f4a09a 0%, #f9c0b8 30%, #fde8e4 60%, #ffffff 85%)",
      }}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Image src="/icons/aorta-heart.png" alt="Aorta logo" width={28} height={28} />
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
      <section className="flex flex-col items-center text-center px-8 pt-16 pb-24">
        <div className="bg-white/60 backdrop-blur-sm border border-white/80 px-4 py-1.5 rounded-full text-sm text-gray-600 mb-8 shadow-sm">
          Keep Ideas Flowing
        </div>

        <h1 className="text-6xl font-bold text-gray-900 leading-tight max-w-2xl">
          Keep your mission moving with Aorta
        </h1>

        <p className="mt-5 text-gray-600 max-w-md text-base leading-relaxed">
          Streamline your organization&apos;s communication and reporting with our AI assistant designed for community-focused work.
        </p>

        <Link
          href="/chat"
          className="mt-8 bg-white hover:bg-gray-50 text-gray-900 font-medium px-7 py-3 rounded-full text-sm transition-colors shadow-sm border border-white/80"
        >
          Try Aorta
        </Link>
      </section>

      {/* Features */}
      <section className="px-8 pb-24">
        {/* Our Capabilities badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/40 backdrop-blur-sm border border-white/60 px-4 py-1.5 rounded-full text-sm text-gray-700 shadow-sm">
            Our Capabilities
          </div>
        </div>

        <h2 className="text-5xl font-bold text-white text-center mb-14 leading-tight drop-shadow-sm">
          The Heartbeat Behind<br />Your Cause
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">

          {/* Row 1: Full chat mockup (left) + Content Types yellow (right) */}
          <div className="rounded-3xl overflow-hidden p-3 bg-white/20 backdrop-blur-sm" style={{ minHeight: "280px" }}>
            <FullChatMockup />
          </div>

          <div className="rounded-3xl p-8 flex flex-col justify-center" style={{ backgroundColor: "#F5C84A" }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Types</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              Aorta creates polished, on-brand content for every format your team needs.
            </p>
          </div>

          {/* Row 2: Chat With Aorta text (left) + conversation mockup (right) */}
          <div className="rounded-3xl p-8 flex flex-col justify-center bg-white/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-3">Chat With Aorta</h3>
            <p className="text-white/90 leading-relaxed text-sm">
              Aorta responds like a teammate, generating newsletters, blog posts, donor emails, social media captions and in moments.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden p-3 bg-white/20 backdrop-blur-sm" style={{ minHeight: "260px" }}>
            <ConversationMockup />
          </div>

          {/* Row 3: Integrate Your Data (left) + Track Your Impact yellow (right) */}
          <div className="rounded-3xl p-8 flex flex-col justify-between bg-white/20 backdrop-blur-sm" style={{ minHeight: "240px" }}>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Integrate Your Data</h3>
              <p className="text-white/90 leading-relaxed text-sm">
                Aorta integrates directly with Google Drive — pulling context from your files and organizing your documents.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center">
                <Image src="/icons/aorta-heart.png" alt="Aorta" width={28} height={28} />
              </div>
              {/* Google Drive icon */}
              <svg width="40" height="34" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </div>
          </div>

          <div className="rounded-3xl p-4 flex flex-col gap-3" style={{ backgroundColor: "#F5C84A", minHeight: "240px" }}>
            <div className="rounded-2xl overflow-hidden flex-1" style={{ minHeight: "140px" }}>
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
      <div className="bg-white">
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

    </div>
  )
}
