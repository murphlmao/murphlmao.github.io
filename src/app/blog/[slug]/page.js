import { getAllMarkdownFiles, getAllCategorySlugs } from '@/utils/markdown';
import path from 'path';
import RedirectClient from './RedirectClient';

const blogDir = path.join(process.cwd(), 'content/blog');

export function generateStaticParams() {
  const posts = getAllMarkdownFiles(blogDir);
  const categorySlugs = getAllCategorySlugs(blogDir);

  const postParams = posts.map((post) => ({ slug: post.slug }));
  const categoryParams = categorySlugs.map((slug) => ({ slug }));

  return [...postParams, ...categoryParams];
}

export default async function BlogPostRedirect({ params }) {
  const resolvedParams = await params;
  return <RedirectClient slug={resolvedParams.slug} />;
}
