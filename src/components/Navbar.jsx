import React, { useState, useEffect } from 'react';
import { useLang } from '../i18n/LanguageContext';
import { Menu, X, Languages } from 'lucide-react';
import { url } from '../config';
import ghostLogo from '../assets/brand/ghost-dark.png';

const Navbar = () => {
  const { t, toggle, lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#about', label: t.nav.about },
    { href: '#services', label: t.nav.services },
    { href: '#fachbereiche', label: t.nav.authors },
    { href: '#process', label: t.nav.process },
    { href: '#contact', label: t.nav.contact }
  ];

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${scrolled ? 'bg-[#F7F3ED]/95 backdrop-blur border-b border-[#1A1A1A]/10' : 'bg-transparent'}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#top" onClick={(e) => scrollTo(e, '#top')} className="flex items-center gap-2">
          <img src={ghostLogo} alt="" aria-hidden="true" className="h-9" style={{ width: "auto" }} />
          <span className="font-serif text-2xl tracking-tight text-[#14110F]">Silent Script<span className="text-[#C1613E]">.</span></span>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)} className="text-sm text-[#14110F] hover:text-[#C1613E] transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C1613E] transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={url('/autoren')} className="hidden md:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#14110F]/70 hover:text-[#C1613E] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B7A3E] animate-pulse"></span>
            Autoren-Login
          </a>
          <button onClick={toggle} className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#14110F] hover:text-[#C1613E] transition-colors border border-[#14110F]/20 hover:border-[#C1613E] rounded-full px-3 py-1.5">
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'de' ? 'EN' : 'DE'}</span>
          </button>
          <button className="lg:hidden text-[#14110F]" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-[#F7F3ED] border-t border-[#1A1A1A]/10">
          <div className="px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)} className="text-base text-[#14110F]">{l.label}</a>
            ))}
            <a href={url('/autoren')} className="text-base text-[#C1613E] flex items-center gap-2 pt-4 border-t border-[#14110F]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7A3E]"></span>
              Autoren-Login
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
