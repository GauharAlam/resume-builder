import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Eye,
  FileText,
  Clock,
  Search,
  Briefcase,
  ArrowLeft,
  X,
  Loader2,
  Pencil,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useResume } from "@/hooks";
import { ResumeData, TemplateID } from "@/types";
import { ResumeTemplate } from "@/components/templates";
import { toastError, toastSuccess } from "@/utils/toast";
import { trackEvent } from "@/services/analytics";
import { exportElementToPdf, isPdfLibraryLoaded } from "@/utils/pdfExport";
import { PrimaryButton, SecondaryButton, SelectField, cx } from "./v3/ui";

type SavedResume = ReturnType<typeof useResume>["resumeHistory"][number];
type SortOption = "recent" | "oldest" | "name-asc" | "name-desc";

const PAGE_BG = "#F3F4F6";
const PAGE_WIDTH = 794;
const PAGE_SIZE = 6;
const VALID_TEMPLATES: TemplateID[] = ["professional-it", "ats-modern", "standard-classic", "tech-minimalist", "clean-serif"];

// React 18 doesn't type `inert`; it keeps decorative thumbnails (which contain
// links) out of the tab order.
const inertProps = { inert: "" } as Record<string, string>;

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const formatDate = (value?: string) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";
};

/** Saved data can predate newer fields; fill gaps so a template never crashes on it. */
const toRenderable = (resume: SavedResume): { data: ResumeData; template: TemplateID } => {
  const raw = (resume.resumeData || {}) as Partial<ResumeData> & { template?: TemplateID };
  const details = raw.personalDetails;
  const data: ResumeData = {
    personalDetails: {
      fullName: details?.fullName || "",
      jobTitle: details?.jobTitle || "",
      email: details?.email || "",
      phone: details?.phone || "",
      location: details?.location || "",
      links: details?.links || [],
      photo: details?.photo,
    },
    summary: raw.summary || "",
    experience: raw.experience || [],
    education: raw.education || [],
    skills: raw.skills || "",
    projects: raw.projects || [],
    accomplishments: raw.accomplishments || [],
    sectionOrder: raw.sectionOrder || ["summary", "experience", "projects", "education", "skills", "accomplishments"],
    accentColor: raw.accentColor || "#4F46E5",
    customization: { fontFamily: "sans", fontSize: "medium", layout: "standard", ...(raw.customization || {}) },
  };
  const template = raw.template && VALID_TEMPLATES.includes(raw.template) ? raw.template : "professional-it";
  return { data, template };
};

/** One malformed resume must not take the whole dashboard down. */
type BoundaryProps = { children: React.ReactNode; fallback: React.ReactNode };

class RenderBoundary extends React.Component<BoundaryProps, { failed: boolean }> {
  // @types/react isn't installed here, so spell out what the base class provides
  declare props: Readonly<BoundaryProps>;
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Resume preview failed to render:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const ThumbnailFallback: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#F6F7F9] text-[#9AA0AB]">
    <FileText size={32} />
  </div>
);

/** The real template, scaled down to the card's width. */
const ResumeThumbnail: React.FC<{ resume: SavedResume }> = ({ resume }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.4);
  const { data, template } = useMemo(() => toRenderable(resume), [resume]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setZoom(entry.contentRect.width / PAGE_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-[230px] overflow-hidden bg-white" aria-hidden="true" {...inertProps}>
      <RenderBoundary fallback={<ThumbnailFallback />}>
        <div className="pointer-events-none select-none" style={{ width: PAGE_WIDTH, zoom }}>
          <ResumeTemplate template={template} data={data} />
        </div>
      </RenderBoundary>
    </div>
  );
};

const IconAction: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, danger, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cx(
      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E3E5EA] bg-white text-[#3F4551] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
      danger ? "hover:border-[#F5C2C2] hover:bg-[#FEECEC] hover:text-[#DC2626]" : "hover:bg-[#F0F1F4]",
    )}
  >
    {children}
  </button>
);

/* ── Full-size preview ─────────────────────────────────────── */

