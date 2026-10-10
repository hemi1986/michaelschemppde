import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

type Section = 'pro' | 'hobby';
type ContentType = 'blog' | 'projects';

type ProAboutEntry = CollectionEntry<'pro-about-de'>;
type HobbyAboutEntry = CollectionEntry<'hobby-about-de'>;
type CvEntry = CollectionEntry<'pro-cv-de'>;

type BlogEntry = CollectionEntry<'pro-blog-de'>;
type ProjectEntry = CollectionEntry<'pro-projects-de'>;

async function safeGetCollection(key: string) {
  try {
    return await getCollection(key as any);
  } catch {
    return [];
  }
}

async function getEntries(section: Section, type: ContentType, lang: Lang) {
  const deKey = `${section}-${type}-de`;
  const enKey = `${section}-${type}-en`;

  const deEntries = await safeGetCollection(deKey);
  if (lang === 'de') return deEntries;

  const enEntries = await safeGetCollection(enKey);
  const enIds = new Set(enEntries.map((e: any) => e.id));

  // English entries + German fallbacks for anything not yet translated
  return [...enEntries, ...deEntries.filter((e: any) => !enIds.has(e.id))];
}

export async function getBlogPosts(section: Section, lang: Lang, filter?: (data: BlogEntry['data']) => boolean) {
  const entries = await getEntries(section, 'blog', lang) as BlogEntry[];
  return entries.filter(e => !e.data.draft && (filter ? filter(e.data) : true));
}

export async function getProjects(section: Section, lang: Lang, filter?: (data: ProjectEntry['data']) => boolean) {
  const entries = await getEntries(section, 'projects', lang) as ProjectEntry[];
  return entries.filter(e => !e.data.draft && (filter ? filter(e.data) : true));
}

/** For [slug] pages: find a post by slug, preferring the requested lang, falling back to de. */
export async function getBlogPostBySlug(section: Section, slug: string, lang: Lang): Promise<BlogEntry | undefined> {
  if (lang === 'en') {
    const enEntries = await safeGetCollection(`${section}-blog-en`) as BlogEntry[];
    const en = enEntries.find(e => e.id === slug);
    if (en) return en;
  }
  const deEntries = await safeGetCollection(`${section}-blog-de`) as BlogEntry[];
  return deEntries.find(e => e.id === slug);
}

export async function getProjectBySlug(section: Section, slug: string, lang: Lang): Promise<ProjectEntry | undefined> {
  if (lang === 'en') {
    const enEntries = await safeGetCollection(`${section}-projects-en`) as ProjectEntry[];
    const en = enEntries.find(e => e.id === slug);
    if (en) return en;
  }
  const deEntries = await safeGetCollection(`${section}-projects-de`) as ProjectEntry[];
  return deEntries.find(e => e.id === slug);
}

export async function getProAbout(lang: Lang): Promise<ProAboutEntry> {
  if (lang === 'en') {
    const en = await safeGetCollection('pro-about-en') as ProAboutEntry[];
    if (en.length > 0) return en[0];
  }
  const de = await safeGetCollection('pro-about-de') as ProAboutEntry[];
  return de[0];
}

export async function getHobbyAbout(lang: Lang): Promise<HobbyAboutEntry> {
  if (lang === 'en') {
    const en = await safeGetCollection('hobby-about-en') as HobbyAboutEntry[];
    if (en.length > 0) return en[0];
  }
  const de = await safeGetCollection('hobby-about-de') as HobbyAboutEntry[];
  return de[0];
}

export async function getCV(lang: Lang): Promise<CvEntry> {
  if (lang === 'en') {
    const en = await safeGetCollection('pro-cv-en') as CvEntry[];
    if (en.length > 0) return en[0];
  }
  const de = await safeGetCollection('pro-cv-de') as CvEntry[];
  return de[0];
}

export interface FaqItem {
  id: string;
  question: string;
  /** Rendered answer HTML — empty string while the question is still unanswered. */
  answer: string;
}

/** Splits a rendered FAQ file into its questions: every `## heading` is a question, everything below it the answer. */
function parseFaq(html: string): FaqItem[] {
  const headings = [...html.matchAll(/<h2[^>]*?(?:\sid="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/g)];
  return headings.map((match, i) => {
    const start = match.index! + match[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index! : html.length;
    const answer = html.slice(start, end).replace(/<!--[\s\S]*?-->/g, '').trim();
    const hasText = answer.replace(/<[^>]+>/g, '').trim().length > 0;
    return { id: match[1] ?? `faq-${i + 1}`, question: match[2], answer: hasText ? answer : '' };
  });
}

/** FAQ of one section, preferring the requested lang, falling back to de. */
export async function getFaq(section: Section, lang: Lang): Promise<FaqItem[]> {
  const find = async (l: Lang) =>
    (await safeGetCollection(`faq-${l}`)).find((e: any) => e.id === section) as { rendered?: { html: string } } | undefined;
  const entry = (lang === 'en' ? await find('en') : undefined) ?? await find('de');
  return parseFaq(entry?.rendered?.html ?? '');
}

/** All slugs from the de collection — used by getStaticPaths to ensure all routes exist. */
export async function getAllSlugs(section: Section, type: ContentType): Promise<string[]> {
  const key = `${section}-${type}-de` as const;
  const entries = await getCollection(key as any);
  return entries.filter((e: any) => !e.data.draft).map((e: any) => e.id);
}
