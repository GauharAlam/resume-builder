import type { Paragraph as ParagraphType } from 'docx';
import { ResumeData, SectionId } from '@/types';
import { dateRange, displayUrl, safeUrl, splitSkills, toLines, toParagraph, visibleSections } from '@/components/templates/shared';
import { sanitizeFilename } from './pdfExport';

// Fonts that exist on virtually every machine that will open the file
const FONT_BY_FAMILY: Record<string, string> = {
  playfair: 'Georgia',
  merriweather: 'Georgia',
  serif: 'Georgia',
  'fira-code': 'Consolas',
  monaco: 'Consolas',
  mono: 'Consolas',
};

// A4 with 0.5in margins, in twentieths of a point
const PAGE_MARGIN = 720;
const TEXT_WIDTH = 11906 - PAGE_MARGIN * 2;

/**
 * Builds an editable Word document that follows the resume's section order,
 * hidden sections, accent colour and font family. `docx` is loaded on demand.
 */
export const buildResumeDocx = async (resume: ResumeData) => {
  const { Document, Paragraph, TextRun, ExternalHyperlink, Tab, TabStopType, AlignmentType, BorderStyle } = await import('docx');

  const font = FONT_BY_FAMILY[resume.customization?.fontFamily] || 'Calibri';
  const accent = /^#[0-9a-fA-F]{6}$/.test(resume.accentColor || '') ? resume.accentColor.slice(1) : '1B1B1B';
  const details = resume.personalDetails;

  const heading = (title: string) =>
    new Paragraph({
      spacing: { before: 280, after: 100 },
      keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 2 } },
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: accent, font })],
    });

  // "Title .......... dates" on one line, dates pushed to the right edge
  const titleLine = (title: string, dates: string) =>
    new Paragraph({
      spacing: { before: 120 },
      keepNext: true,
      tabStops: [{ type: TabStopType.RIGHT, position: TEXT_WIDTH }],
      children: [
        new TextRun({ text: title, bold: true, size: 22, font }),
        ...(dates ? [new TextRun({ children: [new Tab(), dates], size: 20, color: '555555', font })] : []),
      ],
    });

  const bullets = (text: string | undefined) =>
    toLines(text).map((line) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: line, size: 21, font })] }));

  const link = (url: string) =>
    new ExternalHyperlink({ link: safeUrl(url) as string, children: [new TextRun({ text: displayUrl(url), size: 20, color: '1155CC', underline: {}, font })] });

  const sections: Record<SectionId, () => ParagraphType[]> = {
    summary: () => {
      const summary = toParagraph(resume.summary);
      return summary ? [heading('Professional Summary'), new Paragraph({ children: [new TextRun({ text: summary, size: 21, font })] })] : [];
    },
    experience: () => {
      const items = resume.experience || [];
      if (items.length === 0) return [];
      return [
        heading('Work Experience'),
        ...items.flatMap((exp) => [
          titleLine(exp.jobTitle, dateRange(exp.startDate, exp.endDate)),
          ...(exp.company ? [new Paragraph({ keepNext: true, children: [new TextRun({ text: exp.company, italics: true, size: 21, font })] })] : []),
          ...bullets(exp.description),
        ]),
      ];
    },
    projects: () => {
      const items = resume.projects || [];
      if (items.length === 0) return [];
      return [
        heading('Projects'),
        ...items.flatMap((proj) => [
          new Paragraph({
            spacing: { before: 120 },
            keepNext: true,
            children: [
              new TextRun({ text: proj.name, bold: true, size: 22, font }),
              ...(safeUrl(proj.url) ? [new TextRun({ text: '  ', size: 20, font }), link(proj.url as string)] : []),
            ],
          }),
          ...bullets(proj.description),
        ]),
      ];
    },
    education: () => {
      const items = resume.education || [];
      if (items.length === 0) return [];
      return [
        heading('Education'),
        ...items.flatMap((edu) => [
          titleLine(edu.degree, dateRange(edu.startDate, edu.endDate)),
          ...(edu.institution ? [new Paragraph({ children: [new TextRun({ text: edu.institution, size: 21, font })] })] : []),
        ]),
      ];
    },
    skills: () => {
      const skills = splitSkills(resume.skills);
      return skills.length > 0 ? [heading('Skills'), new Paragraph({ children: [new TextRun({ text: skills.join(', '), size: 21, font })] })] : [];
    },
    accomplishments: () => {
      const items = (resume.accomplishments || []).map((a) => toParagraph(a.description)).filter(Boolean);
      return items.length > 0 ? [heading('Certifications & Awards'), ...bullets(items.join('\n'))] : [];
    },
  };

  const contact = [details.email, details.phone, details.location].filter(Boolean);
  const links = (details.links || []).filter((l) => safeUrl(l.url));

  const header: ParagraphType[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: details.fullName || 'Your Name', bold: true, size: 44, color: accent, font })],
    }),
    ...(details.jobTitle
      ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: details.jobTitle, size: 24, font })] })]
      : []),
    ...(contact.length > 0
      ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: contact.join('  |  '), size: 20, color: '555555', font })] })]
      : []),
    ...(links.length > 0
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: links.flatMap((l, i) => [...(i > 0 ? [new TextRun({ text: '  |  ', size: 20, color: '555555', font })] : []), link(l.url)]),
          }),
        ]
      : []),
  ];

  return new Document({
    creator: 'ResumeAI',
    title: `${details.fullName || 'Resume'}`,
    styles: { default: { document: { run: { font, size: 21 } } } },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN } } },
        children: [...header, ...visibleSections(resume).flatMap((id) => sections[id]())],
      },
    ],
  });
};

export const generateDocx = async (resumeData: ResumeData) => {
  const [{ Packer }, { saveAs }, doc] = await Promise.all([import('docx'), import('file-saver'), buildResumeDocx(resumeData)]);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(resumeData.personalDetails.fullName)}.docx`);
};
