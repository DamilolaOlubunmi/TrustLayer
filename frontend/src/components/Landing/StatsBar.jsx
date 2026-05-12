
function StatsBar() {
  const stats = [
    { value: '₦4.2M+',  label: 'Protected' },
    { value: '247',     label: 'Transactions Evaluated' },
    { value: '18',      label: 'Frauds Blocked' },
    { value: '< 200ms', label: 'Response Time' },
  ];
  return (
    <section className="bg-[#E8F0FD] w-full py-[60px]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0">
          {stats.map((s, i) => (
            <>
              <div key={s.label} className="flex-1 flex flex-col items-center text-center">
                <span className="text-[32px] font-bold text-[#1A56DB] mb-1" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {s.value}
                </span>
                <span className="text-[14px] text-[#43474e] uppercase tracking-wider">{s.label}</span>
              </div>
              {i < stats.length - 1 && (
                <div key={`div-${i}`} className="hidden md:block w-px h-12 bg-[#c4c6cf]/30"/>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBar;