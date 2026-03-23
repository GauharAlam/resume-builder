import React from 'react';
import { ResumeData } from '@/types';

const StartupTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
    const { personalDetails, summary, experience, skills, accentColor, customization } = data;
    const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';
    const themeColor = accentColor || '#10B981';

    return (
        <div className={`flex flex-col text-slate-800 bg-white min-h-full ${fontClass}`}>
            <header className="bg-slate-900 text-white p-8 flex justify-between items-center text-left">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase leading-none">{personalDetails.fullName}</h1>
                    <p className="text-xl font-bold mt-1 leading-none" style={{ color: themeColor }}>{personalDetails.jobTitle}</p>
                </div>
                <div className="text-right text-sm space-y-1 opacity-90 leading-tight">
                    <p>{personalDetails.email}</p>
                    <p>{personalDetails.phone}</p>
                    <p>{personalDetails.location}</p>
                </div>
            </header>
            <div className="flex flex-1 text-left">
                <aside className="w-1/3 bg-slate-50 p-6 border-r border-slate-200">
                    <section className="mb-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.split(',').map((skill, i) => (
                                <span key={i} className="bg-white border border-slate-200 text-slate-700 text-xs px-2 py-1 rounded shadow-sm font-bold">
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </section>
                </aside>
                <main className="w-2/3 p-8">
                    <section className="mb-8 font-medium italic text-slate-600" dangerouslySetInnerHTML={{ __html: summary }}></section>
                    {(experience || []).length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Experience</h2>
                            <div className="space-y-6">
                                {experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg text-slate-900 leading-none">{exp.jobTitle}</h3>
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black uppercase text-slate-500">{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <p className="font-black text-xs uppercase mb-2 leading-none" style={{ color: themeColor }}>{exp.company}</p>
                                        <div className="text-xs text-slate-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StartupTemplate;
