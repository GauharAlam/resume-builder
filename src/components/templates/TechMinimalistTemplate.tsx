import React from 'react';
import { ResumeData } from '@/types';

const TechMinimalistTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, summary, experience, education, skills, projects, accomplishments, customization, accentColor } = data;
  
  const baseFontSize = `${10 * scale}pt`;
  const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-mono';
  const themeColor = accentColor || '#000000';
  
  return (
    <div 
       className={`flex flex-col text-slate-800 bg-white ${fontClass} w-full leading-normal`}
       style={{ fontSize: baseFontSize, padding: `${30 * scale}px`, minHeight: '1123px' }}
    >
      {/* Name and Header */}
      <div className="mb-6 flex justify-between items-start border-b-4 pb-4" style={{ borderColor: themeColor }}>
        <div>
          <h1 className="text-[28pt] font-black tracking-tighter leading-none" style={{ color: themeColor }}>{personalDetails.fullName}</h1>
          <h2 className="text-[12pt] font-bold mt-1 uppercase tracking-widest opacity-60">{personalDetails.jobTitle}</h2>
        </div>
        <div className="text-right text-[9pt] font-bold uppercase tracking-tight">
          <p>{personalDetails.email}</p>
          <p>{personalDetails.phone}</p>
          <p>{personalDetails.location}</p>
          {personalDetails.links?.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block underline opacity-60 hover:opacity-100">{link.name || link.url.replace(/^https?:\/\//, '')}</a>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <div className="text-justify leading-relaxed" dangerouslySetInnerHTML={{ __html: summary }}></div>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="mb-6 bg-slate-50 p-4 border-l-4" style={{ borderColor: themeColor }}>
          <h3 className="text-[10pt] font-black uppercase tracking-widest mb-2" style={{ color: themeColor }}>Technical Arsenal</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {skills.split(',').map((skill, i) => (
              <span key={i} className="font-bold">
                <span className="opacity-30">#</span>{skill.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[10pt] font-black uppercase tracking-widest mb-4 border-b pb-1" style={{ color: themeColor }}>// Professional Path</h3>
          <div className="space-y-6">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between font-black uppercase tracking-tight text-[11pt]">
                  <span>{exp.jobTitle}</span>
                  <span className="opacity-50">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="font-bold opacity-70 mb-2 italic">{exp.company}</div>
                {exp.description && (
                  <div className="text-[9.5pt] leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[10pt] font-black uppercase tracking-widest mb-4 border-b pb-1" style={{ color: themeColor }}>// Code & Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(proj => (
              <div key={proj.id} className="border p-3 border-slate-100 rounded">
                <div className="flex justify-between font-bold mb-1">
                   <span>{proj.name}</span>
                   {proj.url && <a href={proj.url} className="text-[8pt] underline">src</a>}
                </div>
                <div className="text-[9pt] leading-snug opacity-80" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section>
          <h3 className="text-[10pt] font-black uppercase tracking-widest mb-2 border-b pb-1" style={{ color: themeColor }}>// Education</h3>
          <div className="flex flex-wrap gap-x-8">
            {education.map(edu => (
              <div key={edu.id} className="mb-2">
                <span className="font-bold">{edu.degree}</span>
                <span className="mx-2 opacity-30">|</span>
                <span className="font-bold opacity-60">{edu.institution}</span>
                <span className="ml-2 text-[8pt] font-bold opacity-40">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TechMinimalistTemplate;
