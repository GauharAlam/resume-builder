import React from 'react';
import { ResumeData } from '@/types';

const ATSModernTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, summary, experience, education, skills, projects, accomplishments, customization } = data;
  
  const baseFontSize = `${11 * scale}pt`; // Standard ATS size is usually 10-12pt
  const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';
  
  return (
    <div 
       className={`flex flex-col text-[#000000] bg-white ${fontClass} w-full leading-normal`}
       style={{ fontSize: baseFontSize, padding: `${0.5 * scale}in`, minHeight: '11in' }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-[18pt] font-bold mb-1">{personalDetails.fullName}</h1>
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
          <h3 className="font-bold border-b border-black uppercase text-[10pt] mb-1">Professional Summary</h3>
          <p className="text-justify">{summary}</p>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold border-b border-black uppercase text-[10pt] mb-1">Education</h3>
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
          <h3 className="font-bold border-b border-black uppercase text-[10pt] mb-1">Technical Skills</h3>
          <p>
            {skills}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold border-b border-black uppercase text-[10pt] mb-1">Experience</h3>
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
              {exp.description && (
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                    <li key={i}>{line.trim()}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold border-b border-black uppercase text-[10pt] mb-1">Projects</h3>
          {projects.map(proj => (
            <div key={proj.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-bold">
                  {proj.name}
                  {proj.url && <span className="font-normal"> | <a href={proj.url} className="underline text-[9pt]">Project Link</a></span>}
                </span>
                <span className="text-[9pt] italic">{proj.technologies || ''}</span>
              </div>
              <div className="mt-0.5" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Accomplishments */}
      {accomplishments?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold border-b border-black uppercase text-[10pt] mb-1">Accomplishments</h3>
          <ul className="list-disc ml-5 space-y-0.5">
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
