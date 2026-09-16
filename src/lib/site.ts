import { getCollection, type CollectionEntry } from 'astro:content';
import { getBlogStructure, type Category, type Header } from './content';
import { isHiddenArticle } from '../content/publish';

export interface Post {
  entry: CollectionEntry<'blog'>; slug: string; headerSlug: string; categorySlug: string;
  category: Category; header: Header; date: Date; words: number; minutes: number;
}

function countWords(body: string | undefined): number {
  return (body || '').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
}

let cache: Post[] | null = null;
export async function getPosts(): Promise<Post[]> {
  if (cache) return cache;
  const structure = getBlogStructure();
  const entries = await getCollection('blog');
  const posts: Post[] = [];
  for (const entry of entries) {
    const [headerSlug, categorySlug, ...rest] = entry.id.split('/');
    const header = structure.find((h) => h.slug === headerSlug);
    const category = header?.categories.find((c) => c.slug === categorySlug);
    if (!header || !category || rest.length !== 1) continue; // files outside header/category folders are ignored
    if (isHiddenArticle(rest[0])) continue; // blacklisted in src/content/publish.ts
    const words = countWords(entry.body);
    posts.push({ entry, slug: rest[0], headerSlug, categorySlug, category, header, date: entry.data.date, words, minutes: Math.max(1, Math.round(words / 220)) });
  }
  posts.sort((a, b) => b.date.getTime() - a.date.getTime() || (b.entry.data.order || 0) - (a.entry.data.order || 0));
  cache = posts;
  return posts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}

export async function getCategoryPosts(categorySlug: string): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.categorySlug === categorySlug)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || (a.entry.data.order || 999) - (b.entry.data.order || 999));
}

export async function getStats() {
  const posts = await getPosts();
  return { total: posts.length, words: posts.reduce((n, p) => n + p.words, 0), since: Math.min(...posts.map((p) => p.date.getFullYear())) };
}

export async function courseCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const p of await getPosts()) counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
  return counts;
}

export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Sidebar + /deer totals: counts summed per animal, cars counted distinct. */
export async function deerCounts(): Promise<{ deer: number; raccoon: number; other: number; cars: number }> {
  const entries: CollectionEntry<'deer'>[] = await getCollection('deer');
  const sum = (animal: string) => entries.filter((e) => e.data.animal === animal).reduce((n, e) => n + e.data.count, 0);
  return { deer: sum('deer'), raccoon: sum('raccoon'), other: sum('other'), cars: new Set(entries.map((e) => e.data.car)).size };
}

/** Frontmatter dates like "December 1, 2025" -> a UTC-midnight Date; undefined when missing/invalid.
    `new Date(str)` parses as local midnight, so shift by the offset before isoDate reads the UTC day. */
export function parseHumanDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
}
