import React, { useEffect, useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { Modal, PrimaryButton, SecondaryButton } from "./v3/ui";

interface AIImproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldText: string;
  newText: string;
  onAccept: (text: string) => void;
  section: string;
}

/** Side-by-side review of an AI suggestion. Nothing is applied until the user accepts it. */
const AIImproveModal: React.FC<AIImproveModalProps> = ({ isOpen, onClose, oldText, newText, onAccept, section }) => {
  const [draft, setDraft] = useState(newText);

  useEffect(() => setDraft(newText), [newText]);

  if (!isOpen) return null;

  return (
    <Modal
      title="Review the suggestion"
      subtitle={`For your ${section}. Edit it if you like, then apply.`}
      icon={<Sparkles size={18} />}
      onClose={onClose}
      widthClass="max-w-4xl"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Keep original</SecondaryButton>
          <PrimaryButton onClick={() => onAccept(draft)} disabled={!draft.trim()}>
            <Check size={16} />
            Apply
          </PrimaryButton>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6B7280]">Original</span>
          <div className="h-[260px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#E9EAEE] bg-[#F6F7F9] p-4 text-sm leading-relaxed text-[#5B6270]">
            {oldText || "Nothing here yet."}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="ai-suggestion" className="text-xs font-medium uppercase tracking-wide text-[#2B5FD9]">
              Suggestion (editable)
            </label>
            {draft !== newText && (
              <button type="button" onClick={() => setDraft(newText)} className="flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#14161A]">
                <RotateCcw size={11} />
                Reset
              </button>
            )}
          </div>
          <textarea
            id="ai-suggestion"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-[260px] w-full resize-none rounded-xl border border-[#C9D8FB] bg-white p-4 text-sm leading-relaxed text-[#14161A] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
          />
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#6B7280]">
        Check that every fact and number is true for you. AI can phrase things well but doesn't know your history.
      </p>
    </Modal>
  );
};

export default AIImproveModal;
