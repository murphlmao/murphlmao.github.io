"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const ARTICLES_PER_LOAD = 25;

export default function InfiniteArticleList({ articles }) {
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_LOAD);
  const loaderRef = useRef(null);

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + ARTICLES_PER_LOAD, articles.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, articles.length]);

  return (
    <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
      <div className="flex max-w-2xl flex-col space-y-16">
        {visibleArticles.map((article) => {
          const categoryName = article.categoryName || null;
          return (
            <article
              key={article.slug}
              className="md:grid md:grid-cols-4 md:items-baseline"
            >
              <div className="md:col-span-3 group relative flex flex-col items-start">
                <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                  <div className="absolute -inset-y-6 -inset-x-4 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl"></div>
                  <Link href={`/articles/${article.slug}`} className="hover:text-sky-500 dark:hover:text-sky-400">
                    <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                    <span className="relative z-10">{article.title}</span>
                  </Link>
                </h2>
                <div className="md:hidden relative z-10 order-first mb-3 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500 pl-3.5">
                  <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                    <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                  </span>
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                  {categoryName && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <span className="text-sky-500 dark:text-sky-400">{categoryName}</span>
                    </>
                  )}
                </div>
                <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {article.description}
                </p>
                <div
                  aria-hidden="true"
                  className="relative z-10 mt-4 flex items-center text-sm font-medium text-sky-500"
                >
                  Read article
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="ml-1 h-4 w-4 stroke-current"
                  >
                    <path
                      d="M6.75 5.75 9.25 8l-2.5 2.25"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-1 hidden md:flex md:flex-col relative z-10 order-first mb-3 text-sm text-zinc-400 dark:text-zinc-500">
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
                {categoryName && (
                  <span className="mt-1 text-sky-500 dark:text-sky-400">{categoryName}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Loader trigger */}
      {hasMore && (
        <div ref={loaderRef} className="mt-12 flex justify-center py-4">
          <span className="text-sm text-zinc-400 dark:text-zinc-500">Loading more...</span>
        </div>
      )}
    </div>
  );
}
