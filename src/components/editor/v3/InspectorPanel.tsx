import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, Loader2, Minus, Plus, CheckCircle2 } from "lucide-react";
import { useResume } from "@/hooks";
import { suggestSkills } from "@/services/aiService";
import { toastError, toastSuccess } from "@/utils/toast";
import { FontFamily, LayoutSpacing, TemplateID } from "@/types";
import { TEMPLATE_OPTIONS, getTemplateOption, splitSkills } from "@/components/templates";
import { getResumeStrength, StrengthCheck } from "@/utils/resumeStrength";
import type { BuilderSection } from "./BuilderPanel";
import type { AnalyzeTab } from "./AnalyzeDrawer";
import { ACCENT_SWATCHES, FONT_OPTIONS, PrimaryButton, SecondaryButton, SelectField, cx, isHexColor } from "./ui";

interface Suggestion {
  id: string;
  title: string;
  body: string;
  actionLabel: string;
  busy?: boolean;
  onAction: () => void;
}

// Short titles and explanations for each completeness check
const CHECK_COPY: Record<string, { title: string; body: string; action: string }> = {
  contact: { title: "Contact Details", body: "Your name, email or phone number is missing. Recruiters need these to reach you.", action: "Add details" },
  title: { title: "Job Title", body: "Add the job title you're known by or aiming for. It sits right under your name.", action: "Add title" },
  summary: { title: "Professional Summary", body: "A 2–4 sentence summary at the top helps recruiters place you in seconds.", action: "Write summary" },
  experience: { title: "Work Experience", body: "Add at least one role. Internships, freelance and volunteer work all count.", action: "Add a role" },
  bullets: { title: "Describe Your Work", body: "Add three or more bullet points about what you did and what came of it.", action: "Add bullets" },
  metrics: { title: "Quantify Impact", body: "None of your bullets include a number. Add a metric, percentage or scale where you truthfully can.", action: "Edit bullets" },
  education: { title: "Education", body: "Add your highest or most relevant qualification.", action: "Add education" },
  skills: { title: "Skills", body: "List at least five skills so keyword searches can find you.", action: "Add skills" },
  links: { title: "Portfolio Link", body: "Add a portfolio, LinkedIn or GitHub link to back up your experience.", action: "Add link" },
};

