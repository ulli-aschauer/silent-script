// Gemeinsame Bausteine für Autorenportal, Admin und Kundenbestätigung – im Stil der Website.
import React from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import ghostLogo from '../assets/brand/ghost-dark.png';
import { FIELDS, fieldLabel, workTypeLabel } from '../data/fields';
import { url } from '../config';

// Name mit Titel, z.B. "Dr. Maria Beispiel"
export const fullName = (a) => [a?.title, a?.display_name].filter(Boolean).join(' ');

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '');
export const euro = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

export const inputCls = 'w-full bg-transparent border-b border-[#14110F]/25 py-3 text-[#14110F] placeholder-[#14110F]/40 focus:outline-none focus:border-[#C1613E] transition-colors';
export const btnDark = 'inline-flex items-center justify-center gap-2 bg-[#14110F] text-[#F7F3ED] px-6 py-3 rounded-full text-sm hover:bg-[#C1613E] transition-colors disabled:opacity-60';
export const btnLight = 'inline-flex items-center justify-center gap-2 border border-[#14110F]/20 text-[#14110F] px-6 py-3 rounded-full text-sm hover:border-[#C1613E] hover:text-[#C1613E] transition-colors disabled:opacity-60';
export const card = 'bg-[#F0EAE0] rounded-sm border border-[#14110F]/10';
export const kicker = 'text-[10px] uppercase tracking-widest';

export const Brand = ({ area }) => (
  <a href={url('/')} className="flex items-center gap-2">
    <img src={ghostLogo} alt="" aria-hidden="true" className="h-8" style={{ width: 'auto' }} />
    <span className="font-serif text-2xl text-[#14110F]">Silent Script<span className="text-[#C1613E]">.</span></span>
    {area && <span className={`${kicker} text-[#14110F]/50 ml-2 hidden sm:inline`}>{area}</span>}
  </a>
);

export const PortalHeader = ({ area, right, onRefresh, onLogout }) => (
  <header className="border-b border-[#14110F]/10 bg-[#F7F3ED] sticky top-0 z-10">
    <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
      <Brand area={area} />
      <div className="flex items-center gap-4">
        {right}
        {onRefresh && <button onClick={onRefresh} title="Aktualisieren" className="text-[#14110F]/70 hover:text-[#C1613E]"><RefreshCw className="w-4 h-4" /></button>}
        {onLogout && <button onClick={onLogout} className="text-sm text-[#14110F]/70 hover:text-[#C1613E] flex items-center gap-1.5"><LogOut className="w-4 h-4" /> Abmelden</button>}
      </div>
    </div>
  </header>
);

export const DemoBanner = () => (
  <div className="bg-[#C1613E] text-[#F7F3ED] text-center text-sm py-2 px-4">
    Testansicht mit Beispieldaten — es wird nichts gespeichert oder versendet.
  </div>
);

export const Toggle = ({ checked, onChange, label, hint, disabled }) => (
  <label className={`flex items-start gap-4 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#6B7A3E]' : 'bg-[#14110F]/20'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#F7F3ED] transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
    <span>
      <span className="block text-sm text-[#14110F]">{label}</span>
      {hint && <span className="block text-xs text-[#14110F]/55 mt-0.5">{hint}</span>}
    </span>
  </label>
);

export const FieldPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {FIELDS.map((f) => {
      const on = value.includes(f.key);
      return (
        <button
          type="button" key={f.key}
          onClick={() => onChange(on ? value.filter((k) => k !== f.key) : [...value, f.key])}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on ? 'bg-[#14110F] text-[#F7F3ED] border-[#14110F]' : 'border-[#14110F]/20 text-[#14110F]/75 hover:border-[#C1613E] hover:text-[#C1613E]'}`}
        >
          {f.de}
        </button>
      );
    })}
  </div>
);

