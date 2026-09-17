// Smoke test: after `pnpm build`, assert built pages contain expected markers.
// Usage: node scripts/check-pages.mjs
import { readFileSync, existsSync } from 'node:fs';

/** [dist path, [substrings that must appear]] — tasks append rows. */
const checks = [
  ['dist/index.html', ['Murphy Malcolm', 'class="side', 'id="tweaks"', 'id="orb"', 'id="critters"', 'id="footWalk"', 'id="sideCat"', 'data-palette="ember"', 'class="hl"', 'data-scene="home"', 'class="rail', 'all 13 articles']],
  ['dist/articles/binary-search-trees/index.html', ['Binary Search Trees', 'code-block-wrapper', 'class="toc', 'class="prose"']],
  ['dist/articles/what-is-the-stack/index.html', ['What is the Stack?', 'code-block-wrapper']],
  ['dist/articles/index.html', ['id="flat"', 'data-view="class"', 'mich-mark', 'data-course="eecs280"']],
  ['dist/articles/eecs280/index.html', ['EECS 280', 'What is the Stack?', 'oldest first']],
  ['dist/blog/index.html', ['/articles']],
  ['dist/blog/what-is-the-stack/index.html', ['/articles/what-is-the-stack']],
  ['dist/resume/index.html', ['Murphy Malcolm', 'Responsive Egg Flow', 'GPA 3.90', 'ITF+', '<details', 'rs-p-create-py-app', 'Download PDF']],
  ['dist/projects/index.html', ['resume']],
  ['dist/resources/index.html', ['Conventional Commits', 'class="res__tile', 'Divisible Cat', 'Premature Optimization Triangle']],
  ['dist/resources/premature-optimization/index.html', ['optimization_triangle']],
  ['dist/snippets/index.html', ['/resources']],
  ['dist/snippets/divisible_cat/index.html', ['/resources/divisible_cat']],
  ['dist/deer/index.html', ['2008 Jeep Liberty']],
  ['dist/404.html', ['404']],
  ['dist/statue/index.html', ['coming soon', 'main_cloud_1400_7.gif', 'href="/statue/1"']],
  ['dist/statue/12/index.html', ['main_cloud_1400_1.gif', 'manheadwhat2.gif', 'href="/statue/1"']],
  ['dist/statue/9/index.html', ['pine_01.gif', 'href="/statue/10"']],
];

/** dist paths that must NOT exist — content blacklisted in src/content/publish.ts. */
const absent = [
  'dist/articles/eecs370/index.html',
  'dist/articles/eecs298/index.html',
  'dist/articles/binary_hex/index.html',
];

let failures = 0;
for (const file of absent) {
  if (existsSync(file)) { console.error(`PRESENT (should be blacklisted) ${file}`); failures++; }
}
for (const [file, needles] of checks) {
  if (!existsSync(file)) { console.error(`MISSING ${file}`); failures++; continue; }
  const html = readFileSync(file, 'utf8');
  for (const needle of needles) {
    if (!html.includes(needle)) { console.error(`${file}: missing "${needle}"`); failures++; }
  }
}
if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log(`ok: ${checks.length} page(s) checked, ${absent.length} blacklisted path(s) absent`);
