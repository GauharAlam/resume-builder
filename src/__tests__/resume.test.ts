import { describe, expect, it } from 'vitest';
import { ResumeData } from '@/types';
import { normalizeSectionOrder, safeUrl, splitSkills, toLines, visibleSections } from '@/components/templates/shared';
import { isImportEmpty, isResumeBlank, normalizeImportedResume } from '@/utils/resumeImport';
import { getResumeStrength } from '@/utils/resumeStrength';
import { sanitizeFilename } from '@/utils/pdfExport';
import { buildResumeDocx } from '@/utils/docxExport';

const blank: ResumeData = {
  personalDetails: { fullName: '', jobTitle: '', email: '', phone: '', location: '', links: [] },
  summary: '',
  experience: [],
  education: [],
  skills: '',
  projects: [],
  accomplishments: [],
  sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'accomplishments'],
  accentColor: '#1B1B1B',
  customization: { fontFamily: 'inter', fontSize: 'medium', layout: 'standard' },
};

const full: ResumeData = {
  ...blank,
  personalDetails: { fullName: 'Maya Chen', jobTitle: 'Designer', email: 'm@x.co', phone: '123', location: 'SF', links: [{ id: '1', name: 'Site', url: 'maya.design' }] },
  summary: 'Product designer with five years of experience turning complex workflows into simple interfaces.',
  experience: [{ id: 'e', jobTitle: 'Designer', company: 'Acme', startDate: '2022', endDate: 'Present', description: '• Shipped 12 features\n• Led research\n• Built a design system' }],
  education: [{ id: 'd', degree: 'BA', institution: 'CCA', startDate: '2015', endDate: '2019' }],
  skills: 'Figma, Research, Prototyping, Accessibility, HTML',
};

describe('template helpers', () => {
  it('strips HTML and bullet characters so nothing can be injected', () => {
    expect(toLines('<ul><li>One</li><li>Two <img src=x onerror=alert(1)></li></ul>')).toEqual(['One', 'Two']);
    expect(toLines('• First\n- Second\n\n* Third')).toEqual(['First', 'Second', 'Third']);
  });

  it('only allows web and mail links', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('data:text/html,x')).toBeUndefined();
    expect(safeUrl('github.com/me')).toBe('https://github.com/me');
    expect(safeUrl('https://a.b')).toBe('https://a.b');
    expect(safeUrl('  ')).toBeUndefined();
  });

  it('repairs section order and applies hidden sections', () => {
    expect(normalizeSectionOrder(['skills', 'skills', 'bogus' as any])).toEqual(['skills', 'summary', 'experience', 'projects', 'education', 'accomplishments']);
    expect(normalizeSectionOrder(undefined)).toHaveLength(6);
    expect(visibleSections({ sectionOrder: ['education', 'summary'], hiddenSections: ['summary', 'projects'] })).toEqual(['education', 'experience', 'skills', 'accomplishments']);
  });

  it('splits skills on commas and new lines', () => {
    expect(splitSkills('React, Node\nSQL,, ')).toEqual(['React', 'Node', 'SQL']);
  });
});

describe('resume import', () => {
  it('normalises loose AI output into the resume shape', () => {
    const data = normalizeImportedResume({
      personalDetails: { fullName: ' Ada ', links: [{ name: 'Site', url: 'ada.dev' }, { name: 'empty', url: '' }] },
      experience: [{ jobTitle: 'Engineer', description: ['Built X', '- Ran Y'] }, {}],
      skills: ['Python', 'python', 'SQL'],
      accomplishments: ['• AWS Certified', { description: 'Award' }, null],
      education: 'not a list',
    });
    expect(data.personalDetails.fullName).toBe('Ada');
    expect(data.personalDetails.links).toHaveLength(1);
    expect(data.experience).toHaveLength(1);
    expect(data.experience[0].description).toBe('• Built X\n• Ran Y');
    expect(data.experience[0].id).toBeTruthy();
    expect(data.skills).toBe('Python, SQL');
    expect(data.accomplishments.map((a) => a.description)).toEqual(['AWS Certified', 'Award']);
    expect(data.education).toEqual([]);
  });

  it('survives junk input', () => {
    for (const junk of [null, undefined, 'text', 42, []]) expect(isImportEmpty(normalizeImportedResume(junk))).toBe(true);
  });

  it('detects a blank resume', () => {
    expect(isResumeBlank(blank)).toBe(true);
    expect(isResumeBlank({ ...blank, personalDetails: { ...blank.personalDetails, fullName: 'Prefilled Name' } })).toBe(true);
    expect(isResumeBlank(full)).toBe(false);
  });
});

describe('resume strength', () => {
  it('scores an empty resume 0 and points at contact details first', () => {
    const result = getResumeStrength(blank);
    expect(result.score).toBe(0);
    expect(result.next?.id).toBe('contact');
  });

  it('scores a complete resume 100', () => {
    const result = getResumeStrength(full);
    expect(result.score).toBe(100);
    expect(result.next).toBeNull();
  });
});

describe('export', () => {
  it('sanitises file names', () => {
    expect(sanitizeFilename('A/B:C*?"<>|')).toBe('ABC');
    expect(sanitizeFilename('')).toBe('Resume');
  });

  it('builds a Word document for full, blank and reordered resumes', async () => {
    const { Packer } = await import('docx');
    for (const resume of [full, blank, { ...full, sectionOrder: ['skills', 'summary'] as any, hiddenSections: ['experience'] as any, accentColor: 'nonsense' }]) {
      const buffer = await Packer.toBuffer(await buildResumeDocx(resume));
      // .docx files are zip archives, which start with "PK"
      expect(buffer.subarray(0, 2).toString()).toBe('PK');
    }
  });
});
