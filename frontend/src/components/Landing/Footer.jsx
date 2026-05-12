
function Footer() {
  return (
    <footer className="bg-[#022448] w-full">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-10 max-w-[1600px] mx-auto gap-6 border-t border-white/10">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-white text-lg" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            TrustLayer
          </span>
          <span className="text-[14px] text-[#8aa4cf] text-center md:text-left">
            © 2026 TrustLayer Inc. AI-Powered Fraud Prevention.
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

export default Footer;