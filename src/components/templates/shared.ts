import { ResumeData, SectionId } from '@/types';

export const DEFAULT_SECTION_ORDER: SectionId[] = ['summary', 'experience', 'projects', 'education', 'skills', 'accomplishments'];

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  skills: 'Skills',
  accomplishments: 'Certifications & Awards',
};

/** Saved order, repaired: unknown ids dropped, duplicates removed, missing sections appended. */
export const normalizeSectionOrder = (order: SectionId[] | undefined): SectionId[] => {
  const seen = new Set<SectionId>();
  const result: SectionId[] = [];
  for (const id of order || []) {
    if (DEFAULT_SECTION_ORDER.includes(id) && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  for (const id of DEFAULT_SECTION_ORDER) if (!seen.has(id)) result.push(id);
  return result;
};

/** Sections to render, in the user's order, minus the ones they have hidden. */
export const visibleSections = (data: Pick<ResumeData, 'sectionOrder' | 'hiddenSections'>): SectionId[] => {
  const hidden = new Set(data.hiddenSections || []);
  return normalizeSectionOrder(data.sectionOrder).filter((id) => !hidden.has(id));
};

export const stripBullet = (line: string) => line.replace(/^\s*[•\-*–·]\s*/, '').trim();

/**
 * Turns stored text into plain lines. Older resumes may contain HTML from a
 * previous rich-text editor; tags are stripped so nothing is ever injected
 * into the page (resumes are viewable publicly via share links).
 */
export const toLines = (text: string | undefined): string[] =>
  (text || '')
    .replace(/<\/(li|p|div)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map(stripBullet)
    .filter(Boolean);

export const toParagraph = (text: string | undefined): string => toLines(text).join(' ');

export const splitSkills = (skills: string | undefined): string[] =>
  toLines((skills || '').replace(/,/g, '\n'));

/** Only web and mail links are allowed as hrefs; anything else (e.g. javascript:) is dropped. */
export const safeUrl = (url: string | undefined): string | undefined => {
  const value = (url || '').trim();
  if (!value) return undefined;
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return undefined;
  return `https://${value}`;
};

export const displayUrl = (url: string | undefined): string =>
  (url || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');

export const dateRange = (start?: string, end?: string): string => [start, end].filter((v) => v && v.trim()).join(' – ');
