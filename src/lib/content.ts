import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Filesystem readers for the blog folder structure: src/content/blog/<header>/<category>/.
// A directory is a header when it has _header.md, a category when it has _category.md.
// Post bodies come from the Astro content collection (src/lib/site.ts), not from here.

export interface Category {
  slug: string;
  headerSlug: string;
  headerName: string;
  name: string;
  description: string;
  order: number;
  icon: string | null;
  showIconInHeader: boolean;
  content: string | null;
}

export interface Header {
  slug: string;
  name: string;
  description: string;
  order: number;
  icon: string | null;
  content: string | null;
  categories: Category[];
}

function getBlogDir(): string {
  return path.join(process.cwd(), 'src/content/blog');
}

// Get the full blog structure: headers -> categories
export function getBlogStructure(): Header[] {
  const blogDir = getBlogDir();
  const headers: Header[] = [];
  const entries = fs.readdirSync(blogDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const headerPath = path.join(blogDir, entry.name);
    const headerMetaPath = path.join(headerPath, '_header.md');

    // Skip directories without _header.md
    if (!fs.existsSync(headerMetaPath)) continue;

    const { data: headerMeta, content: headerContent } = matter(
      fs.readFileSync(headerMetaPath, 'utf8')
    );

    const header: Header = {
      slug: entry.name,
      name: (headerMeta.name as string) || entry.name,
      description: (headerMeta.description as string) || '',
      order: (headerMeta.order as number) || 0,
      icon: (headerMeta.icon as string) || null,
      content: headerContent.trim() || null,
      categories: [],
    };

    // Scan for category directories
    const categoryEntries = fs.readdirSync(headerPath, { withFileTypes: true });
    for (const catEntry of categoryEntries) {
      if (!catEntry.isDirectory()) continue;

      const categoryPath = path.join(headerPath, catEntry.name);
      const categoryMetaPath = path.join(categoryPath, '_category.md');

      // Skip directories without _category.md
      if (!fs.existsSync(categoryMetaPath)) continue;

      const { data: catMeta, content: catContent } = matter(
        fs.readFileSync(categoryMetaPath, 'utf8')
      );

      header.categories.push({
        slug: catEntry.name,
        headerSlug: entry.name,
        headerName: header.name,
        name: (catMeta.name as string) || catEntry.name,
        description: (catMeta.description as string) || '',
        order: (catMeta.order as number) || 0,
        icon: (catMeta.icon as string) || null,
        showIconInHeader: catMeta.showIconInHeader !== false,
        content: catContent.trim() || null,
      });
    }

    // Sort categories by order
    header.categories.sort((a, b) => a.order - b.order);
    headers.push(header);
  }

  // Sort headers by order
  headers.sort((a, b) => a.order - b.order);
  return headers;
}

// Get all category slugs
export function getAllCategorySlugs(): string[] {
  return getBlogStructure().flatMap((header) => header.categories.map((cat) => cat.slug));
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | null {
  for (const header of getBlogStructure()) {
    const category = header.categories.find((cat) => cat.slug === slug);
    if (category) return category;
  }
  return null;
}
