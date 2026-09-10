// Smoke test: after `pnpm build`, assert built pages contain expected markers.
// Usage: node scripts/check-pages.mjs
import { readFileSync, existsSync } from 'node:fs';

/** [dist path, [substrings that must appear]] — tasks append rows. */
const checks = [
  ['dist/index.html', ['Murphy Malcolm', 'class="side', 'id="tweaks"', 'id="orb"', 'id="critters"', 'id="footWalk"', 'id="sideCat"', 'data-palette="ember"']],
  ['dist/articles/complexity_analysis_big_Oshit/index.html', ['Complexity Analysis', 'code-block-wrapper', 'class="toc', 'about 8 min read', 'class="prose"']],
  ['dist/articles/what-is-the-stack/index.html', ['What is the Stack?', 'code-block-wrapper']],
  ['dist/articles/index.html', ['id="flat"', 'data-view="class"', 'mich-mark', 'data-course="eecs280"']],
  ['dist/articles/eecs280/index.html', ['EECS 280', 'What is the Stack?', 'oldest first']],
  ['dist/blog/index.html', ['/articles']],
  ['dist/blog/what-is-the-stack/index.html', ['/articles/what-is-the-stack']],
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
