import { Link } from "react-router";  
function CTABanner() {
  return (
    <section className="bg-[#1A56DB] w-full py-[80px] px-4 md:px-8">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-tight mb-4"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
          Protect your platform before the next fraud attempt.
        </h2>
        <p className="text-[16px] text-white/70 mb-10">
          Integration takes one afternoon. Protection starts immediately.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup"
             className="px-8 py-3 bg-white text-[#1A56DB] text-[14px] font-semibold rounded-lg hover:bg-[#f0f4ff] transition-colors h-[48px] inline-flex items-center justify-center shadow-sm">
            Get API Access
          </Link>
          <Link to="/docs"
             className="px-8 py-3 text-white text-[14px] font-semibold border border-white/60 rounded-lg hover:bg-white/10 transition-colors h-[48px] inline-flex items-center justify-center">
            Read Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;