import React, { useEffect } from "react";
import { X } from "lucide-react";
import { AtsScorePanel, CoverLetterPanel, JobMatchPanel } from "./analysis";
import { cx } from "./ui";

export type AnalyzeTab = "ats" | "jd" | "cover";

const TABS: { id: AnalyzeTab; label: string }[] = [
  { id: "ats", label: "ATS score" },
  { id: "jd", label: "Job match" },
  { id: "cover", label: "Cover letter" },
];

/**
 * Slide-over hosting the analysis tools. Panels stay mounted while the drawer
 * is closed so a finished analysis isn't lost when it is reopened.
 */
const AnalyzeDrawer: React.FC<{
  tab: AnalyzeTab | null;
  onTabChange: (tab: AnalyzeTab) => void;
  onClose: () => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}> = ({ tab, onTabChange, onClose, jobDescription, onJobDescriptionChange }) => {
  const open = tab !== null;
  const shared = { jobDescription, onJobDescriptionChange };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cx("fixed inset-0 z-[60] justify-end", open ? "flex" : "hidden")} aria-hidden={!open}>
      <div className="absolute inset-0 bg-[#0B1220]/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Analyze resume"
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white font-inter text-[#14161A] shadow-[-24px_0_64px_rgba(16,24,40,0.18)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E9EAEE] px-5 py-3.5">
          <div className="flex gap-1 rounded-xl bg-[#F3F4F6] p-1" role="tablist" aria-label="Analysis tools">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => onTabChange(t.id)}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-white text-[#14161A] shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-[#6B7280] hover:text-[#14161A]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F0F1F4] hover:text-[#14161A]">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className={cx(tab !== "ats" && "hidden")}>
            <AtsScorePanel {...shared} />
          </div>
          <div className={cx(tab !== "jd" && "hidden")}>
            <JobMatchPanel {...shared} />
          </div>
          <div className={cx(tab !== "cover" && "hidden")}>
            <CoverLetterPanel {...shared} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeDrawer;
