// Ergänzt Tailwind-Klassen, die in der übernommenen index.css (Original) fehlen.
// Aufruf: npm run css:extra  → schreibt src/extra.css
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

const root = path.resolve(import.meta.dirname, '..');
const original = postcss.parse(fs.readFileSync(path.join(root, 'src/index.css'), 'utf8'));

// Alle Selektoren der Original-CSS (inkl. Media-Query als Schlüssel)
const key = (rule) => {
  const media = rule.parent?.type === 'atrule' ? `@${rule.parent.name} ${rule.parent.params}|` : '';
  return media + rule.selector;
};
const existing = new Set();
original.walkRules((r) => existing.add(key(r)));

const config = {
  content: [path.join(root, 'src/**/*.{js,jsx}')],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    },
  },
};

const input = '@tailwind utilities;';
const result = await postcss([tailwind(config)]).process(input, { from: undefined });
const out = postcss.parse(result.css);
let added = 0;
out.walkRules((r) => {
  if (existing.has(key(r))) r.remove();
  else added++;
});
out.walkAtRules((a) => { if (!a.nodes || a.nodes.length === 0) a.remove(); });

const header = '/* Automatisch erzeugt mit "npm run css:extra" – nicht von Hand bearbeiten. */\n';
fs.writeFileSync(path.join(root, 'src/extra.css'), header + out.toString() + '\n');
console.log(`extra.css: ${added} ergänzte Regeln`);
