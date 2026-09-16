import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

const languageNames: Record<string, string> = {
  cpp: 'C++',
  cplusplus: 'C++',
  c: 'C',
  rust: 'Rust',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  go: 'Go',
  java: 'Java',
  csharp: 'C#',
  cs: 'C#',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  sql: 'SQL',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  md: 'Markdown',
  jsx: 'JSX',
  tsx: 'TSX',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  lua: 'Lua',
  perl: 'Perl',
  r: 'R',
  asm: 'Assembly',
  assembly: 'Assembly',
  pascal: 'Pascal',
  text: 'Text',
  plaintext: 'Text',
};

export function rehypeCodeWrapper() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // Wide tables (e.g. the binary/hex reference tables) get the same
      // treatment as code blocks: scroll horizontally in their own box
      // instead of widening the page on narrow viewports.
      if (node.tagName === 'table') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [node],
        };
        if (parent && typeof index === 'number') {
          (parent.children as Element[])[index] = wrapper;
        }
        return;
      }
      // Look for any pre element that might contain code
      if (node.tagName === 'pre') {
        // Extract language from data-language attribute or try other sources
        const lang = (node.properties?.dataLanguage as string) ||
          (node.properties?.['data-language'] as string) || 'text';
        const displayName = languageNames[lang] || lang.toUpperCase();

        // Create wrapper div
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-wrapper'] },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['code-block-lang'] },
              children: [{ type: 'text', value: displayName }],
            },
            node,
          ],
        };

        // Replace the pre node with the wrapper
        if (parent && typeof index === 'number') {
          (parent.children as Element[])[index] = wrapper;
        }
      }
    });
  };
}
