import {
  getMarkdownContent,
  MarkdownContent,
  getAllMarkdownFiles,
  getPostFilePath,
  getPostsByCategory,
  isCategorySlug,
  getCategoryBySlug,
  getAllCategorySlugs,
  getBlogStructure
} from '@/utils/markdown';
import path from 'path';
import Link from 'next/link';
import '@/styles/markdown.css';
import Script from 'next/script';
import CategoryPage from '../CategoryPage';

const blogDir = path.join(process.cwd(), 'content/blog');

export async function generateStaticParams() {
  const posts = getAllMarkdownFiles(blogDir);
  const categorySlugs = getAllCategorySlugs(blogDir);

  // Include both post slugs and category slugs
  const postParams = posts.map((post) => ({ slug: post.slug }));
  const categoryParams = categorySlugs.map((slug) => ({ slug }));

  return [...postParams, ...categoryParams];
}

// Add metadata export for better SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Check if this is a category
  if (isCategorySlug(blogDir, slug)) {
    const category = getCategoryBySlug(blogDir, slug);
    return {
      title: `${category.name} - Articles`,
      description: category.description,
      openGraph: {
        title: `${category.name} - Articles`,
        description: category.description,
        type: 'website',
      },
    };
  }

  // It's a blog post
  const filePath = getPostFilePath(blogDir, slug);
  if (!filePath) {
    return { title: 'Post Not Found' };
  }

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

export default async function BlogPostOrCategory({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Check if this is a category page
  if (isCategorySlug(blogDir, slug)) {
    const category = getCategoryBySlug(blogDir, slug);
    const posts = getPostsByCategory(blogDir, slug);
    const headers = getBlogStructure(blogDir);
    const allPosts = getAllMarkdownFiles(blogDir);

    // Calculate post counts for sidebar
    const postCounts = allPosts.reduce((acc, post) => {
      if (post.category) {
        acc[post.category] = (acc[post.category] || 0) + 1;
      }
      return acc;
    }, {});

    return <CategoryPage category={category} posts={posts} headers={headers} postCounts={postCounts} />;
  }

  // It's a blog post
  const filePath = getPostFilePath(blogDir, slug);
  const { content, frontmatter } = getMarkdownContent(filePath);

  // Get category info for breadcrumb
  const currentPost = getAllMarkdownFiles(blogDir).find(p => p.slug === slug);
  const categoryInfo = currentPost?.category ? getCategoryBySlug(blogDir, currentPost.category) : null;

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
    url: `https://murph.rip/articles/${slug}`,
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
                    href="/articles"
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
                      <div className="order-first flex items-center gap-3 text-base text-zinc-400 dark:text-zinc-500 mb-4">
                        <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500"></span>
                        {frontmatter.date && (
                          <time dateTime={frontmatter.date}>
                            {new Date(frontmatter.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </time>
                        )}
                        {categoryInfo && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            <Link
                              href={`/articles/${categoryInfo.slug}`}
                              className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 no-underline"
                            >
                              {categoryInfo.name}
                            </Link>
                          </>
                        )}
                      </div>
                      <h1 className="mb-2 !mt-0">{frontmatter.title}</h1>
                    </header>
                    <div className="markdown-content">
                    <MarkdownContent content={content} />

                    {/* remove this later lol */}
                    {/* <Image src="/just_a_chill_guy.jfif" alt="A chill guy" width={500} height={500} />
                    <audio autoPlay>
                      <source src="/chill_guy_man.mp3" type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio> */}
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