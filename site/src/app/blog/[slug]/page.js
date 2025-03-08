import { getMarkdownContent, MarkdownContent, getAllMarkdownFiles } from '@/utils/markdown';
import path from 'path';
import Link from 'next/link';
import '@/styles/markdown.css';
import Script from 'next/script';

export async function generateStaticParams() {
  const posts = getAllMarkdownFiles(path.join(process.cwd(), 'content/blog'));
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Add metadata export for better SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`);
  const { frontmatter } = getMarkdownContent(filePath);
  
  const ogImage = frontmatter.image || '/images/blog-default.jpg';
  
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.tags || [],
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      publishedTime: frontmatter.date,
      authors: ['Murphy Malcolm'],
      tags: frontmatter.tags || [],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPost({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`);
  const { content, frontmatter } = getMarkdownContent(filePath);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: frontmatter.title,
    description: frontmatter.description,
    author: {
      '@type': 'Person',
      name: 'Murphy Malcolm',
      url: 'https://murph.rip'
    },
    datePublished: frontmatter.date,
    dateModified: frontmatter.lastModified || frontmatter.date,
    image: frontmatter.image || '/images/blog-default.jpg',
    url: `https://murph.rip/blog/${slug}`,
    keywords: frontmatter.tags?.join(', '),
    publisher: {
      '@type': 'Organization',
      name: 'Murphy Malcolm',
      logo: {
        '@type': 'ImageObject',
        url: 'https://murph.rip/images/logo.png'
      }
    }
  };

  return (
    <>
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sm:px-8 mt-16 lg:mt-18">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="relative px-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-2xl lg:max-w-5xl">
              <div className="xl:relative">
                <div className="mx-auto max-w-2xl">
                  <Link
                    href="/blog"
                    aria-label="Go back to articles"
                    className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:mb-0 lg:-mt-2 xl:-top-1.5 xl:left-0 xl:mt-0"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400"
                    >
                      <path
                        d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <article className="prose prose-zinc dark:prose-invert lg:prose-xl mx-auto px-4 prose-headings:font-medium prose-p:leading-relaxed">
                    <header className="mb-8">
                      {frontmatter.date && (
                        <time 
                          dateTime={frontmatter.date} 
                          className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500"
                        >
                          <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500"></span>
                          <span className="ml-3">
                            {new Date(frontmatter.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </time>
                      )}
                      <h1 className="mb-2 !mt-0">{frontmatter.title}</h1>
                    </header>
                    <div className="markdown-content">
                      <MarkdownContent content={content} />
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 