import React, { useState } from 'react';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';
import { GraduationCap, BookMarked, FileText } from 'lucide-react';

const icons = [GraduationCap, BookMarked, FileText];

const Services = () => {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  return (
    <section id="services" className="py-24 md:py-32 bg-[#F0EAE0]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <SectionKicker text={t.services.kicker} />
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-[#14110F] mb-6">
              {t.services.title}
            </h2>
            <p className="text-[#14110F]/70 leading-relaxed max-w-md">{t.services.lead}</p>
            <div className="mt-10 space-y-2">
              {t.services.tabs.map((tab, i) => {
                const Icon = icons[i];
                const isActive = active === i;
                return (
                  <button key={tab.id} onClick={() => setActive(i)} className={`w-full text-left flex items-center gap-4 p-4 rounded-sm border transition-colors ${isActive ? 'bg-[#14110F] text-[#F7F3ED] border-[#14110F]' : 'bg-transparent text-[#14110F] border-[#14110F]/15 hover:border-[#14110F]/40'}`}>
                    <span className={`text-xs w-8 ${isActive ? 'text-[#C1613E]' : 'text-[#14110F]/40'}`}>0{i+1}</span>
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest opacity-60">{tab.tag}</div>
                      <div className="font-serif text-lg">{tab.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-7 lg:pl-6">
            <div className="bg-[#F7F3ED] p-10 md:p-14 rounded-sm border border-[#14110F]/10 min-h-[400px]">
              <div className="text-xs uppercase tracking-widest text-[#C1613E] mb-4">{t.services.tabs[active].tag}</div>
              <h3 className="font-serif text-3xl md:text-4xl text-[#14110F] mb-6 leading-tight">
                {t.services.tabs[active].name}
              </h3>
              <p className="text-[#14110F]/75 leading-relaxed text-lg">
                {t.services.tabs[active].body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
