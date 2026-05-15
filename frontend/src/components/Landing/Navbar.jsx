import { useState } from 'react';
import { Link } from 'react-router';
import Logo from "../../assets/trustlayer-logo.png";

const NAV_LINKS = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Documentation', href: '#documentation' },
  { label: 'Dashboard', href: '/dashboard' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-[#faf9fc] sticky top-0 z-50 border-b border-[#c4c6cf] shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-1 max-w-[1600px] mx-auto min-h-[64px]">
        <Link to="#" className="text-[24px] font-bold text-[#0d50d5] tracking-tight" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
          <img src={Logo} alt="TrustLayer Logo" width={200} />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href}
               className="text-[#43474e] hover:text-[#0d50d5] transition-colors text-[14px] font-semibold">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to='/login'
             className="px-3 py-1 text-[#0d50d5] text-[14px] font-semibold border border-[#0d50d5] rounded-lg hover:bg-[#0d50d5] hover:text-white transition-colors h-[40px] inline-flex items-center justify-center">
            Log In
          </Link>
          <Link to='/signup'
             className="px-3 py-1 bg-[#0d50d5] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors shadow-sm h-[40px] inline-flex items-center justify-center">
            Get Started
          </Link>
        </div>
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
          {NAV_LINKS.map(link => (
            <Link key={link.label} to={link.href} onClick={() => setOpen(false)}
               className="block py-2 text-[14px] font-semibold text-[#43474e] hover:text-[#0d50d5]">
              {link.label}
            </Link>
          ))}
          <Link to='/signup' className="block w-full bg-[#0d50d5] text-white text-[14px] font-semibold py-2.5 rounded-lg mt-2 text-center">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;