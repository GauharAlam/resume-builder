import React, { useEffect, useMemo, useRef, useState } from "react";
import { useResume } from "@/hooks";
import SectionCard from "./SectionCard";
import InputField from "./InputField";
import { improveText, generateBullets } from "@/services/aiService";
import { Sparkles, Loader2, Undo2, Redo2, Download } from "lucide-react";
import { SaveStatusIndicator } from "@/components/common";
import {
  ResumeScore,
  CoverLetterGenerator,
  AIImproveModal,
  JDMatchPanel,
  AIGenerateResumeModal,
} from "@/components/editor";

const SECTION_COUNT = 7; // section-0 through section-6

const EditorPanel: React.FC = () => {
  const {
    resumeData,
    updateField,
    manualSave,
    addLink,
    updateLink,
    removeLink,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addAccomplishment,
    updateAccomplishment,
    removeAccomplishment,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    activeResumeId,
  } = useResume();

  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [showATS, setShowATS] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showJDMatch, setShowJDMatch] = useState(false);
  const [hasAtsRun, setHasAtsRun] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);

  // AI Modal State
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    oldText: string;
    newText: string;
    section: string;
    onAccept: (val: string) => void;
  }>({
    isOpen: false,
    oldText: "",
    newText: "",
    section: "",
    onAccept: () => {},
  });

  // Ref for the scrollable editor container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: listen to scroll events and dispatch "section-in-view"
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const offset = 150; // px below the container top to decide "active"
        let activeIdx = 0;

        for (let i = 0; i < SECTION_COUNT; i++) {
          const el = document.getElementById(`section-${i}`);
          if (el) {
            const elRect = el.getBoundingClientRect();
            // How far is this section's top from the container's top?
            const relativeTop = elRect.top - containerRect.top;
            if (relativeTop <= offset) {
              activeIdx = i;
            }
          }
        }

        window.dispatchEvent(
          new CustomEvent("section-in-view", { detail: activeIdx }),
        );

        ticking = false;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    // Fire once on mount to set the initial active section
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!activeResumeId) {
      setHasAtsRun(false);
      setHasExported(false);
      return;
    }

    setHasAtsRun(
      localStorage.getItem(`resumeAtsScanned:${activeResumeId}`) === "true",
    );
    setHasExported(
      localStorage.getItem(`resumeExported:${activeResumeId}`) === "true",
    );
  }, [activeResumeId]);

  useEffect(() => {
    const onAtsRun = (event: Event) => {
      const customEvent = event as CustomEvent<{ resumeId?: string }>;
      if (
        customEvent.detail?.resumeId &&
        customEvent.detail.resumeId === activeResumeId
      ) {
        setHasAtsRun(true);
      }
    };

    const onExport = (event: Event) => {
      const customEvent = event as CustomEvent<{ resumeId?: string }>;
      if (
        customEvent.detail?.resumeId &&
        customEvent.detail.resumeId === activeResumeId
      ) {
        setHasExported(true);
      }
    };

    window.addEventListener("resume-ats-analyzed", onAtsRun);
    window.addEventListener("resume-exported", onExport);
    return () => {
      window.removeEventListener("resume-ats-analyzed", onAtsRun);
      window.removeEventListener("resume-exported", onExport);
    };
  }, [activeResumeId]);

  const experienceBulletCount = useMemo(() => {
    return (resumeData.experience || []).reduce((count, exp) => {
      const lines = (exp.description || "")
        .split("\n")
        .map((line) => line.replace(/<[^>]*>/g, "").trim())
        .filter((line) => line.length > 0);
      return count + lines.length;
    }, 0);
  }, [resumeData.experience]);

  const basicsDone =
    !!resumeData.personalDetails.fullName?.trim() &&
    !!resumeData.personalDetails.jobTitle?.trim() &&
    !!resumeData.personalDetails.email?.trim();

  const checklistItems = useMemo(
    () => [
      {
        id: "basics",
        label: "Complete basic details",
        done: basicsDone,
      },
      {
        id: "experience",
        label: "Add at least 2 experience bullets",
        done: experienceBulletCount >= 2,
      },
      {
        id: "ats",
        label: "Run ATS analysis",
        done: hasAtsRun,
      },
      {
        id: "export",
        label: "Export as PDF/DOCX",
        done: hasExported,
      },
    ],
    [basicsDone, experienceBulletCount, hasAtsRun, hasExported],
  );

  const completionPercent = useMemo(() => {
    const completed = checklistItems.filter((item) => item.done).length;
    return Math.round((completed / checklistItems.length) * 100);
  }, [checklistItems]);

  const handleImproveAI = async (
    id: string,
    text: string,
    section: string,
    onUpdate: (val: string) => void,
  ) => {
    if (!text || !text.trim()) return;
    setImprovingId(id);
    try {
      const improved = await improveText(
        text,
        section,
        resumeData.personalDetails.jobTitle || "Professional",
      );
      if (improved) {
        setAiModal({
          isOpen: true,
          oldText: text,
          newText: improved,
          section,
          onAccept: (finalText: string) => {
            onUpdate(finalText);
            setAiModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      }
    } catch (error) {
      console.error("Failed to improve text", error);
    } finally {
      setImprovingId(null);
    }
  };

  const renderAIButton = (
    id: string,
    text: string,
    section: string,
    onUpdate: (val: string) => void,
  ) => {
    const isSpinning = improvingId === id;
    return (
      <button
        onClick={() => handleImproveAI(id, text, section, onUpdate)}
        disabled={isSpinning || !text}
        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1 px-2 rounded disabled:opacity-50 transition-colors border border-emerald-100"
        title="Improve with AI"
      >
        {isSpinning ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        {isSpinning ? "Improving..." : "Improve"}
      </button>
    );
  };

  const handleGenerateBulletsAI = async (
    id: string,
    jobTitle: string,
    company: string,
    section: string,
    context: string,
    onUpdate: (val: string) => void,
  ) => {
    setImprovingId(id);
    try {
      const generated = await generateBullets(
        jobTitle,
        company,
        section,
        context
      );
      if (generated) {
        setAiModal({
          isOpen: true,
          oldText: context,
          newText: generated,
          section: `${section} bullets`,
          onAccept: (finalText: string) => {
            onUpdate(finalText);
            setAiModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      }
    } catch (error) {
      console.error("Failed to generate bullets", error);
    } finally {
      setImprovingId(null);
    }
  };

  const renderAIActionButtons = (
    id: string,
    text: string,
    section: "experience" | "project",
    onUpdate: (val: string) => void,
    jobTitleVal?: string,
    companyVal?: string,
  ) => {
    const isImproving = improvingId === `${id}-improve`;
    const isGenerating = improvingId === `${id}-generate`;
    const isSpinning = isImproving || isGenerating;

    const currentJobTitle = jobTitleVal || resumeData.personalDetails.jobTitle || "Professional";

    return (
      <div className="flex items-center gap-1.5">
        {/* Improve Button */}
        <button
          onClick={() => {
            setImprovingId(`${id}-improve`);
            handleImproveAI(`${id}-improve`, text, `${section} description`, onUpdate);
          }}
          disabled={isSpinning || !text?.trim()}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1 px-2 rounded disabled:opacity-50 transition-colors border border-emerald-100"
          title="Improve current description with AI"
        >
          {isImproving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          {isImproving ? "Improving..." : "Improve"}
        </button>

        {/* Generate Bullets Button */}
        <button
          onClick={() => {
            setImprovingId(`${id}-generate`);
            handleGenerateBulletsAI(
              `${id}-generate`,
              currentJobTitle,
              companyVal || "",
              section,
              text || "",
              onUpdate
            );
          }}
          disabled={isSpinning}
          className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 py-1 px-2 rounded disabled:opacity-50 transition-colors border border-teal-100"
          title="Generate professional achievement bullet points with AI"
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          {isGenerating ? "Writing..." : "Write Bullets"}
        </button>
      </div>
    );
  };

  const handlePersonalDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateField("personalDetails", {
      ...resumeData.personalDetails,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="w-1/3 max-w-[500px] min-w-[400px] h-[100dvh] overflow-y-auto p-8 flex-shrink-0 border-r border-gray-200"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        background: "rgba(13,20,16,0.96)",
      }}
    >
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "#F0FDF4" }}
          >
            Edit Resume
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(209,250,229,0.50)" }}
          >
            Update to see changes in real-time.
          </p>
          <div className="mt-2">
            <SaveStatusIndicator status={saveStatus} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1 mr-2 border-r border-[rgba(255,255,255,0.08)] pr-3">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 text-[rgba(209,250,229,0.40)] hover:text-[#4ade80] hover:bg-[rgba(74,222,128,0.10)] rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 text-[rgba(209,250,229,0.40)] hover:text-[#4ade80] hover:bg-[rgba(74,222,128,0.10)] rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <button
            onClick={() => setIsAIGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)",
              border: "1px solid rgba(16,185,129,0.35)",
              color: "#4ade80",
            }}
            title="Auto-generate a full resume using AI"
          >
            <Sparkles size={14} /> AI Generate
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(209,250,229,0.70)",
            }}
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-linkedin-modal"))
            }
          >
            <Download size={15} /> Import
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={
              showATS
                ? {
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.35)",
                    color: "#4ade80",
                  }
                : {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(209,250,229,0.70)",
                  }
            }
            onClick={() => setShowATS((prev) => !prev)}
          >
            ATS Score
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={
              showCoverLetter
                ? {
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.35)",
                    color: "#4ade80",
                  }
                : {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(209,250,229,0.70)",
                  }
            }
            onClick={() => setShowCoverLetter((prev) => !prev)}
          >
            Cover Letter
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={
              showJDMatch
                ? {
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.35)",
                    color: "#4ade80",
                  }
                : {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(209,250,229,0.70)",
                  }
            }
            onClick={() => setShowJDMatch((prev) => !prev)}
          >
            JD Match
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={{
              background: "rgba(74,222,128,0.10)",
              border: "1px solid rgba(74,222,128,0.30)",
              color: "#4ade80",
            }}
          >
            Preview
          </button>
          <button
            onClick={manualSave}
            className="btn-primary px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap"
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-6 pb-24">
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-sm font-semibold" style={{ color: "#F0FDF4" }}>
              Resume Completeness
            </h2>
            <span className="text-sm font-bold text-[#4ade80]">
              {completionPercent}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    item.done
                      ? {
                          background: "rgba(74,222,128,0.18)",
                          color: "#4ade80",
                        }
                      : {
                          background: "rgba(255,255,255,0.07)",
                          color: "rgba(209,250,229,0.35)",
                        }
                  }
                >
                  {item.done ? "✓" : "•"}
                </span>
                <span
                  style={
                    item.done
                      ? { color: "#F0FDF4" }
                      : { color: "rgba(209,250,229,0.45)" }
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {showATS && <ResumeScore />}
        {showCoverLetter && <CoverLetterGenerator />}
        {showJDMatch && <JDMatchPanel />}

        <AIImproveModal
          isOpen={aiModal.isOpen}
          onClose={() => setAiModal((prev) => ({ ...prev, isOpen: false }))}
          oldText={aiModal.oldText}
          newText={aiModal.newText}
          section={aiModal.section}
          onAccept={aiModal.onAccept}
        />

        <AIGenerateResumeModal
          isOpen={isAIGenerateModalOpen}
          onClose={() => setIsAIGenerateModalOpen(false)}
        />

        {/* BASICS */}
        <div id="section-0">
          <SectionCard title="Basics" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="fullName"
                value={resumeData.personalDetails.fullName}
                onChange={handlePersonalDetailsChange}
                placeholder="e.g. John Doe"
                className="col-span-2"
              />
              <InputField
                label="Job Title"
                name="jobTitle"
                value={resumeData.personalDetails.jobTitle}
                onChange={handlePersonalDetailsChange}
                placeholder="e.g. Software Engineer"
                className="col-span-2"
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={resumeData.personalDetails.email}
                onChange={handlePersonalDetailsChange}
                placeholder="john@example.com"
                className="col-span-2"
              />
              <InputField
                label="Phone"
                name="phone"
                type="tel"
                value={resumeData.personalDetails.phone}
                onChange={handlePersonalDetailsChange}
                placeholder="+1 234 567 890"
                className="col-span-2"
              />
              <InputField
                label="Location"
                name="location"
                value={resumeData.personalDetails.location}
                onChange={handlePersonalDetailsChange}
                placeholder="San Francisco, CA"
                className="col-span-2"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.07)]">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "rgba(209,250,229,0.70)" }}
              >
                Links & Profiles
              </h3>
              {(resumeData.personalDetails.links || []).map((link) => (
                <div
                  key={link.id}
                  className="p-3 rounded-lg space-y-3 relative group mb-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <button
                    onClick={() => removeLink(link.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[rgba(239,68,68,0.10)]"
                    style={{ color: "#f87171" }}
                    title="Remove Link"
                  >
                    &times;
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Label"
                      value={link.name}
                      onChange={(e) =>
                        updateLink(link.id, { ...link, name: e.target.value })
                      }
                      placeholder="e.g. GitHub"
                    />
                    <InputField
                      label="URL"
                      value={link.url}
                      onChange={(e) =>
                        updateLink(link.id, { ...link, url: e.target.value })
                      }
                      placeholder="github.com/..."
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addLink}
                className="w-full py-2.5 text-sm font-medium border border-dashed rounded-lg hover:bg-[rgba(74,222,128,0.07)] transition-colors mt-2"
                style={{
                  color: "rgba(209,250,229,0.55)",
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              >
                + Add Link
              </button>
            </div>
          </SectionCard>
        </div>

        {/* SUMMARY */}
        <div id="section-1">
          <SectionCard title="Professional Summary" defaultOpen={false}>
            <InputField
              label="Summary"
              as="textarea"
              value={resumeData.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Experienced professional with a track record of..."
              actionButton={renderAIButton(
                "summary",
                resumeData.summary,
                "summary",
                (val) => updateField("summary", val),
              )}
            />
          </SectionCard>
        </div>

        {/* EXPERIENCE */}
        <div id="section-2">
          <SectionCard title="Experience" defaultOpen={false}>
            {resumeData.experience.map((exp, index) => (
              <div
                key={exp.id}
                className="p-4 rounded-lg space-y-4 relative group"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[rgba(239,68,68,0.10)]"
                  style={{ color: "#f87171" }}
                  title="Remove Experience"
                >
                  &times;
                </button>
                <InputField
                  label="Job Title"
                  value={exp.jobTitle}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      ...exp,
                      jobTitle: e.target.value,
                    })
                  }
                  placeholder="Senior Developer"
                />
                <InputField
                  label="Company"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      ...exp,
                      company: e.target.value,
                    })
                  }
                  placeholder="Tech Corp"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Start Date"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, {
                        ...exp,
                        startDate: e.target.value,
                      })
                    }
                    placeholder="Jan 2020"
                  />
                  <InputField
                    label="End Date"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(exp.id, {
                        ...exp,
                        endDate: e.target.value,
                      })
                    }
                    placeholder="Present"
                  />
                </div>
                <InputField
                  label="Description"
                  as="textarea"
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      ...exp,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your responsibilities and achievements..."
                  actionButton={renderAIActionButtons(
                    `exp-${exp.id}`,
                    exp.description,
                    "experience",
                    (val) =>
                      updateExperience(exp.id, { ...exp, description: val }),
                    exp.jobTitle,
                    exp.company
                  )}
                />
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full py-2.5 text-sm font-medium border border-dashed rounded-lg hover:bg-[rgba(74,222,128,0.07)] transition-colors mt-2"
              style={{
                color: "rgba(209,250,229,0.55)",
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              + Add Experience
            </button>
          </SectionCard>
        </div>

        {/* EDUCATION */}
        <div id="section-3">
          <SectionCard title="Education" defaultOpen={false}>
            {resumeData.education.map((edu, index) => (
              <div
                key={edu.id}
                className="p-4 rounded-lg space-y-4 relative group"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[rgba(239,68,68,0.10)]"
                  style={{ color: "#f87171" }}
                  title="Remove Education"
                >
                  &times;
                </button>
                <InputField
                  label="Degree / Major"
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(edu.id, { ...edu, degree: e.target.value })
                  }
                  placeholder="B.S. Computer Science"
                />
                <InputField
                  label="Institution"
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(edu.id, {
                      ...edu,
                      institution: e.target.value,
                    })
                  }
                  placeholder="University of Tech"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Start Date"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(edu.id, {
                        ...edu,
                        startDate: e.target.value,
                      })
                    }
                    placeholder="2015"
                  />
                  <InputField
                    label="End Date"
                    value={edu.endDate}
                    onChange={(e) =>
                      updateEducation(edu.id, {
                        ...edu,
                        endDate: e.target.value,
                      })
                    }
                    placeholder="2019"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full py-2.5 text-sm font-medium border border-dashed rounded-lg hover:bg-[rgba(74,222,128,0.07)] transition-colors mt-2"
              style={{
                color: "rgba(209,250,229,0.55)",
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              + Add Education
            </button>
          </SectionCard>
        </div>

        {/* SKILLS */}
        <div id="section-4">
          <SectionCard title="Skills" defaultOpen={false}>
            <InputField
              label="Skills list"
              as="textarea"
              value={resumeData.skills || ""}
              onChange={(e) => updateField("skills", e.target.value)}
              placeholder="React, TypeScript, Node.js..."
            />
          </SectionCard>
        </div>

        {/* PROJECTS */}
        <div id="section-5">
          <SectionCard title="Projects" defaultOpen={false}>
            {resumeData.projects.map((proj, index) => (
              <div
                key={proj.id}
                className="p-4 rounded-lg space-y-4 relative group"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() => removeProject(proj.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[rgba(239,68,68,0.10)]"
                  style={{ color: "#f87171" }}
                  title="Remove Project"
                >
                  &times;
                </button>
                <InputField
                  label="Project Name"
                  value={proj.name}
                  onChange={(e) =>
                    updateProject(proj.id, { ...proj, name: e.target.value })
                  }
                  placeholder="E-commerce App"
                />
                <InputField
                  label="URL / Link"
                  value={proj.url || ""}
                  onChange={(e) =>
                    updateProject(proj.id, { ...proj, url: e.target.value })
                  }
                  placeholder="github.com/my-project"
                />
                <InputField
                  label="Description"
                  as="textarea"
                  value={proj.description}
                  onChange={(e) =>
                    updateProject(proj.id, {
                      ...proj,
                      description: e.target.value,
                    })
                  }
                  placeholder="Built a full stack..."
                  actionButton={renderAIActionButtons(
                    `proj-${proj.id}`,
                    proj.description,
                    "project",
                    (val) =>
                      updateProject(proj.id, { ...proj, description: val }),
                    resumeData.personalDetails.jobTitle,
                    proj.name
                  )}
                />
              </div>
            ))}
            <button
              onClick={addProject}
              className="w-full py-2.5 text-sm font-medium border border-dashed rounded-lg hover:bg-[rgba(74,222,128,0.07)] transition-colors mt-2"
              style={{
                color: "rgba(209,250,229,0.55)",
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              + Add Project
            </button>
          </SectionCard>
        </div>

        {/* ACCOMPLISHMENTS */}
        <div id="section-6">
          <SectionCard title="Accomplishments / Awards" defaultOpen={false}>
            {resumeData.accomplishments?.map((acc, index) => (
              <div
                key={acc.id}
                className="p-4 rounded-lg space-y-4 relative group"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() => removeAccomplishment(acc.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[rgba(239,68,68,0.10)]"
                  style={{ color: "#f87171" }}
                  title="Remove Accomplishment"
                >
                  &times;
                </button>
                <InputField
                  label="Description"
                  as="textarea"
                  value={acc.description}
                  onChange={(e) =>
                    updateAccomplishment(acc.id, {
                      ...acc,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Received Employee of the Month award in 2023..."
                  actionButton={renderAIButton(
                    `acc-${acc.id}`,
                    acc.description,
                    "accomplishment",
                    (val) =>
                      updateAccomplishment(acc.id, {
                        ...acc,
                        description: val,
                      }),
                  )}
                />
              </div>
            ))}
            <button
              onClick={addAccomplishment}
              className="w-full py-2.5 text-sm font-medium border border-dashed rounded-lg hover:bg-[rgba(74,222,128,0.07)] transition-colors mt-2"
              style={{
                color: "rgba(209,250,229,0.55)",
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              + Add Accomplishment
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
