import React from 'react';
import { ResumeData, SectionId } from '@/types';
import { dateRange, displayUrl, safeUrl, splitSkills, stripBullet, toLines, visibleSections } from './shared';

// Optional on-canvas editing hooks. When omitted (public page, exports,
// thumbnails) the template renders as plain static markup.
export interface TemplateInteraction {
  selected: string | null;
  onSelect: (blockId: string | null) => void;
  onEdit: (blockId: string, text: string) => void;
  renderActions?: (blockId: string) => React.ReactNode;
}

const Handle: React.FC<{ className: string }> = ({ className }) => (
  <span className={`absolute w-[7px] h-[7px] rounded-full bg-white border border-[#2B5FD9] ${className}`} />
);

const Block: React.FC<{
  id: string;
  interaction?: TemplateInteraction;
  as: 'paragraph' | 'bullets';
  text: string;
  className?: string;
}> = ({ id, interaction, as, text, className = '' }) => {
  const isSelected = interaction?.selected === id;
  const lines = toLines(text);

  const commit = (el: HTMLElement) => {
    if (!interaction) return;
    const next =
      as === 'bullets'
        ? Array.from(el.querySelectorAll('li'))
            .map((li) => stripBullet(li.innerText))
            .filter(Boolean)
            .map((l) => `• ${l}`)
            .join('\n')
        : el.innerText.replace(/\n+/g, ' ').trim();
    const current = as === 'bullets' ? lines.map((l) => `• ${l}`).join('\n') : lines.join(' ');
    if (next !== current) interaction.onEdit(id, next);
  };

  const editable = interaction
    ? {
        contentEditable: isSelected,
        suppressContentEditableWarning: true,
        spellCheck: isSelected,
        onBlur: (e: React.FocusEvent<HTMLElement>) => commit(e.currentTarget),
        onPaste: (e: React.ClipboardEvent<HTMLElement>) => {
          // Keep pasted content plain so no foreign markup lands in the resume
          e.preventDefault();
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        },
        style: { outline: 'none' } as React.CSSProperties,
      }
    : {};

  const content =
    as === 'bullets' ? (
      <ul key={text} className="relative z-[1] list-disc ml-[1.5em] space-y-[0.45em]" {...editable}>
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    ) : (
      <p key={text} className="relative z-[1]" {...editable}>
        {lines.join(' ')}
      </p>
    );

  if (!interaction) return <div className={className}>{content}</div>;

  return (
    <div
      className={`relative ${className} ${isSelected ? 'z-20' : 'cursor-pointer rounded-sm hover:bg-[#2B5FD9]/[0.06]'}`}
      title={isSelected ? undefined : 'Click to edit or improve with AI'}
      onClick={(e) => {
        e.stopPropagation();
        if (!isSelected) interaction.onSelect(id);
      }}
    >
      {isSelected && (
        <div
          data-html2canvas-ignore="true"
          className="absolute -inset-x-[6px] -inset-y-[4px] border border-[#2B5FD9] bg-[#2B5FD9]/[0.06] pointer-events-none"
        >
          <Handle className="-top-1 -left-1" />
          <Handle className="-top-1 -right-1" />
          <Handle className="-bottom-1 -left-1" />
          <Handle className="-bottom-1 -right-1" />
        </div>
      )}
      {content}
      {isSelected && interaction.renderActions && (
        <div
          data-html2canvas-ignore="true"
          className="absolute left-1/2 top-full z-30 w-max pt-3 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          {interaction.renderActions(id)}
        </div>
      )}
    </div>
  );
};

const Heading: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <h3 className="text-[1.1em] font-semibold mb-[0.9em] break-after-avoid" style={{ color }}>
    {children}
  </h3>
);

