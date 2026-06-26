import React, { useState, useEffect } from "react";
import { ResumeProvider, useResume } from "@/hooks";
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
  const { loadResume, createNewResume, resumeData, isLoading, resumeHistory } =
    useResume();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsLinkedInModalOpen(true);
    const handleOpenTheme = () => setIsThemePanelOpen(true);
    const handleOpenShare = () => setIsShareModalOpen(true);

    window.addEventListener("open-linkedin-modal", handleOpenModal);
    window.addEventListener("open-theme-panel", handleOpenTheme);
    window.addEventListener("open-share-modal", handleOpenShare);

    return () => {
      window.removeEventListener("open-linkedin-modal", handleOpenModal);
      window.removeEventListener("open-theme-panel", handleOpenTheme);
      window.removeEventListener("open-share-modal", handleOpenShare);
    };
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      if (resumeHistory.length === 0 && !id) return;

      if (id) {
        await loadResume(id);
      } else {
        const newId = await createNewResume();
        if (newId) {
          navigate(`/edit-resume/${newId}`, { replace: true });
        }
      }

      setIsLoaded(true);
    };

    fetchResume();
  }, [id, resumeHistory, loadResume, createNewResume, navigate]);

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
      className="h-screen w-full flex overflow-hidden font-sans"
      style={{ background: "#0D1512", color: "#F0FDF4" }}
    >
      {/* PANE 1: Sidebar Nav */}
      <SidebarV2 />

      {/* PANE 2: Editor Form */}
      <EditorPanelV2 />

      {/* PANE 3: Live Preview */}
      <PreviewPanelV2 />

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
  return (
    <ResumeProvider>
      <EditorContent />
    </ResumeProvider>
  );
};

export default EditorPage;
