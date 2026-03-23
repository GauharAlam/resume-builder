import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '@/types';

export const generateDocx = async (resumeData: ResumeData) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: resumeData.personalDetails.fullName || 'Untitled',
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: resumeData.personalDetails.jobTitle, bold: true }),
              new TextRun(` | ${resumeData.personalDetails.email} | ${resumeData.personalDetails.phone}`),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: resumeData.summary || '' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_1 }),
          ...(resumeData.experience || []).flatMap(exp => [
            new Paragraph({
              children: [
                  new TextRun({ text: exp.jobTitle, bold: true }),
                  new TextRun(` at ${exp.company} (${exp.startDate || ''} - ${exp.endDate || ''})`)
              ]
            }),
            new Paragraph({ text: exp.description || '' }),
            new Paragraph({ text: '' })
          ]),
          new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_1 }),
          ...(resumeData.education || []).flatMap(edu => [
             new Paragraph({
                 children: [
                     new TextRun({ text: edu.degree, bold: true }),
                     new TextRun(` from ${edu.institution} (${edu.startDate || ''} - ${edu.endDate || ''})`)
                 ]
             }),
             new Paragraph({ text: '' })
          ]),
          new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: resumeData.skills || '' }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${resumeData.personalDetails.fullName || 'Resume'}.docx`);
};
