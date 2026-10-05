import React, { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { generateFullResume } from "@/services/aiService";
import { useApplyImport } from "./v3/importFlow";
import { Field, Modal, Notice, PrimaryButton, SecondaryButton, SelectField } from "./v3/ui";

const EXPERIENCE_LEVELS = [
  { value: "entry-level", label: "Entry level (0–2 years)" },
  { value: "mid-level", label: "Mid level (3–5 years)" },
  { value: "senior", label: "Senior (6–10 years)" },
  { value: "lead", label: "Lead / Principal (10+ years)" },
];

interface AIGenerateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Drafts an example resume for a role. The result is sample content to rewrite, not the user's history. */
const AIGenerateResumeModal: React.FC<AIGenerateResumeModalProps> = ({ isOpen, onClose }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid-level");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const { apply, hasContent } = useApplyImport();

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!jobTitle.trim() || isGenerating) return;
    setError("");
    setIsGenerating(true);
    try {
      const data = await generateFullResume(jobTitle.trim(), experienceLevel);
      if (!data) {
        setError("The draft couldn't be generated. Please try again in a moment.");
        return;
      }
      // The generator invents a placeholder person; keep the user's own contact details
      apply({ ...data, personalDetails: { jobTitle: data.personalDetails?.jobTitle || jobTitle.trim() } }, "merge");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      title="Draft a resume with AI"
      subtitle="Get example content for your target role, then make it yours."
      icon={<Wand2 size={18} />}
      onClose={onClose}
      busy={isGenerating}
      widthClass="max-w-md"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={isGenerating}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={() => handleGenerate()} disabled={isGenerating || !jobTitle.trim()}>
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? "Drafting…" : "Generate draft"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={handleGenerate} className="space-y-4">
        <Field
          label="What role are you targeting?"
          value={jobTitle}
          autoFocus
          maxLength={200}
          disabled={isGenerating}
          placeholder="e.g. Senior Frontend Developer"
          onChange={(e) => {
            setJobTitle(e.target.value);
            setError("");
          }}
        />
        <SelectField label="Experience level" value={experienceLevel} disabled={isGenerating} onChange={(e) => setExperienceLevel(e.target.value)}>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </SelectField>
        <Notice tone="warning">
          The draft is <strong>example content</strong>: the employers, dates and numbers are invented. Replace them with your own before you send it anywhere.
          {hasContent && " It will replace the sections currently in this resume (you can undo)."}
        </Notice>
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Modal>
  );
};

export default AIGenerateResumeModal;
