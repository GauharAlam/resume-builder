import { Accomplishment, Education, Experience, Link, PersonalDetails, Project, ResumeData } from '@/types';
import { newId } from './id';

/** What import sources (uploaded file, LinkedIn, AI generator) produce: resume content without design settings. */
export type ImportedResume = Pick<
  ResumeData,
  'personalDetails' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'accomplishments'
>;

const text = (value: unknown, max = 4000): string =>
  (typeof value === 'string' ? value : value == null ? '' : String(value)).trim().slice(0, max);

const list = (value: unknown): any[] => (Array.isArray(value) ? value.filter((v) => v && typeof v === 'object') : []);

/** Bullets may arrive as a string or an array of strings; store one bullet per line. */
const description = (value: unknown): string => {
  const raw = Array.isArray(value) ? value.map((v) => text(v)).join('\n') : text(value, 6000);
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (/^[•\-*–·]/.test(line) ? line.replace(/^[\-*–·]\s*/, '• ') : `• ${line}`))
    .join('\n');
};

const skills = (value: unknown): string => {
  const items = Array.isArray(value) ? value.map((v) => text(v, 80)) : text(value, 2000).split(/[,\n;]/);
  const seen = new Set<string>();
  return items
    .map((s) => s.trim())
    .filter((s) => {
      const key = s.toLowerCase();
      if (!s || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
};

/**
 * Normalises untrusted import data (AI output, third-party APIs) into the
 * app's resume shape: every field a string, every entry given an id, empty
 * entries dropped.
 */
export const normalizeImportedResume = (raw: any): ImportedResume => {
  const details = raw?.personalDetails || {};
  const links: Link[] = list(details.links)
    .map((l) => ({ id: newId(), name: text(l.name, 60), url: text(l.url, 300) }))
    .filter((l) => l.url);
  const personalDetails: PersonalDetails = {
    fullName: text(details.fullName, 120),
    jobTitle: text(details.jobTitle, 160),
    email: text(details.email, 160),
    phone: text(details.phone, 60),
    location: text(details.location, 160),
    links,
  };

  const experience: Experience[] = list(raw?.experience)
    .map((e) => ({
      id: newId(),
      jobTitle: text(e.jobTitle, 160),
      company: text(e.company, 160),
      startDate: text(e.startDate, 40),
      endDate: text(e.endDate, 40),
      description: description(e.description),
    }))
    .filter((e) => e.jobTitle || e.company || e.description);

  const education: Education[] = list(raw?.education)
    .map((e) => ({
      id: newId(),
      degree: text(e.degree, 200),
      institution: text(e.institution, 200),
      startDate: text(e.startDate, 40),
      endDate: text(e.endDate, 40),
    }))
    .filter((e) => e.degree || e.institution);

  const projects: Project[] = list(raw?.projects)
    .map((p) => ({ id: newId(), name: text(p.name, 160), url: text(p.url, 300), description: description(p.description) }))
    .filter((p) => p.name || p.description);

  const accomplishments: Accomplishment[] = (Array.isArray(raw?.accomplishments) ? raw.accomplishments : [])
    .map((a: any) => ({ id: newId(), description: text(typeof a === 'string' ? a : a?.description, 400).replace(/^[•\-*–·]\s*/, '') }))
    .filter((a: Accomplishment) => a.description);

  return {
    personalDetails,
    summary: text(raw?.summary, 2000),
    experience,
    education,
    skills: skills(raw?.skills),
    projects,
    accomplishments,
  };
};

/** True when an import produced nothing worth applying. */
export const isImportEmpty = (data: ImportedResume): boolean =>
  !data.personalDetails.fullName &&
  !data.summary &&
  data.experience.length === 0 &&
  data.education.length === 0 &&
  !data.skills &&
  data.projects.length === 0;

/** A resume the user hasn't put anything into yet (drives the "how do you want to start" prompt). */
export const isResumeBlank = (data: Pick<ResumeData, keyof ImportedResume>): boolean =>
  !data.summary?.trim() &&
  (data.experience || []).length === 0 &&
  (data.education || []).length === 0 &&
  !data.skills?.trim() &&
  (data.projects || []).length === 0 &&
  (data.accomplishments || []).length === 0 &&
  !data.personalDetails?.jobTitle?.trim();
