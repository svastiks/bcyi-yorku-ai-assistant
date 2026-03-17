import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/aorta-heart.png"
            alt="Aorta logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-semibold text-lg text-gray-900">Aorta</span>
        </div>
        <Link
          href="/chat"
          className="bg-[#29D368] hover:bg-[#22b957] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
        >
          Try Aorta
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-20 flex flex-col items-center text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl">
          Keep your mission moving with Aorta
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl">
          Streamline your organization&apos;s communication and reporting with our AI assistant designed for community-focused work.
        </p>
        <Link
          href="/chat"
          className="mt-8 bg-[#29D368] hover:bg-[#22b957] text-white font-semibold px-8 py-3 rounded-full text-base transition-colors"
        >
          Try Aorta
        </Link>

        {/* App screenshot */}
        <div className="mt-14 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
          <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="bg-white p-8 flex items-center justify-center" style={{ minHeight: "320px" }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#29D368] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Image src="/icons/aorta-heart.png" alt="Aorta" width={40} height={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Content Assistant</h3>
              <p className="text-gray-400 text-sm max-w-sm">
                I&apos;m here to help you create engaging content for Black Creek Youth Initiative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          The Heartbeat Behind Your Cause
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-[#29D368] rounded-xl flex items-center justify-center mb-4">
              <Image src="/icons/aorta-heart.png" alt="Chat" width={24} height={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Chat With Aorta</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Aorta responds like a teammate, generating newsletters, blog posts, donor emails, social media captions and more in moments.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-[#29D368] rounded-xl flex items-center justify-center mb-4">
              <Image src="/icons/blog-post.png" alt="Content Types" width={24} height={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Content Types</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Aorta creates polished, on-brand content for every format your team needs.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-[#29D368] rounded-xl flex items-center justify-center mb-4">
              <Image src="/icons/newsletter.png" alt="Google Drive" width={24} height={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Integrate Your Data</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Aorta integrates directly with Google Drive — pulling context from your files and organizing your documents.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-[#29D368] rounded-xl flex items-center justify-center mb-4">
              <Image src="/icons/social-media.png" alt="Analytics" width={24} height={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Your Impact</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              See how your content performs across platforms with built-in social media stats, so you always know what&apos;s resonating with your community.
            </p>
          </div>

        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="bg-gray-50 rounded-3xl p-12 text-center">
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            Aorta is an AI writing assistant built for small, youth-led nonprofits dedicated to supporting their local communities. It handles the heavy lifting of writing — from newsletters and program reports to donor outreach and social media — so your team spends less time at a desk and more time with the people who matter.
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-block bg-[#29D368] hover:bg-[#22b957] text-white font-semibold px-8 py-3 rounded-full text-base transition-colors"
          >
            Try Aorta
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-10 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/aorta-heart.png"
            alt="Aorta logo"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-semibold text-gray-900">Aorta</span>
        </div>
        <Link
          href="/chat"
          className="bg-[#29D368] hover:bg-[#22b957] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
        >
          Try Aorta
        </Link>
      </footer>

    </div>
  )
}
