import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!**/_*.{md,mdx}'],
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional().default(''),
    tags: z.array(z.string()).optional(),
    order: z.number().optional(),
    lastModified: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
