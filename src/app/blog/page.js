import { getAllMarkdownFiles, getBlogStructure } from '@/utils/markdown';
import path from 'path';
import BlogPagination from './BlogPagination';
import CategoryNav from './CategoryNav';

const blogDir = path.join(process.cwd(), 'content/blog');

export default function Blog() {
  // Get blog structure (headers and categories) from file system
  const headers = getBlogStructure(blogDir);

  // Get all posts sorted by date
  const allArticles = getAllMarkdownFiles(blogDir)
    .sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (b.order || 0) - (a.order || 0);
    });

  // Calculate post counts per category
  const postCounts = allArticles.reduce((acc, article) => {
    if (article.category) {
      acc[article.category] = (acc[article.category] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="sm:px-8 mt-16 sm:mt-18">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="relative px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl lg:max-w-6xl">
            <header className="max-w-full">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                Keyboard Warrior&apos;s Manifesto.
              </h1>
              <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                This is where I share things I find useful and occasionally complain about various issues :).
              </p>
            </header>

            {/* Two-column layout */}
            <div className="mt-16 sm:mt-20 lg:flex lg:gap-12">
              {/* Recent posts (left column) */}
              <div className="lg:flex-1 lg:min-w-0">
                <h2 className="sr-only">Recent Posts</h2>
                <BlogPagination articles={allArticles} articlesPerPage={5} />
              </div>

              {/* Category navigation (right column) */}
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