export const FieldChips = ({ fields = [] }) => (
  <div className="flex flex-wrap gap-1.5">
    {fields.map((k) => <span key={k} className="px-2 py-0.5 rounded-full bg-[#14110F]/5 text-[11px] text-[#14110F]/70">{fieldLabel(k)}</span>)}
  </div>
);

export const Stat = ({ label, value, accent }) => (
  <div className={`${card} p-5`}>
    <div className={`${kicker} text-[#14110F]/50 mb-2`}>{label}</div>
    <div className={`font-serif text-3xl ${accent ? 'text-[#C1613E]' : 'text-[#14110F]'}`}>{value}</div>
  </div>
);

export const Meta = ({ label, children }) => (
  <div>
    <div className={`${kicker} text-[#14110F]/50`}>{label}</div>
    <div className="text-sm text-[#14110F]">{children || '—'}</div>
  </div>
);

// Kopf einer Auftragskarte: Fachbereich, Art, Thema
export const OrderHead = ({ o, right }) => (
  <div className="flex flex-wrap-reverse sm:flex-nowrap items-start justify-between gap-x-4 gap-y-2 mb-4">
    <div className="min-w-0">
      <div className={`${kicker} text-[#C1613E]`}>{fieldLabel(o.field)} · {workTypeLabel(o.work_type)}</div>
      <div className="font-serif text-xl text-[#14110F] mt-1 leading-snug">{o.topic}</div>
    </div>
    <div className="sm:text-right sm:shrink-0">
      <div className="text-xs font-mono text-[#14110F]/50">{o.code}</div>
      {right}
    </div>
  </div>
);

export const OrderFacts = ({ o }) => (
  <div className="grid grid-cols-3 gap-3 mb-4">
    <Meta label="Umfang">{o.pages ? `${o.pages} Seiten` : ''}</Meta>
    <Meta label="Frist">{o.deadline}</Meta>
    <Meta label="Honorar">{o.fee_final || o.fee || 'nach Absprache'}</Meta>
  </div>
);

// Status einer Bewerbung als verständlicher Text + Farbe
export const APP_STATUS = {
  applied: { label: 'Beworben – Team prüft', tone: 'neutral' },
  proposed: { label: 'Kunde prüft Ihr Profil', tone: 'accent' },
  meeting: { label: 'Erstgespräch', tone: 'green' },
  declined_by_customer: { label: 'Vom Kunden abgelehnt', tone: 'muted' },
  no_match: { label: 'Kein Match', tone: 'muted' },
  not_selected: { label: 'Andere Person ausgewählt', tone: 'muted' },
  withdrawn: { label: 'Zurückgezogen', tone: 'muted' },
  matched: { label: 'Zusammenarbeit vereinbart', tone: 'green' },
};

export const ORDER_STATUS = {
  open: { label: 'Offen', tone: 'green' },
  proposed: { label: 'Kunde prüft Autor:in', tone: 'accent' },
  meeting: { label: 'Erstgespräch', tone: 'accent' },
  in_progress: { label: 'In Arbeit', tone: 'dark' },
  completed: { label: 'Abgeschlossen', tone: 'muted' },
  cancelled: { label: 'Storniert', tone: 'muted' },
};

const TONES = {
  neutral: 'bg-[#14110F]/10 text-[#14110F]/70',
  accent: 'bg-[#C1613E]/15 text-[#C1613E]',
  green: 'bg-[#6B7A3E]/15 text-[#6B7A3E]',
  dark: 'bg-[#14110F] text-[#F7F3ED]',
  muted: 'bg-[#14110F]/5 text-[#14110F]/45',
};

export const Badge = ({ status, map }) => {
  const s = map[status] || { label: status, tone: 'neutral' };
  return <span className={`inline-block text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap ${TONES[s.tone]}`}>{s.label}</span>;
};

export const Empty = ({ children }) => (
  <div className={`${card} p-8 text-center text-[#14110F]/60`}>{children}</div>
);

export const ErrorText = ({ children }) => (children ? <div className="text-sm text-red-700">{children}</div> : null);
