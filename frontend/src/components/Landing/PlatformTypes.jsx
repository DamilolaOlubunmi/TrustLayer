
const PLATFORMS = [
  {
    title: 'Marketplaces',
    body: 'Bilateral scoring. Catch fake vendor listings before buyers pay.',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4v2l8 5 8-5V4zm0 4.236l-8 5-8-5V20h16V8.236z"/>
      </svg>
    ),
  },
  {
    title: 'E-commerce',
    body: 'Buyer-focused scoring. Stop stolen card usage and chargeback abuse.',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.17 14l.94-2h7.45c.75 0 1.41-.41 1.75-1.03L21 5H5.21L4.27 3H1v2h2l3.6 7.59L5.25 15c-.16.28-.25.61-.25.95C5 17.1 5.9 18 7 18h13v-2H7.42c-.13 0-.25-.11-.25-.24V14z"/>
      </svg>
    ),
  },
  {
    title: 'Gig Platforms',
    body: 'Protect clients from service non-delivery. Score freelancer credibility.',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.07-.44.18-.86.18-1.3C18 2.55 15.45 1 13.15 1c-1.3 0-2.4.52-3.15 1.39C9.25 1.52 8.15 1 6.85 1 4.55 1 2 2.55 2 4.7c0 .44.11.86.18 1.3H0v2h1l1 13h20l1-13h1V6h-4zm-6.85-3c1.12 0 2.85.61 2.85 1.7 0 .44-.43 1.3-2 1.3H12V4.61C12.37 3.67 13.04 3 13.15 3zm-6.3 0C6.96 3 7.63 3.67 8 4.61V6H6c-1.57 0-2-.86-2-1.3C4 3.61 5.73 3 6.85 3zM4 19l-.85-11H8v2h2v-2h4v2h2v-2h4.85L20 19H4z"/>
      </svg>
    ),
  },
  {
    title: 'B2B Procurement',
    body: 'Vendor-side scoring. Catch phantom suppliers and invoice fraud.',
    icon: (
      <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
    ),
  },
];

function PlatformTypes() {
  return (
    <section className="py-[100px] px-4 md:px-8 bg-white w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold text-[#022448] mb-3" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Built For Every Payment-Enabled Platform
          </h2>
          <p className="text-[18px] text-[#43474e]">
            TrustLayer adapts its risk weighting based on your platform type.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORMS.map((p) => (
            <div key={p.title} className="bg-white p-6 border border-[#c4c6cf] rounded-lg hover:border-[#0d50d5] transition-colors shadow-sm">
              <div className="w-11 h-11 bg-[#d5e3ff] rounded-lg flex items-center justify-center mb-5">
                {p.icon}
              </div>
              <h3 className="text-[18px] font-semibold text-[#022448] mb-2" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                {p.title}
              </h3>
              <p className="text-[14px] text-[#43474e] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default PlatformTypes;