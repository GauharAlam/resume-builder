import React, { useRef, useState } from "react";
import { useResume } from "@/hooks";
import { Download, FileText } from "lucide-react";
import { generateDocx } from "@/utils/docxExport";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { TemplateID } from "@/types";
import { trackEvent } from "@/services/analytics";

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

import ProfessionalITTemplate from "../../templates/ProfessionalITTemplate";
import ATSModernTemplate from "../../templates/ATSModernTemplate";
import StandardClassicTemplate from "../../templates/StandardClassicTemplate";
import TechMinimalistTemplate from "../../templates/TechMinimalistTemplate";

// --- Main Panel Wrapper ---

const PreviewPanel: React.FC = () => {
  const {
    resumeData,
    updateResumeData,
    template,
    setTemplate,
    activeResumeId,
  } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);
  const currentTemplateId = template;
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);

  const sanitizeFilename = (name: string): string =>
    (name || "Resume").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80) || "Resume";

  const markExported = (format: "pdf" | "docx") => {
    if (!activeResumeId) return;
    const storageKey = `resumeExported:${activeResumeId}`;
    localStorage.setItem(storageKey, "true");
    window.dispatchEvent(
      new CustomEvent("resume-exported", {
        detail: { resumeId: activeResumeId },
      }),
    );
    trackEvent("funnel_resume_exported", {
      format,
      resumeId: activeResumeId,
    });
  };

  const templates: { id: TemplateID; name: string }[] = [
    { id: "professional-it", name: "Professional IT" },
    { id: "ats-modern", name: "ATS Modern" },
    { id: "standard-classic", name: "Standard Classic" },
    { id: "tech-minimalist", name: "Tech Minimalist" },
  ];

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    if (!window.jspdf?.jsPDF || !window.html2canvas) {
      toastError("PDF library failed to load (ad-blocker or offline). Try DOCX instead.");
      return;
    }
    if (isExporting) return;
    setIsExporting("pdf");
    toastInfo("Generating PDF…");
    try {
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      // Full-width render, paginated vertically (no more single-page squash)
      const renderedWidth = pdfWidth;
      const renderedHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = renderedHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, renderedWidth, renderedHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, renderedWidth, renderedHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${sanitizeFilename(resumeData.personalDetails.fullName)}.pdf`);

      markExported("pdf");
      toastSuccess("PDF downloaded.");
    } catch (err) {
      console.error("PDF export failed:", err);
      toastError("PDF export failed. Try DOCX instead.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadDocx = async () => {
    if (isExporting) return;
    setIsExporting("docx");
    try {
      await generateDocx(resumeData);
      markExported("docx");
      toastSuccess("DOCX downloaded.");
    } catch (err) {
      console.error("DOCX export failed:", err);
      toastError("DOCX export failed. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  const renderTemplate = () => {
    const textScale = resumeData.customization?.textScale ?? 1;
    switch (currentTemplateId) {
      case "professional-it":
        return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
      case "ats-modern":
        return <ATSModernTemplate data={resumeData} scale={textScale} />;
      case "standard-classic":
        return <StandardClassicTemplate data={resumeData} scale={textScale} />;
      case "tech-minimalist":
        return <TechMinimalistTemplate data={resumeData} scale={textScale} />;
      default:
        return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
    }
  };

  return (
    <div
      className="flex-1 h-full min-h-0 overflow-y-auto flex flex-col relative w-full"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        background: "rgba(8,14,11,0.97)",
      }}
    >
      {/* Sticky Top Bar */}
      <div
        className="sticky top-0 z-20 px-3 sm:px-6 py-3 flex flex-wrap gap-2 justify-between items-center"
        style={{
          background: "rgba(10,17,14,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center rounded-xl p-1"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <button
              onClick={() => {
                const currentScale = resumeData.customization?.textScale ?? 1;
                if (currentScale > 0.5) {
                  updateResumeData({
                    customization: {
                      ...resumeData.customization,
                      textScale: currentScale - 0.05,
                    },
                  });
                }
              }}
              className="px-3 py-1.5 text-sm font-bold rounded-lg transition-all"
              style={{ color: "rgba(209,250,229,0.70)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                e.currentTarget.style.color = "#F0FDF4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(209,250,229,0.70)";
              }}
              title="Decrease Text Size"
            >
              A-
            </button>
            <span
              className="px-3 text-sm font-bold min-w-[3.5rem] text-center shrink-0"
              style={{ color: "rgba(209,250,229,0.65)" }}
            >
              {Math.round((resumeData.customization?.textScale ?? 1) * 100)}%
            </span>
            <button
              onClick={() => {
                const currentScale = resumeData.customization?.textScale ?? 1;
                if (currentScale < 1.5) {
                  updateResumeData({
                    customization: {
                      ...resumeData.customization,
                      textScale: currentScale + 0.05,
                    },
                  });
                }
              }}
              className="px-3 py-1.5 text-sm font-bold rounded-lg transition-all"
              style={{ color: "rgba(209,250,229,0.70)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                e.currentTarget.style.color = "#F0FDF4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(209,250,229,0.70)";
              }}
              title="Increase Text Size"
            >
              A+
            </button>
          </div>
          <div
            className="flex items-center rounded-xl p-0.5 ml-2 overflow-x-auto max-w-[300px] md:max-w-md"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              scrollbarWidth: "none",
            }}
          >
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap"
                style={
                  currentTemplateId === t.id
                    ? {
                        background: "rgba(74,222,128,0.18)",
                        color: "#4ade80",
                        border: "1px solid rgba(74,222,128,0.30)",
                      }
                    : {
                        color: "rgba(209,250,229,0.45)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (currentTemplateId !== t.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(209,250,229,0.80)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTemplateId !== t.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(209,250,229,0.45)";
                  }
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDownloadDocx}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.11)",
              color: "rgba(209,250,229,0.75)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            }}
          >
            <FileText size={15} className="text-emerald-600" /> {isExporting === "docx" ? "Saving…" : "DOCX"}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting !== null}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg disabled:opacity-50"
          >
            <Download size={15} /> {isExporting === "pdf" ? "Saving…" : "PDF"}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div
        className="p-3 sm:p-8 pb-32 flex-1 flex justify-center w-full min-h-max overflow-auto"
        style={{ background: "#1a2420" }}
      >
        <div
          ref={previewRef}
          className="w-full max-w-[794px] min-h-[1123px] shrink-0 bg-white self-start transition-all duration-300"
          style={{
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
