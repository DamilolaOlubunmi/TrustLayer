import { useState } from 'react';
import DemoWidget from '../components/DemoWidget';

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-[#faf9fc] sticky top-0 z-50 border-b border-[#c4c6cf] shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-1 max-w-[1600px] mx-auto min-h-[64px]">

        {/* Logo */}
        <a href="#" className="text-[24px] font-bold text-[#0d50d5] tracking-tight" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
          TrustLayer
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {['How it Works', 'Documentation', 'Dashboard'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
               className="text-[#43474e] hover:text-[#0d50d5] transition-colors text-[14px] font-semibold">
              {l}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#"
             className="px-3 py-1 text-[#0d50d5] text-[14px] font-semibold border border-[#0d50d5] rounded-lg hover:bg-[#0d50d5] hover:text-white transition-colors h-[40px] inline-flex items-center justify-center">
            Log In
          </a>
          <a href="#"
             className="px-3 py-1 bg-[#0d50d5] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors shadow-sm h-[40px] inline-flex items-center justify-center">
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-[#43474e]" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#c4c6cf] bg-white px-4 py-3 space-y-2">
          {['How it Works', 'Documentation', 'Dashboard'].map(l => (
            <a key={l} href="#" onClick={() => setOpen(false)}
               className="block py-2 text-[14px] font-semibold text-[#43474e] hover:text-[#0d50d5]">
              {l}
            </a>
          ))}
          <a href="#" className="block w-full bg-[#0d50d5] text-white text-[14px] font-semibold py-2.5 rounded-lg mt-2 text-center">
            Get Started
          </a>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-[100px] max-w-[1600px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left copy */}
        <div className="flex flex-col gap-6 max-w-2xl">
          <h1 className="text-[36px] md:text-[48px] font-bold text-[#022448] leading-tight tracking-tight"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            Stop fraud before money moves
          </h1>
          <p className="text-[18px] text-[#43474e] leading-relaxed max-w-xl">
            AI-powered transaction evaluation for high-stakes environments.
            Integrate in minutes, protect your platform instantly with our sub-200ms API.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="#"
               className="px-6 py-3 bg-[#0d50d5] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors shadow-sm text-center h-[48px] inline-flex items-center justify-center">
              Start Integrating
            </a>
            <a href="#live-demo"
               className="px-6 py-3 text-[#0d50d5] text-[14px] font-semibold border border-[#0d50d5] rounded-lg hover:bg-[#eeedf1] transition-colors text-center h-[48px] inline-flex items-center justify-center">
              See it Live
            </a>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-3 border-t border-[#c4c6cf]/30">
            {/* Shield check icon */}
            <svg className="w-5 h-5 text-[#0d50d5]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
            </svg>
            <span className="text-[14px] font-semibold text-[#43474e]">
              Trusted by enterprise platforms globally
            </span>
          </div>
        </div>

        {/* Right: code mockup */}
        <div className="relative w-full rounded-lg border border-[#c4c6cf] bg-[#022448] shadow-lg overflow-hidden flex flex-col">
          {/* Window bar */}
          <div className="flex items-center px-3 py-2 border-b border-white/10 bg-black/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ba1a1a]"/>
              <div className="w-3 h-3 rounded-full bg-[#74777f]"/>
              <div className="w-3 h-3 rounded-full bg-[#74777f]"/>
            </div>
            <div className="ml-3 font-mono text-[13px] text-[#e3e2e6]/70">
              api.trustlayer.io/v1/evaluate
            </div>
          </div>
          {/* Code */}
          <div className="p-6 font-mono text-[13px] text-[#e3e2e6] overflow-x-auto flex-1 flex flex-col justify-center leading-relaxed">
            <pre>{`{
  `}<span className="text-[#b5c4ff]">"transaction_id"</span>{`: `}<span className="text-[#a3defe]">"tx_9982a4"</span>{`,
  `}<span className="text-[#b5c4ff]">"decision"</span>{`:    `}<span className="text-[#ba1a1a] font-bold">"BLOCK"</span>{`,
  `}<span className="text-[#b5c4ff]">"confidence_score"</span>{`: `}<span className="text-white">0.98</span>{`,
  `}<span className="text-[#b5c4ff]">"flags"</span>{`: [
    `}<span className="text-[#a3defe]">"vendor_age_suspicious"</span>{`,
    `}<span className="text-[#a3defe]">"velocity_spike_detected"</span>{`
  ],
  `}<span className="text-[#b5c4ff]">"processing_time_ms"</span>{`: `}<span className="text-white">142</span>{`
}`}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Bar ──────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: '₦4.2M+', label: 'Protected' },
    { value: '247',    label: 'Transactions Evaluated' },
    { value: '18',     label: 'Frauds Blocked' },
    { value: '< 200ms', label: 'Response Time' },
  ];
  return (
    <section className="bg-[#E8F0FD] w-full py-[60px]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0">
          {stats.map((s, i) => (
            <>
              <div key={s.label} className="flex-1 flex flex-col items-center text-center">
                <span className="text-[32px] font-bold text-[#1A56DB] mb-1"
                      style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {s.value}
                </span>
                <span className="text-[14px] text-[#43474e] uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
              {i < stats.length - 1 && (
                <div key={`div-${i}`} className="hidden md:block w-px h-12 bg-[#c4c6cf]/30"/>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────── */
const STEPS = [
  {
    num: '1',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
      </svg>
    ),
    title: 'Platform Calls Our API',
    body: "Before any payment executes, your backend sends transaction context to TrustLayer's /evaluate endpoint.",
  },
  {
    num: '2',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
      </svg>
    ),
    title: 'AI Evaluates the Risk',
    body: 'Our dual ML models score the buyer and vendor independently. SHAP explains which signals drove the decision.',
  },
  {
    num: '3',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    ),
    title: 'Decision Returned Instantly',
    body: 'ALLOW, REVIEW, or BLOCK — returned in under 200ms with plain-English reasons your team can act on.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[100px] px-4 md:px-8 max-w-[1600px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-[32px] font-bold text-[#1E3A5F] mb-3"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
          How TrustLayer Works
        </h2>
        <p className="text-[18px] text-[#43474e]">Three steps. Zero friction. Full protection.</p>
      </div>

      <div className="relative flex flex-col md:flex-row justify-between gap-16 md:gap-6">
        {STEPS.map((step, i) => (
          <>
            <div key={step.num} className="flex-1 flex flex-col items-center text-center">
              {/* Circle */}
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-full bg-[#1A56DB] flex items-center justify-center text-white font-bold text-xl shadow-lg"
                     style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {step.num}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#faf9fc] p-1 rounded-full border border-[#c4c6cf]">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-[24px] font-semibold text-[#022448] mb-3"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                {step.title}
              </h3>
              <p className="text-[16px] text-[#43474e] max-w-[320px]">{step.body}</p>
            </div>

            {/* Arrow connector (desktop only) */}
            {i < STEPS.length - 1 && (
              <div key={`arr-${i}`} className="hidden md:flex items-center pt-8 text-[#c4c6cf]">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            )}
          </>
        ))}
      </div>
    </section>
  );
}

/* ─── Live Demo Section ──────────────────────────────────── */
function DemoSection() {
  return (
    <section id="live-demo" className="py-16 md:py-[100px] px-4 md:px-8 bg-white w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold text-[#1E3A5F] mb-3"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Try It Right Now
          </h2>
          <p className="text-[18px] text-[#43474e]">
            Enter a transaction scenario and see TrustLayer evaluate it live.
          </p>
        </div>
        <DemoWidget />
      </div>
    </section>
  );
}

/* ─── Integration Code ───────────────────────────────────── */
function IntegrationSection() {
  return (
    <section className="bg-[#1e3a5f] w-full py-[80px] md:py-[100px] px-4 md:px-8 text-white">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold mb-3" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Integrate in Minutes
          </h2>
          <p className="text-[18px] text-[#E8F0FD]">Drop three lines into your checkout flow. That's it.</p>
        </div>

        {/* Code block */}
        <div className="bg-[#0B1E33] rounded-xl border border-white/10 shadow-2xl overflow-hidden mb-6">
          <div className="flex items-center px-6 py-3 bg-black/20 border-b border-white/5">
            <div className="flex gap-1.5 mr-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]/50"/>
              <div className="w-2.5 h-2.5 rounded-full bg-[#74777f]/50"/>
              <div className="w-2.5 h-2.5 rounded-full bg-[#74777f]/50"/>
            </div>
            <span className="font-mono text-[13px] text-[#9ba4b0]">checkout-flow.js</span>
          </div>
          <div className="p-6 md:p-8 overflow-x-auto">
            <pre className="font-mono text-[13px] leading-relaxed">
              <code className="text-[#f8f8f2]">
{`// 1. Before calling Squad, evaluate the transaction
`}<span className="text-[#b5c4ff]">const</span>{` risk = `}<span className="text-[#b5c4ff]">await</span>{` `}<span className="text-[#0d50d5]">fetch</span>{`(`}<span className="text-[#a3defe]">'https://api.trustlayer.ng/v1/evaluate'</span>{`, {
  `}<span className="text-[#b5c4ff]">method</span>{`: `}<span className="text-[#a3defe]">'POST'</span>{`,
  `}<span className="text-[#b5c4ff]">headers</span>{`: { `}<span className="text-[#a3defe]">'Content-Type'</span>{`: `}<span className="text-[#a3defe]">'application/json'</span>{` },
  `}<span className="text-[#b5c4ff]">body</span>{`: `}<span className="text-[#0d50d5]">JSON</span>{`.`}<span className="text-[#0d50d5]">stringify</span>{`(transactionPayload)
});
`}<span className="text-[#b5c4ff]">const</span>{` { decision, reasons } = `}<span className="text-[#b5c4ff]">await</span>{` risk.`}<span className="text-[#0d50d5]">json</span>{`();

// 2. Only proceed if TrustLayer approves
`}<span className="text-[#b5c4ff]">if</span>{` (decision === `}<span className="text-[#a3defe]">'ALLOW'</span>{`) {
  `}<span className="text-[#b5c4ff]">await</span>{` squad.`}<span className="text-[#0d50d5]">initiatePayment</span>{`(transactionPayload);
} `}<span className="text-[#b5c4ff]">else</span>{` {
  `}<span className="text-[#0d50d5]">showWarningToUser</span>{`(reasons);
}`}
              </code>
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {['REST API', 'JSON Response', 'Async-ready'].map(t => (
            <span key={t} className="px-6 py-1.5 bg-[#2D486D] text-white text-[13px] font-semibold rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features Grid ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>,
    title: 'Bilateral Risk Scoring',
    body: 'We score both the buyer AND the vendor independently. Authorized fraud is almost always vendor-side — we catch it.',
  },
  {
    icon: <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/>,
    title: 'AI + Rules Engine',
    body: 'Dual XGBoost models plus Nigeria-specific fraud rule presets. Fake electronics listings, advance-fee patterns, WhatsApp funnels.',
  },
  {
    icon: <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>,
    title: 'Plain-English Explanations',
    body: 'Every decision comes with human-readable reasons. No black boxes. No mystery scores.',
  },
  {
    icon: <path d="M7 2v11h3v9l7-12h-4l4-8z"/>,
    title: 'Sub-200ms Decisions',
    body: 'Your checkout flow feels instant. TrustLayer evaluates in the background before money moves.',
  },
  {
    icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>,
    title: 'Cross-Platform Intelligence',
    body: 'A vendor flagged on one platform is known on all of them. The network gets smarter with every integration.',
  },
  {
    icon: <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>,
    title: 'Programmable Thresholds',
    body: "Set your own ALLOW/REVIEW/BLOCK thresholds based on your platform's risk tolerance.",
  },
];

function FeaturesGrid() {
  return (
    <section id="features" className="py-[100px] px-4 md:px-8 bg-[#faf9fc] w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold text-[#022448]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Everything Your Platform Needs
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i}
                 className="bg-white p-6 border border-[#c4c6cf] rounded-lg hover:border-[#0d50d5] transition-colors shadow-sm">
              <div className="w-12 h-12 bg-[#d5e3ff] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#0d50d5]" viewBox="0 0 24 24" fill="currentColor">
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-[24px] font-semibold text-[#022448] mb-3"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                {f.title}
              </h3>
              <p className="text-[16px] text-[#43474e] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#022448] w-full">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-10 max-w-[1600px] mx-auto gap-6 border-t border-white/10">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-white text-lg" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            TrustLayer
          </span>
          <span className="text-[14px] text-[#8aa4cf] text-center md:text-left">
            © 2024 TrustLayer Inc. AI-Powered Fraud Prevention.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          {['Documentation', 'API Reference', 'Status', 'Privacy', 'Terms'].map(l => (
            <a key={l} href="#"
               className="text-[14px] font-semibold text-[#8aa4cf] hover:text-[#b5c4ff] transition-colors">
              {l}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/* ─── Page Assembly ──────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9fc] text-[#1a1c1e]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <DemoSection />
        <IntegrationSection />
        <FeaturesGrid />
      </main>
      <Footer />
    </div>
  );
}