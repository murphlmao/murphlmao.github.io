import Link from 'next/link';
import Image from 'next/image';
import InfiniteArticleList from './InfiniteArticleList';
import CategoryNav from './CategoryNav';
import { MarkdownContent } from '@/utils/markdown';

// Render icon - supports emojis, image paths, or nothing
function Icon({ icon, size = 16, className = "" }) {
  if (!icon) return null;

  if (icon.startsWith('/')) {
    return (
      <Image
        src={icon}
        alt=""
        width={size}
        height={size}
        className={`inline-block ${className}`}
      />
    );
  }

  return <span className={className}>{icon}</span>;
}

export default function CategoryPage({ category, posts, headers, postCounts }) {
  const sortedPosts = [...posts].sort((a, b) => {
    const dateCompare = new Date(b.date) - new Date(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.order || 0) - (a.order || 0);
  });

  return (
    <div className="sm:px-8 mt-16 sm:mt-18">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="relative px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl lg:max-w-6xl">
            {/* Back link */}
            <Link
              href="/articles"
              className="group mb-8 inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="mr-2 h-4 w-4 stroke-current"
              >
                <path
                  d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to all posts
            </Link>

            {/* Header */}
            <header className="max-w-full mb-12">
              <p className="text-sm font-medium text-sky-500 dark:text-sky-400 mb-2">
                {category.headerName}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl flex items-center gap-3">
                {category.showIconInHeader && <Icon icon={category.icon} size={40} />}
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
                  {category.description}
                </p>
              )}
              {category.content && (
                <div className="mt-6 prose prose-zinc dark:prose-invert prose-sm max-w-none">
                  <MarkdownContent content={category.content} />
                </div>
              )}
            </header>

            {/* Two-column layout */}
            <div className="lg:flex lg:gap-12">
              {/* Posts list */}
              <div className="lg:flex-1 lg:min-w-0">
                {sortedPosts.length > 0 ? (
                  <InfiniteArticleList articles={sortedPosts} />
                ) : (
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No posts in this category yet.
                  </p>
                )}
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                <div className="sticky top-8">
                  <CategoryNav headers={headers} postCounts={postCounts} />
                </div>
              </aside>
            </div>

            {/* Mobile category nav */}
            <div className="mt-12 lg:hidden">
              <CategoryNav headers={headers} postCounts={postCounts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
