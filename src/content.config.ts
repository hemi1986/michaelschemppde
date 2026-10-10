import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['ongoing', 'completed']).default('completed'),
  cover: z.string().optional(),
  link: z.string().optional(),
  draft: z.boolean().default(false),
});

const cvSchema = z.object({
  subtitle: z.string(),
  experience: z.array(z.object({
    role: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  })),
  skills: z.array(z.object({
    category: z.string(),
    items: z.string(),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string().optional(),
  })).optional(),
});

const proAboutSchema = z.object({
  mindset: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
  skills: z.array(z.object({ label: z.string(), sub: z.string() })),
});

const hobbyAboutSchema = z.object({
  activities: z.array(z.object({ icon: z.string(), label: z.string(), sub: z.string() })),
});

const faq = (base: string) =>
  defineCollection({ loader: glob({ pattern: '*.md', base }), schema: z.object({}) });

const blog = (base: string) =>
  defineCollection({ loader: glob({ pattern: '*.{md,mdx}', base }), schema: blogSchema });

const projects = (base: string) =>
  defineCollection({ loader: glob({ pattern: '*.{md,mdx}', base }), schema: projectSchema });

export const collections = {
  'pro-blog-de':       blog('./src/content/pro/blog/de'),
  'pro-blog-en':       blog('./src/content/pro/blog/en'),
  'pro-projects-de':   projects('./src/content/pro/projects/de'),
  'pro-projects-en':   projects('./src/content/pro/projects/en'),
  'hobby-blog-de':     blog('./src/content/hobby/blog/de'),
  'hobby-blog-en':     blog('./src/content/hobby/blog/en'),
  'hobby-projects-de': projects('./src/content/hobby/projects/de'),
  'hobby-projects-en': projects('./src/content/hobby/projects/en'),
  'pro-about-de':      defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/pro/about/de' }), schema: proAboutSchema }),
  'pro-about-en':      defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/pro/about/en' }), schema: proAboutSchema }),
  'hobby-about-de':    defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/hobby/about/de' }), schema: hobbyAboutSchema }),
  'hobby-about-en':    defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/hobby/about/en' }), schema: hobbyAboutSchema }),
  'pro-cv-de':         defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/pro/cv/de' }), schema: cvSchema }),
  'pro-cv-en':         defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/pro/cv/en' }), schema: cvSchema }),
  'faq-de':            faq('./src/content/faq/de'),
  'faq-en':            faq('./src/content/faq/en'),
};
