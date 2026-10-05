import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useResume } from "@/hooks";
import { generateCoverLetter, getATSAnalysis, getGeneralResumeAnalysis, getJDMatch } from "@/services/aiService";
import { ATSAnalysisResult, JDMatchResult } from "@/types";
import { toastError, toastSuccess } from "@/utils/toast";
import { Notice, PrimaryButton, SecondaryButton, TextAreaField, cx } from "./ui";

/* ── Shared pieces ─────────────────────────────────────────── */

const scoreColor = (score: number) => (score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#DC2626");

const ScoreDial: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const circumference = 2 * Math.PI * 15;
  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#F6F7F9] p-4">
      <div className="relative h-[84px] w-[84px] shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#E3E5EA" strokeWidth="3.2" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={scoreColor(value)} strokeWidth="3.2" strokeLinecap="round" strokeDasharray={`${(value / 100) * circumference} ${circumference}`} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">{value}</span>
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">Out of 100. An AI estimate to guide edits, not a guarantee of how any one employer's system will rate you.</div>
      </div>
    </div>
  );
};

const Chips: React.FC<{ items: string[]; empty: string }> = ({ items, empty }) =>
  items.length > 0 ? (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="rounded-md border border-dashed border-[#F1B66A] bg-[#FEF6E7] px-2 py-1 text-xs font-medium text-[#B45309]">
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-[#6B7280]">{empty}</p>
  );

const Suggestions: React.FC<{ items: string[] }> = ({ items }) =>
  items.length > 0 ? (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#3F4551]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  ) : null;

const SubHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="mb-2 mt-5 text-sm font-semibold">{children}</h3>;

const Working: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center gap-2 py-10 text-center">
    <Loader2 className="h-6 w-6 animate-spin text-[#2B5FD9]" />
    <p className="text-sm font-medium">{label}</p>
    <p className="text-xs text-[#6B7280]">This can take up to half a minute.</p>
  </div>
);

interface JobDescriptionProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

const JobDescriptionField: React.FC<JobDescriptionProps & { label: string; disabled?: boolean; rows?: number }> = ({
  jobDescription,
  onJobDescriptionChange,
  label,
  disabled,
  rows = 6,
}) => (
  <TextAreaField
    label={label}
    rows={rows}
    disabled={disabled}
    value={jobDescription}
    maxLength={15000}
    onChange={(e) => onJobDescriptionChange(e.target.value)}
    placeholder="Paste the full job description here…"
    hint="Shared between ATS score, job match and cover letter."
  />
);

/** Flags a result as out of date once the resume has been edited after it was produced. */
const useStaleness = (hasResult: boolean) => {
  const { resumeData } = useResume();
  const [stale, setStale] = useState(false);
  const analysed = useRef(resumeData);
  useEffect(() => {
    if (hasResult && analysed.current !== resumeData) setStale(true);
  }, [resumeData, hasResult]);
  return {
    stale,
    markFresh: () => {
      analysed.current = resumeData;
      setStale(false);
    },
  };
};

const hasEnoughContent = (resumeData: ReturnType<typeof useResume>["resumeData"]) =>
  Boolean(resumeData.personalDetails.fullName?.trim()) &&
  ((resumeData.experience || []).some((e) => e.description?.trim()) || Boolean(resumeData.skills?.trim()));

/* ── ATS score ─────────────────────────────────────────────── */

export const AtsScorePanel: React.FC<JobDescriptionProps> = ({ jobDescription, onJobDescriptionChange }) => {
  const { resumeData, activeResumeId } = useResume();
  const [general, setGeneral] = useState<{ score: number; feedback: string[] } | null>(null);
  const [ats, setAts] = useState<ATSAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasResult = general !== null || ats !== null;
  const { stale, markFresh } = useStaleness(hasResult);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (jobDescription.trim()) {
        const result = await getATSAnalysis(resumeData, jobDescription);
        // The service returns a zero score with an apology when the request failed
        if (result.matchScore === 0 && result.missingKeywords.length === 0) throw new Error("failed");
        setAts(result);
        setGeneral(null);
      } else {
        const result = await getGeneralResumeAnalysis(resumeData);
        if (result.score === 0) throw new Error("failed");
        setGeneral({ score: result.score, feedback: result.feedback || [] });
        setAts(null);
      }
      markFresh();
      if (activeResumeId) {
        try {
          localStorage.setItem(`resumeAtsScanned:${activeResumeId}`, "true");
        } catch {}
        window.dispatchEvent(new CustomEvent("resume-ats-analyzed", { detail: { resumeId: activeResumeId } }));
      }
    } catch {
      setError("The analysis couldn't be completed. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-[#6B7280]">
        Get a score and specific fixes. Add a job description to check keywords for that role, or leave it empty for a general review.
      </p>
      {!hasEnoughContent(resumeData) && <Notice tone="warning" className="mb-4">Add your name and some experience or skills first, otherwise there is little to analyse.</Notice>}
      <JobDescriptionField label="Job description (optional)" jobDescription={jobDescription} onJobDescriptionChange={onJobDescriptionChange} disabled={isLoading} rows={5} />

      {isLoading ? (
        <Working label="Analysing your resume…" />
      ) : (
        <PrimaryButton className="mt-4 w-full" onClick={handleAnalyze}>
          {hasResult ? <RefreshCw size={15} /> : <Sparkles size={15} />}
          {hasResult ? "Analyse again" : "Analyse my resume"}
        </PrimaryButton>
      )}

      {error && <Notice tone="error" className="mt-4">{error}</Notice>}

      {!isLoading && hasResult && (
        <div className="mt-6 border-t border-[#E9EAEE] pt-5">
          {stale && <Notice tone="info" className="mb-4">You've edited the resume since this analysis. Run it again for an up-to-date result.</Notice>}
          {ats && (
            <>
              <ScoreDial score={ats.matchScore} label="ATS match score" />
              <SubHeading>Missing keywords</SubHeading>
              <Chips items={ats.missingKeywords || []} empty="No important keywords seem to be missing." />
              {(ats.suggestions || []).length > 0 && <SubHeading>Suggestions</SubHeading>}
              <Suggestions items={ats.suggestions || []} />
            </>
          )}
          {general && (
            <>
              <ScoreDial score={general.score} label="Overall score" />
              {general.feedback.length > 0 && <SubHeading>What to improve</SubHeading>}
              <Suggestions items={general.feedback} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Job description match ─────────────────────────────────── */

export const JobMatchPanel: React.FC<JobDescriptionProps> = ({ jobDescription, onJobDescriptionChange }) => {
  const { resumeData } = useResume();
  const [result, setResult] = useState<JDMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { stale, markFresh } = useStaleness(result !== null);

  const handleCheck = async () => {
    if (!jobDescription.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getJDMatch(resumeData, jobDescription);
      if (data.matchScore === 0 && (data.verdict || "").startsWith("Could not")) throw new Error("failed");
      setResult(data);
      markFresh();
    } catch {
      setError("The match couldn't be checked. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-[#6B7280]">See how well this resume fits a specific posting, which skills are missing, and what to change.</p>
      {!hasEnoughContent(resumeData) && <Notice tone="warning" className="mb-4">Your resume looks incomplete. Fill in more details for an accurate match.</Notice>}
      <JobDescriptionField label="Job description" jobDescription={jobDescription} onJobDescriptionChange={onJobDescriptionChange} disabled={isLoading} />

      {isLoading ? (
        <Working label="Comparing your resume to the job…" />
      ) : (
        <PrimaryButton className="mt-4 w-full" onClick={handleCheck} disabled={!jobDescription.trim()}>
          {result ? <RefreshCw size={15} /> : <Sparkles size={15} />}
          {result ? "Check again" : "Check match"}
        </PrimaryButton>
      )}

      {error && <Notice tone="error" className="mt-4">{error}</Notice>}

      {!isLoading && result && (
        <div className="mt-6 border-t border-[#E9EAEE] pt-5">
          {stale && <Notice tone="info" className="mb-4">You've edited the resume since this check. Run it again for an up-to-date result.</Notice>}
          <ScoreDial score={result.matchScore} label="Match score" />
          {result.verdict && <p className="mt-3 text-sm italic leading-relaxed text-[#3F4551]">{result.verdict}</p>}
          <SubHeading>Missing skills and keywords</SubHeading>
          <Chips items={result.missingSkills || []} empty="No major skills seem to be missing." />
          {(result.suggestions || []).length > 0 && <SubHeading>Suggestions</SubHeading>}
          <Suggestions items={result.suggestions || []} />
        </div>
      )}
    </div>
  );
};

/* ── Cover letter ──────────────────────────────────────────── */

export const CoverLetterPanel: React.FC<JobDescriptionProps> = ({ jobDescription, onJobDescriptionChange }) => {
  const { resumeData } = useResume();
  const [letter, setLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCoverLetter(resumeData, jobDescription);
      // The service returns an apology sentence instead of throwing
      if (!result || /^(error generating|there was an error)/i.test(result)) throw new Error("failed");
      setLetter(result);
    } catch {
      setError("The cover letter couldn't be written. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      toastSuccess("Cover letter copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError("Copy failed. Select the text and copy it manually.");
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-[#6B7280]">Write a first draft of a cover letter from your resume and the job you're applying for.</p>
      <JobDescriptionField label="Job description" jobDescription={jobDescription} onJobDescriptionChange={onJobDescriptionChange} disabled={isLoading} />

      {isLoading ? (
        <Working label="Writing your cover letter…" />
      ) : (
        <PrimaryButton className="mt-4 w-full" onClick={handleGenerate} disabled={!jobDescription.trim()}>
          {letter ? <RefreshCw size={15} /> : <Sparkles size={15} />}
          {letter ? "Write another version" : "Write cover letter"}
        </PrimaryButton>
      )}

      {error && <Notice tone="error" className="mt-4">{error}</Notice>}

      {!isLoading && letter && (
        <div className="mt-6 border-t border-[#E9EAEE] pt-5">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="cover-letter" className="text-sm font-semibold">
              Your draft (editable)
            </label>
            <SecondaryButton onClick={handleCopy} className={cx("!px-3 !py-1.5 text-xs", copied && "text-[#16A34A]")}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </SecondaryButton>
          </div>
          <textarea
            id="cover-letter"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-xl border border-[#E3E5EA] px-3.5 py-3 text-sm leading-relaxed text-[#14161A] focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15"
          />
          <p className="mt-2 text-xs text-[#6B7280]">Read it through and adjust anything that doesn't sound like you before sending.</p>
        </div>
      )}
    </div>
  );
};
