export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  location: string;
  technologies: string[];
  achievements: string[];
  current: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  impact?: string;
  metrics?: string;
  links?: {
    github?: string;
    demo?: string;
  };
  featured: boolean;
}

export interface SkillCategory {
  category: string;
  skills: Array<{
    name: string;
    proficiency: "expert" | "advanced" | "intermediate";
  }>;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  duration: string;
  highlights: string[];
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
  portfolio: string;
}

export interface Recommendation {
  id: string;
  author: string;
  role: string;
  company: string;
  text: string;
  linkedIn?: string;
}

export interface SkillMatch {
  name: string;
  proficiency: "expert" | "advanced" | "intermediate" | "not found";
  category: string | null;
}

export interface Overview {
  name: string;
  title: string;
  tagline: string;
  yearsExperience: number;
  languages: string[];
}

export type ViewType =
  | "overview"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "contact"
  | "hobbies"
  | "resume"
  | "recommendations"
  | "availability"
  | "skill-comparison"
  | "analytics";

export interface ToolResultData {
  view: ViewType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  format?: "full" | "summary";
  focusId?: string;
  searchQuery?: string;
  technologyFilter?: string;
}

export interface ToolResult {
  structuredContent?: ToolResultData;
}
