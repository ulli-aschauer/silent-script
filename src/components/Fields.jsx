import React, { useState, useMemo } from 'react';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';
import { Search, Scale, Briefcase, Cpu, Stethoscope, Brain, Users, BookOpen, Code, Microscope, GraduationCap, Landmark, Languages } from 'lucide-react';

const FIELDS = [
  { key: 'jura', de: 'Rechtswissenschaft', en: 'Law', icon: Scale, sub: { de: 'Zivil-, Straf-, Öff. Recht', en: 'Civil, criminal, public' } },
  { key: 'wiwi', de: 'Wirtschaftswissenschaft', en: 'Business & Economics', icon: Briefcase, sub: { de: 'BWL, VWL, Finance', en: 'Management, Economics' } },
  { key: 'mint', de: 'MINT / Ingenieur', en: 'STEM / Engineering', icon: Cpu, sub: { de: 'Maschinenbau, E-Technik', en: 'Mechanical, Electrical' } },
  { key: 'medizin', de: 'Medizin', en: 'Medicine', icon: Stethoscope, sub: { de: 'Human-, Zahn-, Pharmazie', en: 'Clinical, Pharmacology' } },
  { key: 'psycho', de: 'Psychologie', en: 'Psychology', icon: Brain, sub: { de: 'Klinisch, Sozial, Kognitiv', en: 'Clinical, social' } },
  { key: 'soz', de: 'Sozialwissenschaft', en: 'Social Sciences', icon: Users, sub: { de: 'Soziologie, Politik', en: 'Sociology, Politics' } },
  { key: 'geist', de: 'Geisteswissenschaft', en: 'Humanities', icon: BookOpen, sub: { de: 'Literatur, Philosophie', en: 'Literature, Philosophy' } },
  { key: 'info', de: 'Informatik', en: 'Computer Science', icon: Code, sub: { de: 'Data Science, KI, SW', en: 'Data, AI, Software' } },
  { key: 'natur', de: 'Naturwissenschaft', en: 'Natural Sciences', icon: Microscope, sub: { de: 'Bio, Chemie, Physik', en: 'Biology, Chemistry, Physics' } },
  { key: 'paed', de: 'Pädagogik', en: 'Education', icon: GraduationCap, sub: { de: 'Schule, Erwachsenenbildung', en: 'Teaching, adult ed.' } },
  { key: 'pol', de: 'Politik & Verwaltung', en: 'Politics & Public Admin', icon: Landmark, sub: { de: 'PolWiss, VerwWiss', en: 'Political science' } },
  { key: 'ling', de: 'Sprach- & Kulturwiss.', en: 'Languages & Culture', icon: Languages, sub: { de: 'Anglistik, Romanistik', en: 'Linguistics, cultural studies' } }
];

const Fields = ({ onPick }) => {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FIELDS;
    return FIELDS.filter((f) => (f.de + ' ' + f.en + ' ' + f.sub.de + ' ' + f.sub.en).toLowerCase().includes(s));
  }, [q]);
  const kicker = lang === 'de' ? 'Fachbereiche|Wir schreiben in Ihrer Disziplin.' : 'Disciplines|We write in your field.';
  const title = lang === 'de' ? '47 Fachbereiche. Ein Anspruch.' : '47 disciplines. One standard.';
  const lead = lang === 'de' ? 'Ob Ihr Fach hier gelistet ist oder nicht — unsere Autor:innen decken jede Disziplin ab. Suchen Sie einfach nach Ihrem Studienfach.' : 'Whether your subject is listed or not — our authors cover every discipline. Just search for your field of study.';
  const searchPlaceholder = lang === 'de' ? 'Fach suchen — z.B. „Steuerrecht“, „Neurowissenschaft“, „Data Science“ ...' : 'Search field — e.g. “Tax law”, “Neuroscience“, “Data Science” ...';
  const emptyMsg = lang === 'de' ? 'Ihr Fach ist nicht dabei? Kein Problem — fragen Sie es einfach an.' : 'Your field is not listed? No problem — just ask.';

  const pick = (label) => {
    if (onPick) onPick(label);
    const el = document.querySelector('#angebot');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="fachbereiche" className="py-24 md:py-32 bg-[#F7F3ED]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <SectionKicker text={kicker} />
        <div className="grid lg:grid-cols-12 gap-8 mb-10">
          <h2 className="lg:col-span-6 font-serif text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-[#14110F]">{title}</h2>
          <p className="lg:col-span-6 lg:pt-3 text-lg text-[#14110F]/70 leading-relaxed">{lead}</p>
        </div>
        <div className="relative mb-10 max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14110F]/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-14 pr-6 py-5 rounded-full border border-[#14110F]/15 bg-[#F0EAE0] text-[#14110F] placeholder-[#14110F]/40 focus:outline-none focus:border-[#C1613E] focus:bg-[#F7F3ED] transition-colors text-base"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((f) => {
            const Icon = f.icon;
            const label = lang === 'de' ? f.de : f.en;
            const sub = f.sub[lang];
            return (
              <button key={f.key} onClick={() => pick(label)} className="group text-left p-6 rounded-sm bg-[#F0EAE0] border border-transparent hover:border-[#14110F] hover:bg-[#F7F3ED] transition-colors">
                <div className="w-11 h-11 rounded-full border border-[#14110F]/20 flex items-center justify-center mb-4 group-hover:bg-[#C1613E] group-hover:border-[#C1613E] group-hover:text-[#F7F3ED] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-serif text-lg text-[#14110F] leading-tight">{label}</div>
                <div className="text-xs text-[#14110F]/55 mt-1">{sub}</div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="mt-8 p-6 rounded-sm bg-[#F0EAE0] border border-[#14110F]/10 text-center text-[#14110F]/70">
            {emptyMsg}
          </div>
        )}
      </div>
    </section>
  );
};

export default Fields;
