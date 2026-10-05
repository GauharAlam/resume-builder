import React, { useState, useEffect, useRef } from "react";
import { useResume } from "@/hooks";
import { useAuth } from "@/context";
import { useParams, useNavigate } from "react-router-dom";

import SidebarV2 from "@/components/editor/v2/Sidebar";
import EditorPanelV2 from "@/components/editor/v2/EditorPanel";
import PreviewPanelV2 from "@/components/editor/v2/PreviewPanel";
import LinkedInImportModal from "@/components/editor/LinkedInImportModal";
import ShareModal from "@/components/editor/ShareModal";
import ThemePanel from "@/components/editor/ThemePanel";
import AIChatPanel from "@/components/editor/AIChatPanel";
import { Palette } from "lucide-react";

const EditorContent: React.FC = () => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { loadResume, createNewResume, resumeData, isLoading, resumeHistory } =
    useResume();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  // Mobile: tabbed Edit | Preview (desktop shows both side-by-side)
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  // Guard against duplicate POST /resumes when effect re-fires (StrictMode / resumeHistory updates)
  const createAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    const handleOpenModal = () => setIsLinkedInModalOpen(true);
    const handleOpenTheme = () => setIsThemePanelOpen(true);
    const handleOpenShare = () => setIsShareModalOpen(true);
    const handleSwitchTab = (e: Event) => {
      const tab = (e as CustomEvent<"edit" | "preview">).detail;
      if (tab === "edit" || tab === "preview") setMobileTab(tab);
    };

    window.addEventListener("open-linkedin-modal", handleOpenModal);
    window.addEventListener("open-theme-panel", handleOpenTheme);
    window.addEventListener("open-share-modal", handleOpenShare);
    window.addEventListener("editor-switch-tab", handleSwitchTab);

    return () => {
      window.removeEventListener("open-linkedin-modal", handleOpenModal);
      window.removeEventListener("open-theme-panel", handleOpenTheme);
      window.removeEventListener("open-share-modal", handleOpenShare);
      window.removeEventListener("editor-switch-tab", handleSwitchTab);
    };
  }, []);

  useEffect(() => {
    // Wait for ResumeProvider to finish initial fetch (incl. Clerk token).
    // Previously: `if (resumeHistory.length === 0 && !id) return;` never set
    // isLoaded for first-time users -> infinite "Loading your workspace…".
    if (isLoading) return;
    if (isLoaded) return;

    const fetchResume = async () => {
      try {
        if (id) {
          await loadResume(id);
        } else {
          // Prevent duplicate creation on re-renders / history updates
          const attemptKey = `create-${resumeHistory.length}`;
          if (createAttemptedRef.current === attemptKey) return;
          createAttemptedRef.current = attemptKey;

          const newId = await createNewResume();
          if (newId) {
            navigate(`/edit-resume/${newId}`, { replace: true });
          }
        }
      } finally {
        // Always resolve loading state, even if load/create fails,
        // so user sees editor with error/save status instead of stuck spinner.
        setIsLoaded(true);
      }
    };

    fetchResume();
  }, [id, isLoading, isLoaded, resumeHistory.length, loadResume, createNewResume, navigate]);

  if (!isLoaded || isLoading || !resumeData) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: "#0D1512" }}
      >
        <div
          className="text-sm font-semibold"
          style={{ color: "rgba(209,250,229,0.55)" }}
        >
          Loading your workspace…
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] w-full flex flex-col overflow-hidden font-sans"
      style={{ background: "#0D1512", color: "#F0FDF4" }}
    >
      {/* Guest try banner */}
      {!isAuthenticated && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm shrink-0"
          style={{
            background: "rgba(74,222,128,0.10)",
            borderBottom: "1px solid rgba(74,222,128,0.25)",
            color: "#F0FDF4",
          }}
        >
          <span className="truncate">
            Trying as guest — work saves in this browser.
          </span>
          <button
            onClick={() => navigate("/register")}
            className="px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap"
            style={{ background: "#4ade80", color: "#052e16" }}
          >
            Sign up to save
          </button>
        </div>
      )}
      {/* Mobile tab bar: Edit | Preview (md+ shows both panes) */}
      <div
        className="md:hidden flex items-center gap-1 p-2 shrink-0"
        style={{
          background: "rgba(10,17,14,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors capitalize"
            style={
              mobileTab === tab
                ? {
                    background: "rgba(74,222,128,0.15)",
                    border: "1px solid rgba(74,222,128,0.35)",
                    color: "#4ade80",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "rgba(209,250,229,0.55)",
                  }
            }
          >
            {tab === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      {/* Main panes */}
      <div className="flex-1 min-h-0 w-full flex flex-col md:flex-row md:overflow-hidden">
      {/* PANE 1: Sidebar Nav (desktop only - mobile uses tab bar) */}
      <div className="hidden md:flex shrink-0">
        <SidebarV2 />
      </div>

      {/* PANE 2: Editor Form (mobile: only when Edit tab active) */}
      <div
        className={`${
          mobileTab === "edit" ? "flex" : "hidden"
        } md:flex flex-1 md:flex-none min-h-0 flex-col`}
      >
        <EditorPanelV2 />
      </div>

      {/* PANE 3: Live Preview (mobile: only when Preview tab active) */}
      <div
        className={`${
          mobileTab === "preview" ? "flex" : "hidden"
        } md:flex flex-1 min-h-0 flex-col`}
      >
        <PreviewPanelV2 />
      </div>
      </div>

      {/* AI Career Chatbot */}
      <AIChatPanel />

      {/* LinkedIn Import Modal */}
      <LinkedInImportModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Theme Sidebar Overlay */}
      {isThemePanelOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div
            className="absolute inset-0 transition-opacity"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            onClick={() => setIsThemePanelOpen(false)}
          />
          <div
            className="relative w-80 h-full flex flex-col"
            style={{
              background: "rgba(10,17,14,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "-24px 0 64px rgba(0,0,0,0.45)",
            }}
          >
            <div
              className="p-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2
                className="text-sm font-black uppercase tracking-widest flex items-center gap-2"
                style={{ color: "#F0FDF4" }}
              >
                <Palette size={16} style={{ color: "#4ade80" }} />
                Theme Settings
              </h2>
              <button
                onClick={() => setIsThemePanelOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "rgba(209,250,229,0.45)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#F0FDF4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(209,250,229,0.45)";
                }}
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <ThemePanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditorPage: React.FC = () => {
  return <EditorContent />;
};

export default EditorPage;
