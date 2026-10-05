import apiRequest from "./api";
import { ResumeData, ATSAnalysisResult, JDMatchResult } from "@/types";

export const improveText = async (
  text: string,
  section: string,
  jobTitle: string,
  instruction?: string,
): Promise<string> => {
  if (!text) return "";
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/improve-text", {
      method: "POST",
      body: JSON.stringify({ text, section, jobTitle, instruction }),
      token,
    });
    return response.success ? response.data : text;
  } catch (error) {
    console.error("Error improving text:", error);
    return text;
  }
};

export const suggestSkills = async (
  resumeData: ResumeData,
): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");
    const experience = resumeData.experience
      .map((e) => `- ${e.jobTitle} at ${e.company}:\n${e.description}`)
      .join("\n");
    const response = await apiRequest("/ai/suggest-skills", {
      method: "POST",
      body: JSON.stringify({
        jobTitle: resumeData.personalDetails.jobTitle,
        experience,
      }),
      token,
    });
    return response.success ? response.data : "";
  } catch (error) {
    console.error("Error suggesting skills:", error);
    return "";
  }
};

export const getGeneralResumeAnalysis = async (
  resumeData: ResumeData,
): Promise<{ score: number; feedback: string[] }> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/analyze-resume", {
      method: "POST",
      body: JSON.stringify({ resumeData }),
      token,
    });
    return response.success
      ? response.data
      : { score: 0, feedback: ["Could not analyze resume."] };
  } catch (error) {
    console.error("Error getting resume score:", error);
    return {
      score: 0,
      feedback: ["Could not analyze resume due to an error."],
    };
  }
};

export const getATSAnalysis = async (
  resumeData: ResumeData,
  jobDescription: string,
): Promise<ATSAnalysisResult> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/analyze-ats", {
      method: "POST",
      body: JSON.stringify({ resumeData, jobDescription }),
      token,
    });
    return response.success
      ? response.data
      : {
          matchScore: 0,
          missingKeywords: [],
          suggestions: ["Could not analyze resume."],
        };
  } catch (error) {
    console.error("Error getting ATS analysis:", error);
    return {
      matchScore: 0,
      missingKeywords: [],
      suggestions: [
        "Could not analyze resume against the job description due to an error.",
      ],
    };
  }
};

export const generateCoverLetter = async (
  resumeData: ResumeData,
  jobDescription: string,
): Promise<string> => {
  if (!jobDescription) return "";
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/generate-cover-letter", {
      method: "POST",
      body: JSON.stringify({ resumeData, jobDescription }),
      token,
    });
    return response.success ? response.data : "Error generating cover letter.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return "There was an error generating the cover letter. Please try again.";
  }
};

export const getJDMatch = async (
  resumeData: ResumeData,
  jobDescription: string,
): Promise<JDMatchResult> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/jd-match", {
      method: "POST",
      body: JSON.stringify({ resumeData, jobDescription }),
      token,
    });
    return response.success
      ? response.data
      : {
          matchScore: 0,
          verdict: "Could not analyze match.",
          missingSkills: [],
          suggestions: [],
        };
  } catch (error) {
    console.error("Error getting JD match:", error);
    return {
      matchScore: 0,
      verdict: "Could not analyze match due to an error.",
      missingSkills: [],
      suggestions: [],
    };
  }
};

export const generateFullResume = async (
  jobTitle: string,
  experienceLevel: string = "mid-level",
): Promise<any> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/generate-full-resume", {
      method: "POST",
      body: JSON.stringify({ jobTitle, experienceLevel }),
      token,
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error("Error generating full resume:", error);
    return null;
  }
};

export const generateBullets = async (
  jobTitle: string,
  company?: string,
  section?: string,
  context?: string,
): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/generate-bullets", {
      method: "POST",
      body: JSON.stringify({ jobTitle, company, section, context }),
      token,
    });
    return response.success ? response.data : "";
  } catch (error) {
    console.error("Error generating bullets:", error);
    return "";
  }
};

