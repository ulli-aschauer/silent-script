import React from 'react';
import { useLang } from '../i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';

const CtaBanner = () => {
  const { lang } = useLang();
  const de = lang === 'de';
  const scrollTo = () => document.querySelector('#angebot')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <section className="py-20 bg-[#14110F] text-[#F7F3ED]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <div className="text-[10px] uppercase tracking-widest text-[#C1613E] mb-3">{de ? 'Startklar?' : 'Ready?'}</div>
          <h3 className="font-serif text-3xl md:text-5xl leading-tight">
            {de ? 'Jetzt unverbindliches Angebot anfordern.' : 'Request a non-binding quote now.'}
          </h3>
          <p className="mt-3 text-[#F7F3ED]/60 max-w-xl">
            {de ? 'Vier Felder. 24 Stunden. Ein individuelles Angebot.' : 'Four fields. 24 hours. A personal offer.'}
          </p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <button onClick={scrollTo} className="group inline-flex items-center gap-3 bg-[#C1613E] text-[#F7F3ED] px-8 py-4 rounded-full text-sm tracking-wide hover:bg-[#F7F3ED] hover:text-[#14110F] transition-colors">
            {de ? 'Angebot anfordern' : 'Request quote'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
