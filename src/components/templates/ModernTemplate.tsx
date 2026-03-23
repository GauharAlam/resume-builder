import React from 'react';
import { ResumeData } from '@/types';

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
    const { personalDetails, summary, experience, accentColor, customization } = data;
    const fontClass = customization.fontFamily ? `font-${customization.fontFamily}` : 'font-sans';
    const themeColor = accentColor || '#111827';

    return (
        <div className={`p-10 text-gray-800 bg-white min-h-full ${fontClass}`}>
            <header className="border-b-4 pb-6 mb-8 text-center" style={{ borderColor: themeColor }}>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">{personalDetails.fullName}</h1>
                <p className="text-xl font-bold mt-1 uppercase tracking-widest" style={{ color: themeColor }}>{personalDetails.jobTitle}</p>
                <div className="flex justify-center gap-4 mt-4 text-sm font-medium text-gray-400">
                    <span>{personalDetails.email}</span>
                    <span>•</span>
                    <span>{personalDetails.phone}</span>
                    <span>•</span>
                    <span>{personalDetails.location}</span>
                </div>
            </header>
            <div className="grid grid-cols-1 gap-10">
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-1">Profile</h2>
                    <div className="text-sm leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-1">Experience</h2>
                        <div className="space-y-6">
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-base">{exp.jobTitle}</h3>
                                        <span className="text-xs font-black text-gray-300 bg-gray-50 px-2 py-0.5 rounded">{exp.startDate} – {exp.endDate}</span>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600 mb-2">{exp.company}</p>
                                    <div className="text-xs leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ModernTemplate;
