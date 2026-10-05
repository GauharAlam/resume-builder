import React, { useEffect, useRef, useState } from "react";
import { Plus, Minus, Sparkles, Loader2, Trash2, ChevronUp, ChevronDown, X, Check, Eye, EyeOff } from "lucide-react";
import { useResume } from "@/hooks";
import { suggestSkills } from "@/services/aiService";
import { toastError, toastInfo } from "@/utils/toast";
import { SectionId } from "@/types";
import { ResumeTemplate, TEMPLATE_OPTIONS, normalizeSectionOrder, splitSkills } from "@/components/templates";
import { useEditorAI } from "./EditorAI";
import { Field, TextAreaField, PrimaryButton, cx } from "./ui";

export type BuilderSection =
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "certifications"
  | "contacts"
  | "links"
  | "skills";

export type BuilderTab = "builder" | "templates";

const TITLES: Record<BuilderSection, string> = {
  contacts: "Contacts",
  links: "Website & Links",
  summary: "Professional Summary",
  experience: "Work Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certification",
};

// Builder sections that appear on the page as a movable, hideable block
const RESUME_SECTION: Partial<Record<BuilderSection, SectionId>> = {
  summary: "summary",
  experience: "experience",
  projects: "projects",
  education: "education",
  skills: "skills",
  certifications: "accomplishments",
};
const BUILDER_SECTION: Record<SectionId, BuilderSection> = {
  summary: "summary",
  experience: "experience",
  projects: "projects",
  education: "education",
  skills: "skills",
  accomplishments: "certifications",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Small building blocks ─────────────────────────────────── */

const AIButton: React.FC<{
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ busy, disabled, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy || disabled}
    title={title}
    className="inline-flex items-center gap-1 rounded-md bg-[#EEF3FF] px-2 py-1 text-[11px] font-medium text-[#2B5FD9] transition-colors hover:bg-[#E0E9FF] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {busy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
    {children}
  </button>
);

const AddButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CDD2DB] py-2.5 text-sm font-medium text-[#3F4551] transition-colors hover:border-[#2B5FD9] hover:bg-[#F5F8FF] hover:text-[#2B5FD9]"
  >
    <Plus size={15} />
    {children}
  </button>
);

const EmptyNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-xl bg-[#F6F7F9] px-3 py-3 text-xs leading-relaxed text-[#6B7280]">{children}</p>
);

/** Collapsible card for one entry in a repeating section, with reorder + delete. */
const ItemCard: React.FC<{
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, open, onToggle, onRemove, onMoveUp, onMoveDown, children }) => (
  <div className="rounded-xl border border-[#E9EAEE] bg-white">
    <div className="flex items-center gap-1 pl-3 pr-1.5">
      <button type="button" onClick={onToggle} aria-expanded={open} className="min-w-0 flex-1 py-2.5 text-left">
        <span className="block truncate text-sm font-medium text-[#14161A]">{title}</span>
        {subtitle && <span className="block truncate text-xs text-[#6B7280]">{subtitle}</span>}
      </button>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!onMoveUp}
        aria-label="Move up"
        title="Move up"
        className="rounded p-1 text-[#6B7280] hover:bg-[#F0F1F4] disabled:opacity-25 disabled:hover:bg-transparent"
      >
        <ChevronUp size={15} />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!onMoveDown}
        aria-label="Move down"
        title="Move down"
        className="rounded p-1 text-[#6B7280] hover:bg-[#F0F1F4] disabled:opacity-25 disabled:hover:bg-transparent"
      >
        <ChevronDown size={15} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        title="Remove (you can undo)"
        className="rounded p-1 text-[#6B7280] hover:bg-[#FEECEC] hover:text-[#DC2626]"
      >
        <Trash2 size={15} />
      </button>
    </div>
    {open && <div className="space-y-3 border-t border-[#E9EAEE] p-3">{children}</div>}
  </div>
);

