// FIX: Implement Gemini API service for AI-powered resume features.
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, ATSAnalysisResult } from "@/types";

// FIX: Initialize GoogleGenAI with apiKey from environment variables.
// For Vite, environment variables must be prefixed with VITE_ and accessed via import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("Gemini API Key status:", apiKey ? "Key is present" : "Key is MISSING");

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey });

const model = 'gemini-2.0-flash';

export const improveText = async (text: string, section: string, jobTitle: string): Promise<string> => {
    if (!text) return '';
    try {
        // Context-specific instructions to guide the AI
        let contextSpecificInstruction = '';
        switch (section) {
            case 'job description':
            case 'project description':
                contextSpecificInstruction = "Focus on turning responsibilities into achievements. Each point should be a concise bullet, starting with a strong action verb (e.g., 'Engineered', 'Accelerated', 'Managed').";
                break;
            case 'summary':
                contextSpecificInstruction = "Craft a powerful professional summary (2-4 sentences). It should highlight key skills, years of experience, and major career achievements relevant to the target job title.";
                break;
            case 'accomplishment':
                contextSpecificInstruction = "Rewrite this as a single, high-impact statement. Make it concise, quantifiable (if possible based on original text), and result-oriented.";
                break;
            default:
                contextSpecificInstruction = "Make the text more impactful, professional, and achievement-oriented.";
                break;
        }

        const prompt = `As an expert resume writer, rewrite the following text for a resume's "${section}" section, targeting a "${jobTitle}" position.
${contextSpecificInstruction}

**Original Text:**
"${text}"

**Instructions & Formatting Rules:**
1.  Your entire response MUST be valid, clean HTML. Do not use any markdown characters like '*' or '#'.
2.  Provide 2-3 distinct, rewritten options for the user to choose from.
3.  Format each option clearly, for example:
    <p><strong>Option 1:</strong></p>
    <ul><li>Engineered a new feature that increased user engagement by 15%.</li><li>Optimized database queries, reducing server response time by 30%.</li></ul>
    <br>
    <p><strong>Option 2:</strong></p>
    <p>Spearheaded the development of a key feature, boosting user engagement by 15%. Led efforts to optimize database performance, which cut server response times by 30%.</p>
4.  Do NOT invent or add placeholder numbers or metrics like "[X%]", "[Number]", or "[Metric]".
5.  Retain the core meaning and achievements from the original text.
6.  Do not include any text or explanation outside of the HTML structure.
`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert career coach and resume writer. Your goal is to help users create outstanding resumes. You will respond with professionally worded resume content formatted as clean HTML, without any markdown."
            }
        });

        // The response should be clean HTML, ready for the editor.
        return response.text.trim();
    } catch (error) {
        console.error("Error improving text:", error);
        return text; // Return original text on error
    }
};

export const suggestSkills = async (resumeData: ResumeData): Promise<string> => {
    try {
        const prompt = `Based on the job title "${resumeData.personalDetails.jobTitle}" and the experience described below, suggest a comma-separated list of 10-15 relevant hard and soft skills for this resume. Only return the list, no other text.\n\nExperience:\n${resumeData.experience.map(e => `- ${e.jobTitle} at ${e.company}:\n${e.description}`).join('\n')}`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are an AI assistant that suggests relevant skills for resumes based on job experience."
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error suggesting skills:", error);
        return '';
    }
};

export const getGeneralResumeAnalysis = async (resumeData: ResumeData): Promise<{ score: number; feedback: string[]; }> => {
    try {
        const resumeString = `
            Job Title: ${resumeData.personalDetails.jobTitle}
            About Me: ${resumeData.summary}
            Experience: ${resumeData.experience.map(exp => `${exp.jobTitle} at ${exp.company}\n${exp.description}`).join('\n\n')}
            Education: ${resumeData.education.map(edu => `${edu.degree} at ${edu.institution}`).join(', ')}
            Skills: ${resumeData.skills}
        `;

        const prompt = `Analyze the following resume for a "${resumeData.personalDetails.jobTitle}" position. Provide a score out of 100 and a list of 3-5 specific, actionable feedback points for improvement.

        **CRITICAL INSTRUCTIONS:**
        1. **Check Summary Length:** If the summary is over 100 words, strictly suggest finding a way to shorten it to 50-100 words for impact.
        2. **Check Bullet Points:** If any experience entry has more than 5 bullet points or they are very long, suggest condensing them.
        3. **Check Skills:** If the skills list is too long (over 15 items) or generic, suggest prioritizing key technical skills.
        4. **General Quality:** Also check for clarity, impact, and relevance to the job title.

        Format the feedback as specific, actionable advice (e.g., "Your summary is too long (X words). Try 50-100 words.").`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash', // Using a more powerful model for analysis
            contents: [
                {
                    parts: [{ text: prompt }, { text: resumeString }]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: {
                            type: Type.INTEGER,
                            description: "A score from 0 to 100 for the resume's quality."
                        },
                        feedback: {
                            type: Type.ARRAY,
                            description: "A list of actionable feedback points for improvement.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    }
                }
            }
        });

        // FIX: The response text is a JSON string, parse it.
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error getting resume score:", error);
        return { score: 0, feedback: ['Could not analyze resume due to an error.'] };
    }
};

