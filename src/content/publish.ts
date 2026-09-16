/* Publish manifest — a blacklist. Anything listed here is hidden from the whole site:
   no page is built for it, no link points to it, and it is left out of every count
   (articles index, course pages, home rail, resume course line, stats).

   Slugs are the folder or file names under src/content/blog/:
     headers     -> src/content/blog/<header>/
     categories  -> src/content/blog/<header>/<category>/
     articles    -> src/content/blog/<header>/<category>/<article>.md (no extension)

   To preview everything locally, including blacklisted content:
     PUBLISH_ALL=1 pnpm dev */

export const blacklist = {
  headers: [] as string[],
  categories: ['eecs298', 'eecs370'],
  articles: [] as string[],
};

/** True when PUBLISH_ALL=1 is set in the environment; the blacklist is then ignored. */
export const publishAll = process.env.PUBLISH_ALL === '1';

export const isHiddenHeader = (slug: string) => !publishAll && blacklist.headers.includes(slug);
export const isHiddenCategory = (slug: string) => !publishAll && blacklist.categories.includes(slug);
export const isHiddenArticle = (slug: string) => !publishAll && blacklist.articles.includes(slug);
