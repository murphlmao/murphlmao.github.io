// Smoke test: after `pnpm build`, assert built pages contain expected markers.
// Usage: node scripts/check-pages.mjs
import { readFileSync, existsSync } from 'node:fs';

/** [dist path, [substrings that must appear]] — tasks append rows. */
const checks = [
  ['dist/index.html', ['Murphy Malcolm']],
];

let failures = 0;
for (const [file, needles] of checks) {
  if (!existsSync(file)) { console.error(`MISSING ${file}`); failures++; continue; }
  const html = readFileSync(file, 'utf8');
  for (const needle of needles) {
    if (!html.includes(needle)) { console.error(`${file}: missing "${needle}"`); failures++; }
  }
}
if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log(`ok: ${checks.length} page(s) checked`);