const PreviewModal: React.FC<{
  resume: SavedResume;
  downloading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
}> = ({ resume, downloading, onClose, onEdit, onDownload }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const { data, template } = useMemo(() => toRenderable(resume), [resume]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setZoom(Math.min(1, Math.max(0.3, (entry.contentRect.width - 32) / PAGE_WIDTH))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/50 p-3 sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${resume.title || "resume"}`}
        className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(16,24,40,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E9EAEE] px-5 py-3.5">
          <h2 className="min-w-0 truncate text-[17px] font-medium text-[#14161A]">{resume.title || "Untitled Resume"}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <SecondaryButton onClick={onDownload} disabled={downloading} className="!px-3 !py-2">
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span className="hidden sm:inline">{downloading ? "Exporting…" : "PDF"}</span>
            </SecondaryButton>
            <PrimaryButton onClick={onEdit} className="!px-4 !py-2">
              <Pencil size={14} />
              Edit
            </PrimaryButton>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F0F1F4] hover:text-[#14161A]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-[#F3F4F6] p-4">
          <RenderBoundary fallback={<p className="py-16 text-center text-sm text-[#6B7280]">This resume can't be previewed. Open it in the editor instead.</p>}>
            <div className="mx-auto w-fit bg-white shadow-[0_2px_24px_rgba(16,24,40,0.08)]" style={{ zoom }}>
              <div style={{ width: PAGE_WIDTH }}>
                <ResumeTemplate template={template} data={data} />
              </div>
            </div>
          </RenderBoundary>
        </div>
      </div>
    </div>
  );
};

/* ── Page ──────────────────────────────────────────────────── */

const ResumeHistory: React.FC = () => {
  const navigate = useNavigate();
  const { resumeHistory, activeResumeId, createNewResume, deleteResume, isLoading } = useResume();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [itemsToShow, setItemsToShow] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // index.html paints the body dark for the rest of the app
  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = PAGE_BG;
    return () => {
      document.body.style.background = previous;
    };
  }, []);

  useEffect(() => setItemsToShow(PAGE_SIZE), [searchTerm, sortBy]);

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (value?: string) => (value || "").toLowerCase().includes(term);
    const list = resumeHistory.filter(
      (r) =>
        !term ||
        matches(r.title || "Untitled Resume") ||
        matches(r.resumeData?.personalDetails?.fullName) ||
        matches(r.resumeData?.personalDetails?.jobTitle),
    );
    const time = (r: SavedResume) => new Date(r.updatedAt).getTime() || 0;
    return list.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return time(a) - time(b);
        case "name-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "name-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return time(b) - time(a);
      }
    });
  }, [resumeHistory, searchTerm, sortBy]);

  const displayed = filteredAndSorted.slice(0, itemsToShow);
  const hasMore = displayed.length < filteredAndSorted.length;
  const previewing = previewId ? resumeHistory.find((r) => r._id === previewId) : undefined;
  const exporting = exportingId ? resumeHistory.find((r) => r._id === exportingId) : undefined;

  // Close the preview if its resume is deleted from under it
  useEffect(() => {
    if (previewId && !previewing) setPreviewId(null);
  }, [previewId, previewing]);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const id = await createNewResume();
      if (id) navigate(`/edit-resume/${id}`);
      else toastError("Couldn't create a new resume. Check your connection and try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteResume(id);
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleDownload = async (resume: SavedResume) => {
    if (exportingId) return;
    if (!isPdfLibraryLoaded()) {
      toastError("The PDF library didn't load (ad-blocker or offline). Open the resume and use DOCX instead.");
      return;
    }
    // Render the resume off-screen at full size so it can be captured
    setExportingId(resume._id);
    try {
      await nextFrame();
      await nextFrame();
      if (document.fonts?.ready) await document.fonts.ready;
      if (!exportRef.current) throw new Error("Export target is not mounted");
      await exportElementToPdf(exportRef.current, resume.title || toRenderable(resume).data.personalDetails.fullName || "Resume");
      try {
        localStorage.setItem(`resumeExported:${resume._id}`, "true");
      } catch {}
      trackEvent("funnel_resume_exported", { format: "pdf", resumeId: resume._id });
      toastSuccess("PDF downloaded.");
    } catch (error) {
      console.error("PDF export failed:", error);
      toastError("PDF export failed. Open the resume and try DOCX instead.");
    } finally {
      setExportingId(null);
    }
  };

  const hasResumes = resumeHistory.length > 0;

  return (
    <div className="min-h-screen font-inter text-[#14161A]" style={{ background: PAGE_BG }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#E9EAEE] bg-white">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="ResumeAI home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B5FD9]">
              <FileText className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="hidden text-xl font-semibold tracking-tight sm:block">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={() => navigate("/")} className="!px-3.5 !py-2">
              <ArrowLeft size={15} />
              Home
            </SecondaryButton>
            <PrimaryButton onClick={handleCreate} disabled={creating} className="!px-4 !py-2">
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              New resume
            </PrimaryButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My resumes</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {isLoading
              ? "Loading your resumes…"
              : hasResumes
                ? `${resumeHistory.length} ${resumeHistory.length === 1 ? "resume" : "resumes"} · pick one to keep editing`
                : "Everything you create will show up here."}
          </p>
        </div>

        {/* Search + sort */}
        {hasResumes && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search resumes</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA0AB]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find a resume by title, job or name…"
                className="w-full rounded-xl border border-[#E3E5EA] bg-white py-2.5 pl-10 pr-3 text-sm text-[#14161A] placeholder:text-[#9AA0AB] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
              />
            </label>
            <SelectField aria-label="Sort resumes" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="sm:w-48">
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Title (A–Z)</option>
              <option value="name-desc">Title (Z–A)</option>
            </SelectField>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#E9EAEE] bg-white">
                <div className="h-[230px] bg-[#EEF0F3]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 rounded bg-[#EEF0F3]" />
                  <div className="h-3 w-1/2 rounded bg-[#EEF0F3]" />
                  <div className="h-9 rounded-lg bg-[#EEF0F3]" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasResumes ? (
          <div className="rounded-2xl border border-dashed border-[#CDD2DB] bg-white px-6 py-20 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3FF]">
              <FileText className="h-6 w-6 text-[#2B5FD9]" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">No resumes yet</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[#6B7280]">
              Start with a template, let AI sharpen the wording, and download it when you're ready.
            </p>
            <PrimaryButton onClick={handleCreate} disabled={creating} className="mx-auto mt-6">
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create your first resume
            </PrimaryButton>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="rounded-2xl border border-[#E9EAEE] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Search className="h-5 w-5 text-[#9AA0AB]" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">No resumes match “{searchTerm.trim()}”</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Try a different title, job or name.</p>
            <SecondaryButton onClick={() => setSearchTerm("")} className="mx-auto mt-5 !py-2">
              Clear search
            </SecondaryButton>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((resume) => {
                const isActive = resume._id === activeResumeId;
                const isConfirming = deleteConfirm === resume._id;
                const jobTitle = resume.resumeData?.personalDetails?.jobTitle;
                const title = resume.title || "Untitled Resume";
                return (
                  <article
                    key={resume._id}
                    className={cx(
                      "group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-[0_14px_40px_rgba(16,24,40,0.09)]",
                      isActive ? "border-[#2B5FD9]/50 ring-1 ring-[#2B5FD9]/20" : "border-[#E9EAEE]",
                    )}
                  >
                    {/* Thumbnail doubles as the main "open" target */}
                    <div className="relative border-b border-[#E9EAEE]">
                      <ResumeThumbnail resume={resume} />
                      <button
                        type="button"
                        onClick={() => navigate(`/edit-resume/${resume._id}`)}
                        aria-label={`Edit ${title}`}
                        className="absolute inset-0 bg-[#14161A]/0 transition-colors hover:bg-[#14161A]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2B5FD9]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 truncate text-[15px] font-semibold" title={title}>
                          {title}
                        </h3>
                        {isActive && (
                          <span className="shrink-0 rounded-md bg-[#EEF3FF] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2B5FD9]">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-[13px] text-[#6B7280]">
                        {jobTitle && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{jobTitle}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Edited {formatDate(resume.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-[#E9EAEE] pt-4">
                        <PrimaryButton onClick={() => navigate(`/edit-resume/${resume._id}`)} className="flex-1 !py-2">
                          Edit
                        </PrimaryButton>
                        <IconAction label="Preview" onClick={() => setPreviewId(resume._id)}>
                          <Eye size={16} />
                        </IconAction>
                        <IconAction label={exportingId === resume._id ? "Exporting…" : "Download PDF"} disabled={exportingId !== null} onClick={() => handleDownload(resume)}>
                          {exportingId === resume._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        </IconAction>
                        <IconAction label="Delete" danger onClick={() => setDeleteConfirm(resume._id)}>
                          <Trash2 size={16} />
                        </IconAction>
                      </div>
                    </div>

                    {isConfirming && (
                      <div
                        role="alertdialog"
                        aria-label={`Delete ${title}?`}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 p-5 backdrop-blur-sm"
                      >
                        <div className="w-full text-center">
                          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FEECEC]">
                            <Trash2 className="h-5 w-5 text-[#DC2626]" />
                          </span>
                          <p className="mt-3 font-semibold">Delete this resume?</p>
                          <p className="mx-auto mt-1 max-w-[16rem] break-words text-xs text-[#6B7280]">“{title}” will be permanently removed.</p>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <SecondaryButton onClick={() => setDeleteConfirm(null)} disabled={deletingId === resume._id} className="!py-2">
                              Cancel
                            </SecondaryButton>
                            <button
                              type="button"
                              onClick={() => handleDelete(resume._id)}
                              disabled={deletingId === resume._id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
                            >
                              {deletingId === resume._id && <Loader2 size={14} className="animate-spin" />}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <SecondaryButton onClick={() => setItemsToShow((n) => n + PAGE_SIZE)}>
                  Show more ({filteredAndSorted.length - displayed.length})
                </SecondaryButton>
              </div>
            )}
          </>
        )}
      </main>

      {previewing && (
        <PreviewModal
          resume={previewing}
          downloading={exportingId === previewing._id}
          onClose={() => setPreviewId(null)}
          onEdit={() => navigate(`/edit-resume/${previewing._id}`)}
          onDownload={() => handleDownload(previewing)}
        />
      )}

      {/* Off-screen, full-size copy used only while a PDF is being captured */}
      {exporting && (
        <div aria-hidden="true" className="pointer-events-none fixed top-0" style={{ left: -10000, width: PAGE_WIDTH }}>
          <RenderBoundary fallback={null}>
            <div ref={exportRef} className="bg-white" style={{ width: PAGE_WIDTH }}>
              <ResumeTemplate template={toRenderable(exporting).template} data={toRenderable(exporting).data} />
            </div>
          </RenderBoundary>
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
