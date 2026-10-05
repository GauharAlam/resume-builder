import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  PenLine,
  Crosshair,
  Star,
  Smile,
  ChevronDown,
  MoreVertical,
  Loader2,
  Maximize2,
  Minimize2,
  X,
  PanelLeft,
} from "lucide-react";
import { useResume } from "@/hooks";
import { generateDocx } from "@/utils/docxExport";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { trackEvent } from "@/services/analytics";
import { FontFamily } from "@/types";
import { ResumeTemplate, getTemplateOption, TemplateInteraction } from "@/components/templates";
import { useEditorAI } from "./EditorAI";
import type { BuilderSection } from "./BuilderPanel";
import { ACCENT_SWATCHES, FONT_OPTIONS, IconButton, cx, isHexColor, useDismiss } from "./ui";

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

export type ExportFormat = "pdf" | "docx";

export interface CanvasHandle {
  exportAs: (format: ExportFormat) => Promise<void>;
}

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const ZOOM_STEPS = [0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.25, 1.5];
const HINT_KEY = "editor:canvasHintDismissed";

const TONES: { label: string; instruction: string }[] = [
  { label: "Professional", instruction: "Rewrite in a polished, professional tone suitable for a formal resume." },
  { label: "Confident", instruction: "Rewrite in a confident, assertive tone with strong action verbs. Do not exaggerate." },
  { label: "Friendly", instruction: "Rewrite in a warm, approachable tone while staying professional." },
  { label: "Concise", instruction: "Rewrite to be as concise as possible. Cut filler words and keep only what matters." },
];

const CLARITY_INSTRUCTION =
  "Improve clarity only: make it easier to read, remove jargon and filler, fix grammar. Keep the same facts and a similar or shorter length.";

const sanitizeFilename = (name: string): string =>
  (name || "Resume").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80) || "Resume";

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/* ── Floating AI bar shown under the selected block ───────── */

const BarButton: React.FC<{
  icon: React.ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ icon, busy, disabled, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#14161A] transition-colors hover:bg-[#F0F1F4] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {busy ? <Loader2 size={15} className="animate-spin" /> : icon}
    {children}
  </button>
);

