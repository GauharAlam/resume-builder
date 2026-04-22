import React from 'react';
import { ResumeData } from '@/types';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="border-b-[1.5px] border-black mb-2 pb-0.5">
    <h3 className="font-bold uppercase text-[10pt] tracking-wide">{title}</h3>
  </div>
);

const ATSModernTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, summary, experience, education, skills, projects, accomplishments, customization } = data;
  
  const baseFontSize = `${11 * scale}pt`; // Standard ATS size is usually 10-12pt
  const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';
  
  // Helper to safely render description strings that might be plain text or HTML
  const renderDescription = (desc: string) => {
    if (!desc) return null;
    // If it looks like HTML (contains <p> or <li>), use dangerouslySetInnerHTML
    if (desc.includes('<p>') || desc.includes('<li>')) {
      return <div className="mt-1 text-[10pt] [&>ul]:list-none [&>ul]:ml-1 [&>ul>li]:relative [&>ul>li]:pl-3.5 [&>ul>li::before]:content-['•'] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ol]:list-decimal [&>ol]:ml-5 space-y-1" dangerouslySetInnerHTML={{ __html: desc }}></div>;
    }
    // Otherwise, treat as plain text and split by newlines, cleaning up manual bullets
    return (
      <ul className="list-none ml-1 mt-1 space-y-0.5">
        {desc.split('\n')
          .map(l => l.trim().replace(/^[\u2022\-\*\.]\s*/, '')) // Remove leading bullets/dots
          .filter(l => l)
          .map((line, i) => (
            <li key={i} className="relative pl-3.5 before:content-['•'] before:absolute before:left-0">{line}</li>
        ))}
      </ul>
    );
  };

  return (
    <div 
       className={`flex flex-col text-[#000000] bg-white ${fontClass} w-full leading-normal`}
       style={{ fontSize: baseFontSize, padding: `${0.5 * scale}in`, minHeight: '11in' }}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-[18pt] font-bold mb-1 tracking-tight">{personalDetails.fullName}</h1>
        <div className="flex justify-center flex-wrap gap-x-3 text-[10pt]">
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.phone && personalDetails.email && <span>|</span>}
          {personalDetails.email && <a href={`mailto:${personalDetails.email}`} className="underline">{personalDetails.email}</a>}
          {personalDetails.email && personalDetails.location && <span>|</span>}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
        <div className="flex justify-center flex-wrap gap-x-3 text-[10pt] mt-1">
          {personalDetails.links?.map((link, idx) => (
            <React.Fragment key={link.id}>
              {idx > 0 && <span>|</span>}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline">{link.name || link.url.replace(/^https?:\/\//, '')}</a>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <SectionHeader title="Professional Summary" />
          <div className="text-justify">{renderDescription(summary)}</div>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title="Education" />
          {education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between font-bold">
                <span>{edu.institution}</span>
                <span>{edu.location || ''}</span>
              </div>
              <div className="flex justify-between italic">
                <span>{edu.degree}</span>
                <span>{edu.startDate} – {edu.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="mb-4">
          <SectionHeader title="Technical Skills" />
          <p className="mt-1">
            {skills}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title="Experience" />
          {experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{exp.company}</span>
                <span>{exp.location || ''}</span>
              </div>
              <div className="flex justify-between font-bold italic">
                <span>{exp.jobTitle}</span>
                <span>{exp.startDate} – {exp.endDate}</span>
              </div>
              {renderDescription(exp.description)}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title="Projects" />
          {projects.map(proj => (
            <div key={proj.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-bold">
                  {proj.name}
                  {proj.url && <span className="font-normal"> | <a href={proj.url} className="underline text-[9pt]">Project Link</a></span>}
                </span>
                <span className="text-[9pt] italic">{proj.technologies || ''}</span>
              </div>
              {renderDescription(proj.description)}
            </div>
          ))}
        </div>
      )}

      {/* Accomplishments */}
      {accomplishments?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title="Accomplishments" />
          <ul className="list-disc ml-5 space-y-0.5 mt-1">
            {accomplishments.map(acc => (
              <li key={acc.id}>{acc.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ATSModernTemplate;