const Stepper: React.FC<{
  label: string;
  display: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
}> = ({ label, display, onDecrease, onIncrease, canDecrease, canIncrease }) => (
  <div>
    <span className="mb-1.5 block text-xs font-medium text-[#5B6270]">{label}</span>
    <div className="flex items-center rounded-lg border border-[#E3E5EA] bg-white">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={!canDecrease}
        onClick={onDecrease}
        className="flex h-9 w-9 items-center justify-center text-[#3F4551] hover:bg-[#F6F7F9] disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="flex-1 text-center text-sm tabular-nums text-[#14161A]">{display}</span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={!canIncrease}
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center text-[#3F4551] hover:bg-[#F6F7F9] disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

const InspectorPanel: React.FC<{
  onOpenSection: (section: BuilderSection) => void;
  onOpenAnalyze: (tab: AnalyzeTab) => void;
}> = ({ onOpenSection, onOpenAnalyze }) => {
  const { resumeData, updateResumeData, updateField, template, setTemplate, activeResumeId } = useResume();
  const option = getTemplateOption(template);
  const customization = resumeData.customization || { fontFamily: "sans" as FontFamily, fontSize: "medium" as const, layout: "standard" as const };

  /* ── AI suggestions ─────────────────────────────────────── */
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [foundSkills, setFoundSkills] = useState<string[] | null>(null);
  const [scanning, setScanning] = useState(false);

  // Suggestions belong to one resume; start fresh when another is opened
  useEffect(() => {
    setDismissed([]);
    setIndex(0);
    setFoundSkills(null);
  }, [activeResumeId]);

  const skills = splitSkills(resumeData.skills);

  const scanSkills = async () => {
    if (!resumeData.personalDetails.jobTitle?.trim()) {
      toastError("Add your job title under Contacts so AI knows what to look for.");
      onOpenSection("contacts");
      return;
    }
    setScanning(true);
    try {
      const result = await suggestSkills(resumeData);
      if (!result) {
        toastError("AI couldn't scan your skills right now. Try again shortly.");
        return;
      }
      const current = new Set(skills.map((s) => s.toLowerCase()));
      setFoundSkills(splitSkills(result).filter((s) => !current.has(s.toLowerCase())));
    } finally {
      setScanning(false);
    }
  };

  const strength = useMemo(() => getResumeStrength(resumeData), [resumeData]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [];

    // Essentials first, most valuable gap first
    strength.checks
      .filter((check: StrengthCheck) => !check.done)
      .sort((a, b) => b.weight - a.weight)
      .forEach((check) => {
        const copy = CHECK_COPY[check.id];
        if (!copy) return;
        list.push({ id: check.id, title: copy.title, body: copy.body, actionLabel: copy.action, onAction: () => onOpenSection(check.section) });
      });

    if (foundSkills === null) {
      list.push({
        id: "skill-scan",
        title: "Skill Alignment",
        body: "Scan your experience for skills you haven't listed yet.",
        actionLabel: scanning ? "Scanning…" : "Scan skills",
        busy: scanning,
        onAction: scanSkills,
      });
    } else if (foundSkills.length > 0) {
      list.push({
        id: "skill-scan",
        title: "Skill Alignment",
        body: `${foundSkills.length} ${foundSkills.length === 1 ? "skill" : "skills"} found in your profile that ${foundSkills.length === 1 ? "is" : "are"} not listed here: ${foundSkills.slice(0, 4).join(", ")}${foundSkills.length > 4 ? "…" : ""}`,
        actionLabel: "Add skills",
        onAction: () => {
          updateField("skills", [...skills, ...foundSkills].join(", "));
          toastSuccess(`${foundSkills.length} ${foundSkills.length === 1 ? "skill" : "skills"} added.`);
          setFoundSkills([]);
        },
      });
    }

    list.push({
      id: "jd",
      title: "Job Match",
      body: "Applying for a specific role? Check how well this resume matches the job description.",
      actionLabel: "Check match",
      onAction: () => onOpenAnalyze("jd"),
    });

    return list.filter((s) => !dismissed.includes(s.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strength, foundSkills, scanning, dismissed]);

  const safeIndex = Math.min(index, Math.max(0, suggestions.length - 1));
  const current = suggestions[safeIndex];

  /* ── Design controls ────────────────────────────────────── */
  const [hexDraft, setHexDraft] = useState(resumeData.accentColor || "");
  useEffect(() => setHexDraft(resumeData.accentColor || ""), [resumeData.accentColor]);

  const textScale = customization.textScale ?? 1;
  const lineHeight = customization.lineHeight ?? 1.6;
  const setCustomization = (patch: Partial<typeof customization>) =>
    updateResumeData({ customization: { ...customization, ...patch } });
  const round = (value: number, step: number) => Math.round(value / step) * step;
  const fontValue = FONT_OPTIONS.some((f) => f.id === customization.fontFamily) ? customization.fontFamily : "sans";

  return (
    <aside className="flex h-full min-h-0 w-full flex-col gap-5 overflow-y-auto">
      {/* AI suggestion card */}
      <section
        aria-label="AI suggestions"
        className="shrink-0 overflow-hidden rounded-2xl border border-[#E4EAFB] p-5"
        style={{ background: "linear-gradient(160deg, #F7F9FF 0%, #E9EFFD 100%)" }}
      >
        <div className="mb-4 flex items-center gap-3 border-b border-[#D9E2F8] pb-4">
          <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#D9E2F8" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={strength.score >= 80 ? "#16A34A" : strength.score >= 50 ? "#2B5FD9" : "#D97706"}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${(strength.score / 100) * 94.25} 94.25`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums">{strength.score}</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#14161A]">Resume strength</div>
            <div className="text-xs text-[#6B7280]">
              {strength.checks.filter((c) => c.done).length} of {strength.checks.length} essentials in place
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Sparkles size={18} className="text-[#2B5FD9]" fill="#2B5FD9" />
          {suggestions.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-[#14161A]">
              <button
                type="button"
                aria-label="Previous suggestion"
                disabled={safeIndex === 0}
                onClick={() => setIndex(safeIndex - 1)}
                className="rounded p-0.5 hover:bg-white/70 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="tabular-nums">
                {safeIndex + 1}/{suggestions.length}
              </span>
              <button
                type="button"
                aria-label="Next suggestion"
                disabled={safeIndex >= suggestions.length - 1}
                onClick={() => setIndex(safeIndex + 1)}
                className="rounded p-0.5 hover:bg-white/70 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {current ? (
          <>
            <h2 className="mt-3 text-[17px] font-medium text-[#14161A]">{current.title}</h2>
            <p className="mt-1.5 min-h-[44px] text-sm leading-relaxed text-[#6B7280]">{current.body}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <SecondaryButton onClick={() => setDismissed((prev) => [...prev, current.id])}>Ignore</SecondaryButton>
              <PrimaryButton onClick={current.onAction} disabled={current.busy}>
                {current.busy && <Loader2 size={14} className="animate-spin" />}
                {current.actionLabel}
              </PrimaryButton>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <h2 className="flex items-center gap-2 text-[17px] font-medium text-[#14161A]">
              <CheckCircle2 size={18} className="text-[#16A34A]" />
              All caught up
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">No more suggestions for this resume right now.</p>
            {dismissed.length > 0 && (
              <button type="button" onClick={() => setDismissed([])} className="mt-3 text-sm font-medium text-[#2B5FD9] hover:underline">
                Show ignored suggestions
              </button>
            )}
          </div>
        )}
      </section>

      {/* Design card */}
      <section aria-label="Design" className="shrink-0 rounded-2xl border border-[#E9EAEE] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-[#E9EAEE] p-5">
          <h3 className="mb-4 text-[17px] font-medium text-[#14161A]">Layout</h3>
          <SelectField label="Template" value={template} onChange={(e) => setTemplate(e.target.value as TemplateID)}>
            {TEMPLATE_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </SelectField>
          <div className="mt-4">
            <span className="mb-1.5 block text-xs font-medium text-[#5B6270]">Spacing</span>
            <div className={cx("grid grid-cols-3 gap-1 rounded-lg bg-[#F3F4F6] p-1", !option.supportsSpacing && "opacity-50")}>
              {(["compact", "standard", "spacious"] as LayoutSpacing[]).map((layout) => (
                <button
                  key={layout}
                  type="button"
                  disabled={!option.supportsSpacing}
                  aria-pressed={(customization.layout || "standard") === layout}
                  onClick={() => setCustomization({ layout })}
                  className={cx(
                    "rounded-md py-1.5 text-xs font-medium capitalize transition-colors disabled:cursor-not-allowed",
                    (customization.layout || "standard") === layout
                      ? "bg-white text-[#14161A] shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                      : "text-[#6B7280]",
                  )}
                >
                  {layout}
                </button>
              ))}
            </div>
            {!option.supportsSpacing && (
              <p className="mt-1.5 text-xs text-[#9AA0AB]">Spacing and line height apply to the Clean Serif template.</p>
            )}
          </div>
        </div>

        <div className="border-b border-[#E9EAEE] p-5">
          <h3 className="mb-4 text-[17px] font-medium text-[#14161A]">Text</h3>
          <SelectField
            label="Font"
            value={fontValue}
            onChange={(e) => setCustomization({ fontFamily: e.target.value as FontFamily })}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </SelectField>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stepper
              label="Size"
              display={`${Math.round(textScale * 100)}%`}
              canDecrease={textScale > 0.6}
              canIncrease={textScale < 1.5}
              onDecrease={() => setCustomization({ textScale: Math.max(0.6, round(textScale - 0.05, 0.05)) })}
              onIncrease={() => setCustomization({ textScale: Math.min(1.5, round(textScale + 0.05, 0.05)) })}
            />
            <div className={cx(!option.supportsSpacing && "pointer-events-none opacity-50")}>
              <Stepper
                label="Line height"
                display={lineHeight.toFixed(1)}
                canDecrease={option.supportsSpacing && lineHeight > 1.2}
                canIncrease={option.supportsSpacing && lineHeight < 2}
                onDecrease={() => setCustomization({ lineHeight: Math.max(1.2, round(lineHeight - 0.1, 0.1)) })}
                onIncrease={() => setCustomization({ lineHeight: Math.min(2, round(lineHeight + 0.1, 0.1)) })}
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-4 text-[17px] font-medium text-[#14161A]">Colors</h3>
          <div className={cx(!option.supportsAccent && "pointer-events-none opacity-50")}>
            <label className="flex items-center gap-2 rounded-lg border border-[#E3E5EA] px-2.5 py-2 focus-within:border-[#2B5FD9] focus-within:ring-2 focus-within:ring-[#2B5FD9]/15">
              <span className="h-5 w-5 shrink-0 rounded border border-black/10" style={{ background: resumeData.accentColor || "#1B1B1B" }} />
              <input
                aria-label="Accent color hex"
                value={hexDraft}
                maxLength={7}
                disabled={!option.supportsAccent}
                onChange={(e) => {
                  const value = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                  setHexDraft(value);
                  if (isHexColor(value)) updateResumeData({ accentColor: value });
                }}
                onBlur={() => setHexDraft(resumeData.accentColor || "")}
                className="w-full bg-transparent text-sm uppercase text-[#14161A] focus:outline-none"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACCENT_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  disabled={!option.supportsAccent}
                  onClick={() => updateResumeData({ accentColor: color })}
                  className={cx(
                    "h-7 w-7 rounded-md border border-black/10",
                    (resumeData.accentColor || "").toLowerCase() === color.toLowerCase() && "ring-2 ring-[#2B5FD9] ring-offset-2",
                  )}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          {!option.supportsAccent && (
            <p className="mt-2 text-xs text-[#9AA0AB]">{option.name} is a single-color template.</p>
          )}
        </div>
      </section>
    </aside>
  );
};

export default InspectorPanel;
