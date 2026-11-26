import React from 'react';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';
import { images } from '../data/mock';
import { Feather, BookOpen, Compass } from 'lucide-react';

const About = () => {
  const { t } = useLang();
  return (
    <section id="about" className="py-24 md:py-32 bg-[#F7F3ED]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <SectionKicker text={t.about.kicker} />
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-[#14110F] mb-6">
              {t.about.title}
            </h2>
            <p className="text-lg text-[#14110F]/75 leading-relaxed max-w-xl">
              {t.about.lead}
            </p>
            <div className="mt-10 relative aspect-[5/4] overflow-hidden rounded-sm">
              <img src={images.about} alt="about" className="w-full h-full object-cover grayscale-[20%]" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:pl-6 space-y-10 lg:mt-16">
            {[
              { icon: Feather, h: t.about.h1, p: t.about.p1 },
              { icon: BookOpen, h: t.about.h2, p: t.about.p2 },
              { icon: Compass, h: t.about.h3, p: t.about.p3 }
            ].map(({ icon: Icon, h, p }, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full border border-[#14110F]/20 flex items-center justify-center group-hover:border-[#C1613E] group-hover:bg-[#C1613E] group-hover:text-[#F7F3ED] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#14110F]">{h}</h3>
                </div>
                <p className="text-[#14110F]/70 leading-relaxed" style={{ paddingLeft: '3.25rem' }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
