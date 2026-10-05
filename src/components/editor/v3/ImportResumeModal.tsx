import React, { useRef, useState } from "react";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { parseResumeText } from "@/services/aiService";
import { ACCEPTED_RESUME_TYPES, extractResumeText } from "@/utils/fileText";
import { useApplyImport } from "./importFlow";
import { Modal, Notice, PrimaryButton, SecondaryButton, cx } from "./ui";

/** Upload (or paste) an existing resume and have AI sort it into sections. */
const ImportResumeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { apply, hasContent } = useApplyImport();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [pasted, setPasted] = useState("");
  const [stage, setStage] = useState<null | "reading" | "organising">(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  if (!isOpen) return null;
  const busy = stage !== null;

  const organise = async (text: string) => {
    setStage("organising");
    apply(await parseResumeText(text), "replace");
    onClose();
  };

  const run = async (work: () => Promise<void>) => {
    setError(null);
    try {
      await work();
    } catch (err: any) {
      setError(err?.message || "We couldn't read that resume. Please try again.");
    } finally {
      setStage(null);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file || busy) return;
    setFileName(file.name);
    run(async () => {
      setStage("reading");
      await organise(await extractResumeText(file));
    });
  };

  const handlePaste = () => {
    if (pasted.trim().length < 80 || busy) return;
    run(() => organise(pasted));
  };

  return (
    <Modal
      title="Import your existing resume"
      subtitle="We'll read it and fill in each section for you."
      icon={<FileUp size={18} />}
      onClose={onClose}
      busy={busy}
      footer={
        mode === "paste" ? (
          <>
            <SecondaryButton onClick={onClose} disabled={busy}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handlePaste} disabled={busy || pasted.trim().length < 80}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? "Organising…" : "Import text"}
            </PrimaryButton>
          </>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F3F4F6] p-1" role="tablist" aria-label="Import method">
          {(["file", "paste"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              disabled={busy}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cx("rounded-lg py-2 text-sm font-medium transition-colors", mode === m ? "bg-white text-[#14161A] shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-[#6B7280]")}
            >
              {m === "file" ? "Upload a file" : "Paste text"}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <>
            <input ref={inputRef} type="file" accept={ACCEPTED_RESUME_TYPES} className="sr-only" tabIndex={-1} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={cx(
                "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors disabled:cursor-wait",
                dragging ? "border-[#2B5FD9] bg-[#F5F8FF]" : "border-[#CDD2DB] hover:border-[#2B5FD9] hover:bg-[#F5F8FF]",
              )}
            >
              {busy ? <Loader2 className="h-8 w-8 animate-spin text-[#2B5FD9]" /> : <UploadCloud className="h-8 w-8 text-[#2B5FD9]" />}
              <span className="text-[15px] font-medium text-[#14161A]">
                {stage === "reading" ? `Reading ${fileName}…` : stage === "organising" ? "Sorting it into sections…" : "Choose a file or drop it here"}
              </span>
              <span className="text-xs text-[#6B7280]">{busy ? "This usually takes 10–20 seconds." : "PDF, DOCX or TXT, up to 8 MB"}</span>
            </button>
          </>
        ) : (
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            disabled={busy}
            rows={10}
            aria-label="Resume text"
            placeholder="Paste the full text of your resume here…"
            className="w-full resize-y rounded-xl border border-[#E3E5EA] px-3 py-2.5 text-sm leading-relaxed text-[#14161A] placeholder:text-[#9AA0AB] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
          />
        )}

        {error && <Notice tone="error">{error}</Notice>}
        {hasContent && !busy && <Notice tone="warning">This replaces the content currently in this resume. You can undo it afterwards.</Notice>}
        <p className="text-xs leading-relaxed text-[#6B7280]">
          The file is read in your browser; only its text is sent to our AI service to be organised. Nothing is added or invented, but check each section after importing.
        </p>
      </div>
    </Modal>
  );
};

export default ImportResumeModal;
