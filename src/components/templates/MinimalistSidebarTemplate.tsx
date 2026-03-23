import React from 'react';
import { ResumeData } from '@/types';

const MinimalistSidebarTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, accentColor, customization } = data;
    const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';
    const themeColor = accentColor || '#94a3b8';

    return (
        <div className={`flex text-slate-700 bg-white min-h-full text-left ${fontClass}`}>
            <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col gap-8">
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 whitespace-nowrap leading-none" style={{ color: themeColor }}>Contact</h2>
                    <div className="space-y-2 text-[11px] font-medium leading-tight">
                        <p>{personalDetails.email}</p>
                        <p>{personalDetails.phone}</p>
                        <p>{personalDetails.location}</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 whitespace-nowrap leading-none" style={{ color: themeColor }}>Skills</h2>
                    <div className="flex flex-col gap-2">
                        {skills.split(',').map((s, i) => (
                            <div key={i} className="text-[11px] font-bold text-slate-600 border-b border-slate-100 pb-1 leading-tight">{s.trim()}</div>
                        ))}
                    </div>
                </div>
                {(education || []).length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 whitespace-nowrap leading-none" style={{ color: themeColor }}>Education</h2>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-4 last:mb-0">
                                <h3 className="font-bold text-[11px] text-slate-800 leading-tight">{edu.degree}</h3>
                                <p className="text-[10px] text-slate-500 mt-1 leading-tight">{edu.institution}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="w-2/3 p-10 flex flex-col gap-10">
                <header>
                    <h1 className="text-4xl font-light text-slate-900 leading-none mb-2">{personalDetails.fullName}</h1>
                    <p className="text-lg font-medium leading-none" style={{ color: themeColor }}>{personalDetails.jobTitle}</p>
                </header>
                <div className="text-sm leading-relaxed text-slate-600 max-w-xl prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                {(experience || []).length > 0 && (
                    <section>
                        <h2 className="text-[11px] font-black uppercase mb-6 border-b pb-2 leading-none" style={{ color: themeColor, borderColor: themeColor }}>Experience</h2>
                        <div className="flex flex-col gap-8">
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between mb-1">
                                        <h3 className="font-bold text-slate-900 text-sm leading-none">{exp.jobTitle}</h3>
                                        <span className="text-[10px] font-black text-slate-300 leading-none">{exp.startDate} – {exp.endDate}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2 leading-none">{exp.company}</p>
                                    <div className="text-xs text-slate-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MinimalistSidebarTemplate;
