import React from 'react';
import { ResumeData, SectionId } from '@/types';
import { dateRange, displayUrl, safeUrl, splitSkills, toLines, toParagraph, visibleSections } from './shared';

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1 break-after-avoid">
    {children}
  </h3>
);

const Bullets: React.FC<{ text: string | undefined; className?: string }> = ({ text, className = '' }) => {
  const lines = toLines(text);
  if (lines.length === 0) return null;
  return (
    <ul className={`list-disc ml-5 space-y-1 ${className}`}>
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
};

// Long sections span the page; short ones pair up in two columns
const WIDE: SectionId[] = ['summary', 'experience'];

const StandardClassicTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, customization } = data;
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const accomplishments = (data.accomplishments || []).filter((a) => toLines(a.description).length > 0);
  const skills = splitSkills(data.skills);
  const summary = toParagraph(data.summary);

  const fontClass = customization?.fontFamily ? `font-${customization.fontFamily}` : 'font-serif';

  const sections: Record<SectionId, React.ReactNode> = {
    summary: summary && (
      <section>
        <Heading>Profile</Heading>
        <p className="text-[10.5pt]">{summary}</p>
      </section>
    ),
    experience: experience.length > 0 && (
      <section>
        <Heading>Professional Experience</Heading>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex justify-between items-baseline gap-4 mb-1">
                <h4 className="font-bold text-[11pt]">{exp.jobTitle}</h4>
                <span className="shrink-0 text-[10pt] font-semibold text-slate-500">{dateRange(exp.startDate, exp.endDate)}</span>
              </div>
              {exp.company && <div className="text-[10pt] font-bold text-slate-700 mb-2">{exp.company}</div>}
              <Bullets text={exp.description} className="text-[10.5pt]" />
            </div>
          ))}
        </div>
      </section>
    ),
    skills: skills.length > 0 && (
      <section className="break-inside-avoid">
        <Heading>Skills</Heading>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="text-[10pt] bg-slate-50 px-2 py-0.5 border border-slate-200 rounded font-medium">
              {skill}
            </span>
          ))}
        </div>
      </section>
    ),
    education: education.length > 0 && (
      <section>
        <Heading>Education</Heading>
        {education.map((edu) => (
          <div key={edu.id} className="mb-3 break-inside-avoid">
            <h4 className="font-bold text-[10.5pt]">{edu.degree}</h4>
            <div className="text-[10pt] font-medium text-slate-600">{edu.institution}</div>
            <div className="text-[9pt] italic text-slate-500">{dateRange(edu.startDate, edu.endDate)}</div>
          </div>
        ))}
      </section>
    ),
    projects: projects.length > 0 && (
      <section>
        <Heading>Selected Projects</Heading>
        {projects.map((proj) => (
          <div key={proj.id} className="mb-3 break-inside-avoid">
            <h4 className="font-bold text-[10.5pt]">{proj.name}</h4>
            {safeUrl(proj.url) && (
              <a href={safeUrl(proj.url)} className="text-[9pt] text-slate-600 underline break-all">
                {displayUrl(proj.url)}
              </a>
            )}
            <Bullets text={proj.description} className="text-[10pt] text-slate-700 leading-snug mt-1" />
          </div>
        ))}
      </section>
    ),
    accomplishments: accomplishments.length > 0 && (
      <section className="break-inside-avoid">
        <Heading>Awards &amp; Certifications</Heading>
        <ul className="list-disc ml-5 text-[10pt] space-y-1 text-slate-700">
          {accomplishments.map((acc) => (
            <li key={acc.id}>{toParagraph(acc.description)}</li>
          ))}
        </ul>
      </section>
    ),
  };

  // Keep the user's order, grouping runs of short sections into a two-column block
  const present = visibleSections(data).filter((id) => Boolean(sections[id]));
  const blocks: SectionId[][] = [];
  let pairing = false;
  for (const id of present) {
    if (!WIDE.includes(id) && pairing) blocks[blocks.length - 1].push(id);
    else blocks.push([id]);
    pairing = !WIDE.includes(id);
  }

  return (
    <div
      className={`flex flex-col text-[#111827] bg-white ${fontClass} w-full leading-relaxed`}
      style={{ fontSize: `${11 * scale}pt`, padding: `${40 * scale}px`, minHeight: '1123px' }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-[24pt] font-black uppercase tracking-tight leading-none mb-1">{personalDetails.fullName}</h1>
        {personalDetails.jobTitle && <h2 className="text-[14pt] font-semibold text-slate-600 mb-3">{personalDetails.jobTitle}</h2>}
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-[10pt] font-medium text-slate-500">
          {personalDetails.email && <span>{personalDetails.email}</span>}
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 text-[10pt] mt-1 text-slate-600">
          {(personalDetails.links || [])
            .filter((link) => safeUrl(link.url))
            .map((link) => (
              <a key={link.id} href={safeUrl(link.url)} className="underline">
                {displayUrl(link.url)}
              </a>
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {blocks.map((ids, i) =>
          ids.length === 1 ? (
            <React.Fragment key={i}>{sections[ids[0]]}</React.Fragment>
          ) : (
            <div key={i} className="grid grid-cols-2 gap-8">
              {/* Deal sections left/right alternately to balance the columns */}
              {[0, 1].map((col) => (
                <div key={col} className="space-y-6">
                  {ids
                    .filter((_, idx) => idx % 2 === col)
                    .map((id) => (
                      <React.Fragment key={id}>{sections[id]}</React.Fragment>
                    ))}
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default StandardClassicTemplate;
