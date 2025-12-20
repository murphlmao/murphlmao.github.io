import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardDocumentListIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

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
  pascal: 'Pascal',
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
};

interface CodeBlockProps {
  children: string;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract the language from className (format: language-*)
  const match = /language-([\w+#]+)/.exec(className || '');
  const language = match ? match[1] : '';
  const displayName = languageNames[language] || language.toUpperCase();

  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      {language && (
        <span className="absolute left-3 top-2 text-xs text-zinc-500">{displayName}</span>
      )}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 invisible group-hover:visible bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-100 rounded-md p-2 transition-colors z-10"
        aria-label={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="h-5 w-5" />
        ) : (
          <ClipboardDocumentListIcon className="h-5 w-5" />
        )}
      </button>
      <pre>
        <SyntaxHighlighter
          language={language}
          style={dracula}
          customStyle={{
            margin: 0,
            padding: language ? '2rem 1rem 1rem 1rem' : '1rem',
            background: '#090915',
          }}
        >
          {children}
        </SyntaxHighlighter>
      </pre>
    </div>
  );
}
