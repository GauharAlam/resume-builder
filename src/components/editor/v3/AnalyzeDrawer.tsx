import React, { useEffect } from "react";
import { X } from "lucide-react";
import { ResumeScore, JDMatchPanel, CoverLetterGenerator } from "@/components/editor";
import { cx } from "./ui";

export type AnalyzeTab = "ats" | "jd" | "cover";

const TABS: { id: AnalyzeTab; label: string }[] = [
  { id: "ats", label: "ATS Score" },
  { id: "jd", label: "JD Match" },
  { id: "cover", label: "Cover Letter" },
];

/**
 * Slide-over hosting the analysis tools. The tools keep their own dark
 * surface, so the drawer is dark too. Panels stay mounted while the drawer
 * is closed so a finished analysis isn't lost when it is reopened.
 */
const AnalyzeDrawer: React.FC<{
  tab: AnalyzeTab | null;
  onTabChange: (tab: AnalyzeTab) => void;
  onClose: () => void;
}> = ({ tab, onTabChange, onClose }) => {
  const open = tab !== null;

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
        className="relative flex h-full w-full max-w-[520px] flex-col"
        style={{ background: "#0D1512", color: "#F0FDF4", boxShadow: "-24px 0 64px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex gap-1 rounded-xl bg-white/[0.06] p-1" role="tablist" aria-label="Analysis tools">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => onTabChange(t.id)}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-white text-[#0D1512]" : "text-white/60 hover:text-white",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className={cx(tab !== "ats" && "hidden")}>
            <ResumeScore />
          </div>
          <div className={cx(tab !== "jd" && "hidden")}>
            <JDMatchPanel />
          </div>
          <div className={cx(tab !== "cover" && "hidden")}>
            <CoverLetterGenerator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeDrawer;
