'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { LuLink, LuCheck } from 'react-icons/lu';
import dynamic from 'next/dynamic';

const CodeBlock = dynamic(() => import('./CodeBlock'), {
  ssr: false
});

const HeadingWithAnchor = ({ level, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const Tag = `h${level}`;

  const handleCopy = (e) => {
    e.preventDefault();
    const id = props.id;
    if (id) {
      const fullUrl = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(fullUrl).then(() => {
        window.history.pushState(null, '', `#${id}`);
        setIsVisible(true);
        setCopied(true);
        setTimeout(() => {
          // Start fading out
          setIsVisible(false);
          // Switch icon back after fade completes
          setTimeout(() => setCopied(false), 150);
        }, 800);
      });
    }
  };

  return (
    <Tag {...props} className="group">
      {children}
      {props.id && (
        <button
          onClick={handleCopy}
          className={`heading-link-button ${isVisible ? 'keep-visible' : ''}`}
          aria-label="Copy link to heading"
        >
          <span className={`copy-icon ${copied ? 'copied' : ''}`}>
            {copied ? <LuCheck /> : <LuLink />}
          </span>
        </button>
      )}
    </Tag>
  );
};

const ClientMarkdownContent = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          h1: (props) => <HeadingWithAnchor level={1} {...props} />,
          h2: (props) => <HeadingWithAnchor level={2} {...props} />,
          h3: (props) => <HeadingWithAnchor level={3} {...props} />,
          h4: (props) => <HeadingWithAnchor level={4} {...props} />,
          h5: (props) => <HeadingWithAnchor level={5} {...props} />,
          h6: (props) => <HeadingWithAnchor level={6} {...props} />,
          code({ className, children, ...props }) {
            const isCodeBlock = String(children).includes('\n');

            if (!isCodeBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock className={className} {...props}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ClientMarkdownContent;