export const getATSAnalysis = async (resumeData: ResumeData, jobDescription: string): Promise<ATSAnalysisResult> => {
    try {
        const resumeString = `
            Job Title: ${resumeData.personalDetails.jobTitle}
            Summary: ${stripHtml(resumeData.summary)}
            Experience: ${resumeData.experience.map(exp => `${exp.jobTitle} at ${exp.company}\n${stripHtml(exp.description)}`).join('\n\n')}
            Skills: ${stripHtml(resumeData.skills)}
        `;

        const prompt = `You are an expert ATS resume analyzer. Compare the provided resume against the job description. 
        1. Calculate a match score from 0-100 based on how well the resume is tailored to the job description.
        2. Identify the top 5-10 most important keywords and skills from the job description that are MISSING from the resume.
        3. Provide 3-5 specific, actionable suggestions on how and where to integrate these keywords into the resume. Reference specific parts of the resume (e.g., 'In your summary...' or 'Under your role as ${resumeData.experience[0]?.jobTitle}...').
        
        **Resume:**
        ${resumeString}

        **Job Description:**
        ${jobDescription}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchScore: {
                            type: Type.INTEGER,
                            description: "A score from 0 to 100 for how well the resume matches the job description."
                        },
                        missingKeywords: {
                            type: Type.ARRAY,
                            description: "A list of important keywords from the job description missing in the resume.",
                            items: { type: Type.STRING }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            description: "A list of actionable suggestions for improving the resume.",
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error getting ATS analysis:", error);
        return { matchScore: 0, missingKeywords: [], suggestions: ['Could not analyze resume against the job description due to an error.'] };
    }
}


export const generateCoverLetter = async (resumeData: ResumeData, jobDescription: string): Promise<string> => {
    if (!jobDescription) return '';
    try {
        const resumeString = `
            Full Name: ${resumeData.personalDetails.fullName}
            Job Title: ${resumeData.personalDetails.jobTitle}
            About Me: ${resumeData.summary}
            Experience: ${resumeData.experience.map(exp => `- ${exp.jobTitle} at ${exp.company}:\n${exp.description}`).join('\n')}
            Skills: ${resumeData.skills}
        `;

        const prompt = `
            Based on the following resume and job description, write a professional and compelling cover letter.

            The tone should be confident but not arrogant. The letter should be tailored to the job description, highlighting the most relevant skills and experiences from the resume. Structure it into a clear introduction, 2-3 body paragraphs, and a concluding paragraph. Do not use placeholders like "[Your Name]" or "[Company Name]"; use the information provided.

            **Resume Data:**
            ${resumeString}

            **Job Description:**
            ${jobDescription}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert career coach specializing in writing persuasive cover letters."
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating cover letter:", error);
        return 'There was an error generating the cover letter. Please try again.';
    }
};

const stripHtml = (html: string | undefined): string => {
    if (!html) return '';
    let text = html;
    // Add newlines for block elements for better formatting
    text = text.replace(/<\/li>/ig, '\n');
    text = text.replace(/<\/p>/ig, '\n');
    text = text.replace(/<br\s*\/?>/ig, '\n');
    // Strip all remaining HTML tags
    text = text.replace(/<[^>]*>?/gm, '');
    // Clean up extra whitespace and newlines
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.replace(/&nbsp;/g, ' ');
    return text.trim();
};

