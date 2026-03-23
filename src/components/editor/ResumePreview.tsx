import React from 'react';
import { useResume, useAutoFit } from '@/hooks';
import { ResumeData, TemplateID, FontFamily, FontSize, LayoutSpacing } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import ProfessionalITTemplate from '../templates/ProfessionalITTemplate';

// --- TEMPLATES ---

interface TemplateProps {
    data: ResumeData;
}

const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="bg-white p-10 leading-snug text-gray-800 font-sans">
            <header className="text-center border-b-2 border-gray-200 pb-2 mb-4">
                <h1 className="text-4xl font-bold tracking-wide text-gray-900">{personalDetails.fullName}</h1>
                <h2 className="text-xl font-medium accent-text mt-1">{personalDetails.jobTitle}</h2>
                <div className="flex justify-center items-center flex-wrap gap-x-4 text-sm text-gray-600 mt-3">
                    <span>{personalDetails.email}</span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span>{personalDetails.phone}</span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span>{personalDetails.location}</span>
                    {(personalDetails.links || []).map(link => (
                        <React.Fragment key={link.id}>
                            <span className="text-gray-300 hidden sm:inline">|</span>
                            <a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                        </React.Fragment>
                    ))}
                </div>
            </header>

            <main>
                <section className="mb-6">
                    <h3 className="text-lg font-semibold uppercase tracking-wider accent-text accent-border-b-2-light pb-1 mb-2">About Me</h3>
                    <div className="text-gray-700 text-sm leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>

                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold uppercase tracking-wider accent-text accent-border-b-2-light pb-1 mb-2">Experience</h3>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-md font-bold text-gray-800">{exp.jobTitle}</h4>
                                    <p className="text-sm font-medium text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <p className="text-md font-semibold text-gray-700 italic">{exp.company}</p>
                                <div className="mt-2 pl-4 border-l-2 border-gray-200 text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                            </div>
                        ))}
                    </section>
                )}

                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold uppercase tracking-wider accent-text accent-border-b-2-light pb-1 mb-2">Projects</h3>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-md font-bold text-gray-800">{proj.name}</h4>
                                    {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-500 hover:underline">View Project</a>}
                                </div>
                                <div className="mt-1 pl-4 border-l-2 border-gray-200 text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                            </div>
                        ))}
                    </section>
                )}

                {(education || []).length > 0 && (
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold uppercase tracking-wider accent-text accent-border-b-2-light pb-1 mb-2">Education</h3>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-md font-bold text-gray-800">{edu.degree}</h4>
                                    <p className="text-sm font-medium text-gray-500">{edu.startDate} - {edu.endDate}</p>
                                </div>
                                <p className="text-md font-semibold text-gray-700 italic">{edu.institution}</p>
                            </div>
                        ))}
                    </section>
                )}

                {(accomplishments || []).length > 0 && (
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold uppercase tracking-wider accent-text accent-border-b-2-light pb-1 mb-2">Accomplishments</h3>
                        <div className="mt-2 text-sm text-gray-700 leading-normal prose max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h3 className="text-lg font-semibold uppercase tracking-wider accent-text accent-border-b-2-light pb-1 mb-2">Skills</h3>
                    <p className="text-gray-700 text-sm leading-normal" dangerouslySetInnerHTML={{ __html: skills }}></p>
                </section>
            </main>
        </div>
    )
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="bg-white p-10 font-serif text-gray-900">
            <header className="text-center mb-6">
                <h1 className="text-5xl font-bold">{personalDetails.fullName}</h1>
                <p className="text-2xl mt-2">{personalDetails.jobTitle}</p>
                <p className="text-sm mt-4">
                    {personalDetails.location} &bull; {personalDetails.phone} &bull; {personalDetails.email}
                    {(personalDetails.links || []).map(link => (
                        <React.Fragment key={link.id}>
                            &nbsp;&bull;&nbsp;<a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                        </React.Fragment>
                    ))}
                </p>
            </header>
            <main>
                <section className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">ABOUT ME</h2>
                    <div className="text-sm leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">PROFESSIONAL EXPERIENCE</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold">{exp.company}</h3>
                                    <p className="text-sm">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <p className="text-md italic">{exp.jobTitle}</p>
                                <div className="mt-2 text-sm space-y-1 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">PROJECTS</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold">{proj.name}</h3>
                                    {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">Project Link</a>}
                                </div>
                                <div className="mt-2 text-sm space-y-1 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {(education || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">EDUCATION</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold">{edu.institution}</h3>
                                    <p className="text-sm">{edu.startDate} - {edu.endDate}</p>
                                </div>
                                <p className="text-md italic">{edu.degree}</p>
                            </div>
                        ))}
                    </section>
                )}

                {(accomplishments || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">ACCOMPLISHMENTS & AWARDS</h2>
                        <div className="mt-2 text-sm space-y-1 leading-normal prose max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">SKILLS</h2>
                    <p className="text-sm leading-normal" dangerouslySetInnerHTML={{ __html: skills }}></p>
                </section>
            </main>
        </div>
    )
}

