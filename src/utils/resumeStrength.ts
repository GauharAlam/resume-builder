import { ResumeData } from '@/types';
import { splitSkills, toLines, toParagraph } from '@/components/templates/shared';

export type StrengthSection = 'contacts' | 'summary' | 'experience' | 'education' | 'skills' | 'links';

export interface StrengthCheck {
  id: string;
  label: string;
  /** Where in the builder the user fixes this */
  section: StrengthSection;
  weight: number;
  done: boolean;
}

export interface ResumeStrength {
  score: number;
  checks: StrengthCheck[];
  /** The most valuable thing still to do, if any */
  next: StrengthCheck | null;
}

/**
 * A quick, local completeness score (no AI, no network). It measures whether
 * the essentials are present, not writing quality; the AI analysis does that.
 */
export const getResumeStrength = (data: ResumeData): ResumeStrength => {
  const details = data.personalDetails || ({} as ResumeData['personalDetails']);
  const experience = data.experience || [];
  const bullets = experience.flatMap((e) => toLines(e.description));
  const summaryLength = toParagraph(data.summary).length;

  const checks: StrengthCheck[] = [
    { id: 'contact', label: 'Add your name, email and phone', section: 'contacts', weight: 15, done: Boolean(details.fullName?.trim() && details.email?.trim() && details.phone?.trim()) },
    { id: 'title', label: 'Add your job title', section: 'contacts', weight: 5, done: Boolean(details.jobTitle?.trim()) },
    { id: 'summary', label: 'Write a 2–4 sentence summary', section: 'summary', weight: 15, done: summaryLength >= 60 && summaryLength <= 700 },
    { id: 'experience', label: 'Add at least one role', section: 'experience', weight: 15, done: experience.some((e) => e.jobTitle?.trim() || e.company?.trim()) },
    { id: 'bullets', label: 'Describe your work in 3 or more bullets', section: 'experience', weight: 15, done: bullets.length >= 3 },
    { id: 'metrics', label: 'Include a number in at least one bullet', section: 'experience', weight: 10, done: bullets.some((b) => /\d/.test(b)) },
    { id: 'education', label: 'Add your education', section: 'education', weight: 10, done: (data.education || []).some((e) => e.degree?.trim() || e.institution?.trim()) },
    { id: 'skills', label: 'List at least 5 skills', section: 'skills', weight: 10, done: splitSkills(data.skills).length >= 5 },
    { id: 'links', label: 'Add a portfolio or LinkedIn link', section: 'links', weight: 5, done: (details.links || []).some((l) => l.url?.trim()) },
  ];

  const score = checks.reduce((total, check) => total + (check.done ? check.weight : 0), 0);
  const remaining = checks.filter((c) => !c.done).sort((a, b) => b.weight - a.weight);
  return { score, checks, next: remaining[0] || null };
};
