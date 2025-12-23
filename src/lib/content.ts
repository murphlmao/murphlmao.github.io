import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, type Tokens } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';

// Language display names for the code block header
const languageNames: Record<string, string> = {
  cpp: 'C++',
  cplusplus: 'C++',
  c: 'C',
  rust: 'Rust',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  go: 'Go',
  java: 'Java',
  csharp: 'C#',
  cs: 'C#',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  sql: 'SQL',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  md: 'Markdown',
  jsx: 'JSX',
  tsx: 'TSX',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  lua: 'Lua',
  perl: 'Perl',
  r: 'R',
  asm: 'Assembly',
  assembly: 'Assembly',
  pascal: 'Pascal',
  text: 'Text',
  plaintext: 'Text',
};

// Cache the highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['dracula'],
      langs: [
        'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c', 'cpp',
        'csharp', 'html', 'css', 'json', 'bash', 'shell', 'sql', 'yaml', 'xml',
        'markdown', 'jsx', 'tsx', 'php', 'ruby', 'swift', 'kotlin', 'scala',
        'lua', 'perl', 'r', 'pascal', 'asm',
      ],
    });
  }
  return highlighterPromise;
}

// Types
export interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags?: string[];
  order?: number;
  lastModified?: string;
  image?: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  category: string;
  categoryName: string;
  headerSlug: string;
  headerName: string;
}

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

export interface BlogStats {
  totalArticles: number;
  earliestYear: number;
  totalWords: number;
}

export interface Snippet {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  date?: string;
  type?: 'markdown' | 'interactive';
  assetPath?: string;
}

export interface AnimalIncident {
  slug: string;
  title: string;
  date: string;
  animal: 'deer' | 'raccoon' | 'other';
  count: number;
  car: string;
  damage?: string;
  images: string[];
  content: string;
}

// Get content directory path
function getContentDir(): string {
  return path.join(process.cwd(), 'src/content');
}

function getBlogDir(): string {
  return path.join(getContentDir(), 'blog');
}

function getSnippetsDir(): string {
  return path.join(getContentDir(), 'snippets');
}

function getDeerDir(): string {
  return path.join(getContentDir(), 'deer');
}

// Read and parse a markdown file
export function getMarkdownContent(filePath: string): { frontmatter: PostFrontmatter; content: string } {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return { frontmatter: data as PostFrontmatter, content };
}

// Get all markdown files from a flat directory (no nested structure)
export function getFlatMarkdownFiles<T extends Record<string, unknown>>(directory: string): (T & { slug: string })[] {
  const files = fs.readdirSync(directory);
  return files
    .filter(file => file.endsWith('.md') && !file.startsWith('_'))
    .map(file => {
      const filePath = path.join(directory, file);
      const { data } = matter(fs.readFileSync(filePath, 'utf8'));
      return {
        slug: file.replace('.md', ''),
        ...data,
      } as T & { slug: string };
    });
}

// Get the full blog structure: headers -> categories -> posts
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

      const category: Category = {
        slug: catEntry.name,
        headerSlug: entry.name,
        headerName: header.name,
        name: (catMeta.name as string) || catEntry.name,
        description: (catMeta.description as string) || '',
        order: (catMeta.order as number) || 0,
        icon: (catMeta.icon as string) || null,
        showIconInHeader: catMeta.showIconInHeader !== false,
        content: catContent.trim() || null,
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
export function getAllPosts(): Post[] {
  const blogDir = getBlogDir();
  const posts: Post[] = [];
  const structure = getBlogStructure();

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
          ...(data as PostFrontmatter),
        });
      }
    }
  }

  return posts;
}

// Get all category slugs
export function getAllCategorySlugs(): string[] {
  const structure = getBlogStructure();
  return structure.flatMap(header => header.categories.map(cat => cat.slug));
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | null {
  const structure = getBlogStructure();
  for (const header of structure) {
    const category = header.categories.find(cat => cat.slug === slug);
    if (category) return category;
  }
  return null;
}

// Check if a slug is a category
export function isCategorySlug(slug: string): boolean {
  return getAllCategorySlugs().includes(slug);
}

// Get posts for a specific category
export function getPostsByCategory(categorySlug: string): Post[] {
  return getAllPosts().filter(post => post.category === categorySlug);
}

// Find a post by slug
export function findPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find(post => post.slug === slug);
}

// Get file path for a post
export function getPostFilePath(slug: string): string | null {
  const post = findPostBySlug(slug);
  if (post) {
    return path.join(getBlogDir(), post.headerSlug, post.category, `${slug}.md`);
  }
  return null;
}

// Get post content by slug
export function getPostContent(slug: string): { frontmatter: PostFrontmatter; content: string } | null {
  const filePath = getPostFilePath(slug);
  if (!filePath) return null;
  return getMarkdownContent(filePath);
}

