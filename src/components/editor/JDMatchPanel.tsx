import React, { useState } from "react";
import { useResume } from "@/hooks";
import { getJDMatch } from "@/services/aiService";
import { AIIcon } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";
import { JDMatchResult } from "@/types";

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

/* Returns an inline color value — works on dark bg */
const getScoreColor = (s: number): string => {
  if (s >= 80) return "#4ade80";
  if (s >= 60) return "#fde047";
  return "#f87171";
};

const isResumeIncomplete = (
  resumeData: ReturnType<typeof useResume>["resumeData"],
): boolean => {
  const hasName = !!resumeData.personalDetails.fullName?.trim();
  const hasExperience = (resumeData.experience || []).some(
    (e) =>
      e.description && e.description.replace(/<[^>]*>/g, "").trim().length > 0,
  );
  const hasSkills = !!resumeData.skills?.replace(/<[^>]*>/g, "").trim();
  return !hasName || (!hasExperience && !hasSkills);
};

const JDMatchPanel: React.FC = () => {
  const { resumeData } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JDMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jdFocused, setJdFocused] = useState(false);

  const incomplete = isResumeIncomplete(resumeData);

  const handleCheck = async () => {
    if (!jobDescription.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getJDMatch(resumeData, jobDescription);
      if (data.matchScore === 0 && data.verdict.startsWith("Could not")) {
        setError("Couldn't check match right now — please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Couldn't check match right now — please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription("");
    setError(null);
  };

  return (
    <Section
      title="JD Match"
      tooltip="Paste a job description to get a detailed match score, missing skills, and actionable suggestions tailored to your resume."
    >
      {/* Incompleteness warning */}
      {incomplete && (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
          style={{
            background: "rgba(234,179,8,0.10)",
            border: "1px solid rgba(234,179,8,0.22)",
            color: "#fde047",
          }}
        >
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <span>
            Your resume looks incomplete — fill in more details for an accurate
            match.
          </span>
        </div>
      )}

      {/* Input form */}
      {!result && (
        <>
          <div className="mb-4">
            <label
              htmlFor="jd-match-textarea"
              className="block text-xs font-semibold tracking-wide uppercase mb-1.5"
              style={{ color: "rgba(209,250,229,0.55)" }}
            >
              Paste the job description here
            </label>
            <textarea
              id="jd-match-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={7}
              placeholder="Paste the full job description to see how well your resume matches..."
              disabled={isLoading}
              onFocus={() => setJdFocused(true)}
              onBlur={() => setJdFocused(false)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: jdFocused
                  ? "1px solid rgba(74,222,128,0.52)"
                  : "1px solid rgba(255,255,255,0.12)",
                boxShadow: jdFocused
                  ? "0 0 0 3px rgba(74,222,128,0.10)"
                  : "none",
                color: "#F0FDF4",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                outline: "none",
                resize: "none",
                width: "100%",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <LoadingSpinner />
              <p
                className="mt-2 text-sm"
                style={{ color: "rgba(209,250,229,0.65)" }}
              >
                Analyzing your match...
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "rgba(209,250,229,0.42)" }}
              >
                This may take a moment.
              </p>
            </div>
          ) : (
            <button
              onClick={handleCheck}
              disabled={!jobDescription.trim()}
              className="w-full flex items-center justify-center gap-2 btn-primary py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AIIcon />
              <span>Check Match</span>
            </button>
          )}
        </>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="mt-4">
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
          <button
            onClick={handleReset}
            className="mt-3 text-sm font-semibold underline"
            style={{ color: "#4ade80" }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-5">
          {/* Score + verdict */}
          <div className="text-center py-2">
            <p
              className="text-sm mb-1"
              style={{ color: "rgba(209,250,229,0.55)" }}
            >
              Match Score
            </p>
            <p
              className="text-7xl font-extrabold tabular-nums"
              style={{ color: getScoreColor(result.matchScore) }}
            >
              {result.matchScore}
            </p>
            <p
              className="mt-2 text-sm italic"
              style={{ color: "rgba(209,250,229,0.75)" }}
            >
              {result.verdict}
            </p>
          </div>

          {/* Missing skills */}
          <div>
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "#F0FDF4" }}
            >
              Missing Skills / Keywords
            </h3>
            {result.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      color: "#f87171",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p
                className="text-sm"
                style={{ color: "rgba(209,250,229,0.45)" }}
              >
                No major skills seem to be missing — great alignment!
              </p>
            )}
          </div>

          {/* Suggestions */}
          <div>
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "#F0FDF4" }}
            >
              Suggestions
            </h3>
            <ul
              className="list-disc pl-5 space-y-1.5 text-sm"
              style={{ color: "rgba(209,250,229,0.65)" }}
            >
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Run again */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.25)",
              color: "#4ade80",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,222,128,0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(74,222,128,0.08)";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Run Again / Try Another JD</span>
          </button>
        </div>
      )}
    </Section>
  );
};

export default JDMatchPanel;
