import React, { useState, useEffect } from 'react';
import { ResumeProvider, useResume } from '@/hooks';
import { useParams, useNavigate } from 'react-router-dom';

import SidebarV2 from '@/components/editor/v2/Sidebar';
import EditorPanelV2 from '@/components/editor/v2/EditorPanel';
import PreviewPanelV2 from '@/components/editor/v2/PreviewPanel';
import LinkedInImportModal from '@/components/editor/LinkedInImportModal';
import { Chatbot } from '@/components/editor'; // Keep chatbot if needed

const EditorContent: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadResume, createNewResume, resumeData, isLoading, resumeHistory } = useResume();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsLinkedInModalOpen(true);
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('open-linkedin-modal', handleOpenModal);
    window.addEventListener('open-chatbot', handleOpenChat);
    return () => {
      window.removeEventListener('open-linkedin-modal', handleOpenModal);
      window.removeEventListener('open-chatbot', handleOpenChat);
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