const CleanSerifTemplate: React.FC<{
  data: ResumeData;
  scale?: number;
  interaction?: TemplateInteraction;
}> = ({ data, scale = 1, interaction }) => {
  const { personalDetails, summary, customization, accentColor } = data;
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const accomplishments = (data.accomplishments || []).filter((a) => stripBullet(a.description || ''));
  const skillList = splitSkills(data.skills);

  const fontClass = customization?.fontFamily ? `font-${customization.fontFamily}` : 'font-inter';
  const ink = accentColor || '#1B1B1B';
  const spacing = customization?.layout === 'compact' ? 0.75 : customization?.layout === 'spacious' ? 1.3 : 1;

  const skillsSection = (columns: number) => (
    <section className="break-inside-avoid">
      <Heading color={ink}>Skills</Heading>
      <ul className="list-disc ml-[1.5em] text-[0.88em]" style={{ columns, columnGap: '3em' }}>
        {skillList.map((skill, i) => (
          <li key={i} className="mb-[0.45em]" style={{ breakInside: 'avoid' }}>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );

  const accomplishmentsSection = (
    <section className="break-inside-avoid">
      <Heading color={ink}>Certifications &amp; Awards</Heading>
      <ul className="list-disc ml-[1.5em] text-[0.88em] space-y-[0.45em]">
        {accomplishments.map((acc) => (
          <li key={acc.id}>{toLines(acc.description).join(' ')}</li>
        ))}
      </ul>
    </section>
  );

  const sections: Record<SectionId, React.ReactNode> = {
    summary: toLines(summary).length > 0 && <Block id="summary" interaction={interaction} as="paragraph" text={summary} />,
    experience: experience.length > 0 && (
      <section>
        <Heading color={ink}>Experience</Heading>
        <div className="flex flex-col" style={{ gap: `${1.4 * spacing}em` }}>
          {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="text-[0.72em] uppercase tracking-wide text-[#6B7280]">{dateRange(exp.startDate, exp.endDate)}</div>
              <div className="mt-[0.2em] text-[1.05em]">
                <span className="font-bold">{exp.jobTitle || 'Job title'}</span>
                {exp.company && <span> @ {exp.company}</span>}
              </div>
              {toLines(exp.description).length > 0 && (
                <Block id={`exp:${exp.id}`} interaction={interaction} as="bullets" text={exp.description} className="mt-[0.8em] text-[0.88em]" />
              )}
            </div>
          ))}
        </div>
      </section>
    ),
    projects: projects.length > 0 && (
      <section>
        <Heading color={ink}>Projects</Heading>
        <div className="flex flex-col" style={{ gap: `${1.4 * spacing}em` }}>
          {projects.map((proj) => (
            <div key={proj.id} className="break-inside-avoid">
              <div className="text-[1.05em]">
                <span className="font-bold">{proj.name || 'Project name'}</span>
                {safeUrl(proj.url) && <span className="text-[0.82em] text-[#6B7280] break-all"> — {displayUrl(proj.url)}</span>}
              </div>
              {toLines(proj.description).length > 0 && (
                <Block id={`proj:${proj.id}`} interaction={interaction} as="bullets" text={proj.description} className="mt-[0.6em] text-[0.88em]" />
              )}
            </div>
          ))}
        </div>
      </section>
    ),
    education: education.length > 0 && (
      <section>
        <Heading color={ink}>Education</Heading>
        <div className="flex flex-col" style={{ gap: `${1.1 * spacing}em` }}>
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid">
              <div className="text-[0.72em] uppercase tracking-wide text-[#6B7280]">{dateRange(edu.startDate, edu.endDate)}</div>
              <div className="mt-[0.2em] text-[1.05em]">
                <span className="font-bold">{edu.degree || 'Degree'}</span>
                {edu.institution && <span> @ {edu.institution}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: skillList.length > 0 && skillsSection(2),
    accomplishments: accomplishments.length > 0 && accomplishmentsSection,
  };

  // Skills and certifications sit side by side when they are neighbours
  const order = visibleSections(data).filter((id) => Boolean(sections[id]));
  const rendered: React.ReactNode[] = [];
  for (let i = 0; i < order.length; i++) {
    const pair = [order[i], order[i + 1]];
    if (pair.includes('skills') && pair.includes('accomplishments')) {
      rendered.push(
        <div key="skills-accomplishments" className="grid grid-cols-2 gap-x-10 break-inside-avoid">
          {pair.map((id) => (
            <React.Fragment key={id}>{id === 'skills' ? skillsSection(1) : accomplishmentsSection}</React.Fragment>
          ))}
        </div>,
      );
      i++;
    } else {
      rendered.push(<React.Fragment key={order[i]}>{sections[order[i]]}</React.Fragment>);
    }
  }

  return (
    <div
      className={`flex flex-col bg-white text-[#1B1B1B] ${fontClass} w-full`}
      style={{
        fontSize: `${10 * scale}pt`,
        lineHeight: customization?.lineHeight ?? 1.6,
        padding: `${52 * scale}px`,
        minHeight: '1123px',
        gap: `${2 * spacing}em`,
      }}
      onClick={() => interaction?.onSelect(null)}
    >
      {/* Header */}
      <header className="flex justify-between items-start gap-6">
        <div className="min-w-0">
          <h1
            className="text-[2.4em] font-semibold leading-tight tracking-tight break-words"
            style={{ fontFamily: '"Source Serif 4", "Merriweather", Georgia, serif', color: ink }}
          >
            {personalDetails.fullName || 'Your Name'}
          </h1>
          {personalDetails.jobTitle && <div className="mt-[0.5em] text-[1.05em]">{personalDetails.jobTitle}</div>}
        </div>
        <div className="flex flex-col items-end text-[0.85em] leading-[2] shrink-0 max-w-[45%] text-right break-all">
          {(personalDetails.links || [])
            .filter((link) => safeUrl(link.url))
            .map((link) => (
              <a key={link.id} href={safeUrl(link.url)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {displayUrl(link.url)}
              </a>
            ))}
          {personalDetails.email && (
            <a href={`mailto:${personalDetails.email}`} className="underline underline-offset-2">
              {personalDetails.email}
            </a>
          )}
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
      </header>

      {rendered}
    </div>
  );
};

export default CleanSerifTemplate;
