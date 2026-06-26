import { useResume } from "@/hooks";
import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Eye,
  FileText,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ResumePreview from "./ResumePreview";

/* ─── Colour tokens (match design system) ───────────────────── */
const C = {
  base: "#0D1512",
  textPrimary: "#F0FDF4",
  textSecondary: "rgba(209,250,229,0.65)",
  textMuted: "rgba(209,250,229,0.42)",
  green: "#4ade80",
  greenMuted: "rgba(74,222,128,0.12)",
  greenBorder: "rgba(74,222,128,0.25)",
  mint: "#bbf7d0",
  divider: "rgba(255,255,255,0.07)",
  surfaceBorder: "rgba(255,255,255,0.09)",
} as const;

type SortOption = "recent" | "oldest" | "name-asc" | "name-desc";

const ResumeHistory: React.FC = () => {
  const navigate = useNavigate();
  const {
    resumeHistory,
    activeResumeId,
    loadResume,
    createNewResume,
    deleteResume,
    isLoading,
    updateResumeTitle,
    currentTitle,
  } = useResume();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState(currentTitle);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [itemsToShow, setItemsToShow] = useState(6);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [previewingResumeId, setPreviewingResumeId] = useState<string | null>(
    null,
  );
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  /* ── title editing ── */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditingTitleValue(e.target.value);

  const handleTitleSave = () => {
    updateResumeTitle(editingTitleValue || "Untitled Resume");
    setIsEditingTitle(false);
  };

  const handleTitleBlur = () => handleTitleSave();
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleTitleSave();
    else if (e.key === "Escape") {
      setEditingTitleValue(currentTitle);
      setIsEditingTitle(false);
    }
  };

  React.useEffect(() => {
    setEditingTitleValue(currentTitle);
  }, [currentTitle]);

  /* ── actions ── */
  const handleDeleteResume = async (resumeId: string) => {
    await deleteResume(resumeId);
    setDeleteConfirm(null);
  };

  const handleEditResume = (resumeId: string) => {
    loadResume(resumeId);
    navigate(`/edit-resume/${resumeId}`);
  };

  const handlePreviewResume = (resumeId: string) => {
    loadResume(resumeId);
    setPreviewingResumeId(resumeId);
  };

  const handleShareResume = async (resumeId: string, resumeTitle: string) => {
    try {
      const shareData = {
        title: resumeTitle || "My Resume",
        text: `Check out my resume: ${resumeTitle || "My Resume"}`,
        url: window.location.href,
      };
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(
          `${shareData.title} - ${shareData.url}`,
        );
        setShareToast(resumeId);
        setTimeout(() => setShareToast(null), 3000);
      }
    } catch (err) {
      console.error("Error sharing resume:", err);
    }
  };

  const handleCreateNewResume = async () => {
    const newResumeId = await createNewResume();
    navigate(`/edit-resume/${newResumeId}`);
  };

  const handleDownloadPdf = async (resumeId: string) => {
    setIsDownloadingPdf(resumeId);
    try {
      const resumeToDownload = resumeHistory.find((r) => r._id === resumeId);
      if (!resumeToDownload) return setIsDownloadingPdf(null);

      loadResume(resumeId);
      setTimeout(async () => {
        const el = document.getElementById("resume-preview");
        if (!el) return setIsDownloadingPdf(null);
        try {
          const { jsPDF } = window.jspdf;
          const canvas = await window.html2canvas(el, {
            scale: 2,
            useCORS: true,
          });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });
          const pdfW = pdf.internal.pageSize.getWidth();
          const pdfH = pdf.internal.pageSize.getHeight();
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = Math.min(pdfW / imgProps.width, pdfH / imgProps.height);
          const sW = imgProps.width * ratio;
          const sH = imgProps.height * ratio;
          pdf.addImage(imgData, "PNG", (pdfW - sW) / 2, 0, sW, sH);
          pdf.save(`${resumeToDownload.title || "resume"}.pdf`);
        } catch (err) {
          console.error("Error generating PDF:", err);
        } finally {
          setIsDownloadingPdf(null);
        }
      }, 500);
    } catch (err) {
      console.error("Error downloading resume:", err);
      setIsDownloadingPdf(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  /* ── filter + sort ── */
  const filteredAndSorted = useMemo(() => {
    let filtered = resumeHistory.filter(
      (r) =>
        (r.title || "Untitled Resume")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (r.resumeData?.personalDetails?.fullName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (r.resumeData?.personalDetails?.jobTitle || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case "name-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "name-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });
    return filtered;
  }, [resumeHistory, searchTerm, sortBy]);

  const displayedResumes = filteredAndSorted.slice(0, itemsToShow);
  const hasMore = displayedResumes.length < filteredAndSorted.length;

  /* ── sort label helper ── */
  const sortLabels: Record<SortOption, string> = {
    recent: "Most Recent",
    oldest: "Oldest",
    "name-asc": "Title (A–Z)",
    "name-desc": "Title (Z–A)",
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen relative font-sans"
      style={
        {
          background: C.base,
          color: C.textPrimary,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties
      }
    >
      {/* Ambient blobs — same as landing page, lighter */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute animate-blob"
          style={{
            top: "-20%",
            left: "-10%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background: "#16532d",
            opacity: 0.22,
            filter: "blur(110px)",
          }}
        />
        <div
          className="absolute animate-blob animation-delay-2000"
          style={{
            bottom: "-15%",
            right: "-12%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background: "#134e3e",
            opacity: 0.18,
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* ─── Page body ─── */}
      <div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-10"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
      >
        {/* ══ HEADER ══════════════════════════════════════════ */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* Title area */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-4 mb-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editingTitleValue}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="text-2xl sm:text-3xl font-bold rounded-xl px-4 py-2 focus:outline-none w-full max-w-sm"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(74,222,128,0.50)`,
                    color: C.textPrimary,
                    boxShadow: "0 0 0 3px rgba(74,222,128,0.10)",
                  }}
                />
              ) : (
                <div
                  className="flex items-center gap-4 cursor-pointer group w-full"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to rename"
                >
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: C.greenMuted,
                      border: `1px solid ${C.greenBorder}`,
                    }}
                  >
                    <FileText className="h-6 w-6" style={{ color: C.green }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1
                      className="text-2xl sm:text-3xl font-bold truncate tracking-tight transition-colors"
                      style={{ color: C.textPrimary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = C.green)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = C.textPrimary)
                      }
                    >
                      {currentTitle || "Dashboard"}
                    </h1>
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      Manage all your tailored resumes
                    </p>
                  </div>
                  <Pencil
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: C.green }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/")}
              className="btn-ghost flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>
            <button
              onClick={handleCreateNewResume}
              className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm"
            >
              <Plus className="h-4 w-4" />
              New Resume
            </button>
          </div>
        </div>

        {/* ══ SEARCH + SORT ════════════════════════════════════ */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: C.textMuted }}
            />
            <input
              type="text"
              placeholder="Find resume by title, job, or name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="btn-ghost flex items-center justify-between w-full sm:w-48 px-4 py-3 rounded-xl text-sm gap-2"
              onBlur={() => setTimeout(() => setShowSortMenu(false), 150)}
            >
              <Filter className="h-4 w-4" style={{ color: C.textMuted }} />
              <span className="flex-1 text-left">{sortLabels[sortBy]}</span>
              <ChevronDown
                className="h-4 w-4 transition-transform"
                style={{
                  color: C.textMuted,
                  transform: showSortMenu ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {showSortMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-full sm:w-48 rounded-xl overflow-hidden z-20 py-1"
                style={{
                  background: "rgba(13,21,18,0.95)",
                  border: `1px solid ${C.surfaceBorder}`,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
                }}
              >
                {(
                  [
                    { value: "recent", label: "Most Recent" },
                    { value: "oldest", label: "Oldest" },
                    { value: "name-asc", label: "Title (A–Z)" },
                    { value: "name-desc", label: "Title (Z–A)" },
                  ] as { value: SortOption; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      color: sortBy === opt.value ? C.green : C.textSecondary,
                      background:
                        sortBy === opt.value ? C.greenMuted : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (sortBy !== opt.value)
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (sortBy !== opt.value)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ GRID CONTENT ═════════════════════════════════════ */}
        {isLoading ? (
          <div className="text-center py-20" style={{ color: C.textMuted }}>
            Loading Dashboard…
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div
            className="text-center py-24 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.surfaceBorder}`,
            }}
          >
            <div
              className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <Search className="h-6 w-6" style={{ color: C.textMuted }} />
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: C.textPrimary }}
            >
              No resumes found
            </h3>
            <p className="text-sm" style={{ color: C.textMuted }}>
              Adjust your search or create a new resume to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {displayedResumes.map((resume, i) => {
                const isActive = resume._id === activeResumeId;
                const isDeleting = deleteConfirm === resume._id;

                return (
                  <div
                    key={resume._id}
                    className={`relative rounded-2xl p-5 transition-all ${
                      isActive ? "glass-card-active" : "glass-card"
                    }`}
                    style={{
                      /* Cascade entrance on first render */
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    {/* ── Card header ── */}
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="p-2 rounded-xl flex-shrink-0"
                          style={{
                            background: isActive
                              ? "rgba(74,222,128,0.18)"
                              : C.greenMuted,
                            border: `1px solid ${
                              isActive ? "rgba(74,222,128,0.35)" : C.greenBorder
                            }`,
                          }}
                        >
                          <FileText
                            className="h-4 w-4"
                            style={{ color: C.green }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="font-semibold truncate"
                            style={{ color: C.textPrimary }}
                          >
                            {resume.title || "Untitled"}
                          </h3>
                          {isActive && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: C.green }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Share toast */}
                      {shareToast === resume._id && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{
                            background: C.greenMuted,
                            color: C.green,
                          }}
                        >
                          Link copied!
                        </span>
                      )}
                    </div>

                    {/* ── Meta ── */}
                    <div className="space-y-1.5 mb-4">
                      {resume.resumeData?.personalDetails?.jobTitle && (
                        <div
                          className="flex items-center gap-2 text-sm"
                          style={{ color: C.textSecondary }}
                        >
                          <Briefcase
                            className="h-3.5 w-3.5 flex-shrink-0"
                            style={{ color: C.green }}
                          />
                          <span className="truncate">
                            {resume.resumeData.personalDetails.jobTitle}
                          </span>
                        </div>
                      )}
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: C.textMuted }}
                      >
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Edited {formatDate(resume.updatedAt)}</span>
                      </div>
                    </div>

                    {/* ── Action row ── */}
                    <div
                      className="flex items-center gap-2 pt-4"
                      style={{ borderTop: `1px solid ${C.divider}` }}
                    >
                      {/* Edit — primary */}
                      <button
                        onClick={() => handleEditResume(resume._id)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: C.greenMuted,
                          border: `1px solid ${C.greenBorder}`,
                          color: C.green,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(74,222,128,0.20)";
                          e.currentTarget.style.borderColor =
                            "rgba(74,222,128,0.42)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = C.greenMuted;
                          e.currentTarget.style.borderColor = C.greenBorder;
                        }}
                      >
                        Edit
                      </button>

                      {/* Icon buttons */}
                      {[
                        {
                          icon: Eye,
                          title: "Quick Preview",
                          onClick: () => handlePreviewResume(resume._id),
                          loading: false,
                        },
                        {
                          icon: Download,
                          title:
                            isDownloadingPdf === resume._id
                              ? "Exporting…"
                              : "Export PDF",
                          onClick: () => handleDownloadPdf(resume._id),
                          loading: isDownloadingPdf === resume._id,
                        },
                        {
                          icon: Trash2,
                          title: "Delete",
                          onClick: () => setDeleteConfirm(resume._id),
                          loading: false,
                          danger: true,
                        },
                      ].map(
                        ({ icon: Icon, title, onClick, loading, danger }) => (
                          <button
                            key={title}
                            onClick={onClick}
                            title={title}
                            disabled={loading}
                            className="px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                            style={{
                              background: danger
                                ? "rgba(239,68,68,0.08)"
                                : "rgba(255,255,255,0.06)",
                              border: `1px solid ${
                                danger
                                  ? "rgba(239,68,68,0.20)"
                                  : C.surfaceBorder
                              }`,
                              color: danger ? "#f87171" : C.textSecondary,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = danger
                                ? "rgba(239,68,68,0.16)"
                                : "rgba(255,255,255,0.11)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = danger
                                ? "rgba(239,68,68,0.08)"
                                : "rgba(255,255,255,0.06)";
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ),
                      )}
                    </div>

                    {/* ── Delete confirmation overlay ── */}
                    {isDeleting && (
                      <div
                        className="absolute inset-0 rounded-2xl flex items-center justify-center p-5 z-10 modal-enter"
                        style={{
                          background: "rgba(10,17,14,0.92)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(239,68,68,0.30)",
                        }}
                      >
                        <div className="text-center w-full">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                            style={{ background: "rgba(239,68,68,0.12)" }}
                          >
                            <Trash2
                              className="h-5 w-5"
                              style={{ color: "#f87171" }}
                            />
                          </div>
                          <p
                            className="font-bold mb-1"
                            style={{ color: C.textPrimary }}
                          >
                            Delete resume?
                          </p>
                          <p
                            className="text-xs mb-4"
                            style={{ color: C.textMuted }}
                          >
                            "{resume.title || "Untitled"}" will be permanently
                            removed.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: `1px solid ${C.surfaceBorder}`,
                                color: C.textSecondary,
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteResume(resume._id)}
                              className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                              style={{
                                background: "rgba(239,68,68,0.75)",
                                color: "#fff",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setItemsToShow((p) => p + 6)}
                  className="btn-ghost px-6 py-2.5 rounded-xl text-sm"
                >
                  Load More (
                  {filteredAndSorted.length - displayedResumes.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ PREVIEW MODAL ════════════════════════════════════ */}
      {previewingResumeId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl modal-enter"
            style={{
              background: "rgba(13,21,18,0.92)",
              border: `1px solid ${C.surfaceBorder}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.60)",
            }}
          >
            {/* Modal header */}
            <div
              className="flex justify-between items-center p-5 flex-shrink-0"
              style={{ borderBottom: `1px solid ${C.divider}` }}
            >
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: C.textPrimary }}
              >
                <Eye className="w-5 h-5" style={{ color: C.green }} />
                Live Document Preview
              </h2>
              <button
                onClick={() => setPreviewingResumeId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xl font-light transition-colors"
                style={{ color: C.textMuted }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                ×
              </button>
            </div>

            {/* Resume preview */}
            <div
              className="overflow-y-auto w-full p-8 flex justify-center flex-1"
              style={
                {
                  background: "#F7F9FC",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                } as React.CSSProperties
              }
            >
              <div
                className="bg-white shadow-lg overflow-hidden shrink-0"
                style={{ transform: "scale(1)", transformOrigin: "top center" }}
              >
                <ResumePreview />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
