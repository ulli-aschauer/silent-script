// Fachbereiche – gemeinsam genutzt von Website, Autorenportal und Backend (Matching).
export const FIELDS = [
  { key: 'jura', de: 'Rechtswissenschaft', en: 'Law', sub: { de: 'Zivil-, Straf-, Öff. Recht', en: 'Civil, criminal, public' } },
  { key: 'wiwi', de: 'Wirtschaftswissenschaft', en: 'Business & Economics', sub: { de: 'BWL, VWL, Finance', en: 'Management, Economics' } },
  { key: 'mint', de: 'MINT / Ingenieur', en: 'STEM / Engineering', sub: { de: 'Maschinenbau, E-Technik', en: 'Mechanical, Electrical' } },
  { key: 'medizin', de: 'Medizin', en: 'Medicine', sub: { de: 'Human-, Zahn-, Pharmazie', en: 'Clinical, Pharmacology' } },
  { key: 'psycho', de: 'Psychologie', en: 'Psychology', sub: { de: 'Klinisch, Sozial, Kognitiv', en: 'Clinical, social' } },
  { key: 'soz', de: 'Sozialwissenschaft', en: 'Social Sciences', sub: { de: 'Soziologie, Politik', en: 'Sociology, Politics' } },
  { key: 'geist', de: 'Geisteswissenschaft', en: 'Humanities', sub: { de: 'Literatur, Philosophie', en: 'Literature, Philosophy' } },
  { key: 'info', de: 'Informatik', en: 'Computer Science', sub: { de: 'Data Science, KI, SW', en: 'Data, AI, Software' } },
  { key: 'natur', de: 'Naturwissenschaft', en: 'Natural Sciences', sub: { de: 'Bio, Chemie, Physik', en: 'Biology, Chemistry, Physics' } },
  { key: 'paed', de: 'Pädagogik', en: 'Education', sub: { de: 'Schule, Erwachsenenbildung', en: 'Teaching, adult ed.' } },
  { key: 'pol', de: 'Politik & Verwaltung', en: 'Politics & Public Admin', sub: { de: 'PolWiss, VerwWiss', en: 'Political science' } },
  { key: 'ling', de: 'Sprach- & Kulturwiss.', en: 'Languages & Culture', sub: { de: 'Anglistik, Romanistik', en: 'Linguistics, cultural studies' } },
];

export const FIELD_KEYS = FIELDS.map((f) => f.key);
export const fieldLabel = (key, lang = 'de') => FIELDS.find((f) => f.key === key)?.[lang] || key;

export const WORK_TYPES = [
  { key: 'bachelor', de: 'Bachelorarbeit', en: "Bachelor's thesis" },
  { key: 'master', de: 'Masterarbeit', en: "Master's thesis" },
  { key: 'diss', de: 'Dissertation', en: 'Dissertation' },
  { key: 'hausarbeit', de: 'Hausarbeit / Seminararbeit', en: 'Term paper' },
  { key: 'paper', de: 'Paper / Fachartikel', en: 'Paper / article' },
  { key: 'sonstiges', de: 'Sonstiges', en: 'Other' },
];
export const WORK_TYPE_KEYS = WORK_TYPES.map((w) => w.key);
export const workTypeLabel = (key, lang = 'de') => WORK_TYPES.find((w) => w.key === key)?.[lang] || key;
