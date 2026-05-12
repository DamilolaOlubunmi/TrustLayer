
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
            <span key={t} className="px-6 py-1.5 bg-[#2D486D] text-white text-[13px] font-semibold rounded-full">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IntegrationSection;