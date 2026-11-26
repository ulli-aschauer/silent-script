import React from 'react';
import { useLang } from '../i18n/LanguageContext';

const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="bg-[#14110F] text-[#F7F3ED] py-16">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-10 mb-14">
          <div className="md:col-span-2">
            <div className="font-serif text-3xl mb-3">Silent Script<span className="text-[#C1613E]">.</span></div>
            <p className="text-[#F7F3ED]/60 max-w-sm leading-relaxed">{t.footer.tag}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#C1613E] mb-4">{t.footer.col2}</div>
            <div className="space-y-2 text-[#F7F3ED]/70">
              <div>kontakt@silent-script.com</div>
              <div>www.silent-script.com</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#C1613E] mb-4">{t.footer.col3}</div>
            <ul className="space-y-2">
              {t.footer.links.map((l) => (
                <li key={l}><a href="#" className="text-[#F7F3ED]/70 hover:text-[#C1613E] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#F7F3ED]/10 pt-6 text-xs text-[#F7F3ED]/40 flex flex-wrap justify-between gap-2">
          <div>{t.footer.copy}</div>
          <div>Made silently.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
