import { getAllMarkdownFiles } from '@/utils/markdown';
import path from 'path';
import BlogPagination from './BlogPagination';

export default function Blog() {
  // This runs on the server
  const allArticles = getAllMarkdownFiles(path.join(process.cwd(), 'content/blog'))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="sm:px-8 mt-16 sm:mt-18">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="relative px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl lg:max-w-5xl">
            <header className="max-w-full">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                Keyboard Warrior&apos;s Manifesto.
              </h1>
              <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                This is here to enable me to share information that I find useful, or just complain about any range of issue(s) at all :).
              </p>
            </header>

            <div className="mt-16 sm:mt-20">
              <BlogPagination articles={allArticles} articlesPerPage={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}