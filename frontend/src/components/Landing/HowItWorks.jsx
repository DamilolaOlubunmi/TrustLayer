
const STEPS = [
  {
    num: '1',
    icon: <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>,
    title: 'Platform Calls Our API',
    body: "Before any payment executes, your backend sends transaction context to TrustLayer's /evaluate endpoint.",
  },
  {
    num: '2',
    icon: <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/></svg>,
    title: 'AI Evaluates the Risk',
    body: 'Our dual ML models score the buyer and vendor independently. SHAP explains which signals drove the decision.',
  },
  {
    num: '3',
    icon: <svg className="w-6 h-6 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
    title: 'Decision Returned Instantly',
    body: 'ALLOW, REVIEW, or BLOCK — returned in under 200ms with plain-English reasons your team can act on.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[100px] px-4 md:px-8 max-w-[1600px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-[32px] font-bold text-[#1E3A5F] mb-3" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
          How TrustLayer Works
        </h2>
        <p className="text-[18px] text-[#43474e]">Three steps. Zero friction. Full protection.</p>
      </div>
      <div className="relative flex flex-col md:flex-row justify-between gap-16 md:gap-6">
        {STEPS.map((step, i) => (
          <>
            <div key={step.num} className="flex-1 flex flex-col items-center text-center">
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-full bg-[#1A56DB] flex items-center justify-center text-white font-bold text-xl shadow-lg"
                     style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {step.num}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#faf9fc] p-1 rounded-full border border-[#c4c6cf]">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-[24px] font-semibold text-[#022448] mb-3" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                {step.title}
              </h3>
              <p className="text-[16px] text-[#43474e] max-w-[320px]">{step.body}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div key={`arr-${i}`} className="hidden md:flex items-center pt-8 text-[#c4c6cf]">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            )}
          </>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;