import React from 'react';
import { ResumeData } from '@/types';

const StandardClassicTemplate: React.FC<{ data: ResumeData; scale?: number }> = ({ data, scale = 1 }) => {
  const { personalDetails, summary, experience, education, skills, projects, accomplishments, customization } = data;
  
  const baseFontSize = `${11 * scale}pt`;
  const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-serif';
  
  return (
    <div 
       className={`flex flex-col text-[#111827] bg-white ${fontClass} w-full leading-relaxed`}
       style={{ fontSize: baseFontSize, padding: `${40 * scale}px`, minHeight: '1123px' }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-[24pt] font-black uppercase tracking-tight leading-none mb-1">{personalDetails.fullName}</h1>
        <h2 className="text-[14pt] font-semibold text-slate-600 mb-3">{personalDetails.jobTitle}</h2>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-[10pt] font-medium text-slate-500">
           {personalDetails.email && <span>{personalDetails.email}</span>}
           {personalDetails.phone && <span>{personalDetails.phone}</span>}
           {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 text-[10pt] mt-1 italic text-indigo-600">
          {personalDetails.links?.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">{link.name || link.url.replace(/^https?:\/\//, '')}</a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Experience */}
        {experience?.length > 0 && (
          <section>
            <h3 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Professional Experience</h3>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-[11pt]">{exp.jobTitle}</h4>
                    <span className="text-[10pt] font-semibold text-slate-500">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="text-[10pt] font-bold text-slate-700 mb-2">{exp.company}</div>
                  {exp.description && (
                    <ul className="list-disc ml-5 text-[10.5pt] space-y-1">
                      {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                        <li key={i}>{line.trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                {/* Skills */}
                {skills && (
                  <section>
                    <h3 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.split(',').map((skill, i) => (
                        <span key={i} className="text-[10pt] bg-slate-50 px-2 py-0.5 border border-slate-200 rounded font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {education?.length > 0 && (
                  <section>
                    <h3 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Education</h3>
                    {education.map(edu => (
                      <div key={edu.id} className="mb-3">
                        <h4 className="font-bold text-[10.5pt]">{edu.degree}</h4>
                        <div className="text-[10pt] font-medium text-slate-600">{edu.institution}</div>
                        <div className="text-[9pt] italic text-slate-500">{edu.startDate} – {edu.endDate}</div>
                      </div>
                    ))}
                  </section>
                )}
            </div>

            <div className="space-y-6">
                {/* Projects */}
                {projects?.length > 0 && (
                  <section>
                    <h3 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Selected Projects</h3>
                    {projects.map(proj => (
                      <div key={proj.id} className="mb-3">
                        <h4 className="font-bold text-[10.5pt] flex justify-between">
                          {proj.name}
                          {proj.url && <a href={proj.url} className="text-indigo-600 text-[9pt] font-normal underline">View</a>}
                        </h4>
                        <div className="text-[10pt] text-slate-700 leading-snug mt-1" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                      </div>
                    ))}
                  </section>
                )}

                {/* Accomplishments */}
                {accomplishments?.length > 0 && (
                  <section>
                    <h3 className="text-[12pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Awards & Honors</h3>
                    <ul className="list-disc ml-5 text-[10pt] space-y-1 italic text-slate-600">
                      {accomplishments.map(acc => (
                        <li key={acc.id}>{acc.description}</li>
                      ))}
                    </ul>
                  </section>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StandardClassicTemplate;
