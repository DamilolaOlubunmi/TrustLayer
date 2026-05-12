
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
          <h2 className="text-[32px] font-bold text-[#022448]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Everything Your Platform Needs
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white p-6 border border-[#c4c6cf] rounded-lg hover:border-[#0d50d5] transition-colors shadow-sm">
              <div className="w-12 h-12 bg-[#d5e3ff] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#0d50d5]" viewBox="0 0 24 24" fill="currentColor">{f.icon}</svg>
              </div>
              <h3 className="text-[24px] font-semibold text-[#022448] mb-3" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
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


export default FeaturesGrid;