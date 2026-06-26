import React, { useState } from "react";
import { useResume } from "@/hooks";
import { generateCoverLetter } from "@/services/aiService";
import { AIIcon, ClipboardIcon } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";

/* Shared dark-glass section wrapper */
const Section: React.FC<{
  title: string;
  tooltip?: string;
  children: React.ReactNode;
}> = ({ title, tooltip, children }) => (
  <div
    className="rounded-xl p-5 mb-6"
    style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.09)",
    }}
  >
    <div
      className="flex items-center gap-2 mb-4 pb-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <h2 className="text-lg font-bold" style={{ color: "#F0FDF4" }}>
        {title}
      </h2>
      {tooltip && (
        <div className="group relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 cursor-help"
            style={{ color: "rgba(209,250,229,0.35)" }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="absolute bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 -translate-x-1/2 left-1/2 border border-white/10">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

const CoverLetterGenerator: React.FC = () => {
  const { resumeData } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [jdFocused, setJdFocused] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedLetter("");
    const letter = await generateCoverLetter(resumeData, jobDescription);
    setGeneratedLetter(letter);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleClear = () => {
    setGeneratedLetter("");
    setJobDescription("");
  };

  return (
    <Section
      title="AI Cover Letter Generator"
      tooltip="Paste a job description here to generate a customized cover letter based on your resume. This is a great starting point for your application."
    >
      <div className="mb-4">
        <label
          htmlFor="job-description"
          className="block text-xs font-semibold tracking-wide uppercase mb-1.5"
          style={{ color: "rgba(209,250,229,0.55)" }}
        >
          Paste Job Description Here
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="Paste the full job description to generate a tailored cover letter..."
          onFocus={() => setJdFocused(true)}
          onBlur={() => setJdFocused(false)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: jdFocused
              ? "1px solid rgba(74,222,128,0.52)"
              : "1px solid rgba(255,255,255,0.12)",
            boxShadow: jdFocused ? "0 0 0 3px rgba(74,222,128,0.10)" : "none",
            color: "#F0FDF4",
            borderRadius: "0.5rem",
            padding: "0.5rem 0.75rem",
            outline: "none",
            resize: "vertical",
            width: "100%",
            fontSize: "0.875rem",
          }}
        />
      </div>
      <button
        onClick={handleGenerate}
        disabled={isLoading || !jobDescription}
        className="w-full flex items-center justify-center gap-2 btn-primary py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <LoadingSpinner /> : <AIIcon />}
        <span>{isLoading ? "Generating..." : "Generate Cover Letter"}</span>
      </button>

      {generatedLetter && (
        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold" style={{ color: "#F0FDF4" }}>
              Generated Cover Letter
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: "#4ade80" }}
              >
                <ClipboardIcon />
                <span>{copySuccess ? "Copied!" : "Copy Text"}</span>
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: "#f87171" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Clear</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={generatedLetter}
            rows={15}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(209,250,229,0.80)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              width: "100%",
              fontSize: "0.8125rem",
              lineHeight: "1.6",
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>
      )}
    </Section>
  );
};

export default CoverLetterGenerator;
