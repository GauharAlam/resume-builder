import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useResume } from "@/hooks";
import { improveText, generateBullets } from "@/services/aiService";
import { toastError } from "@/utils/toast";
import AIImproveModal from "@/components/editor/AIImproveModal";

interface ImproveRequest {
  /** Stable id so the triggering control can show its own spinner */
  id: string;
  text: string;
  section: string;
  instruction?: string;
  onAccept: (text: string) => void;
}

interface BulletsRequest {
  id: string;
  jobTitle: string;
  company?: string;
  section: "experience" | "project";
  context: string;
  onAccept: (text: string) => void;
}

interface EditorAIContextType {
  busyId: string | null;
  improve: (req: ImproveRequest) => Promise<void>;
  writeBullets: (req: BulletsRequest) => Promise<void>;
}

const EditorAIContext = createContext<EditorAIContextType | undefined>(undefined);

const closedModal = { isOpen: false, oldText: "", newText: "", section: "", onAccept: (_: string) => {} };

/**
 * Runs AI rewrites for any part of the editor and shows the result in the
 * accept/edit modal, so nothing is written to the resume without review.
 */
export const EditorAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resumeData } = useResume();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState(closedModal);
  const busyRef = useRef(false);
  const jobTitleRef = useRef("");
  jobTitleRef.current = resumeData.personalDetails.jobTitle || "Professional";

  const present = useCallback((oldText: string, newText: string, section: string, onAccept: (t: string) => void) => {
    setModal({
      isOpen: true,
      oldText,
      newText,
      section,
      onAccept: (finalText: string) => {
        onAccept(finalText);
        setModal(closedModal);
      },
    });
  }, []);

  const improve = useCallback(
    async ({ id, text, section, instruction, onAccept }: ImproveRequest) => {
      if (busyRef.current) return;
      if (!text || !text.trim()) {
        toastError("Add some text first, then ask AI to improve it.");
        return;
      }
      busyRef.current = true;
      setBusyId(id);
      try {
        const improved = await improveText(text, section, jobTitleRef.current, instruction);
        // The service falls back to the original text when the request fails
        if (!improved || improved.trim() === text.trim()) {
          toastError("AI couldn't produce a rewrite right now. Please try again in a moment.");
          return;
        }
        present(text, improved, section, onAccept);
      } catch (error) {
        console.error("Failed to improve text", error);
        toastError("AI request failed. Check your connection and try again.");
      } finally {
        busyRef.current = false;
        setBusyId(null);
      }
    },
    [present],
  );

  const writeBullets = useCallback(
    async ({ id, jobTitle, company, section, context, onAccept }: BulletsRequest) => {
      if (busyRef.current) return;
      const title = jobTitle?.trim() || jobTitleRef.current;
      busyRef.current = true;
      setBusyId(id);
      try {
        const generated = await generateBullets(title, company || "", section, (context || "").slice(0, 2000));
        if (!generated || !generated.trim()) {
          toastError("AI didn't return any bullets. Add a job title and try again.");
          return;
        }
        present(context, generated, `${section} bullets`, onAccept);
      } catch (error) {
        console.error("Failed to generate bullets", error);
        toastError("AI request failed. Check your connection and try again.");
      } finally {
        busyRef.current = false;
        setBusyId(null);
      }
    },
    [present],
  );

  const value = useMemo(() => ({ busyId, improve, writeBullets }), [busyId, improve, writeBullets]);

  return (
    <EditorAIContext.Provider value={value}>
      {children}
      <AIImproveModal
        isOpen={modal.isOpen}
        onClose={() => setModal(closedModal)}
        oldText={modal.oldText}
        newText={modal.newText}
        section={modal.section}
        onAccept={modal.onAccept}
      />
    </EditorAIContext.Provider>
  );
};

export const useEditorAI = () => {
  const context = useContext(EditorAIContext);
  if (!context) throw new Error("useEditorAI must be used within an EditorAIProvider");
  return context;
};
