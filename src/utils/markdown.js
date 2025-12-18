import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ClientMarkdownContent from '@/components/ClientMarkdownContent';

export function getMarkdownContent(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content: markdownContent } = matter(fileContents);
  return { frontmatter, content: markdownContent };
}

export function MarkdownContent({ content }) {
  return <ClientMarkdownContent content={content} />;
}

// Get all markdown files from a flat directory (no nested structure)
export function getFlatMarkdownFiles(directory) {
  const files = fs.readdirSync(directory);
  return files
    .filter(file => file.endsWith('.md') && !file.startsWith('_'))
    .map(file => {
      const filePath = path.join(directory, file);
      const { data } = matter(fs.readFileSync(filePath, 'utf8'));
      return {
        slug: file.replace('.md', ''),
        ...data
      };
    });
}

// Get the full blog structure: headers -> categories -> posts
export function getBlogStructure(blogDir) {
  const headers = [];
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

    const header = {
      slug: entry.name,
      name: headerMeta.name || entry.name,
      description: headerMeta.description || '',
      order: headerMeta.order || 0,
      icon: headerMeta.icon || null,
      content: headerContent.trim() || null,
      categories: []
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

      const category = {
        slug: catEntry.name,
        headerSlug: entry.name,
        headerName: header.name,
        name: catMeta.name || catEntry.name,
        description: catMeta.description || '',
        order: catMeta.order || 0,
        icon: catMeta.icon || null,
        showIconInHeader: catMeta.showIconInHeader !== false,
        content: catContent.trim() || null
      };

      header.categories.push(category);
    }

    // Sort categories by order
    header.categories.sort((a, b) => a.order - b.order);
    headers.push(header);
  }

  // Sort headers by order
  headers.sort((a, b) => a.order - b.order);
  return headers;
}

// Get all posts from all categories
export function getAllMarkdownFiles(blogDir) {
  const posts = [];
  const structure = getBlogStructure(blogDir);

  for (const header of structure) {
    for (const category of header.categories) {
      const categoryPath = path.join(blogDir, header.slug, category.slug);
      const files = fs.readdirSync(categoryPath);

      for (const file of files) {
        // Skip metadata files and non-markdown files
        if (file.startsWith('_') || !file.endsWith('.md')) continue;

        const filePath = path.join(categoryPath, file);
        const { data } = matter(fs.readFileSync(filePath, 'utf8'));

        posts.push({
          slug: file.replace('.md', ''),
          category: category.slug,
          categoryName: category.name,
          headerSlug: header.slug,
          headerName: header.name,
          ...data
        });
      }
    }
  }

  return posts;
}

// Get all category slugs
export function getAllCategorySlugs(blogDir) {
  const structure = getBlogStructure(blogDir);
  return structure.flatMap(header => header.categories.map(cat => cat.slug));
}

// Get category by slug
export function getCategoryBySlug(blogDir, slug) {
  const structure = getBlogStructure(blogDir);
  for (const header of structure) {
    const category = header.categories.find(cat => cat.slug === slug);
    if (category) return category;
  }
  return null;
}

// Check if a slug is a category
export function isCategorySlug(blogDir, slug) {
  return getAllCategorySlugs(blogDir).includes(slug);
}

// Get posts for a specific category
export function getPostsByCategory(blogDir, categorySlug) {
  return getAllMarkdownFiles(blogDir).filter(post => post.category === categorySlug);
}

// Find a post by slug
export function findPostBySlug(blogDir, slug) {
  return getAllMarkdownFiles(blogDir).find(post => post.slug === slug);
}

// Get file path for a post
export function getPostFilePath(blogDir, slug) {
  const post = findPostBySlug(blogDir, slug);
  if (post) {
    return path.join(blogDir, post.headerSlug, post.category, `${slug}.md`);
  }
  return null;
}
