import React from 'react';
import { ResumeData } from '@/types';

const ElegantTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, accentColor, customization } = data;
    const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-serif';
    const themeColor = accentColor || '#1e293b';

    return (
        <div className={`bg-[#fdfdfd] p-12 text-slate-900 min-h-full ${fontClass}`}>
            <header className="text-center mb-10">
                <h1 className="text-5xl font-light tracking-wide text-slate-900 mb-2">{personalDetails.fullName}</h1>
                <p className="text-lg uppercase tracking-[.25em] mb-6 leading-none" style={{ color: themeColor }}>{personalDetails.jobTitle}</p>
                <div className="flex justify-center items-center gap-6 text-xs font-sans text-slate-400 uppercase tracking-widest leading-none">
                    <span>{personalDetails.email}</span>
                    <span>•</span>
                    <span>{personalDetails.phone}</span>
                    <span>•</span>
                    <span>{personalDetails.location}</span>
                </div>
            </header>
            <main className="max-w-3xl mx-auto text-left">
                <section className="mb-10 text-center italic text-slate-600 px-10" dangerouslySetInnerHTML={{ __html: summary }}></section>
                {(experience || []).length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] border-b pb-2 mb-6 text-center text-slate-400" style={{ borderColor: themeColor }}>Experience</h2>
                        <div className="space-y-8">
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-lg font-bold leading-none">{exp.jobTitle}</h3>
                                        <span className="text-xs font-sans text-slate-400">{exp.startDate} — {exp.endDate}</span>
                                    </div>
                                    <p className="font-sans text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 leading-none">{exp.company}</p>
                                    <div className="text-sm leading-relaxed text-slate-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                <div className="grid grid-cols-2 gap-10">
                    <div>
                        {(education || []).length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] border-b pb-2 mb-6 text-slate-400" style={{ borderColor: themeColor }}>Education</h2>
                                {education.map(edu => (
                                    <div key={edu.id} className="mb-4 last:mb-0">
                                        <h3 className="font-bold text-sm leading-tight">{edu.degree}</h3>
                                        <p className="text-xs text-slate-500 mt-1 italic leading-tight">{edu.institution}</p>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                    <div>
                        <section>
                            <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] border-b pb-2 mb-6 text-slate-400" style={{ borderColor: themeColor }}>Skills</h2>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                {skills.split(',').map((s, i) => <span key={i} className="bg-slate-50 border border-slate-100 px-2 py-1">{s.trim()}</span>)}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ElegantTemplate;