const AIActionBar: React.FC<{
  maxWidth: number;
  busyId: string | null;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onRun: (action: string, instruction?: string) => void;
  onEditInBuilder: () => void;
  onDeselect: () => void;
}> = ({ maxWidth, busyId, jobDescription, onJobDescriptionChange, onRun, onEditInBuilder, onDeselect }) => {
  const [menu, setMenu] = useState<"tone" | "jd" | "more" | null>(null);
  const ref = useDismiss<HTMLDivElement>(menu !== null, () => setMenu(null));
  const busy = busyId !== null;
  const isBusy = (action: string) => busyId === `canvas-${action}`;
  const divider = <span className="h-4 w-px shrink-0 bg-[#E3E5EA]" />;

  return (
    <div ref={ref} className="relative font-inter" style={{ maxWidth }}>
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-[#E9EAEE] bg-white px-1.5 py-1 shadow-[0_8px_28px_rgba(16,24,40,0.14)]">
        <BarButton icon={<PenLine size={15} />} busy={isBusy("rewrite")} disabled={busy} onClick={() => onRun("rewrite")}>
          Rewrite
        </BarButton>
        {divider}
        <BarButton icon={<Crosshair size={15} />} busy={isBusy("jd")} disabled={busy} onClick={() => setMenu(menu === "jd" ? null : "jd")}>
          Match Job Description
        </BarButton>
        {divider}
        <BarButton icon={<Star size={15} />} busy={isBusy("clarity")} disabled={busy} onClick={() => onRun("clarity", CLARITY_INSTRUCTION)}>
          Improve Clarity
        </BarButton>
        {divider}
        <BarButton icon={<Smile size={15} />} busy={isBusy("tone")} disabled={busy} onClick={() => setMenu(menu === "tone" ? null : "tone")}>
          Change Tone
          <ChevronDown size={14} />
        </BarButton>
        {divider}
        <button
          type="button"
          aria-label="More actions"
          onClick={() => setMenu(menu === "more" ? null : "more")}
          className="rounded-lg p-1.5 text-[#14161A] hover:bg-[#F0F1F4]"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      {menu === "tone" && (
        <div className="absolute right-10 top-full z-10 mt-1.5 w-40 rounded-xl border border-[#E9EAEE] bg-white p-1 shadow-[0_8px_28px_rgba(16,24,40,0.14)]">
          {TONES.map((tone) => (
            <button
              key={tone.label}
              type="button"
              onClick={() => {
                setMenu(null);
                onRun("tone", tone.instruction);
              }}
              className="block w-full rounded-lg px-3 py-1.5 text-left text-[13px] text-[#14161A] hover:bg-[#F0F1F4]"
            >
              {tone.label}
            </button>
          ))}
        </div>
      )}

      {menu === "more" && (
        <div className="absolute right-0 top-full z-10 mt-1.5 w-48 rounded-xl border border-[#E9EAEE] bg-white p-1 shadow-[0_8px_28px_rgba(16,24,40,0.14)]">
          <button
            type="button"
            onClick={onEditInBuilder}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] text-[#14161A] hover:bg-[#F0F1F4]"
          >
            <PanelLeft size={14} />
            Edit in builder
          </button>
          <button
            type="button"
            onClick={onDeselect}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] text-[#14161A] hover:bg-[#F0F1F4]"
          >
            <X size={14} />
            Deselect
          </button>
        </div>
      )}

      {menu === "jd" && (
        <div className="absolute left-1/2 top-full z-10 mt-1.5 w-[340px] max-w-full -translate-x-1/2 rounded-xl border border-[#E9EAEE] bg-white p-3 shadow-[0_8px_28px_rgba(16,24,40,0.14)]">
          <label className="mb-1.5 block text-xs font-medium text-[#5B6270]" htmlFor="canvas-jd">
            Paste the job description to tailor this text to
          </label>
          <textarea
            id="canvas-jd"
            rows={5}
            autoFocus
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste the job description here…"
            className="w-full resize-y rounded-lg border border-[#E3E5EA] px-3 py-2 text-[13px] text-[#14161A] placeholder:text-[#9AA0AB] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#9AA0AB]">{jobDescription.trim().length < 40 ? "Add at least a few lines." : "Only true, relevant points are emphasised."}</span>
            <button
              type="button"
              disabled={jobDescription.trim().length < 40}
              onClick={() => {
                setMenu(null);
                onRun(
                  "jd",
                  `Tailor this text to the job description below. Emphasise the experience that is relevant to it and use its keywords only where they truthfully apply.\n\nJob description:\n${jobDescription.trim().slice(0, 5000)}`,
                );
              }}
              className="rounded-lg bg-[#2B5FD9] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#2450BD] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tailor text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Canvas ────────────────────────────────────────────────── */

const Canvas = forwardRef<
  CanvasHandle,
  {
    jobDescription: string;
    onJobDescriptionChange: (value: string) => void;
    onOpenSection: (section: BuilderSection) => void;
    onExportingChange: (format: ExportFormat | null) => void;
  }
>(({ jobDescription, onJobDescriptionChange, onOpenSection, onExportingChange }, ref) => {
  const { resumeData, updateResumeData, updateField, updateExperience, updateProject, template, setTemplate, activeResumeId } =
    useResume();
  const { busyId, improve } = useEditorAI();
  const option = getTemplateOption(template);

  const scrollRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const exportingRef = useRef(false);

  const [containerWidth, setContainerWidth] = useState(900);
  const [zoomMode, setZoomMode] = useState<"fit" | "wide" | number>("fit");
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pages, setPages] = useState(1);
  const [colorOpen, setColorOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(resumeData.accentColor || "");
  const [hintDismissed, setHintDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(HINT_KEY) === "1";
    } catch {
      return false;
    }
  });
  const colorRef = useDismiss<HTMLDivElement>(colorOpen, () => setColorOpen(false));

  const fitZoom = Math.min(1, Math.max(0.3, (containerWidth - 48) / PAGE_WIDTH));
  // "Expand": fill the panel width, and always end up clearly larger than "fit"
  // (the page scrolls sideways if it is wider than the panel)
  const wideZoom = Math.min(1.5, Math.max((containerWidth - 48) / PAGE_WIDTH, fitZoom * 1.2, 1));
  const displayZoom = zoomMode === "fit" ? fitZoom : zoomMode === "wide" ? wideZoom : zoomMode;
  // Capture always happens at 100% so the exported file is not scaled
  const zoom = exporting === "pdf" ? 1 : displayZoom;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const measure = () => setPages(Math.max(1, Math.ceil((el.scrollHeight - 8) / PAGE_HEIGHT)));
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [template]);

  useEffect(() => setHexDraft(resumeData.accentColor || ""), [resumeData.accentColor]);

  /* Selected block → the resume field it edits */
  const resolveBlock = useCallback(
    (blockId: string) => {
      if (blockId === "summary") {
        return {
          text: resumeData.summary || "",
          section: "summary",
          builder: "summary" as BuilderSection,
          apply: (value: string) => updateField("summary", value),
        };
      }
      const [kind, id] = blockId.split(":");
      if (kind === "exp") {
        const exp = (resumeData.experience || []).find((e) => e.id === id);
        if (!exp) return null;
        return {
          text: exp.description || "",
          section: "experience description",
          builder: "experience" as BuilderSection,
          apply: (value: string) => updateExperience(exp.id, { ...exp, description: value }),
        };
      }
      if (kind === "proj") {
        const proj = (resumeData.projects || []).find((p) => p.id === id);
        if (!proj) return null;
        return {
          text: proj.description || "",
          section: "project description",
          builder: "projects" as BuilderSection,
          apply: (value: string) => updateProject(proj.id, { ...proj, description: value }),
        };
      }
      return null;
    },
    [resumeData, updateField, updateExperience, updateProject],
  );

  // Handlers that run after an async gap must see the latest resume data
  const resolveRef = useRef(resolveBlock);
  resolveRef.current = resolveBlock;

  // Drop the selection if its block was deleted, emptied, or the template changed
  useEffect(() => {
    if (!selected) return;
    const block = resolveBlock(selected);
    if (!option.supportsCanvasEditing || !block || !block.text.trim()) setSelected(null);
  }, [selected, resolveBlock, option.supportsCanvasEditing]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement | null)?.blur?.();
        setSelected(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  const interaction: TemplateInteraction | undefined =
    option.supportsCanvasEditing && !exporting
      ? {
          selected,
          onSelect: setSelected,
          onEdit: (blockId, text) => resolveBlock(blockId)?.apply(text),
          renderActions: (blockId) => (
            <div style={{ zoom: 1 / zoom }}>
              <AIActionBar
                maxWidth={Math.max(260, containerWidth - 24)}
                busyId={busyId}
                jobDescription={jobDescription}
                onJobDescriptionChange={onJobDescriptionChange}
                onDeselect={() => setSelected(null)}
                onEditInBuilder={() => {
                  const block = resolveBlock(blockId);
                  if (block) onOpenSection(block.builder);
                  setSelected(null);
                }}
                onRun={(action, instruction) => {
                  // Commit any in-progress typing before sending the text to AI
                  (document.activeElement as HTMLElement | null)?.blur?.();
                  requestAnimationFrame(() => {
                    const block = resolveRef.current(blockId);
                    if (!block) return;
                    improve({
                      id: `canvas-${action}`,
                      text: block.text,
                      section: block.section,
                      instruction,
                      onAccept: (value) => resolveRef.current(blockId)?.apply(value),
                    });
                  });
                }}
              />
            </div>
          ),
        }
      : undefined;

  /* Export */
  const markExported = (format: ExportFormat) => {
    if (!activeResumeId) return;
    try {
      localStorage.setItem(`resumeExported:${activeResumeId}`, "true");
    } catch {}
    window.dispatchEvent(new CustomEvent("resume-exported", { detail: { resumeId: activeResumeId } }));
    trackEvent("funnel_resume_exported", { format, resumeId: activeResumeId });
  };

  const exportAs = async (format: ExportFormat) => {
    if (exportingRef.current) return;
    const fileName = sanitizeFilename(resumeData.personalDetails.fullName);

    if (format === "pdf" && (!window.jspdf?.jsPDF || !window.html2canvas)) {
      toastError("The PDF library didn't load (ad-blocker or offline). Try DOCX instead.");
      return;
    }

    exportingRef.current = true;
    (document.activeElement as HTMLElement | null)?.blur?.();
    setSelected(null);
    setExporting(format);
    onExportingChange(format);
    try {
      if (format === "docx") {
        await generateDocx(resumeData);
        markExported("docx");
        toastSuccess("DOCX downloaded.");
        return;
      }

      toastInfo("Generating PDF…");
      // Let React re-render the page at 100% with no selection chrome
      await nextFrame();
      await nextFrame();
      if (document.fonts?.ready) await document.fonts.ready;
      if (!paperRef.current) throw new Error("Preview is not mounted");

      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(paperRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const renderedHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = renderedHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, renderedHeight);
      heightLeft -= pdfHeight;
      // 1mm tolerance so a hairline of overflow doesn't add a blank page
      while (heightLeft > 1) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, renderedHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`${fileName}.pdf`);
      markExported("pdf");
      toastSuccess("PDF downloaded.");
    } catch (err) {
      console.error(`${format} export failed:`, err);
      toastError(format === "pdf" ? "PDF export failed. Try DOCX instead." : "DOCX export failed. Please try again.");
    } finally {
      exportingRef.current = false;
      setExporting(null);
      onExportingChange(null);
    }
  };

  useImperativeHandle(ref, () => ({ exportAs }));

  /* Toolbar handlers */
  const customization = resumeData.customization || { fontFamily: "sans" as FontFamily, fontSize: "medium" as const, layout: "standard" as const };
  const textScale = customization.textScale ?? 1;
  const setTextScale = (value: number) =>
    updateResumeData({ customization: { ...customization, textScale: Math.round(Math.min(1.5, Math.max(0.6, value)) * 100) / 100 } });
  const stepZoom = (direction: 1 | -1) => {
    const idx = ZOOM_STEPS.findIndex((z) => z >= displayZoom - 0.001);
    const base = idx === -1 ? ZOOM_STEPS.length - 1 : idx;
    const exact = Math.abs(ZOOM_STEPS[base] - displayZoom) < 0.001;
    const next = direction === 1 ? (exact ? base + 1 : base) : base - 1;
    setZoomMode(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, next))]);
  };

  const fontValue = FONT_OPTIONS.some((f) => f.id === customization.fontFamily) ? customization.fontFamily : "sans";
  const divider = <span className="mx-1 hidden h-5 w-px bg-[#E3E5EA] sm:block" />;

  return (
    <div
      ref={scrollRef}
      className="relative h-full min-h-0 w-full overflow-auto"
      onClick={() => setSelected(null)}
    >
      {/* Floating format toolbar */}
      <div className="sticky top-0 z-30 flex justify-center px-2 pb-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border border-[#E9EAEE] bg-white px-2 py-1.5 shadow-[0_6px_24px_rgba(16,24,40,0.08)]">
          <select
            aria-label="Font family"
            value={fontValue}
            onChange={(e) => updateResumeData({ customization: { ...customization, fontFamily: e.target.value as FontFamily } })}
            className="h-8 cursor-pointer rounded-lg border border-[#E3E5EA] bg-white px-2 text-[13px] font-medium text-[#14161A] focus:border-[#2B5FD9] focus:outline-none"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>

          {divider}

          <IconButton label="Decrease text size" disabled={textScale <= 0.6} onClick={() => setTextScale(textScale - 0.05)}>
            <span className="text-[13px] font-semibold">A−</span>
          </IconButton>
          <span className="w-10 text-center text-[13px] font-medium tabular-nums text-[#14161A]" title="Text size">
            {Math.round(textScale * 100)}%
          </span>
          <IconButton label="Increase text size" disabled={textScale >= 1.5} onClick={() => setTextScale(textScale + 0.05)}>
            <span className="text-[13px] font-semibold">A+</span>
          </IconButton>

          {divider}

          <div ref={colorRef} className="relative">
            <button
              type="button"
              disabled={!option.supportsAccent}
              onClick={() => setColorOpen((prev) => !prev)}
              aria-label="Accent color"
              title={option.supportsAccent ? "Accent color" : `${option.name} doesn't use an accent color`}
              className="flex h-8 items-center gap-1 rounded-lg px-1.5 hover:bg-[#F0F1F4] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="h-5 w-5 rounded-md border border-black/10" style={{ background: resumeData.accentColor || "#1B1B1B" }} />
              <ChevronDown size={14} className="text-[#3F4551]" />
            </button>
            {colorOpen && (
              <div className="absolute left-1/2 top-full z-40 mt-2 w-[196px] -translate-x-1/2 rounded-xl border border-[#E9EAEE] bg-white p-3 shadow-[0_8px_28px_rgba(16,24,40,0.14)]">
                <div className="grid grid-cols-4 gap-2">
                  {ACCENT_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Use ${color}`}
                      onClick={() => updateResumeData({ accentColor: color })}
                      className={cx(
                        "h-9 w-9 rounded-lg border border-black/10",
                        (resumeData.accentColor || "").toLowerCase() === color.toLowerCase() && "ring-2 ring-[#2B5FD9] ring-offset-2",
                      )}
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <input
                  aria-label="Hex color"
                  value={hexDraft}
                  maxLength={7}
                  onChange={(e) => {
                    const value = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                    setHexDraft(value);
                    if (isHexColor(value)) updateResumeData({ accentColor: value });
                  }}
                  onBlur={() => setHexDraft(resumeData.accentColor || "")}
                  className="mt-3 w-full rounded-lg border border-[#E3E5EA] px-2.5 py-1.5 text-[13px] uppercase text-[#14161A] focus:border-[#2B5FD9] focus:outline-none"
                />
              </div>
            )}
          </div>

          {divider}

          <IconButton label="Zoom out" disabled={displayZoom <= ZOOM_STEPS[0] + 0.001} onClick={() => stepZoom(-1)}>
            <Minus size={15} />
          </IconButton>
          <span className="w-10 text-center text-[13px] font-medium tabular-nums text-[#14161A]" title="Zoom">
            {Math.round(displayZoom * 100)}%
          </span>
          <IconButton label="Zoom in" disabled={displayZoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] - 0.001} onClick={() => stepZoom(1)}>
            <Plus size={15} />
          </IconButton>
          <IconButton
            label={zoomMode === "wide" ? "Back to fit" : "Expand to full width"}
            className={cx(zoomMode === "wide" && "bg-[#EEF3FF] text-[#2B5FD9]")}
            onClick={() => setZoomMode(zoomMode === "wide" ? "fit" : "wide")}
          >
            {zoomMode === "wide" ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </IconButton>

          {divider}

          <span
            className={cx(
              "rounded-md px-2 py-1 text-[12px] font-medium",
              pages > 2 ? "bg-[#FEF3E2] text-[#B45309]" : "bg-[#F0F1F4] text-[#3F4551]",
            )}
            title={pages > 2 ? "Most recruiters prefer one or two pages" : undefined}
          >
            {pages} {pages === 1 ? "page" : "pages"}
          </span>
        </div>
      </div>

      {!option.supportsCanvasEditing && !hintDismissed && (
        <div className="mb-3 flex justify-center px-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 rounded-lg bg-[#EEF3FF] py-1.5 pl-3 pr-1.5 text-xs text-[#1E3A8A]">
            <span>Click-to-edit and AI rewrite on the page work in the Clean Serif template.</span>
            <button type="button" onClick={() => setTemplate("clean-serif")} className="font-semibold text-[#2B5FD9] hover:underline">
              Switch
            </button>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => {
                setHintDismissed(true);
                try {
                  sessionStorage.setItem(HINT_KEY, "1");
                } catch {}
              }}
              className="rounded p-1 text-[#6B7280] hover:bg-white/70"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* The page */}
      <div className="px-3 pb-24">
        <div className="mx-auto w-fit" style={{ zoom }}>
          <div
            ref={paperRef}
            className="relative bg-white shadow-[0_2px_24px_rgba(16,24,40,0.07)]"
            style={{ width: PAGE_WIDTH, minHeight: PAGE_HEIGHT }}
          >
            <ResumeTemplate template={template} data={resumeData} interaction={interaction} />
            {/* Page-break guides (never exported) */}
            {Array.from({ length: pages - 1 }, (_, i) => (
              <div
                key={i}
                data-html2canvas-ignore="true"
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#F59E0B]/70"
                style={{ top: (i + 1) * PAGE_HEIGHT }}
              >
                <span className="absolute right-2 top-1 rounded bg-[#FEF3E2] px-1.5 py-0.5 font-inter text-[10px] font-medium text-[#B45309]">
                  Page {i + 2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;
