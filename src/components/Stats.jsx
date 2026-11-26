import React, { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';

const Counter = ({ end, active }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1600;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(end * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, end]);
  return <span>{v.toLocaleString('de-DE')}</span>;
};

const Stats = () => {
  const { t } = useLang();
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="py-24 md:py-32 bg-[#14110F] text-[#F7F3ED]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-14">
          <SectionKicker text={t.stats.kicker} onDark />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
          {t.stats.items.map((it, i) => (
            <div key={i} className="border-t border-[#F7F3ED]/15 pt-6">
              <div className="font-serif text-[clamp(3rem,6vw,5rem)] leading-none tracking-tight">
                <Counter end={it.n} active={active} />
              </div>
              <div className="mt-4 text-sm text-[#F7F3ED]/60">{it.label}</div>
              <div className="text-sm text-[#F7F3ED]/60">{it.suffix}</div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-right">
          <span className="font-serif italic text-3xl md:text-5xl text-[#C1613E] whitespace-pre-line">{t.stats.tail}</span>
        </div>
      </div>
    </section>
  );
};

export default Stats;