export const getChatbotResponse = async (message: string, resumeData: ResumeData): Promise<string> => {
    if (!message) return "Please ask a question.";

    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is not configured in .env file");
        return "AI features are not configured. Please add your Gemini API key to the .env file.";
    }

    try {
        // Create a more readable and comprehensive context for the AI
        const resumeContext = `
Here is the user's current resume data for context. Use this to provide personalized, specific advice.
---
**Name:** ${resumeData.personalDetails.fullName || 'Not specified'}
**Target Job Title:** ${resumeData.personalDetails.jobTitle || 'Not specified'}

**Summary:**
${stripHtml(resumeData.summary) || 'No summary provided yet.'}

**Experience:**
${resumeData.experience?.length > 0 ? resumeData.experience.map(e => `
- **${e.jobTitle} at ${e.company}** (${e.startDate} - ${e.endDate})
  ${stripHtml(e.description).split('\n').map(line => `  - ${line.trim()}`).filter(line => line.trim() !== '-').join('\n')}
`).join('') : 'No experience added yet.'}

**Projects:**
${(resumeData.projects || []).length > 0 ? (resumeData.projects || []).map(p => `
- **${p.name}**
  ${stripHtml(p.description).split('\n').map(line => `  - ${line.trim()}`).filter(line => line.trim() !== '-').join('\n')}
`).join('') : 'No projects added yet.'}

**Education:**
${resumeData.education?.length > 0 ? resumeData.education.map(e => `
- **${e.degree}** from ${e.institution} (${e.startDate} - ${e.endDate})
`).join('') : 'No education added yet.'}

**Skills:**
${stripHtml(resumeData.skills) || 'No skills added yet.'}

**Accomplishments:**
${(resumeData.accomplishments || []).length > 0 ? (resumeData.accomplishments || []).map(a => `
- ${stripHtml(a.description)}
`).join('') : 'No accomplishments added yet.'}
---
`;

        const systemInstruction = `You are an expert career advisor and AI assistant named "CareerBot," integrated into a resume builder application. Your advice MUST be highly personalized and directly reference the user's resume content provided in the context.

**Core Directives:**
1.  **Be Specific:** Do not give generic advice. ALWAYS connect your suggestions to the user's specific job title, summary, experience, skills, or projects. For example, instead of "Quantify your achievements," say "In your role as 'Frontend Developer at Tech Solutions Inc.', you mentioned improving performance by 20%. Could you add what business impact this had, like improved user retention?"
2.  **Analyze and Advise:** Act as a critical but encouraging coach. Analyze the provided resume context to answer questions, identify weaknesses, and suggest concrete improvements.
3.  **Generate Content on Request:** If asked, help draft or rephrase specific bullet points or sections, maintaining a professional tone and matching the style of the user's resume.
4.  **Prepare for Interviews:** When asked for interview help, use the resume context to formulate relevant questions. For instance, "Tell me more about the 'E-commerce Platform' project mentioned on your resume. What was the biggest technical challenge you faced?"
5.  **Be Comprehensive:** Address all parts of the user's question thoroughly.
6.  **Resume Improvement Focus:** When the user asks for help improving their resume, provide:
    - Specific suggestions for their summary, experience bullets, and skills
    - ATS-friendly keyword recommendations based on their target role
    - Quantifiable achievement suggestions (help them add metrics)
    - Action verb recommendations for stronger impact

**Tone:** Be encouraging, professional, and friendly. Use markdown formatting for readability (e.g., **bold**, *italics*, and bullet points using *).`;

        console.log("Calling Gemini API with message:", message.substring(0, 50) + "...");

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `${resumeContext}\n\nUser's question: "${message}"`,
            config: {
                systemInstruction,
            }
        });

        console.log("Gemini API response received successfully");
        return response.text?.trim() || "I received your message but couldn't generate a response. Please try again.";
    } catch (error: any) {
        console.error("Error getting chatbot response:", error);
        console.error("Error details:", error.message, error.status, error.statusText);

        // Provide more helpful error messages
        if (error.message?.includes('API key')) {
            return "There's an issue with the API key configuration. Please check that your Gemini API key is valid.";
        }
        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return "The AI service has reached its usage limit. Please try again later or check your API quota.";
        }
        if (error.message?.includes('model')) {
            return "There's an issue accessing the AI model. Please try again in a moment.";
        }

        return "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.";
    }
};