const move = <T,>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Tracks which entry of a list is expanded and auto-expands newly added ones. */
const useExpanded = (ids: string[]) => {
  const [expanded, setExpanded] = useState<string | null>(ids.length === 1 ? ids[0] : null);
  const prevCount = useRef(ids.length);
  const idsKey = ids.join(",");
  useEffect(() => {
    if (ids.length > prevCount.current) setExpanded(ids[ids.length - 1]);
    // A different resume was loaded (or entries removed): show a lone entry open
    else if (ids.length === 1) setExpanded((prev) => (prev && ids.includes(prev) ? prev : ids[0]));
    prevCount.current = ids.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);
  return {
    isOpen: (id: string) => expanded === id,
    toggle: (id: string) => setExpanded((prev) => (prev === id ? null : id)),
  };
};

/* ── Main panel ────────────────────────────────────────────── */

const BuilderPanel: React.FC<{
  tab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  openSection: BuilderSection | null;
  onOpenSection: (section: BuilderSection | null) => void;
}> = ({ tab, onTabChange, openSection, onOpenSection }) => {
  const {
    resumeData,
    updateField,
    template,
    setTemplate,
    addLink,
    updateLink,
    removeLink,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addAccomplishment,
    updateAccomplishment,
    removeAccomplishment,
  } = useResume();
  const { busyId, improve, writeBullets } = useEditorAI();

  const experience = resumeData.experience || [];
  const education = resumeData.education || [];
  const projects = resumeData.projects || [];
  const accomplishments = resumeData.accomplishments || [];
  const links = resumeData.personalDetails.links || [];
  const skills = splitSkills(resumeData.skills);

  /* Section order and visibility on the page */
  const order = normalizeSectionOrder(resumeData.sectionOrder);
  const hidden = resumeData.hiddenSections || [];
  // Contact details always lead the page; the rest follow the user's order
  const sectionList: BuilderSection[] = ["contacts", "links", ...order.map((id) => BUILDER_SECTION[id])];

  const moveSection = (id: SectionId, direction: -1 | 1) => {
    const from = order.indexOf(id);
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    updateField("sectionOrder", move(order, from, to));
  };
  const toggleHidden = (id: SectionId) =>
    updateField("hiddenSections", hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]);

  const expExpanded = useExpanded(experience.map((e) => e.id));
  const eduExpanded = useExpanded(education.map((e) => e.id));
  const projExpanded = useExpanded(projects.map((p) => p.id));

  // Bring the section opened from elsewhere (inspector, canvas) into view
  const sectionRefs = useRef<Partial<Record<BuilderSection, HTMLDivElement | null>>>({});
  useEffect(() => {
    if (!openSection || tab !== "builder") return;
    sectionRefs.current[openSection]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [openSection, tab]);

  const handleDetail = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateField("personalDetails", { ...resumeData.personalDetails, [e.target.name]: e.target.value });

  /* Skills */
  const [skillDraft, setSkillDraft] = useState("");
  const [suggested, setSuggested] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  const setSkills = (list: string[]) => updateField("skills", list.join(", "));
  const addSkills = (raw: string) => {
    const incoming = splitSkills(raw);
    if (incoming.length === 0) return;
    const seen = new Set(skills.map((s) => s.toLowerCase()));
    const fresh = incoming.filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (fresh.length > 0) setSkills([...skills, ...fresh]);
    setSkillDraft("");
  };

  const handleSuggestSkills = async () => {
    if (!resumeData.personalDetails.jobTitle?.trim()) {
      toastError("Add your job title under Contacts so AI knows what to suggest.");
      return;
    }
    setSuggesting(true);
    try {
      const result = await suggestSkills(resumeData);
      const current = new Set(skills.map((s) => s.toLowerCase()));
      const fresh = splitSkills(result).filter((s) => !current.has(s.toLowerCase()));
      if (fresh.length === 0) {
        toastInfo(result ? "No new skills to suggest — your list already covers them." : "AI couldn't suggest skills right now. Try again shortly.");
      }
      setSuggested(fresh);
    } finally {
      setSuggesting(false);
    }
  };

  const email = resumeData.personalDetails.email || "";
  const emailError = email && !EMAIL_RE.test(email.trim()) ? "This doesn't look like a valid email address." : undefined;

  const renderSection = (id: BuilderSection) => {
    switch (id) {
      case "summary":
        return (
          <div className="space-y-3">
            <TextAreaField
              aria-label="Professional summary"
              rows={7}
              value={resumeData.summary || ""}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Write a brief summary of your professional experience here"
              hint={`${(resumeData.summary || "").trim().length} characters · aim for 2–4 sentences`}
            />
            <PrimaryButton
              className="w-full"
              disabled={busyId === "summary" || !(resumeData.summary || "").trim()}
              onClick={() =>
                improve({
                  id: "summary",
                  text: resumeData.summary,
                  section: "summary",
                  onAccept: (val) => updateField("summary", val),
                })
              }
            >
              {busyId === "summary" ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {busyId === "summary" ? "Improving…" : "Improve my summary"}
            </PrimaryButton>
          </div>
        );

      case "education":
        return (
          <div className="space-y-3">
            {education.length === 0 && <EmptyNote>No education added yet. Add your most recent degree or course first.</EmptyNote>}
            {education.map((edu, i) => (
              <ItemCard
                key={edu.id}
                title={edu.degree || "New education"}
                subtitle={edu.institution}
                open={eduExpanded.isOpen(edu.id)}
                onToggle={() => eduExpanded.toggle(edu.id)}
                onRemove={() => removeEducation(edu.id)}
                onMoveUp={i > 0 ? () => updateField("education", move(education, i, i - 1)) : undefined}
                onMoveDown={i < education.length - 1 ? () => updateField("education", move(education, i, i + 1)) : undefined}
              >
                <Field label="Degree / Course" value={edu.degree} placeholder="BA in Design" onChange={(e) => updateEducation(edu.id, { ...edu, degree: e.target.value })} />
                <Field label="Institution" value={edu.institution} placeholder="Global Design Institute" onChange={(e) => updateEducation(edu.id, { ...edu, institution: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" value={edu.startDate} placeholder="Sept 2019" onChange={(e) => updateEducation(edu.id, { ...edu, startDate: e.target.value })} />
                  <Field label="End" value={edu.endDate} placeholder="May 2023" onChange={(e) => updateEducation(edu.id, { ...edu, endDate: e.target.value })} />
                </div>
              </ItemCard>
            ))}
            <AddButton onClick={addEducation}>Add education</AddButton>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-3">
            {experience.length === 0 && <EmptyNote>No roles added yet. Start with your current or most recent job.</EmptyNote>}
            {experience.map((exp, i) => (
              <ItemCard
                key={exp.id}
                title={exp.jobTitle || "New role"}
                subtitle={exp.company}
                open={expExpanded.isOpen(exp.id)}
                onToggle={() => expExpanded.toggle(exp.id)}
                onRemove={() => removeExperience(exp.id)}
                onMoveUp={i > 0 ? () => updateField("experience", move(experience, i, i - 1)) : undefined}
                onMoveDown={i < experience.length - 1 ? () => updateField("experience", move(experience, i, i + 1)) : undefined}
              >
                <Field label="Job title" value={exp.jobTitle} placeholder="Design Assistant" onChange={(e) => updateExperience(exp.id, { ...exp, jobTitle: e.target.value })} />
                <Field label="Company" value={exp.company} placeholder="Innovate Solutions" onChange={(e) => updateExperience(exp.id, { ...exp, company: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" value={exp.startDate} placeholder="Feb 2023" onChange={(e) => updateExperience(exp.id, { ...exp, startDate: e.target.value })} />
                  <Field label="End" value={exp.endDate} placeholder="Present" onChange={(e) => updateExperience(exp.id, { ...exp, endDate: e.target.value })} />
                </div>
                <TextAreaField
                  label="Description"
                  rows={5}
                  value={exp.description}
                  placeholder={"• What you did and the result it had\n• One achievement per line"}
                  onChange={(e) => updateExperience(exp.id, { ...exp, description: e.target.value })}
                  hint="One bullet per line."
                  action={
                    <span className="flex gap-1.5">
                      <AIButton
                        busy={busyId === `exp-${exp.id}-improve`}
                        disabled={!exp.description?.trim() || busyId !== null}
                        title="Rewrite this description with AI"
                        onClick={() =>
                          improve({
                            id: `exp-${exp.id}-improve`,
                            text: exp.description,
                            section: "experience description",
                            onAccept: (val) => updateExperience(exp.id, { ...exp, description: val }),
                          })
                        }
                      >
                        Improve
                      </AIButton>
                      <AIButton
                        busy={busyId === `exp-${exp.id}-write`}
                        disabled={busyId !== null}
                        title="Draft achievement bullets for this role"
                        onClick={() =>
                          writeBullets({
                            id: `exp-${exp.id}-write`,
                            jobTitle: exp.jobTitle,
                            company: exp.company,
                            section: "experience",
                            context: exp.description || "",
                            onAccept: (val) => updateExperience(exp.id, { ...exp, description: val }),
                          })
                        }
                      >
                        Write bullets
                      </AIButton>
                    </span>
                  }
                />
              </ItemCard>
            ))}
            <AddButton onClick={addExperience}>Add work experience</AddButton>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-3">
            {projects.length === 0 && <EmptyNote>No projects yet. Volunteer, freelance and side projects all count.</EmptyNote>}
            {projects.map((proj, i) => (
              <ItemCard
                key={proj.id}
                title={proj.name || "New project"}
                subtitle={proj.url}
                open={projExpanded.isOpen(proj.id)}
                onToggle={() => projExpanded.toggle(proj.id)}
                onRemove={() => removeProject(proj.id)}
                onMoveUp={i > 0 ? () => updateField("projects", move(projects, i, i - 1)) : undefined}
                onMoveDown={i < projects.length - 1 ? () => updateField("projects", move(projects, i, i + 1)) : undefined}
              >
                <Field label="Project name" value={proj.name} placeholder="EcoAction website" onChange={(e) => updateProject(proj.id, { ...proj, name: e.target.value })} />
                <Field label="Link (optional)" value={proj.url || ""} placeholder="github.com/you/project" onChange={(e) => updateProject(proj.id, { ...proj, url: e.target.value })} />
                <TextAreaField
                  label="Description"
                  rows={4}
                  value={proj.description}
                  placeholder={"• What you built and why it mattered"}
                  onChange={(e) => updateProject(proj.id, { ...proj, description: e.target.value })}
                  action={
                    <span className="flex gap-1.5">
                      <AIButton
                        busy={busyId === `proj-${proj.id}-improve`}
                        disabled={!proj.description?.trim() || busyId !== null}
                        onClick={() =>
                          improve({
                            id: `proj-${proj.id}-improve`,
                            text: proj.description,
                            section: "project description",
                            onAccept: (val) => updateProject(proj.id, { ...proj, description: val }),
                          })
                        }
                      >
                        Improve
                      </AIButton>
                      <AIButton
                        busy={busyId === `proj-${proj.id}-write`}
                        disabled={busyId !== null}
                        onClick={() =>
                          writeBullets({
                            id: `proj-${proj.id}-write`,
                            jobTitle: resumeData.personalDetails.jobTitle,
                            company: proj.name,
                            section: "project",
                            context: proj.description || "",
                            onAccept: (val) => updateProject(proj.id, { ...proj, description: val }),
                          })
                        }
                      >
                        Write bullets
                      </AIButton>
                    </span>
                  }
                />
              </ItemCard>
            ))}
            <AddButton onClick={addProject}>Add project</AddButton>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-3">
            {accomplishments.length === 0 && <EmptyNote>List certifications, awards or other achievements, one per entry.</EmptyNote>}
            {accomplishments.map((acc, i) => (
              <div key={acc.id} className="flex items-start gap-1.5">
                <textarea
                  rows={2}
                  aria-label={`Certification ${i + 1}`}
                  value={acc.description}
                  placeholder="Google UX Design Certificate, 2023"
                  onChange={(e) => updateAccomplishment(acc.id, { ...acc, description: e.target.value })}
                  className="w-full resize-y rounded-lg border border-[#E3E5EA] bg-white px-3 py-2 text-sm text-[#14161A] placeholder:text-[#9AA0AB] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
                />
                <button
                  type="button"
                  onClick={() => removeAccomplishment(acc.id)}
                  aria-label="Remove certification"
                  title="Remove (you can undo)"
                  className="mt-1 rounded p-1.5 text-[#6B7280] hover:bg-[#FEECEC] hover:text-[#DC2626]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <AddButton onClick={addAccomplishment}>Add certification</AddButton>
          </div>
        );

      case "contacts":
        return (
          <div className="space-y-3">
            <Field label="Full name" name="fullName" autoComplete="name" value={resumeData.personalDetails.fullName} placeholder="Enzo Fernanda" onChange={handleDetail} />
            <Field label="Job title" name="jobTitle" value={resumeData.personalDetails.jobTitle} placeholder="Jr. Product Designer" onChange={handleDetail} />
            <Field label="Email" name="email" type="email" autoComplete="email" value={email} placeholder="you@email.com" onChange={handleDetail} error={emailError} />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" value={resumeData.personalDetails.phone} placeholder="+61 412 345 678" onChange={handleDetail} />
            <Field label="Location" name="location" value={resumeData.personalDetails.location} placeholder="City, Country" onChange={handleDetail} />
          </div>
        );

      case "links":
        return (
          <div className="space-y-3">
            {links.length === 0 && <EmptyNote>Add a portfolio, LinkedIn or GitHub link so recruiters can see your work.</EmptyNote>}
            {links.map((link) => (
              <div key={link.id} className="rounded-xl border border-[#E9EAEE] p-3">
                <div className="grid grid-cols-[1fr_1.4fr_auto] items-end gap-2">
                  <Field label="Label" value={link.name} placeholder="Portfolio" onChange={(e) => updateLink(link.id, { ...link, name: e.target.value })} />
                  <Field label="URL" value={link.url} placeholder="enzo.design" onChange={(e) => updateLink(link.id, { ...link, url: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    aria-label="Remove link"
                    title="Remove (you can undo)"
                    className="mb-0.5 rounded p-2 text-[#6B7280] hover:bg-[#FEECEC] hover:text-[#DC2626]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <AddButton onClick={addLink}>Add link</AddButton>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-3">
            {skills.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <li key={`${skill}-${i}`} className="inline-flex items-center gap-1 rounded-lg bg-[#F0F1F4] py-1 pl-2.5 pr-1 text-xs font-medium text-[#14161A]">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                      aria-label={`Remove ${skill}`}
                      className="rounded p-0.5 text-[#6B7280] hover:bg-[#DCDFE5] hover:text-[#14161A]"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addSkills(skillDraft);
              }}
            >
              <input
                value={skillDraft}
                aria-label="Add a skill"
                placeholder="Type a skill and press Enter"
                onChange={(e) => {
                  // A comma or pasted list commits immediately
                  if (/[,\n]/.test(e.target.value)) addSkills(e.target.value);
                  else setSkillDraft(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !skillDraft && skills.length > 0) setSkills(skills.slice(0, -1));
                }}
                className="w-full rounded-lg border border-[#E3E5EA] bg-white px-3 py-2 text-sm text-[#14161A] placeholder:text-[#9AA0AB] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
              />
              <button
                type="submit"
                disabled={!skillDraft.trim()}
                className="rounded-lg border border-[#E3E5EA] px-3 text-sm font-medium text-[#14161A] hover:bg-[#F6F7F9] disabled:opacity-40"
              >
                Add
              </button>
            </form>
            <AIButton busy={suggesting} onClick={handleSuggestSkills} title="Suggest skills from your job title and experience">
              {suggesting ? "Finding skills…" : "Suggest skills with AI"}
            </AIButton>
            {suggested.length > 0 && (
              <div className="rounded-xl bg-[#F5F8FF] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#2B5FD9]">Suggested — click to add</span>
                  <button type="button" onClick={() => setSuggested([])} className="text-xs text-[#6B7280] hover:text-[#14161A]">
                    Dismiss
                  </button>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {suggested.map((skill) => (
                    <li key={skill}>
                      <button
                        type="button"
                        onClick={() => {
                          addSkills(skill);
                          setSuggested((prev) => prev.filter((s) => s !== skill));
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#C9D8FB] bg-white px-2.5 py-1 text-xs font-medium text-[#2B5FD9] hover:bg-[#E0E9FF]"
                      >
                        <Plus size={12} />
                        {skill}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
    }
  };

  const counts: Partial<Record<BuilderSection, number>> = {
    education: education.length,
    experience: experience.length,
    projects: projects.length,
    certifications: accomplishments.length,
    links: links.length,
    skills: skills.length,
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E9EAEE] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      {/* Tabs */}
      <div className="border-b border-[#E9EAEE] p-5">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F3F4F6] p-1" role="tablist" aria-label="Editor mode">
          {(["builder", "templates"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => onTabChange(t)}
              className={cx(
                "rounded-lg py-2 text-sm font-medium capitalize transition-colors",
                tab === t ? "bg-white text-[#14161A] shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-[#6B7280] hover:text-[#14161A]",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "builder" ? (
          sectionList.map((id) => {
            const isOpen = openSection === id;
            const resumeSection = RESUME_SECTION[id];
            const position = resumeSection ? order.indexOf(resumeSection) : -1;
            const isHidden = resumeSection ? hidden.includes(resumeSection) : false;
            return (
              <div
                key={id}
                ref={(el) => {
                  sectionRefs.current[id] = el;
                }}
                className="group/section border-b border-[#E9EAEE] last:border-b-0"
              >
                <div className="flex items-center transition-colors hover:bg-[#FAFAFB]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => onOpenSection(isOpen ? null : id)}
                    className="flex min-w-0 flex-1 items-center gap-2 py-4 pl-5 text-left"
                  >
                    <span className={cx("truncate text-[15px] font-medium", isHidden ? "text-[#9AA0AB] line-through" : "text-[#14161A]")}>{TITLES[id]}</span>
                    {!!counts[id] && !isHidden && (
                      <span className="rounded-full bg-[#F0F1F4] px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280]">{counts[id]}</span>
                    )}
                    {isHidden && <span className="rounded-md bg-[#F0F1F4] px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280]">Hidden</span>}
                  </button>
                  {resumeSection && (
                    <div className="flex items-center opacity-100 transition-opacity lg:opacity-0 lg:focus-within:opacity-100 lg:group-hover/section:opacity-100">
                      <button
                        type="button"
                        onClick={() => moveSection(resumeSection, -1)}
                        disabled={position <= 0}
                        aria-label={`Move ${TITLES[id]} up`}
                        title="Move up on the page"
                        className="rounded p-1 text-[#6B7280] hover:bg-[#F0F1F4] disabled:opacity-25 disabled:hover:bg-transparent"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(resumeSection, 1)}
                        disabled={position >= order.length - 1}
                        aria-label={`Move ${TITLES[id]} down`}
                        title="Move down on the page"
                        className="rounded p-1 text-[#6B7280] hover:bg-[#F0F1F4] disabled:opacity-25 disabled:hover:bg-transparent"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleHidden(resumeSection)}
                        aria-pressed={isHidden}
                        aria-label={isHidden ? `Show ${TITLES[id]} on the page` : `Hide ${TITLES[id]} from the page`}
                        title={isHidden ? "Show on the page" : "Hide from the page (content is kept)"}
                        className="rounded p-1 text-[#6B7280] hover:bg-[#F0F1F4]"
                      >
                        {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onOpenSection(isOpen ? null : id)}
                    className="py-4 pl-2 pr-5 text-[#14161A]"
                  >
                    {isOpen ? <Minus size={17} /> : <Plus size={17} />}
                  </button>
                </div>
                {isOpen && (
                  <div className="px-5 pb-5">
                    {isHidden && (
                      <p className="mb-3 rounded-lg bg-[#F6F7F9] px-3 py-2 text-xs text-[#6B7280]">
                        This section is hidden, so it won't appear on your resume.{" "}
                        <button type="button" onClick={() => resumeSection && toggleHidden(resumeSection)} className="font-medium text-[#2B5FD9] hover:underline">
                          Show it
                        </button>
                      </p>
                    )}
                    {renderSection(id)}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-2 gap-3 p-5">
            {TEMPLATE_OPTIONS.map((option) => {
              const active = template === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTemplate(option.id)}
                  aria-pressed={active}
                  className={cx(
                    "group relative overflow-hidden rounded-xl border bg-white text-left transition-shadow hover:shadow-[0_6px_20px_rgba(16,24,40,0.08)]",
                    active ? "border-[#2B5FD9] ring-2 ring-[#2B5FD9]/20" : "border-[#E9EAEE]",
                  )}
                >
                  {/* Live thumbnail: the real template rendered small */}
                  <div className="pointer-events-none relative h-[170px] overflow-hidden bg-white" aria-hidden="true">
                    <div style={{ width: 794, zoom: 0.19 }}>
                      <ResumeTemplate template={option.id} data={resumeData} />
                    </div>
                  </div>
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2B5FD9] text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <div className="border-t border-[#E9EAEE] px-2.5 py-2">
                    <div className="text-xs font-semibold text-[#14161A]">{option.name}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default BuilderPanel;