// Get blog statistics: total articles, earliest year, total word count
export function getBlogStats(): BlogStats {
  const blogDir = getBlogDir();
  const posts = getAllPosts();
  let totalWords = 0;
  let earliestYear = new Date().getFullYear();

  for (const post of posts) {
    // Get the file path and read content for word count
    const filePath = path.join(blogDir, post.headerSlug, post.category, `${post.slug}.md`);
    const { content } = matter(fs.readFileSync(filePath, 'utf8'));

    // Count words (split on whitespace, filter empty strings)
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    totalWords += words.length;

    // Track earliest year
    if (post.date) {
      const year = new Date(post.date).getFullYear();
      if (year < earliestYear) {
        earliestYear = year;
      }
    }
  }

  return {
    totalArticles: posts.length,
    earliestYear,
    totalWords,
  };
}

// Get all snippets (supports both flat .md files and directories with index.md)
export function getAllSnippets(): Snippet[] {
  const snippetsDir = getSnippetsDir();
  const entries = fs.readdirSync(snippetsDir, { withFileTypes: true });
  const snippets: Snippet[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;

    if (entry.isFile() && entry.name.endsWith('.md')) {
      // Flat markdown file
      const filePath = path.join(snippetsDir, entry.name);
      const { data } = matter(fs.readFileSync(filePath, 'utf8'));
      snippets.push({
        slug: entry.name.replace('.md', ''),
        type: 'markdown',
        ...data,
      } as Snippet);
    } else if (entry.isDirectory()) {
      // Directory-based snippet with index.md
      const indexPath = path.join(snippetsDir, entry.name, 'index.md');
      if (fs.existsSync(indexPath)) {
        const { data } = matter(fs.readFileSync(indexPath, 'utf8'));
        snippets.push({
          slug: entry.name,
          type: (data.type as 'markdown' | 'interactive') || 'markdown',
          ...data,
        } as Snippet);
      }
    }
  }

  return snippets;
}

// Get snippet content by slug (supports both flat files and directories)
export function getSnippetContent(slug: string): { frontmatter: Record<string, unknown>; content: string } | null {
  // Try flat file first
  const flatFilePath = path.join(getSnippetsDir(), `${slug}.md`);
  if (fs.existsSync(flatFilePath)) {
    const fileContents = fs.readFileSync(flatFilePath, 'utf8');
    const { data, content } = matter(fileContents);
    return { frontmatter: data, content };
  }

  // Try directory with index.md
  const dirIndexPath = path.join(getSnippetsDir(), slug, 'index.md');
  if (fs.existsSync(dirIndexPath)) {
    const fileContents = fs.readFileSync(dirIndexPath, 'utf8');
    const { data, content } = matter(fileContents);
    return { frontmatter: data, content };
  }

  return null;
}

// Get all animal incidents
export function getAnimalIncidents(): AnimalIncident[] {
  const deerDir = getDeerDir();
  if (!fs.existsSync(deerDir)) return [];

  const files = fs.readdirSync(deerDir);
  const incidents: AnimalIncident[] = [];

  for (const file of files) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;

    const filePath = path.join(deerDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    incidents.push({
      slug: file.replace('.md', ''),
      title: data.title || 'Untitled',
      date: data.date || '',
      animal: data.animal || 'deer',
      count: data.count || 1,
      car: data.car || 'Unknown',
      damage: data.damage || '',
      images: data.images || [],
      content: content.trim(),
    });
  }

  // Sort by date descending (newest first), then by slug descending for consistent ordering
  return incidents.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.slug.localeCompare(a.slug);
  });
}

// Render markdown to HTML with syntax highlighting
export async function renderMarkdown(content: string): Promise<string> {
  const highlighter = await getHighlighter();

  // Create a custom renderer for code blocks
  const renderer = new marked.Renderer();

  renderer.code = function({ text, lang }: Tokens.Code): string {
    const language = lang || 'text';
    const displayName = languageNames[language] || language.toUpperCase();

    // Try to highlight with shiki, fall back to plain text
    let highlightedCode: string;
    try {
      // Check if language is supported
      const loadedLangs = highlighter.getLoadedLanguages();
      const langToUse = loadedLangs.includes(language as any) ? language : 'text';

      highlightedCode = highlighter.codeToHtml(text, {
        lang: langToUse,
        theme: 'dracula',
      });
    } catch {
      // Fallback to escaped plain text
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      highlightedCode = `<pre class="shiki dracula" style="background-color:#282A36"><code>${escaped}</code></pre>`;
    }

    // Wrap with our custom styling (language label + structure)
    return `<div class="code-block-wrapper">
      <span class="code-block-lang">${displayName}</span>
      ${highlightedCode}
    </div>`;
  };

  // Configure marked for GFM support
  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  return await marked.parse(content, { renderer });
}
