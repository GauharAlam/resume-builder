import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '@/types';

const sanitizeFilename = (name: string): string =>
  (name || 'Resume').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80) || 'Resume';

// Split multi-line descriptions (• or \n separated) into individual paragraphs
// so DOCX matches the on-screen preview instead of one giant block.
const descriptionToParagraphs = (description: string | undefined): Paragraph[] => {
  if (!description) return [];
  return description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => new Paragraph({ text: line }));
};

export const generateDocx = async (resumeData: ResumeData) => {
  const personal = resumeData.personalDetails || ({} as ResumeData['personalDetails']);
  const contactParts = [personal.jobTitle, personal.email, personal.phone, personal.location].filter(Boolean);
  const links = personal.links || [];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: personal.fullName || 'Untitled',
            heading: HeadingLevel.TITLE,
          }),
          ...(contactParts.length > 0
            ? [new Paragraph({ children: [new TextRun(contactParts.join(' | '))] })]
            : []),
          ...(links.length > 0
            ? [new Paragraph({ children: [new TextRun(links.map((l) => `${l.name}: ${l.url}`).join(' | '))] })]
            : []),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: resumeData.summary || '' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_1 }),
          ...(resumeData.experience || []).flatMap((exp) => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle || 'Role', bold: true }),
                new TextRun(` at ${exp.company || ''} (${exp.startDate || ''} - ${exp.endDate || ''})`),
              ],
            }),
            ...descriptionToParagraphs(exp.description),
            new Paragraph({ text: '' }),
          ]),
          new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_1 }),
          ...(resumeData.projects || []).flatMap((proj) => [
            new Paragraph({
              children: [
                new TextRun({ text: proj.name || 'Project', bold: true }),
                ...(proj.url ? [new TextRun(` (${proj.url})`)] : []),
              ],
            }),
            ...descriptionToParagraphs(proj.description),
            new Paragraph({ text: '' }),
          ]),
          new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_1 }),
          ...(resumeData.education || []).flatMap((edu) => [
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree || 'Degree', bold: true }),
                new TextRun(` from ${edu.institution || ''} (${edu.startDate || ''} - ${edu.endDate || ''})`),
              ],
            }),
            new Paragraph({ text: '' }),
          ]),
          new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: resumeData.skills || '' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Accomplishments', heading: HeadingLevel.HEADING_1 }),
          ...(resumeData.accomplishments || []).flatMap((acc) => descriptionToParagraphs(acc.description)),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(personal.fullName || 'Resume')}.docx`);
};
