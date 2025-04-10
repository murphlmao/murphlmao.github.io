'use client';

import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

const CodeBlock = dynamic(() => import('./CodeBlock'), {
  ssr: false
});

const ClientMarkdownContent = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
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