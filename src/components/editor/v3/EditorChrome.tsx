import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FileText,
  ChevronDown,
  Undo2,
  Redo2,
  Cloud,
  CloudOff,
  Loader2,
  Sparkles,
  Share2,
  Download,
  LayoutDashboard,
  LogOut,
  Wand2,
  Gauge,
  Crosshair,
  Mail,
  Linkedin,
  Pencil,
} from "lucide-react";
import { useResume } from "@/hooks";
import { useAuth } from "@/context";
import type { AnalyzeTab } from "./AnalyzeDrawer";
import type { ExportFormat } from "./Canvas";
import { IconButton, PrimaryButton, SecondaryButton, cx, useDismiss } from "./ui";

/* ── Top navigation ────────────────────────────────────────── */

const MenuItem: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ icon, onClick, danger, children }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={cx(
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
      danger ? "text-[#DC2626] hover:bg-[#FEECEC]" : "text-[#14161A] hover:bg-[#F0F1F4]",
    )}
  >
    {icon}
    {children}
  </button>
);

export const TopNav: React.FC<{
  onOpenAnalyze: (tab: AnalyzeTab) => void;
  onOpenGenerate: () => void;
  onOpenImport: () => void;
  onShowTemplates: () => void;
}> = ({ onOpenAnalyze, onOpenGenerate, onOpenImport, onShowTemplates }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useUser();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const toolsRef = useDismiss<HTMLDivElement>(toolsOpen, () => setToolsOpen(false));
  const userRef = useDismiss<HTMLDivElement>(userOpen, () => setUserOpen(false));

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  const runTool = (action: () => void) => {
    setToolsOpen(false);
    action();
  };

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-[#E9EAEE] bg-white px-4 sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ResumeAI home">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B5FD9]">
          <FileText className="h-4 w-4 text-white" strokeWidth={2.5} />
        </span>
        <span className="hidden text-xl font-semibold tracking-tight text-[#14161A] sm:block">ResumeAI</span>
      </Link>

      <nav className="flex items-center gap-1 text-[15px] sm:gap-2" aria-label="Main">
        <Link to="/" className="hidden rounded-lg px-3 py-2 text-[#6B7280] transition-colors hover:text-[#14161A] md:block">
          Home
        </Link>
        <Link to="/history" className="hidden rounded-lg px-3 py-2 text-[#6B7280] transition-colors hover:text-[#14161A] md:block">
          My Resumes
        </Link>
        <div ref={toolsRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={toolsOpen}
            onClick={() => setToolsOpen((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-[#14161A] transition-colors hover:bg-[#F6F7F9]"
          >
            AI Tools
            <ChevronDown size={15} className={cx("transition-transform", toolsOpen && "rotate-180")} />
          </button>
          {toolsOpen && (
            <div role="menu" className="absolute left-1/2 top-full z-50 mt-1.5 w-60 -translate-x-1/2 rounded-xl border border-[#E9EAEE] bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
              <MenuItem icon={<Wand2 size={16} />} onClick={() => runTool(onOpenGenerate)}>Generate resume with AI</MenuItem>
              <MenuItem icon={<Gauge size={16} />} onClick={() => runTool(() => onOpenAnalyze("ats"))}>ATS score</MenuItem>
              <MenuItem icon={<Crosshair size={16} />} onClick={() => runTool(() => onOpenAnalyze("jd"))}>Job description match</MenuItem>
              <MenuItem icon={<Mail size={16} />} onClick={() => runTool(() => onOpenAnalyze("cover"))}>Cover letter</MenuItem>
              <MenuItem icon={<Linkedin size={16} />} onClick={() => runTool(onOpenImport)}>Import from LinkedIn</MenuItem>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onShowTemplates}
          className="hidden rounded-lg px-3 py-2 text-[#6B7280] transition-colors hover:text-[#14161A] md:block"
        >
          Templates
        </button>
      </nav>

      <div ref={userRef} className="relative shrink-0">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={userOpen}
          onClick={() => setUserOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-[#E9EAEE] py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-[#F6F7F9]"
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF3FF] text-xs font-semibold text-[#2B5FD9]">{initial}</span>
          )}
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-[#14161A] lg:block">{displayName}</span>
          <ChevronDown size={15} className="text-[#6B7280]" />
        </button>
        {userOpen && (
          <div role="menu" className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-[#E9EAEE] bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
            <MenuItem icon={<LayoutDashboard size={16} />} onClick={() => navigate("/history")}>My resumes</MenuItem>
            <MenuItem
              icon={<LogOut size={16} />}
              danger
              onClick={async () => {
                setUserOpen(false);
                await logout();
                navigate("/login");
              }}
            >
              Sign out
            </MenuItem>
          </div>
        )}
      </div>
    </header>
  );
};

/* ── Document bar: history, save state, title, actions ─────── */

const formatSavedAgo = (savedAt: number, now: number) => {
  const seconds = Math.max(0, Math.round((now - savedAt) / 1000));
  if (seconds < 45) return "Saved just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  return `Saved ${Math.round(minutes / 60)}h ago`;
};

export const DocumentBar: React.FC<{
  exporting: ExportFormat | null;
  onExport: (format: ExportFormat) => void;
  onAnalyze: () => void;
  onShare: () => void;
}> = ({ exporting, onExport, onAnalyze, onShare }) => {
  const { undo, redo, canUndo, canRedo, saveStatus, manualSave, currentTitle, updateResumeTitle } = useResume();

  /* Save indicator */
  const [savedAt, setSavedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const prevStatus = useRef(saveStatus);
  useEffect(() => {
    if (saveStatus === "saved" && prevStatus.current !== "saved") setSavedAt(Date.now());
    prevStatus.current = saveStatus;
  }, [saveStatus]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(timer);
  }, []);

  /* Title */
  const [titleDraft, setTitleDraft] = useState(currentTitle);
  const [editingTitle, setEditingTitle] = useState(false);
  useEffect(() => {
    if (!editingTitle) setTitleDraft(currentTitle);
  }, [currentTitle, editingTitle]);
  const commitTitle = () => {
    setEditingTitle(false);
    const next = titleDraft.trim().slice(0, 200);
    if (!next) {
      setTitleDraft(currentTitle);
      return;
    }
    if (next !== currentTitle) updateResumeTitle(next);
  };

  /* Download menu */
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useDismiss<HTMLDivElement>(downloadOpen, () => setDownloadOpen(false));

  return (
    <div className="grid h-[64px] shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#E9EAEE] bg-white px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,auto)_1fr]">
      <div className="flex min-w-0 items-center gap-1">
        <IconButton label="Undo" disabled={!canUndo} onClick={undo}>
          <Undo2 size={18} />
        </IconButton>
        <IconButton label="Redo" disabled={!canRedo} onClick={redo}>
          <Redo2 size={18} />
        </IconButton>
        <span className="mx-2 hidden h-6 w-px bg-[#E3E5EA] sm:block" />
        <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex" aria-live="polite">
          {saveStatus === "error" ? (
            <button type="button" onClick={manualSave} className="flex items-center gap-2 text-[#DC2626] hover:underline">
              <CloudOff size={17} />
              <span className="truncate">Save failed · Retry</span>
            </button>
          ) : saveStatus === "saving" ? (
            <span className="flex items-center gap-2 italic text-[#6B7280]">
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </span>
          ) : (
            <span className="flex items-center gap-2 italic text-[#6B7280]">
              <Cloud size={17} />
              <span className="truncate">{formatSavedAgo(savedAt, now)}</span>
            </span>
          )}
        </div>
      </div>

      <div className="group flex min-w-0 items-center justify-center gap-1.5">
        <input
          aria-label="Resume title"
          value={titleDraft}
          maxLength={200}
          onFocus={() => setEditingTitle(true)}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTitleDraft(currentTitle);
              setEditingTitle(false);
              e.currentTarget.blur();
            }
          }}
          size={Math.min(40, Math.max(8, titleDraft.length))}
          className="min-w-0 max-w-full truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-center text-[17px] font-medium text-[#14161A] hover:border-[#E3E5EA] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
        />
        <Pencil size={13} className="hidden shrink-0 text-[#9AA0AB] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
      </div>

      <div className="flex items-center justify-end gap-2">
        <div ref={downloadRef} className="relative">
          <SecondaryButton
            aria-haspopup="menu"
            aria-expanded={downloadOpen}
            aria-label="Download"
            disabled={exporting !== null}
            onClick={() => setDownloadOpen((prev) => !prev)}
            className="!px-3"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden xl:inline">{exporting ? "Exporting…" : "Download"}</span>
          </SecondaryButton>
          {downloadOpen && (
            <div role="menu" className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-[#E9EAEE] bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
              {(["pdf", "docx"] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDownloadOpen(false);
                    onExport(format);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#14161A] hover:bg-[#F0F1F4]"
                >
                  <FileText size={16} />
                  {format === "pdf" ? "PDF document" : "Word (DOCX)"}
                </button>
              ))}
            </div>
          )}
        </div>
        <SecondaryButton onClick={onAnalyze} aria-label="Analyze" className="!px-3 sm:!px-4">
          <Sparkles size={16} className="text-[#2B5FD9]" />
          <span className="hidden sm:inline">Analyze</span>
        </SecondaryButton>
        <PrimaryButton onClick={onShare} aria-label="Share" className="!px-3 sm:!px-5">
          <Share2 size={16} />
          <span className="hidden sm:inline">Share</span>
        </PrimaryButton>
      </div>
    </div>
  );
};
