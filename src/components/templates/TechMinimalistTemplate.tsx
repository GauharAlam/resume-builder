import React from 'react';
import { ResumeData, SectionId } from '@/types';
import { dateRange, displayUrl, safeUrl, splitSkills, toLines, toParagraph, visibleSections } from './shared';

const Bullets: React.FC<{ text: string | undefined; className?: string }> = ({ text, className = '' }) => {
  const lines = toLines(text);
  if (lines.length === 0) return null;
  return (
    <ul className={`list-disc ml-[1.3em] space-y-[0.2em] ${className}`}>
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
};

const TechMinimalistTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, customization, accentColor } = data;
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const accomplishments = (data.accomplishments || []).filter((a) => toLines(a.description).length > 0);
  const skills = splitSkills(data.skills);
  const summary = toParagraph(data.summary);

  const fontClass = customization?.fontFamily ? `font-${customization.fontFamily}` : 'font-mono';
  const themeColor = accentColor || '#000000';

  const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-[10pt] font-black uppercase tracking-widest mb-3 border-b pb-1 break-after-avoid" style={{ color: themeColor }}>
      {children}
    </h3>
  );

  const sections: Record<SectionId, React.ReactNode> = {
    summary: summary && (
      <section className="mb-6">
        <p className="leading-relaxed">{summary}</p>
      </section>
    ),
    skills: skills.length > 0 && (
      <section className="mb-6 bg-slate-50 p-4 border-l-4 break-inside-avoid" style={{ borderColor: themeColor }}>
        <h3 className="text-[10pt] font-black uppercase tracking-widest mb-2" style={{ color: themeColor }}>
          Skills
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {skills.map((skill, i) => (
            <span key={i} className="font-bold">
              {skill}
            </span>
          ))}
        </div>
      </section>
    ),
    experience: experience.length > 0 && (
      <section className="mb-6">
        <Heading>Experience</Heading>
        <div className="space-y-5">
          {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex justify-between gap-4 font-black uppercase tracking-tight text-[11pt]">
                <span>{exp.jobTitle}</span>
                <span className="shrink-0 text-slate-500">{dateRange(exp.startDate, exp.endDate)}</span>
              </div>
              {exp.company && <div className="font-bold text-slate-600 mb-2 italic">{exp.company}</div>}
              <Bullets text={exp.description} className="text-[9.5pt] leading-relaxed" />
            </div>
          ))}
        </div>
      </section>
    ),
    projects: projects.length > 0 && (
      <section className="mb-6">
        <Heading>Projects</Heading>
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id} className="break-inside-avoid">
              <div className="flex justify-between gap-4 font-bold mb-1">
                <span>{proj.name}</span>
                {safeUrl(proj.url) && (
                  <a href={safeUrl(proj.url)} className="shrink-0 text-[8.5pt] underline font-normal">
                    {displayUrl(proj.url)}
                  </a>
                )}
              </div>
              <Bullets text={proj.description} className="text-[9pt] leading-snug text-slate-700" />
            </div>
          ))}
        </div>
      </section>
    ),
    education: education.length > 0 && (
      <section className="mb-6">
        <Heading>Education</Heading>
        <div className="space-y-1.5">
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between gap-4 break-inside-avoid">
              <span>
                <span className="font-bold">{edu.degree}</span>
                {edu.institution && <span className="font-bold text-slate-500"> | {edu.institution}</span>}
              </span>
              <span className="shrink-0 text-[8.5pt] font-bold text-slate-500">{dateRange(edu.startDate, edu.endDate)}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    accomplishments: accomplishments.length > 0 && (
      <section className="mb-6 break-inside-avoid">
        <Heading>Certifications &amp; Awards</Heading>
        <ul className="list-disc ml-[1.3em] space-y-[0.2em] text-[9.5pt]">
          {accomplishments.map((acc) => (
            <li key={acc.id}>{toParagraph(acc.description)}</li>
          ))}
        </ul>
      </section>
    ),
  };

  return (
    <div
      className={`flex flex-col text-slate-800 bg-white ${fontClass} w-full leading-normal`}
      style={{ fontSize: `${10 * scale}pt`, padding: `${30 * scale}px`, minHeight: '1123px' }}
    >
      {/* Name and header */}
      <div className="mb-6 flex justify-between items-start gap-6 border-b-4 pb-4" style={{ borderColor: themeColor }}>
        <div className="min-w-0">
          <h1 className="text-[28pt] font-black tracking-tighter leading-none break-words" style={{ color: themeColor }}>
            {personalDetails.fullName}
          </h1>
          {personalDetails.jobTitle && (
            <h2 className="text-[12pt] font-bold mt-1 uppercase tracking-widest text-slate-500">{personalDetails.jobTitle}</h2>
          )}
        </div>
        <div className="shrink-0 max-w-[45%] text-right text-[9pt] font-bold tracking-tight break-all">
          {personalDetails.email && <p>{personalDetails.email}</p>}
          {personalDetails.phone && <p>{personalDetails.phone}</p>}
          {personalDetails.location && <p>{personalDetails.location}</p>}
          {(personalDetails.links || [])
            .filter((link) => safeUrl(link.url))
            .map((link) => (
              <a key={link.id} href={safeUrl(link.url)} className="block underline text-slate-600">
                {displayUrl(link.url)}
              </a>
            ))}
        </div>
      </div>

      {visibleSections(data).map((id) => (
        <React.Fragment key={id}>{sections[id]}</React.Fragment>
      ))}
    </div>
  );
};

export default TechMinimalistTemplate;
