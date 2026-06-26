import apiRequest from "./api";
import { ResumeData, ATSAnalysisResult, JDMatchResult } from "@/types";

/**
 * Helper to strip HTML from strings (for context preparation)
 */
const stripHtml = (html: string | undefined): string => {
  if (!html) return "";
  let text = html;
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]*>?/gm, "");
  text = text.replace(/\n\s*\n/g, "\n");
  text = text.replace(/&nbsp;/g, " ");
  return text.trim();
};

export const improveText = async (
  text: string,
  section: string,
  jobTitle: string,
): Promise<string> => {
  if (!text) return "";
  try {
    const token = localStorage.getItem("authToken");
    const response = await apiRequest("/ai/improve-text", {
      method: "POST",
      body: JSON.stringify({ text, section, jobTitle }),
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

export const getChatbotResponse = async (
  message: string,
  resumeData: ResumeData,
): Promise<string> => {
  if (!message) return "Please ask a question.";

  try {
    const token = localStorage.getItem("authToken");
    const resumeContext = `
Here is the user's current resume data for context. Use this to provide personalized, specific advice.
---
**Name:** ${resumeData.personalDetails.fullName || "Not specified"}
**Target Job Title:** ${resumeData.personalDetails.jobTitle || "Not specified"}

**Summary:**
${stripHtml(resumeData.summary) || "No summary provided yet."}

**Experience:**
${
  resumeData.experience?.length > 0
    ? resumeData.experience
        .map(
          (e) => `
- **${e.jobTitle} at ${e.company}** (${e.startDate} - ${e.endDate})
  ${stripHtml(e.description)
    .split("\n")
    .map((line) => `  - ${line.trim()}`)
    .filter((line) => line.trim() !== "-")
    .join("\n")}
`,
        )
        .join("")
    : "No experience added yet."
}

**Projects:**
${
  (resumeData.projects || []).length > 0
    ? (resumeData.projects || [])
        .map(
          (p) => `
- **${p.name}**
  ${stripHtml(p.description)
    .split("\n")
    .map((line) => `  - ${line.trim()}`)
    .filter((line) => line.trim() !== "-")
    .join("\n")}
`,
        )
        .join("")
    : "No projects added yet."
}

**Education:**
${
  resumeData.education?.length > 0
    ? resumeData.education
        .map(
          (e) => `
- **${e.degree}** from ${e.institution} (${e.startDate} - ${e.endDate})
`,
        )
        .join("")
    : "No education added yet."
}

**Skills:**
${stripHtml(resumeData.skills) || "No skills added yet."}

**Accomplishments:**
${
  (resumeData.accomplishments || []).length > 0
    ? (resumeData.accomplishments || [])
        .map(
          (a) => `
- ${stripHtml(a.description)}
`,
        )
        .join("")
    : "No accomplishments added yet."
}
---
`;

    const systemInstruction = `You are an expert career advisor and AI assistant named "CareerBot," integrated into a resume builder application. Your advice MUST be highly personalized and directly reference the user's resume content provided in the context.

**Core Directives:**
1.  **Be Specific:** Do not give generic advice. ALWAYS connect your suggestions to the user's specific job title, summary, experience, skills, or projects.
2.  **Analyze and Advise:** Act as a critical but encouraging coach.
3.  **Generate Content on Request:** Help draft or rephrase specific bullet points.
4.  **Prepare for Interviews:** Use the resume context to formulate relevant questions.
5.  **Be Comprehensive:** Address all parts of the user's question.
6.  **Resume Improvement Focus:** Provide specific suggestions for summary, bullets, and skills.

**Tone:** Be encouraging, professional, and friendly. Use markdown formatting for readability.`;

    const response = await apiRequest("/ai/chatbot", {
      method: "POST",
      body: JSON.stringify({ message, resumeContext, systemInstruction }),
      token,
    });

    return response.success
      ? response.data
      : "I'm having trouble connecting right now.";
  } catch (error: any) {
    console.error("Error getting chatbot response:", error);
    return "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.";
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

