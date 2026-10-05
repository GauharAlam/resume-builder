import React, { useState } from "react";
import { Linkedin, Loader2 } from "lucide-react";
import { importLinkedInProfile } from "@/services/aiService";
import { useApplyImport } from "./v3/importFlow";
import { Field, Modal, Notice, PrimaryButton, SecondaryButton } from "./v3/ui";

const PROFILE_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^\s/?#]+\/?(\?.*)?$/i;

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({ isOpen, onClose }) => {
  const { apply, hasContent } = useApplyImport();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // People often paste the link without the scheme
  const normalized = url.trim() && !/^https?:\/\//i.test(url.trim()) ? `https://${url.trim()}` : url.trim();
  const isValid = PROFILE_RE.test(normalized);

  const handleImport = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      apply(await importLinkedInProfile(normalized), "merge");
      onClose();
    } catch (err: any) {
      setError(err?.message || "We couldn't import that profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Import from LinkedIn"
      subtitle="Pull your experience and education from a public profile."
      icon={<Linkedin size={18} />}
      onClose={onClose}
      busy={isLoading}
      widthClass="max-w-md"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={isLoading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={() => handleImport()} disabled={isLoading || !isValid}>
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Importing…" : "Import profile"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={handleImport} className="space-y-4">
        <Field
          label="LinkedIn profile link"
          type="url"
          value={url}
          autoFocus
          disabled={isLoading}
          placeholder="https://www.linkedin.com/in/your-name"
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          error={url.trim() && !isValid ? "This should look like linkedin.com/in/your-name" : undefined}
          hint="The profile must be public."
        />
        {hasContent && <Notice tone="warning">Sections found on the profile will replace the matching sections here. You can undo it afterwards.</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Modal>
  );
};

export default LinkedInImportModal;
