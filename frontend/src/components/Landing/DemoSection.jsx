import DemoWidget from './DemoWidget';

function DemoSection() {
  return (
    <section id="live-demo" className="py-16 md:py-[100px] px-4 md:px-8 bg-white w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold text-[#1E3A5F] mb-3" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Try It Right Now
          </h2>
          <p className="text-[18px] text-[#43474e]">Enter a transaction scenario and see TrustLayer evaluate it live.</p>
        </div>
        <DemoWidget />
      </div>
    </section>
  );
}

export default DemoSection;