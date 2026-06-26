// FIX: Define TypeScript interfaces for the application's data structures.
export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  links: Link[];
  photo?: string; // Base64 encoded photo
}

export interface Link {
  id: string;
  name: string;
  url: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export interface Accomplishment {
  id: string;
  description: string;
}

export type SectionId =
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "accomplishments";

export type FontFamily =
  | "inter"
  | "roboto"
  | "playfair"
  | "merriweather"
  | "fira-code"
  | "monaco"
  | "sans"
  | "serif"
  | "mono";

export type FontSize = "small" | "medium" | "large";
export type LayoutSpacing = "compact" | "standard" | "spacious";

export interface TemplateCustomization {
  fontFamily: FontFamily;
  fontSize: FontSize;
  layout: LayoutSpacing;
  textScale?: number;
  lineHeight?: number;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  projects: Project[];
  accomplishments: Accomplishment[];
  sectionOrder: SectionId[];
  accentColor: string;
  customization: TemplateCustomization;
  isPublic?: boolean;
  shareId?: string;
}

export interface ATSAnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
}

export interface JDMatchResult {
  matchScore: number;
  verdict: string;
  missingSkills: string[];
  suggestions: string[];
}

export type TemplateID =
  | "professional-it"
  | "ats-modern"
  | "standard-classic"
  | "tech-minimalist";

export type SaveStatus = "saving" | "saved" | "error";

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}
