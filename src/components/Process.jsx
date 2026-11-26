import React from 'react';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';
import { images } from '../data/mock';

const Process = () => {
  const { t } = useLang();
  return (
    <section id="process" className="py-24 md:py-32 bg-[#F0EAE0] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <SectionKicker text={t.process.kicker} />
        <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-[#14110F] mb-16 max-w-2xl">
          {t.process.title}
        </h2>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <img src={images.library} alt="process" className="w-full h-full object-cover grayscale-[25%]" />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-1">
            {t.process.steps.map((s, i) => (
              <div key={i} className="group grid grid-cols-[80px_1fr] gap-6 py-8 border-t border-[#14110F]/15 hover:bg-[#F7F3ED] transition-colors -mx-4 px-4 rounded-sm">
                <div className="font-serif text-3xl text-[#C1613E]">{s.n}</div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl text-[#14110F] mb-3">{s.t}</h3>
                  <p className="text-[#14110F]/70 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-[#14110F]/15"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
