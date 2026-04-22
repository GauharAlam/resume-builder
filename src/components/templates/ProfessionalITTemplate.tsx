import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { ResumeData } from '@/types';

const SectionHeader: React.FC<{ title: string; color?: string }> = ({ title, color = '#111827' }) => (
  <div className="mb-[0.75em] border-b-[1.5px] pb-[0.2em]" style={{ borderColor: color }}>
    <h3 className="text-[1.1em] font-bold uppercase tracking-wider text-gray-900">{title}</h3>
  </div>
);

const ProfessionalITTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, summary, experience, education, skills, projects, accomplishments, accentColor, customization } = data;
  
  // Base font size is 14px * scale. All ems are relative to this.
  const baseFontSize = `${14 * scale}px`;
  const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';
  const themeColor = accentColor || '#4F46E5';
  
  return (
    <div 
       className={`flex flex-col text-gray-900 bg-white ${fontClass}`}
       style={{ fontSize: baseFontSize, padding: `${40 * scale}px`, minHeight: '1123px' }}
    >
      {/* Header */}
      <div className="text-center mb-[1.5em]">
        <h1 className="text-[2.2em] font-bold uppercase tracking-tight leading-none mb-[0.2em]" style={{ color: themeColor }}>{personalDetails.fullName}</h1>
        {personalDetails.jobTitle && (
          <h2 className="text-[1.2em] font-semibold text-gray-700 tracking-wider mb-[0.5em]">{personalDetails.jobTitle}</h2>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-x-[1.2em] gap-y-[0.3em] text-[0.85em] text-gray-700 font-medium">
          {personalDetails.email && <div className="flex items-center gap-[0.3em]"><Mail size="1.1em" className="text-gray-500 translate-y-[0.05em]" /> <span>{personalDetails.email}</span></div>}
          {personalDetails.phone && <div className="flex items-center gap-[0.3em]"><Phone size="1.1em" className="text-gray-500 translate-y-[0.05em]" /> <span>{personalDetails.phone}</span></div>}
          {personalDetails.location && <div className="flex items-center gap-[0.3em]"><MapPin size="1.1em" className="text-gray-500 translate-y-[0.05em]" /> <span>{personalDetails.location}</span></div>}
          {personalDetails.links?.map(link => (
            <div key={link.id} className="flex items-center gap-[0.3em]">
              <Globe size="1.1em" className="text-gray-500 translate-y-[0.05em]" /> <a href={link.url} className="hover:text-blue-600 transition-colors"><span>{link.name || link.url.replace(/^https?:\/\//, '')}</span></a>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-[1.2em]">
          <SectionHeader title="Professional Summary" color={themeColor} />
          <p className="text-[0.9em] leading-relaxed text-gray-800 text-justify">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div className="mb-[1.2em]">
          <SectionHeader title="Work Experience" color={themeColor} />
          <div className="flex flex-col gap-[1em]">
            {experience.map(exp => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-[0.1em]">
                  <h4 className="font-bold text-[1em] text-gray-900">{exp.jobTitle}</h4>
                  <span className="text-[0.85em] font-bold text-gray-600">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-[0.9em] font-bold text-gray-700 italic mb-[0.3em]">{exp.company}</div>
                {exp.description && (
                  <ul className="list-disc ml-[1.2em] text-[0.9em] leading-[1.6em] text-gray-800 space-y-[0.2em] marker:text-gray-500">
                    {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div className="mb-[1.2em]">
          <SectionHeader title="Projects & Technical Work" color={themeColor} />
          <div className="flex flex-col gap-[0.8em]">
            {projects.map(proj => (
              <div key={proj.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-[0.1em]">
                  <h4 className="font-bold text-[0.95em] text-gray-900">
                    {proj.name} {proj.url && <a href={proj.url} className="text-blue-600 font-normal ml-[0.5em] text-[0.85em] hover:underline">Link</a>}
                  </h4>
                </div>
                <p className="text-[0.9em] leading-[1.6em] text-gray-800">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-[1.2em]">
          <SectionHeader title="Education" color={themeColor} />
          <div className="flex flex-col gap-[0.6em]">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline break-inside-avoid">
                <div>
                  <h4 className="font-bold text-[0.95em] text-gray-900">{edu.degree}</h4>
                  <div className="text-[0.85em] font-medium text-gray-700">{edu.institution}</div>
                </div>
                <div className="text-[0.85em] font-bold text-gray-600 text-right">
                   {edu.startDate} – {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accomplishments */}
      {accomplishments?.length > 0 && (
        <div className="mb-[1.2em] break-inside-avoid">
          <SectionHeader title="Accomplishments & Awards" color={themeColor} />
          <ul className="list-disc ml-[1.2em] text-[0.9em] leading-[1.6em] text-gray-800 space-y-[0.3em] marker:text-gray-500">
            {accomplishments.map(acc => (
              <li key={acc.id}>{acc.description}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="mb-[1.2em] break-inside-avoid">
          <SectionHeader title="Technical Skills" color={themeColor} />
          <p className="text-[0.9em] leading-relaxed text-gray-800">
            {skills.split(',').map((skill, i) => (
              <span key={i} className="inline-block bg-gray-50 border border-gray-200 px-[0.6em] py-[0.1em] rounded-[0.3em] font-medium mr-[0.5em] mb-[0.4em] text-[0.9em] shadow-sm">
                {skill.trim()}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessionalITTemplate;