const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    const skillList = skills.split(',').map(s => s.trim());
    return (
        <div className="flex font-sans text-sm h-full">
            {/* Left Column */}
            <div className="w-1/3 bg-gray-800 text-white p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-wider">{personalDetails.fullName.split(' ')[0]}</h1>
                    <h1 className="text-3xl font-bold tracking-wider -mt-2">{personalDetails.fullName.split(' ').slice(1).join(' ')}</h1>
                    <p className="text-lg text-gray-300 mt-2">{personalDetails.jobTitle}</p>
                </div>

                <div className="mt-6">
                    <h2 className="uppercase font-bold tracking-widest text-gray-300 border-b border-gray-500 pb-1 mb-2">Contact</h2>
                    <p className="mb-1">{personalDetails.phone}</p>
                    <p className="mb-1 break-words">{personalDetails.email}</p>
                    <p className="mb-2">{personalDetails.location}</p>
                    {(personalDetails.links || []).map(link => (
                        <p key={link.id} className="mb-1 break-words">
                            <a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                        </p>
                    ))}
                </div>

                {(skillList || []).length > 0 && (
                    <div className="mt-6">
                        <h2 className="uppercase font-bold tracking-widest text-gray-300 border-b border-gray-500 pb-1 mb-2">Skills</h2>
                        <ul className="space-y-1 leading-normal">
                            {skillList.map((skill, i) => <li key={i} dangerouslySetInnerHTML={{ __html: skill }}></li>)}
                        </ul>
                    </div>
                )}

                {(accomplishments || []).length > 0 && (
                    <div className="mt-6">
                        <h2 className="uppercase font-bold tracking-widest text-gray-300 border-b border-gray-500 pb-1 mb-2">Awards</h2>
                        <div className="space-y-1 text-sm leading-normal prose-invert max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/3 p-8 bg-white text-gray-700">
                <section className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-2">About Me</h2>
                    <div className="leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-2">Experience</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold text-gray-800">{exp.jobTitle}</h3>
                                    <p className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <p className="text-md font-semibold text-gray-600 italic">{exp.company}</p>
                                <div className="mt-2 space-y-1 text-sm leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-2">Projects</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold text-gray-800">{proj.name}</h3>
                                    {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-500 hover:underline">Link</a>}
                                </div>
                                <div className="mt-2 space-y-1 text-sm leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {(education || []).length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-2">Education</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                                    <p className="text-xs font-medium text-gray-500">{edu.startDate} - {edu.endDate}</p>
                                </div>
                                <p className="text-md font-semibold text-gray-600 italic">{edu.institution}</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    )
}

const MinimalistTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="bg-white p-12 font-sans text-gray-800">
            <header className="mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight">{personalDetails.fullName}</h1>
                <p className="text-lg text-gray-600 mt-1">{personalDetails.jobTitle}</p>
                <div className="text-xs text-gray-500 mt-3 flex flex-wrap gap-x-4">
                    <span>{personalDetails.email}</span>
                    <span>{personalDetails.phone}</span>
                    <span>{personalDetails.location}</span>
                    {(personalDetails.links || []).map(link => (
                        <a key={link.id} href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                    ))}
                </div>
            </header>
            <main>
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">About Me</h2>
                    <div className="text-sm leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Experience</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-semibold">{exp.jobTitle} at {exp.company}</h3>
                                    <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <div className="mt-1 text-sm space-y-1 text-gray-600 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Projects</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-semibold">{proj.name}</h3>
                                    {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline">Link</a>}
                                </div>
                                <div className="mt-1 text-sm space-y-1 text-gray-600 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(education || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Education</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-semibold">{edu.degree}, {edu.institution}</h3>
                                    <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {(accomplishments || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Accomplishments</h2>
                        <div className="mt-1 text-sm space-y-1 text-gray-600 leading-normal prose max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Skills</h2>
                    <p className="text-sm leading-normal" dangerouslySetInnerHTML={{ __html: skills }}></p>
                </section>
            </main>
        </div>
    )
}

const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="flex font-sans text-sm h-full">
            {/* Left Column */}
            <div className="w-1/3 accent-bg text-white p-8">
                <h1 className="text-4xl font-bold tracking-tight">{personalDetails.fullName}</h1>
                <p className="text-lg opacity-80 mt-1">{personalDetails.jobTitle}</p>

                <div className="mt-6">
                    <h2 className="text-sm uppercase font-semibold tracking-wider opacity-80 border-b border-white border-opacity-40 pb-1 mb-2">Contact</h2>
                    <p className="mb-1 text-xs">{personalDetails.phone}</p>
                    <p className="mb-1 break-words text-xs">{personalDetails.email}</p>
                    <p className="text-xs mb-2">{personalDetails.location}</p>
                    {(personalDetails.links || []).map(link => (
                        <p key={link.id} className="mb-1 text-xs break-words">
                            <a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                        </p>
                    ))}
                </div>

                <div className="mt-5">
                    <h2 className="text-sm uppercase font-semibold tracking-wider opacity-80 border-b border-white border-opacity-40 pb-1 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {skills.split(',').map((skill, i) => <span key={i} className="bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded" dangerouslySetInnerHTML={{ __html: skill.trim() }}></span>)}
                    </div>
                </div>

                {(accomplishments || []).length > 0 && (
                    <div className="mt-5">
                        <h2 className="text-sm uppercase font-semibold tracking-wider opacity-80 border-b border-white border-opacity-40 pb-1 mb-2">Awards</h2>
                        <div className="mt-2 text-xs space-y-1 leading-normal prose-invert max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/3 p-8 bg-white text-gray-700">
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">About Me</h2>
                    <div className="leading-normal text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Work Experience</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-3 relative pl-4">
                                <div className="absolute left-0 top-1 h-full w-px bg-gray-200"></div>
                                <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full accent-bg"></div>
                                <p className="text-xs font-bold text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                <h3 className="text-md font-semibold text-gray-900 mt-1">{exp.jobTitle}</h3>
                                <p className="text-sm font-medium text-gray-600">{exp.company}</p>
                                <div className="mt-2 space-y-1 text-xs text-gray-600 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Key Projects</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3 relative pl-4">
                                <div className="absolute left-0 top-1 h-full w-px bg-gray-200"></div>
                                <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full accent-bg"></div>
                                <h3 className="text-md font-semibold text-gray-900 mt-1">{proj.name}</h3>
                                {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-600 hover:underline">Project Link</a>}
                                <div className="mt-2 space-y-1 text-xs text-gray-600 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
                {(education || []).length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Education</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <p className="text-xs font-bold text-gray-500">{edu.startDate} - {edu.endDate}</p>
                                <h3 className="text-md font-semibold text-gray-900 mt-1">{edu.degree}</h3>
                                <p className="text-sm font-medium text-gray-600">{edu.institution}</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    )
}

const CorporateTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="flex font-sans text-sm h-full">
            <div className="w-1/3 bg-gray-100 p-8 text-gray-700">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Contact</h2>
                <p className="mb-1">{personalDetails.phone}</p>
                <p className="mb-1 break-words">{personalDetails.email}</p>
                <p className="mb-3">{personalDetails.location}</p>
                {(personalDetails.links || []).map(link => (
                    <p key={link.id} className="mb-1 break-words">
                        <a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold">{link.name}</a>
                    </p>
                ))}

                {(skills || "").length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Skills</h2>
                        <div className="leading-normal" dangerouslySetInnerHTML={{ __html: skills.split(',').map(s => `<div>${s.trim()}</div>`).join('') }}></div>
                    </div>
                )}

                {(education || []).length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Education</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                                <p className="text-xs">{edu.institution}</p>
                                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                            </div>
                        ))}
                    </div>
                )}
                {(accomplishments || []).length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Awards</h2>
                        <div className="leading-normal prose max-w-none text-xs" dangerouslySetInnerHTML={{ __html: accomplishments.map(a => a.description).join('') }}></div>
                    </div>
                )}
            </div>
            <div className="w-2/3 p-8 bg-white text-gray-800">
                <header className="mb-6">
                    <h1 className="text-5xl font-bold accent-text">{personalDetails.fullName}</h1>
                    <p className="text-2xl text-gray-600 mt-1">{personalDetails.jobTitle}</p>
                </header>
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider accent-text border-b-2 border-gray-200 pb-1 mb-2">Profile</h2>
                    <div className="leading-relaxed prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-lg font-bold uppercase tracking-wider accent-text border-b-2 border-gray-200 pb-1 mb-2">Experience</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-bold">{exp.jobTitle}</h3>
                                    <p className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</p>

                                </div>
                                <p className="text-sm font-semibold text-gray-600">{exp.company}</p>
                                <div className="mt-1 text-xs text-gray-700 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(projects || []).length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-wider accent-text border-b-2 border-gray-200 pb-1 mb-2">Projects</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-4">
                                <h3 className="text-md font-bold">{proj.name}</h3>
                                {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline">View Project</a>}
                                <div className="mt-1 text-xs text-gray-700 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    )
}

const AcademicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="bg-white p-10 font-serif text-gray-900 text-sm">
            <header className="text-center mb-6 border-b border-gray-300 pb-3">
                <h1 className="text-4xl font-bold">{personalDetails.fullName}</h1>
                <p className="text-lg mt-1">{personalDetails.jobTitle}</p>
                <p className="text-xs mt-3">
                    {personalDetails.location} | {personalDetails.phone} | {personalDetails.email}
                    {(personalDetails.links || []).map(link => (
                        <React.Fragment key={link.id}>
                            &nbsp;|&nbsp;<a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                        </React.Fragment>
                    ))}
                </p>
            </header>
            <main>
                <section className="mb-6">
                    <h2 className="text-md font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Summary</h2>
                    <div className="leading-normal prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                {(education || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-md font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Education</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-bold">{edu.institution}</h3>
                                    <p className="text-xs">{edu.startDate} - {edu.endDate}</p>
                                </div>
                                <p className="italic">{edu.degree}</p>
                            </div>
                        ))}
                    </section>
                )}
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-md font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Research Experience</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-bold">{exp.jobTitle}</h3>
                                    <p className="text-xs">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <p className="italic">{exp.company}</p>
                                <div className="mt-1 text-xs space-y-1 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-md font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Projects</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3">
                                <h3 className="text-md font-bold">{proj.name}</h3>
                                {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline">Project Link</a>}
                                <div className="mt-1 text-xs space-y-1 leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(accomplishments || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-md font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Publications & Awards</h2>
                        <div className="mt-1 text-xs space-y-1 leading-normal prose max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </section>
                )}
                <section>
                    <h2 className="text-md font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Technical Skills</h2>
                    <p className="leading-normal text-sm" dangerouslySetInnerHTML={{ __html: skills }}></p>
                </section>
            </main>
        </div>
    )
}

const TechnicalTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="bg-white p-8 font-mono text-gray-800 text-sm">
            <header className="flex justify-between items-center mb-4 border-b pb-2">
                <div>
                    <h1 className="text-3xl font-bold">{personalDetails.fullName}</h1>
                    <p className="text-md accent-text">{personalDetails.jobTitle}</p>
                </div>
                <div className="text-right text-xs">
                    <p>{personalDetails.email}</p>
                    <p>{personalDetails.phone}</p>
                    <p>{personalDetails.location}</p>
                    {(personalDetails.links || []).map(link => (
                        <a key={link.id} href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="block hover:underline">{link.name}</a>
                    ))}
                </div>
            </header>
            <main>
                <section className="mb-6">
                    <h2 className="text-md font-bold accent-text">// SUMMARY</h2>
                    <div className="mt-1 leading-normal prose max-w-none text-xs" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>
                <section className="mb-6">
                    <h2 className="text-md font-bold accent-text">// SKILLS</h2>
                    <div className="mt-1 leading-normal text-xs" dangerouslySetInnerHTML={{ __html: skills }}></div>
                </section>
                {(experience || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-md font-bold accent-text">// EXPERIENCE</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold">{exp.jobTitle} @ {exp.company}</h3>
                                    <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <div className="mt-1 text-xs leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(projects || []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-md font-bold accent-text">// PROJECTS</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold">{proj.name}</h3>
                                    {proj.url && <a href={`https://${proj.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline">[link]</a>}
                                </div>
                                <div className="mt-1 text-xs leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                            </div>
                        ))}
                    </section>
                )}
                {(education || []).length > 0 && (
                    <section>
                        <h2 className="text-md font-bold accent-text">// EDUCATION</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold">{edu.degree}</h3>
                                    <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                                </div>
                                <p className="text-sm">{edu.institution}</p>
                            </div>
                        ))}
                    </section>
                )}
                {(accomplishments || []).length > 0 && (
                    <section className="mt-6">
                        <h2 className="text-md font-bold accent-text">// ACHIEVEMENTS</h2>
                        <div className="mt-1 text-xs leading-normal prose max-w-none" dangerouslySetInnerHTML={{ __html: accomplishments.map(a => a.description).join('') }}></div>
                    </section>
                )}
            </main>
        </div>
    )
}


const StartupTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="flex flex-col font-sans text-slate-800 bg-white min-h-full">
            <header className="bg-slate-900 text-white p-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">{personalDetails.fullName}</h1>
                    <p className="text-xl text-emerald-400 font-bold mt-1">{personalDetails.jobTitle}</p>
                </div>
                <div className="text-right text-sm space-y-1 opacity-90">
                    <p>{personalDetails.email}</p>
                    <p>{personalDetails.phone}</p>
                    <p>{personalDetails.location}</p>
                </div>
            </header>
            
            <div className="flex flex-1">
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

                    {(education || []).length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Education</h2>
                            {education.map(edu => (
                                <div key={edu.id} className="mb-4 last:mb-0">
                                    <h3 className="font-bold text-sm text-slate-900">{edu.degree}</h3>
                                    <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{edu.startDate} — {edu.endDate}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {(accomplishments || []).length > 0 && (
                        <section>
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Awards</h2>
                            <div className="space-y-3">
                                {accomplishments.map(acc => (
                                    <div key={acc.id} className="text-xs text-slate-600 leading-relaxed border-l-2 border-emerald-400 pl-3 italic" dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>

                <main className="w-2/3 p-8">
                    <section className="mb-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">About</h2>
                        <div className="text-sm leading-relaxed text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: summary }}></div>
                    </section>

                    {(experience || []).length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Experience</h2>
                            <div className="space-y-6">
                                {experience.map(exp => (
                                    <div key={exp.id} className="relative">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg text-slate-900">{exp.jobTitle}</h3>
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black uppercase text-slate-500">{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <p className="text-emerald-600 font-black text-xs uppercase tracking-tighter mb-2">{exp.company}</p>
                                        <div className="text-xs text-slate-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {(projects || []).length > 0 && (
                        <section>
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Key Projects</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {projects.map(proj => (
                                    <div key={proj.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <h3 className="font-bold text-sm text-slate-900 flex justify-between">
                                            {proj.name}
                                            {proj.url && <a href={proj.url} className="text-emerald-600 hover:underline text-[10px] uppercase">Link →</a>}
                                        </h3>
                                        <div className="text-xs text-slate-600 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
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

const ElegantTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="bg-[#fdfdfd] p-12 font-serif text-slate-900 min-h-full">
            <header className="text-center mb-10">
                <h1 className="text-5xl font-light tracking-wide text-slate-900 mb-2">{personalDetails.fullName}</h1>
                <p className="text-lg uppercase tracking-[.25em] text-slate-500 mb-6 font-sans">{personalDetails.jobTitle}</p>
                <div className="flex justify-center items-center gap-6 text-xs font-sans text-slate-400 uppercase tracking-widest">
                    <span>{personalDetails.email}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span>{personalDetails.phone}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span>{personalDetails.location}</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto">
                <section className="mb-10 text-center">
                    <p className="text-sm italic leading-relaxed text-slate-600 px-10" dangerouslySetInnerHTML={{ __html: summary }}></p>
                </section>

                <div className="grid grid-cols-1 gap-10">
                    {(experience || []).length > 0 && (
                        <section>
                            <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] text-slate-400 border-b border-slate-100 pb-2 mb-6">Experience</h2>
                            <div className="space-y-8">
                                {experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-lg font-bold">{exp.jobTitle}</h3>
                                            <span className="text-xs font-sans text-slate-400 whitespace-nowrap">{exp.startDate} &mdash; {exp.endDate}</span>
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
                                    <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] text-slate-400 border-b border-slate-100 pb-2 mb-6">Education</h2>
                                    {education.map(edu => (
                                        <div key={edu.id} className="mb-4 last:mb-0">
                                            <h3 className="font-bold text-sm">{edu.degree}</h3>
                                            <p className="text-xs text-slate-500 mt-1 italic">{edu.institution}</p>
                                            <p className="text-[10px] font-sans text-slate-400 mt-1 uppercase tracking-tighter">{edu.startDate} — {edu.endDate}</p>
                                        </div>
                                    ))}
                                </section>
                            )}
                            
                            <section>
                                <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] text-slate-400 border-b border-slate-100 pb-2 mb-6">Expertise</h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.split(',').map((skill, i) => (
                                        <span key={i} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 border border-slate-100">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div>
                            {(projects || []).length > 0 && (
                                <section className="mb-10">
                                    <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] text-slate-400 border-b border-slate-100 pb-2 mb-6">Projects</h2>
                                    {projects.map(proj => (
                                        <div key={proj.id} className="mb-4 last:mb-0">
                                            <h3 className="font-bold text-sm">{proj.name}</h3>
                                            <div className="text-xs text-slate-600 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                                            {proj.url && <a href={proj.url} className="text-[10px] font-sans text-slate-400 uppercase tracking-widest mt-1 inline-block hover:text-slate-900 transition-colors underline underline-offset-4">View Selection</a>}
                                        </div>
                                    ))}
                                </section>
                            )}

                            {(accomplishments || []).length > 0 && (
                                <section>
                                    <h2 className="text-sm font-sans font-bold uppercase tracking-[.2em] text-slate-400 border-b border-slate-100 pb-2 mb-6">Honors</h2>
                                    <div className="space-y-3">
                                        {accomplishments.map(acc => (
                                            <div key={acc.id} className="text-xs text-slate-600 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const MinimalistSidebarTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="flex font-sans text-slate-700 bg-white min-h-full">
            {/* Sidebar */}
            <div className="w-1/4 bg-slate-50 p-8 border-r border-slate-100 flex flex-col gap-8">
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4 whitespace-nowrap">Contact</h2>
                    <div className="space-y-2 text-[11px] font-medium">
                        <p className="break-words">{personalDetails.email}</p>
                        <p>{personalDetails.phone}</p>
                        <p>{personalDetails.location}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Skills</h2>
                    <div className="flex flex-col gap-2 shadow-none">
                        {skills.split(',').map((skill, i) => (
                            <div key={i} className="text-[11px] font-bold text-slate-600 border-b border-slate-100 pb-1">
                                {skill.trim()}
                            </div>
                        ))}
                    </div>
                </div>

                {(education || []).length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Education</h2>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-4 last:mb-0">
                                <h3 className="font-bold text-[11px] text-slate-800 leading-tight">{edu.degree}</h3>
                                <p className="text-[10px] text-slate-500 mt-1">{edu.institution}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-3/4 p-10 flex flex-col gap-10">
                <header>
                    <h1 className="text-4xl font-light text-slate-900 leading-none mb-2">{personalDetails.fullName}</h1>
                    <p className="text-lg font-medium text-slate-400">{personalDetails.jobTitle}</p>
                </header>

                <section>
                    <div className="text-sm leading-relaxed text-slate-600 max-w-xl" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>

                {(experience || []).length > 0 && (
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-300 mb-6">Experience</h2>
                        <div className="flex flex-col gap-8">
                            {experience.map(exp => (
                                <div key={exp.id} className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <p className="text-[10px] font-black text-slate-300 mt-1">{exp.startDate} – {exp.endDate}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <h3 className="font-bold text-slate-900 text-sm mb-1">{exp.jobTitle}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-3">{exp.company}</p>
                                        <div className="text-xs text-slate-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {(projects || []).length > 0 && (
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-300 mb-6">Projects</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {projects.map(proj => (
                                <div key={proj.id}>
                                    <h3 className="font-bold text-slate-900 text-sm mb-2">{proj.name}</h3>
                                    <div className="text-[11px] text-slate-600 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                                    {proj.url && <a href={proj.url} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 underline underline-offset-4 decoration-slate-200">View Project</a>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// Professional Template with Photo Support
const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalDetails, summary, experience, education, skills, projects, accomplishments } = data;
    return (
        <div className="flex font-sans text-sm h-full bg-white">
            {/* Left Sidebar with Photo */}
            <div className="w-1/3 accent-bg text-white p-6">
                {/* Photo Section */}
                <div className="flex justify-center mb-4">
                    {personalDetails.photo ? (
                        <img
                            src={personalDetails.photo}
                            alt={personalDetails.fullName}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white border-opacity-40">
                            <span className="text-4xl font-bold text-white text-opacity-60">
                                {personalDetails.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Name & Title */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">{personalDetails.fullName}</h1>
                    <p className="text-base opacity-90 mt-1">{personalDetails.jobTitle}</p>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                    <h2 className="text-sm uppercase font-bold tracking-wider opacity-80 border-b border-white border-opacity-30 pb-1 mb-3">Contact</h2>
                    <div className="space-y-2 text-xs">
                        <p>📧 {personalDetails.email}</p>
                        <p>📱 {personalDetails.phone}</p>
                        <p>📍 {personalDetails.location}</p>
                        {(personalDetails.links || []).map(link => (
                            <p key={link.id}>🔗 <a href={`https://${link.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a></p>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                    <h2 className="text-sm uppercase font-bold tracking-wider opacity-80 border-b border-white border-opacity-30 pb-1 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                        {skills.split(',').map((skill, i) => (
                            <span key={i} className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full" dangerouslySetInnerHTML={{ __html: skill.trim() }}></span>
                        ))}
                    </div>
                </div>

                {/* Education */}
                {(education || []).length > 0 && (
                    <div>
                        <h2 className="text-sm uppercase font-bold tracking-wider opacity-80 border-b border-white border-opacity-30 pb-1 mb-3">Education</h2>
                        {(education || []).map(edu => (
                            <div key={edu.id} className="mb-3">
                                <h3 className="font-semibold text-xs">{edu.degree}</h3>
                                <p className="text-xs opacity-80">{edu.institution}</p>
                                <p className="text-xs opacity-60">{edu.startDate} - {edu.endDate}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Content */}
            <div className="w-2/3 p-6 text-gray-800">
                {/* Summary */}
                <section className="mb-5">
                    <h2 className="text-lg font-bold uppercase tracking-wide accent-text border-b-2 border-gray-200 pb-1 mb-3">Profile</h2>
                    <div className="text-sm leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                </section>

                {/* Experience */}
                {(experience || []).length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-lg font-bold uppercase tracking-wide accent-text border-b-2 border-gray-200 pb-1 mb-3">Experience</h2>
                        {(experience || []).map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold text-gray-900">{exp.jobTitle}</h3>
                                    <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-600 italic">{exp.company}</p>
                                <div className="mt-1 text-xs leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Projects */}
                {(projects || []).length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-lg font-bold uppercase tracking-wide accent-text border-b-2 border-gray-200 pb-1 mb-3">Projects</h2>
                        {(projects || []).map(proj => (
                            <div key={proj.id} className="mb-3">
                                <h3 className="text-sm font-bold text-gray-900">{proj.name}</h3>
                                <div className="mt-1 text-xs leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Accomplishments */}
                {(accomplishments || []).length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-wide accent-text border-b-2 border-gray-200 pb-1 mb-3">Achievements</h2>
                        <div className="text-xs leading-relaxed prose max-w-none">
                            {(accomplishments || []).map(acc => (
                                <div key={acc.id} dangerouslySetInnerHTML={{ __html: acc.description }}></div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}


// --- MAIN COMPONENT ---

const getFontFamily = (font: FontFamily): string => {
    if (font === 'serif') return 'Georgia, "Times New Roman", Times, serif';
    if (font === 'mono') return '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace';
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
};

const getFontScale = (size: FontSize): string => {
    if (size === 'small') return '0.9';
    if (size === 'large') return '1.1';
    return '1';
};

const getLayoutSpacing = (layout: LayoutSpacing): string => {
    if (layout === 'compact') return '0.75';
    if (layout === 'spacious') return '1.25';
    return '1';
};

const ResumePreview: React.FC = () => {
    const { resumeData, template, setTemplate } = useResume();
    const { customization } = resumeData;
    const [zoom, setZoom] = React.useState(100);
    const [isAutoFitEnabled, setIsAutoFitEnabled] = React.useState(false);

    const contentRef = React.useRef<HTMLDivElement>(null);
    const { scale, isOverflowing, fitPercentage } = useAutoFit(contentRef, {
        enabled: isAutoFitEnabled,
        minScale: 0.65, // Minimum 65% scale (approx 9px font size)
        maxScale: 1.0
    });

    const templates: { id: TemplateID; name: string }[] = [
        { id: 'modern', name: 'Modern' },
        { id: 'classic', name: 'Classic' },
        { id: 'creative', name: 'Creative' },
        { id: 'minimalist', name: 'Minimalist' },
        { id: 'executive', name: 'Executive' },
        { id: 'corporate', name: 'Corporate' },
        { id: 'academic', name: 'Academic' },
        { id: 'technical', name: 'Technical' },
        { id: 'professional', name: '📷 Photo' },
        { id: 'professional-it', name: 'Professional IT' },
        { id: 'startup', name: 'Startup' },
        { id: 'elegant', name: 'Elegant' },
        { id: 'minimalist-sidebar', name: 'Minimalist Sidebar' },
    ];

    const renderTemplate = () => {
        const textScale = resumeData.customization?.textScale ?? 1;
        
        // Map template ID to component
        switch (template) {
            case 'modern': return <ModernTemplate data={resumeData} />;
            case 'classic': return <ClassicTemplate data={resumeData} />;
            case 'creative': return <CreativeTemplate data={resumeData} />;
            case 'minimalist': return <MinimalistTemplate data={resumeData} />;
            case 'executive': return <ExecutiveTemplate data={resumeData} />;
            case 'corporate': return <CorporateTemplate data={resumeData} />;
            case 'academic': return <AcademicTemplate data={resumeData} />;
            case 'technical': return <TechnicalTemplate data={resumeData} />;
            case 'professional': return <ProfessionalTemplate data={resumeData} />;
            case 'professional-it': return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
            case 'startup': return <StartupTemplate data={resumeData} />; 
            case 'elegant': return <ElegantTemplate data={resumeData} />;
            case 'minimalist-sidebar': return <MinimalistSidebarTemplate data={resumeData} />;
            default: return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
        }
    }

    const styleVars = {
        '--accent-color': resumeData.accentColor,
        '--font-family': getFontFamily(customization.fontFamily),
        '--font-scale-factor': (Number(getFontScale(customization.fontSize)) * (isAutoFitEnabled ? scale : 1)).toString(),
        '--layout-spacing-factor': getLayoutSpacing(customization.layout),
    } as React.CSSProperties;


    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

    // Min swipe distance required (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = templates.findIndex(t => t.id === template);
            let nextIndex = currentIndex;

            if (isLeftSwipe) {
                // Next template
                nextIndex = currentIndex === templates.length - 1 ? 0 : currentIndex + 1;
            } else {
                // Previous template
                nextIndex = currentIndex === 0 ? templates.length - 1 : currentIndex - 1;
            }

            setTemplate(templates[nextIndex].id);
        }
    };

    return (
        <div className="sticky top-8">
            {/* Template Selector - Desktop: Buttons, Mobile: Scrollable */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm mb-4 print:hidden transition-colors duration-300">
                <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTemplate(t.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 flex-shrink-0 ${template === t.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                                }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
                <div className="md:hidden text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                    Swipe to switch templates
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>

            {/* Auto-Fit & Zoom Controls */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm mb-4 print:hidden transition-colors duration-300 flex flex-col gap-3">
                {/* Auto-Fit Toggle & Status */}
                <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isAutoFitEnabled}
                                onChange={(e) => setIsAutoFitEnabled(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Fit to One Page</span>
                        </label>
                    </div>
                    {isAutoFitEnabled && (
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${scale < 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {scale < 1 ? `Scaled: ${Math.round(scale * 100)}%` : 'Perfect Fit'}
                        </div>
                    )}
                    {/* Overflow Warning (only shown if fit-to-page is disabled or if content still overflows despite scaling) */}
                    {(!isAutoFitEnabled || (isAutoFitEnabled && isOverflowing)) && fitPercentage < 100 && (
                        <div className="flex flex-col gap-1 w-full mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <div className="flex items-center gap-1 font-bold">
                                <span>⚠️ Content overflows page</span>
                            </div>
                            <div className="pl-5">
                                <p>Try trimming these sections:</p>
                                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                    {(resumeData.summary && resumeData.summary.length > 400) && <li>Summary is quite long ({Math.round(resumeData.summary.length / 5)} words)</li>}
                                    {(resumeData.experience && resumeData.experience.length > 3) && <li>Experience has {resumeData.experience.length} entries</li>}
                                    {(resumeData.projects && resumeData.projects.length > 3) && <li>Projects has {resumeData.projects.length} entries</li>}
                                    {(resumeData.skills && resumeData.skills.length > 200) && <li>Skills section might be too dense</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                        disabled={zoom <= 50}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="50"
                            max="150"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 w-10">{zoom}%</span>
                    </div>

                    <button
                        onClick={() => setZoom(Math.min(150, zoom + 10))}
                        disabled={zoom >= 150}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                    </button>

                    <button
                        onClick={() => setZoom(100)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        title="Reset Zoom"
                    >
                        <RotateCcw className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                    </button>
                </div>
            </div>

            {/* Resume Preview with Zoom */}
            <div
                className="overflow-auto max-h-[70vh] rounded-lg border border-gray-200 dark:border-slate-700 touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease-out'
                    }}
                >
                    <div id="resume-preview" className="bg-white shadow-lg rounded-lg A4-aspect-ratio overflow-hidden" style={styleVars}>
                        <div ref={contentRef} style={{ height: '100%' }}>
                            {renderTemplate()}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
          .A4-aspect-ratio {
            width: 100%;
            aspect-ratio: 210 / 297; /* A4 paper aspect ratio */
            max-height: 1200px; /* Optional: to prevent it from getting too large on big screens */
          }
          #resume-preview > div { /* Ensure template fills the container */
            width: 100%;
            height: 100%;
            overflow-y: auto; /* Allow scrolling within the template if content overflows */
            font-family: var(--font-family);
            font-size: calc(1rem * var(--font-scale-factor));
          }
          /* Apply spacing scale */
          #resume-preview .mb-2 { margin-bottom: calc(0.5rem * var(--layout-spacing-factor)); }
          #resume-preview .mb-3 { margin-bottom: calc(0.75rem * var(--layout-spacing-factor)); }
          #resume-preview .mb-4 { margin-bottom: calc(1rem * var(--layout-spacing-factor)); }
          #resume-preview .mb-6 { margin-bottom: calc(1.5rem * var(--layout-spacing-factor)); }
          #resume-preview .mt-6 { margin-top: calc(1.5rem * var(--layout-spacing-factor)); }
          
          /* Apply font-size scale to headings */
          #resume-preview h1 { font-size: calc(2.5em * var(--font-scale-factor)); }
          #resume-preview h2 { font-size: calc(1.5em * var(--font-scale-factor)); }
          #resume-preview h3 { font-size: calc(1.17em * var(--font-scale-factor)); }
          #resume-preview h4 { font-size: calc(1em * var(--font-scale-factor)); }

          /* Basic styles for rich text content */
          .prose ul { list-style-type: disc; padding-left: 1.5rem; }
          .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
          .prose u { text-decoration: underline; }
          .prose s { text-decoration: line-through; }
          .prose sub { vertical-align: sub; font-size: smaller; }
          .prose sup { vertical-align: super; font-size: smaller; }
          .prose-invert ul, .prose-invert ol { color: white; }
          .prose-invert a { color: #93c5fd; }
          /* Dynamic Accent Color Classes */
          #resume-preview .accent-text { color: var(--accent-color); }
          #resume-preview .accent-bg { background-color: var(--accent-color); }
          #resume-preview .accent-border-b-2 { border-bottom-width: 2px; border-color: var(--accent-color); }
          #resume-preview .accent-border-b-2-light { border-bottom-width: 2px; border-color: var(--accent-color); border-bottom-style: solid; opacity: 0.4; }
          
          /* Hide scrollbar for template selector on mobile */
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}</style>
        </div>
    );
};

export default ResumePreview;