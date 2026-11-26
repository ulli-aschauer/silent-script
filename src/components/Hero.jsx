import React from 'react';
import { useLang } from '../i18n/LanguageContext';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { images } from '../data/mock';

const Hero = () => {
  const { t } = useLang();
  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section id="top" className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#14110F]/60 mb-8">
            <span className="h-px w-10 bg-[#C1613E]"></span>
            <span>{t.hero.eyebrow}</span>
          </div>
          <h1 className="font-serif text-[clamp(3rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.02em] text-[#14110F]">
            {t.hero.title}<br />
            <span className="italic text-[#C1613E]">{t.hero.titleAccent}</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-[#14110F]/70 max-w-xl leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button onClick={() => scrollTo('#angebot')} className="group inline-flex items-center gap-2 bg-[#14110F] text-[#F7F3ED] px-7 py-4 rounded-full text-sm tracking-wide hover:bg-[#C1613E] transition-colors">
              {t.hero.cta1}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollTo('#process')} className="inline-flex items-center gap-2 border border-[#14110F]/20 text-[#14110F] px-7 py-4 rounded-full text-sm tracking-wide hover:border-[#14110F] transition-colors">
              {t.hero.cta2}
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <img src={images.hero} alt="writing" className="w-full h-full object-cover grayscale-[15%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14110F]/20 to-transparent"></div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-[#F7F3ED] border border-[#14110F]/10 px-5 py-3 rounded-sm shadow-sm">
            <div className="text-[10px] uppercase tracking-widest text-[#14110F]/50">est. 2011</div>
            <div className="font-serif text-lg text-[#14110F]">Ingolstadt — Berlin — Zürich</div>
          </div>
        </div>
      </div>
      <button onClick={() => scrollTo('#about')} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#14110F]/50 hover:text-[#C1613E] transition-colors">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
};

export default Hero;
