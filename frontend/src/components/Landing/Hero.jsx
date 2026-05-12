function Hero() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-[100px] max-w-[1600px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
            <svg className="w-5 h-5 text-[#0d50d5]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
            </svg>
            <span className="text-[14px] font-semibold text-[#43474e]">Trusted by enterprise platforms globally</span>
          </div>
        </div>
        <div className="relative w-full rounded-lg border border-[#c4c6cf] bg-[#022448] shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center px-3 py-2 border-b border-white/10 bg-black/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ba1a1a]"/>
              <div className="w-3 h-3 rounded-full bg-[#74777f]"/>
              <div className="w-3 h-3 rounded-full bg-[#74777f]"/>
            </div>
            <div className="ml-3 font-mono text-[13px] text-[#e3e2e6]/70">api.trustlayer.io/v1/evaluate</div>
          </div>
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

export default Hero;