"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function BlogPagination({ articles, articlesPerPage }) {
  // Pagination settings
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  // Get current articles for the page
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
      <div className="flex max-w-2xl flex-col space-y-16">
        {currentArticles.map((article) => {
          // Use categoryName from the article data (already populated by server)
          const categoryName = article.categoryName || null;
          return (
            <article
              key={article.slug}
              className="md:grid md:grid-cols-4 md:items-baseline"
            >
              <div className="md:col-span-3 group relative flex flex-col items-start">
                <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                <div className="absolute -inset-y-6 -inset-x-4 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl"></div>

                  <Link href={`/blog/${article.slug}`} className="hover:text-sky-500 dark:hover:text-sky-400">
                    <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                    <span className="relative z-10">{article.title}</span>
                  </Link>
                </h2>
                <div
                  className="md:hidden relative z-10 order-first mb-3 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500 pl-3.5"
                >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700/40 pt-6">
          <div className="flex w-0 flex-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${
                currentPage === 1
                  ? 'cursor-not-allowed text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
              Previous
            </button>
          </div>
          <div className="hidden md:flex">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                  currentPage === i + 1
                    ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                    : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex w-0 flex-1 justify-end">
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${
                currentPage === totalPages
                  ? 'cursor-not-allowed text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              Next
              <svg
                className="ml-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}