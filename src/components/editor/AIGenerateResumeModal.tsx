import React, { useState } from "react";
import { Sparkles, Loader2, X, Wand2, ChevronDown } from "lucide-react";
import { generateFullResume } from "@/services/aiService";
import { useResume } from "@/hooks";

const EXPERIENCE_LEVELS = [
  { value: "entry-level", label: "Entry Level (0-2 years)" },
  { value: "mid-level", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "lead", label: "Lead / Principal (10+ years)" },
];

interface AIGenerateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIGenerateResumeModal: React.FC<AIGenerateResumeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid-level");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const { updateResumeData } = useResume();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      setError("Please enter a job title");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const data = await generateFullResume(jobTitle.trim(), experienceLevel);

      if (!data) {
        setError("Failed to generate resume. Please try again.");
        return;
      }

      // Map AI response to resume data format with unique IDs
      const updates: any = {};

      if (data.personalDetails) {
        updates.personalDetails = {
          ...data.personalDetails,
          links: [],
        };
      }

      if (data.summary) {
        updates.summary = data.summary;
      }

      if (data.skills) {
        updates.skills = data.skills;
      }

      if (data.experience && Array.isArray(data.experience)) {
        updates.experience = data.experience.map((exp: any) => ({
          id: crypto.randomUUID(),
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          description: exp.description || "",
        }));
      }

      if (data.education && Array.isArray(data.education)) {
        updates.education = data.education.map((edu: any) => ({
          id: crypto.randomUUID(),
          degree: edu.degree || "",
          institution: edu.institution || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
        }));
      }

      if (data.projects && Array.isArray(data.projects)) {
        updates.projects = data.projects.map((proj: any) => ({
          id: crypto.randomUUID(),
          name: proj.name || "",
          url: proj.url || "",
          description: proj.description || "",
        }));
      }

      if (data.accomplishments && Array.isArray(data.accomplishments)) {
        updates.accomplishments = data.accomplishments.map((acc: any) => ({
          id: crypto.randomUUID(),
          description: acc.description || "",
        }));
      }

      updateResumeData(updates);
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-[480px] rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,17,14,0.98)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(5,150,105,0.04) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(5,150,105,0.15) 100%)",
                border: "1px solid rgba(74,222,128,0.3)",
              }}
            >
              <Wand2 size={18} style={{ color: "#4ade80" }} />
            </div>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: "#F0FDF4" }}
              >
                AI Resume Generator
              </h2>
              <p
                className="text-xs"
                style={{ color: "rgba(209,250,229,0.5)" }}
              >
                Generate a complete resume in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "rgba(209,250,229,0.45)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Job Title */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "rgba(209,250,229,0.8)" }}
            >
              What role are you targeting?
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#F0FDF4",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(74,222,128,0.4)";
                e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.12)";
                e.target.style.boxShadow = "none";
              }}
              autoFocus
              disabled={isGenerating}
            />
          </div>

          {/* Experience Level */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "rgba(209,250,229,0.8)" }}
            >
              Experience Level
            </label>
            <div className="relative">
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#F0FDF4",
                }}
                disabled={isGenerating}
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option
                    key={level.value}
                    value={level.value}
                    style={{ background: "#0D1512", color: "#F0FDF4" }}
                  >
                    {level.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(209,250,229,0.4)" }}
              />
            </div>
          </div>

          {/* Warning */}
          <div
            className="rounded-xl px-4 py-3 text-xs leading-relaxed"
            style={{
              background: "rgba(250,204,21,0.06)",
              border: "1px solid rgba(250,204,21,0.15)",
              color: "rgba(250,204,21,0.7)",
            }}
          >
            ⚠️ This will <strong>replace all current content</strong> in your
            resume with AI-generated content. Make sure to save your current
            work first if needed.
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-xs"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              color: "rgba(209,250,229,0.6)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !jobTitle.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "#F0FDF4",
              border: "1px solid rgba(74,222,128,0.3)",
              boxShadow: "0 4px 16px rgba(74,222,128,0.2)",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Resume
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateResumeModal;
