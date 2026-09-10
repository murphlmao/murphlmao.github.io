import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Keep ids equal to the file path without extension, original casing, so URLs do not change.
const keepId = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

const blog = defineCollection({
  loader: glob({ pattern: '**/[!_]*.{md,mdx}', base: './src/content/blog', generateId: keepId }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional().default(''),
    tags: z.array(z.string()).optional(),
    order: z.number().optional(),
    lastModified: z.coerce.date().optional(),
    image: z.string().optional(),
  }),
});

const snippets = defineCollection({
  loader: glob({ pattern: '**/[!_]*.md', base: './src/content/snippets', generateId: ({ entry }) => entry.replace(/\/index\.md$|\.md$/, '') }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().optional(),
    icon: z.string().optional(),
    type: z.enum(['markdown', 'interactive']).optional().default('markdown'),
    assetPath: z.string().optional(),
  }),
});

const deer = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/deer', generateId: keepId }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    animal: z.enum(['deer', 'raccoon', 'other']),
    count: z.number().optional().default(1),
    car: z.string(),
    damage: z.string().optional(),
    // 002-second.md has a bare `images:` key (YAML null), so nullish, not optional.
    images: z.array(z.string()).nullish().transform((v) => v ?? []),
  }),
});

export const collections = { blog, snippets, deer };
