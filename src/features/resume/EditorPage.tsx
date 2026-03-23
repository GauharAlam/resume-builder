import React, { useState, useEffect } from 'react';
import { ResumeProvider, useResume } from '@/hooks';
import { useParams, useNavigate } from 'react-router-dom';

import SidebarV2 from '@/components/editor/v2/Sidebar';
import EditorPanelV2 from '@/components/editor/v2/EditorPanel';
import PreviewPanelV2 from '@/components/editor/v2/PreviewPanel';
import LinkedInImportModal from '@/components/editor/LinkedInImportModal';
import ShareModal from '@/components/editor/ShareModal';
import ThemePanel from '@/components/editor/ThemePanel';
import { Palette } from 'lucide-react';
import { Chatbot } from '@/components/editor'; // Keep chatbot if needed

const EditorContent: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadResume, createNewResume, resumeData, isLoading, resumeHistory } = useResume();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsLinkedInModalOpen(true);
    const handleOpenChat = () => setIsChatOpen(true);
    const handleOpenTheme = () => setIsThemePanelOpen(true);
    const handleOpenShare = () => setIsShareModalOpen(true);

    window.addEventListener('open-linkedin-modal', handleOpenModal);
    window.addEventListener('open-chatbot', handleOpenChat);
    window.addEventListener('open-theme-panel', handleOpenTheme);
    window.addEventListener('open-share-modal', handleOpenShare);

    return () => {
      window.removeEventListener('open-linkedin-modal', handleOpenModal);
      window.removeEventListener('open-chatbot', handleOpenChat);
      window.removeEventListener('open-theme-panel', handleOpenTheme);
      window.removeEventListener('open-share-modal', handleOpenShare);
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
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-lg font-semibold text-gray-700">
          Loading your workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white font-sans text-gray-900">
      {/* PANE 1: Sidebar Nav */}
      <SidebarV2 />
      
      {/* PANE 2: Editor Form */}
      <EditorPanelV2 />
      
      {/* PANE 3: Live Preview */}
      <PreviewPanelV2 />

      {/* Optional Chatbot */}
      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}

      {/* LinkedIn Import Modal */}
      <LinkedInImportModal isOpen={isLinkedInModalOpen} onClose={() => setIsLinkedInModalOpen(false)} />

      {/* Share Modal */}
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />

      {/* Theme Sidebar Overlay */}
      {isThemePanelOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsThemePanelOpen(false)}
          />
          <div className="relative w-80 h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                <Palette size={16} className="text-emerald-600" />
                Theme Settings
              </h2>
              <button 
                onClick={() => setIsThemePanelOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
