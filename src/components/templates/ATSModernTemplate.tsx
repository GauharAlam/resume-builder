import React from 'react';
import { ResumeData, SectionId } from '@/types';
import { dateRange, displayUrl, safeUrl, splitSkills, toLines, toParagraph, visibleSections } from './shared';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="border-b-[1.5px] border-black mb-2 pb-0.5 break-after-avoid">
    <h3 className="font-bold uppercase text-[10pt] tracking-wide">{title}</h3>
  </div>
);

const Bullets: React.FC<{ text: string | undefined }> = ({ text }) => {
  const lines = toLines(text);
  if (lines.length === 0) return null;
  return (
    <ul className="list-disc ml-5 mt-1 space-y-0.5">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
};

/** Plain single-column layout with no icons or columns, for the strictest parsers. */
const ATSModernTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, customization } = data;
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const accomplishments = (data.accomplishments || []).filter((a) => toLines(a.description).length > 0);
  const skills = splitSkills(data.skills);
  const summary = toParagraph(data.summary);
  const links = (personalDetails.links || []).filter((link) => safeUrl(link.url));
  const contact = [personalDetails.phone, personalDetails.email, personalDetails.location].filter(Boolean);

  const fontClass = customization?.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';

  const sections: Record<SectionId, React.ReactNode> = {
    summary: summary && (
      <div className="mb-4">
        <SectionHeader title="Professional Summary" />
        <p>{summary}</p>
      </div>
    ),
    education: education.length > 0 && (
      <div className="mb-4">
        <SectionHeader title="Education" />
        {education.map((edu) => (
          <div key={edu.id} className="mb-2 break-inside-avoid">
            <div className="font-bold">{edu.institution}</div>
            <div className="flex justify-between gap-4 italic">
              <span>{edu.degree}</span>
              <span className="shrink-0">{dateRange(edu.startDate, edu.endDate)}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    skills: skills.length > 0 && (
      <div className="mb-4 break-inside-avoid">
        <SectionHeader title="Skills" />
        <p className="mt-1">{skills.join(', ')}</p>
      </div>
    ),
    experience: experience.length > 0 && (
      <div className="mb-4">
        <SectionHeader title="Experience" />
        {experience.map((exp) => (
          <div key={exp.id} className="mb-3 break-inside-avoid">
            <div className="font-bold">{exp.company}</div>
            <div className="flex justify-between gap-4 font-bold italic">
              <span>{exp.jobTitle}</span>
              <span className="shrink-0">{dateRange(exp.startDate, exp.endDate)}</span>
            </div>
            <Bullets text={exp.description} />
          </div>
        ))}
      </div>
    ),
    projects: projects.length > 0 && (
      <div className="mb-4">
        <SectionHeader title="Projects" />
        {projects.map((proj) => (
          <div key={proj.id} className="mb-2 break-inside-avoid">
            <div className="font-bold">
              {proj.name}
              {safeUrl(proj.url) && (
                <span className="font-normal">
                  {' '}
                  |{' '}
                  <a href={safeUrl(proj.url)} className="underline text-[9pt]">
                    {displayUrl(proj.url)}
                  </a>
                </span>
              )}
            </div>
            <Bullets text={proj.description} />
          </div>
        ))}
      </div>
    ),
    accomplishments: accomplishments.length > 0 && (
      <div className="mb-4 break-inside-avoid">
        <SectionHeader title="Certifications & Awards" />
        <ul className="list-disc ml-5 space-y-0.5 mt-1">
          {accomplishments.map((acc) => (
            <li key={acc.id}>{toParagraph(acc.description)}</li>
          ))}
        </ul>
      </div>
    ),
  };

  return (
    <div
      className={`flex flex-col text-[#000000] bg-white ${fontClass} w-full leading-normal`}
      style={{ fontSize: `${11 * scale}pt`, padding: `${0.5 * scale}in`, minHeight: '1123px' }}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-[18pt] font-bold mb-1 tracking-tight">{personalDetails.fullName}</h1>
        {personalDetails.jobTitle && <div className="text-[11pt] mb-1">{personalDetails.jobTitle}</div>}
        {contact.length > 0 && <div className="text-[10pt]">{contact.join(' | ')}</div>}
        {links.length > 0 && (
          <div className="flex justify-center flex-wrap gap-x-3 text-[10pt] mt-1">
            {links.map((link, idx) => (
              <React.Fragment key={link.id}>
                {idx > 0 && <span>|</span>}
                <a href={safeUrl(link.url)} className="underline">
                  {displayUrl(link.url)}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {visibleSections(data).map((id) => (
        <React.Fragment key={id}>{sections[id]}</React.Fragment>
      ))}
    </div>
  );
};

export default ATSModernTemplate;
