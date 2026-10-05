import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, FileQuestion, AlertTriangle } from "lucide-react";
import { useResume } from "@/hooks";
import { toastError } from "@/utils/toast";

import LinkedInImportModal from "@/components/editor/LinkedInImportModal";
import ShareModal from "@/components/editor/ShareModal";
import AIGenerateResumeModal from "@/components/editor/AIGenerateResumeModal";
import { EditorAIProvider } from "@/components/editor/v3/EditorAI";
import { TopNav, DocumentBar } from "@/components/editor/v3/EditorChrome";
import BuilderPanel, { BuilderSection, BuilderTab } from "@/components/editor/v3/BuilderPanel";
import Canvas, { CanvasHandle, ExportFormat } from "@/components/editor/v3/Canvas";
import InspectorPanel from "@/components/editor/v3/InspectorPanel";
import AnalyzeDrawer, { AnalyzeTab } from "@/components/editor/v3/AnalyzeDrawer";
import { PrimaryButton, SecondaryButton, cx } from "@/components/editor/v3/ui";

const PAGE_BG = "#F3F4F6";

type MobileTab = "build" | "preview" | "design";

/* ── The editor UI itself (assumes a resume is loaded) ─────── */

export const EditorWorkspace: React.FC = () => {
  const { activeResumeId, manualSave } = useResume();
  const canvasRef = useRef<CanvasHandle>(null);

  const [builderTab, setBuilderTab] = useState<BuilderTab>("builder");
  const [openSection, setOpenSection] = useState<BuilderSection | null>("summary");
  const [mobileTab, setMobileTab] = useState<MobileTab>("build");
  const [analyzeTab, setAnalyzeTab] = useState<AnalyzeTab | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // index.html paints the body dark for the rest of the app
  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = PAGE_BG;
    return () => {
      document.body.style.background = previous;
    };
  }, []);

  // Other parts of the app open these via window events
  useEffect(() => {
    const openImport = () => setIsImportOpen(true);
    const openShare = () => setIsShareOpen(true);
    window.addEventListener("open-linkedin-modal", openImport);
    window.addEventListener("open-share-modal", openShare);
    return () => {
      window.removeEventListener("open-linkedin-modal", openImport);
      window.removeEventListener("open-share-modal", openShare);
    };
  }, []);

  // Cmd/Ctrl+S saves instead of opening the browser's save dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        manualSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [manualSave]);

  const showSection = useCallback((section: BuilderSection) => {
    setBuilderTab("builder");
    setOpenSection(section);
    setMobileTab("build");
  }, []);

  const closeAnalyze = useCallback(() => setAnalyzeTab(null), []);

  const handleExport = async (format: ExportFormat) => {
    // The page must be on screen to be captured
    if (format === "pdf" && mobileTab !== "preview") {
      setMobileTab("preview");
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
    await canvasRef.current?.exportAs(format);
  };

  const handleShare = () => {
    if (!activeResumeId) {
      toastError("This resume hasn't been saved yet. Wait a moment and try again.");
      return;
    }
    setIsShareOpen(true);
  };

  const pane = (tab: MobileTab) => cx(mobileTab === tab ? "block" : "hidden", "min-h-0 lg:block");

  return (
    <EditorAIProvider>
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden font-inter text-[#14161A]" style={{ background: PAGE_BG }}>
        <TopNav
          onOpenAnalyze={setAnalyzeTab}
          onOpenGenerate={() => setIsGenerateOpen(true)}
          onOpenImport={() => setIsImportOpen(true)}
          onShowTemplates={() => {
            setBuilderTab("templates");
            setMobileTab("build");
          }}
        />
        <DocumentBar
          exporting={exporting}
          onExport={handleExport}
          onAnalyze={() => setAnalyzeTab("ats")}
          onShare={handleShare}
        />

        {/* Small screens show one pane at a time */}
        <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-[#E9EAEE] bg-white p-1.5 lg:hidden" role="tablist" aria-label="Editor panes">
          {(["build", "preview", "design"] as MobileTab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={mobileTab === tab}
              onClick={() => setMobileTab(tab)}
              className={cx(
                "rounded-lg py-2 text-sm font-medium capitalize transition-colors",
                mobileTab === tab ? "bg-[#EEF3FF] text-[#2B5FD9]" : "text-[#6B7280]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <main className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)_300px] xl:grid-cols-[400px_minmax(0,1fr)_340px]">
          <div className={cx(pane("build"), "p-3 sm:p-5 lg:pr-0")}>
            <BuilderPanel tab={builderTab} onTabChange={setBuilderTab} openSection={openSection} onOpenSection={setOpenSection} />
          </div>
          <div className={cx(pane("preview"), "pt-3 sm:pt-5")}>
            <Canvas
              ref={canvasRef}
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              onOpenSection={showSection}
              onExportingChange={setExporting}
            />
          </div>
          <div className={cx(pane("design"), "p-3 sm:p-5 lg:pl-0")}>
            <InspectorPanel onOpenSection={showSection} onOpenAnalyze={setAnalyzeTab} />
          </div>
        </main>

        <AnalyzeDrawer tab={analyzeTab} onTabChange={setAnalyzeTab} onClose={closeAnalyze} />
        <LinkedInImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
        <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        <AIGenerateResumeModal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} />
      </div>
    </EditorAIProvider>
  );
};

/* ── Full-page states shown instead of the editor ──────────── */

const StatusScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center font-inter text-[#14161A]" style={{ background: PAGE_BG }}>
    {children}
  </div>
);

/* ── Route component: decides which resume to open ─────────── */

const EditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadResume, createNewResume, isLoading, resumeHistory, activeResumeId } = useResume();
  const [phase, setPhase] = useState<"loading" | "ready" | "not-found" | "create-failed">("loading");
  const [attempt, setAttempt] = useState(0);
  // Which route target has been handled, so re-renders (and StrictMode's
  // double effect) never create a second resume
  const handledRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Wait for the resume list (and the auth token behind it)
    if (isLoading) return;
    const key = id ?? `new-${attempt}`;
    if (handledRef.current === key) return;
    handledRef.current = key;

    if (id) {
      if (!resumeHistory.some((r) => r._id === id)) {
        setPhase("not-found");
        return;
      }
      if (activeResumeId !== id) loadResume(id);
      setPhase("ready");
      return;
    }

    // No id in the URL: start a new resume and move to its own URL
    setPhase("loading");
    createNewResume().then((newId) => {
      if (!mountedRef.current) return;
      if (newId) {
        handledRef.current = newId;
        setPhase("ready");
        navigate(`/edit-resume/${newId}`, { replace: true });
      } else {
        setPhase("create-failed");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoading, attempt]);

  if (isLoading || phase === "loading") {
    return (
      <StatusScreen>
        <Loader2 className="h-6 w-6 animate-spin text-[#2B5FD9]" />
        <p className="text-sm text-[#6B7280]">Loading your workspace…</p>
      </StatusScreen>
    );
  }

  if (phase === "not-found") {
    return (
      <StatusScreen>
        <FileQuestion className="h-9 w-9 text-[#9AA0AB]" />
        <div>
          <h1 className="text-lg font-semibold">We couldn't find that resume</h1>
          <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
            It may have been deleted, or it belongs to a different account.
          </p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton onClick={() => navigate("/history")}>My resumes</SecondaryButton>
          <PrimaryButton onClick={() => navigate("/try")}>Create a new resume</PrimaryButton>
        </div>
      </StatusScreen>
    );
  }

  if (phase === "create-failed") {
    return (
      <StatusScreen>
        <AlertTriangle className="h-9 w-9 text-[#F59E0B]" />
        <div>
          <h1 className="text-lg font-semibold">We couldn't create your resume</h1>
          <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
            The server didn't respond. Check your connection and try again.
          </p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton onClick={() => navigate("/history")}>My resumes</SecondaryButton>
          <PrimaryButton
            onClick={() => {
              setPhase("loading");
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </PrimaryButton>
        </div>
      </StatusScreen>
    );
  }

  return <EditorWorkspace />;
};

export default EditorPage;
