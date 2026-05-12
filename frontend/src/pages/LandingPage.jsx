import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import StatsBar from '../components/Landing/StatsBar';
import HowItWorks from '../components/Landing/HowItWorks';
import DemoSection from '../components/Landing/DemoSection';
import IntegrationSection from '../components/Landing/IntegrationSection';
import FeaturesGrid from '../components/Landing/FeaturesGrid';
import PlatformTypes from '../components/Landing/PlatformTypes';
import CTABanner from '../components/Landing/CTABanner';
import Footer from '../components/Landing/Footer';


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
        <PlatformTypes />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}