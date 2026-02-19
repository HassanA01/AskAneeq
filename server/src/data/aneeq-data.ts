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

export interface AneeqData {
  overview: {
    name: string;
    title: string;
    tagline: string;
    yearsExperience: number;
    languages: string[];
  };
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  education: Education[];
  contact: Contact;
  hobbies: string[];
  recommendations: Recommendation[];
}

export const aneeqData: AneeqData = {
  overview: {
    name: "Aneeq Hassan",
    title: "AI Software Engineer",
    tagline:
      "Building intelligent systems that deliver meaningful impact. Over 3 years of experience developing AI solutions and scalable applications.",
    yearsExperience: 3,
    languages: ["English", "French", "Spanish", "Arabic", "Urdu"],
  },

  experience: [
    {
      id: "dayforce",
      company: "Dayforce",
      role: "AI Software Engineer",
      duration: "Sept 2025 - Present",
      location: "Toronto, ON",
      technologies: [
        "LangGraph",
        "Python",
        "ChromaDB",
        "FastAPI",
        "LangChain",
        "RAG",
      ],
      achievements: [
        "Built QueryGPT, an internal agentic application for SQL generation across 50K+ tables",
        "Implemented RAG architecture with ChromaDB for semantic search",
        "Designed conversational AI workflows with LangGraph",
      ],
      current: true,
    },
    {
      id: "learning-mode",
      company: "Learning Mode AI",
      role: "Software Engineer Intern",
      duration: "May - Aug 2025",
      location: "Toronto, ON",
      technologies: ["Go", "Redis", "OpenAI", "Microservices"],
      achievements: [
        "Developed quiz microservices with real-time video synchronization",
        "Built high-performance backend services in Go",
        "Implemented Redis-based caching strategies",
      ],
      current: false,
    },
    {
      id: "magnet",
      company: "Magnet Forensics",
      role: "Software Engineer Intern",
      duration: "Jan - Apr 2025",
      location: "Waterloo, ON",
      technologies: ["C#", ".NET", "Enterprise Software"],
      achievements: [
        "Created Fastrak, reducing specialized tool usage by 85%",
        "Built forensic analysis tools with .NET framework",
      ],
      current: false,
    },
    {
      id: "annaly",
      company: "Annaly",
      role: "Software Engineer Intern",
      duration: "Feb - Aug 2024",
      location: "New York, NY",
      technologies: ["Python", "ETL", "Data Pipelines"],
      achievements: [
        "Implemented ETL notification system reducing incident response by 95%",
        "Performance optimizations cutting execution time by 50%",
      ],
      current: false,
    },
    {
      id: "enbridge",
      company: "Enbridge",
      role: "Software Engineer Intern",
      duration: "June - Sept 2023",
      location: "Toronto, ON",
      technologies: ["Power Apps", "SharePoint", "Automation"],
      achievements: [
        "Built Power Apps tool improving inter-departmental communication by 75%",
      ],
      current: false,
    },
    {
      id: "koho",
      company: "Koho Financial",
      role: "Software Engineer Intern",
      duration: "May 2022 - May 2023",
      location: "Toronto, ON",
      technologies: ["Angular", "Go", "Google Pay API"],
      achievements: [
        "Integrated Google Pay achieving 40% adoption and $2M in transactions",
        "Implemented state management reducing API calls by 60%",
        "Developed Angular/Go solutions for financial features",
      ],
      current: false,
    },
    {
      id: "uoft-ta",
      company: "University of Toronto",
      role: "Teaching Assistant",
      duration: "Jan 2022 - May 2025",
      location: "Toronto, ON",
      technologies: ["Python", "Education"],
      achievements: [
        "Instructed 2,000+ students in Python programming",
        "Improved student grades by 47%",
      ],
      current: false,
    },
  ],

  projects: [
    {
      id: "mailflowai",
      name: "MailflowAI",
      description:
        "AI-powered 24/7 customer service automation that processes emails and generates intelligent responses",
      techStack: [
        "Python",
        "GCP",
        "Cloud Pub/Sub",
        "OpenAI",
        "Shopify GraphQL Admin API",
        "Gmail API",
      ],
      impact: "Reduced monthly costs by $14K",
      metrics: "Response times from hours to minutes",
      links: {
        github: "https://github.com/HassanA01/mailflowai",
      },
      featured: true,
    },
    {
      id: "b2w",
      name: "B2W - UofT Hacks 12",
      description:
        "Financial management platform with ML-powered spending predictions, expense tracking, and personalized recommendations",
      techStack: [
        "Next.js",
        "Express.js",
        "PostgreSQL",
        "Flask",
        "Databricks",
        "AWS",
        "scikit-learn",
      ],
      links: {
        github: "https://github.com/HassanA01/UofTHacks12",
      },
      featured: true,
    },
    {
      id: "bizreach",
      name: "BizReach Marketplace",
      description:
        "Full-stack marketplace connecting mobile businesses with clients, with AI-powered gig description generator",
      techStack: [
        "React",
        "Express",
        "OAuth",
        "Node.js",
        "Socket.io",
        "Firebase",
        "OpenAI",
      ],
      impact: "Led team of 5 developers",
      links: {
        github:
          "https://github.com/HassanA01/final-project-s23-cd-users-baddies",
      },
      featured: true,
    },
    {
      id: "myriad-cro",
      name: "Myriad CRO Landing Page",
      description:
        "Conversion-focused landing page with step-by-step processes, expandable FAQs, and responsive design",
      techStack: [
        "Next.js",
        "Shadcn",
        "Tailwind CSS",
        "Aceternity UI",
        "RadixUI",
        "Motion",
      ],
      links: {
        github: "https://github.com/HassanA01/myriad-cro-website",
        demo: "https://myriadcro.com",
      },
      featured: true,
    },
    {
      id: "iot-monitoring",
      name: "IoT Data Monitoring System",
      description:
        "Manages 1+ million records with optimized retrieval using continuous aggregates",
      techStack: ["TypeScript", "TimescaleDB", "Grafana"],
      links: {
        github: "https://github.com/HassanA01/IoT-Data-Monitoring-System",
      },
      featured: false,
    },
    {
      id: "proxy-server",
      name: "Proxy Server",
      description:
        "Caching mechanisms reducing data retrieval times by 50%, uses socket programming",
      techStack: ["Python"],
      impact: "50% faster data retrieval",
      links: {
        github: "https://github.com/HassanA01/ProxyServer",
      },
      featured: false,
    },
    {
      id: "delivery-service",
      name: "Delivery Service App",
      description:
        "Delivery tracking system with event-driven architecture and order lifecycle simulation",
      techStack: ["React", "Bootstrap", "Python", "Redis", "FastAPI"],
      links: {
        github: "https://github.com/HassanA01/DeliveryService",
      },
      featured: false,
    },
    {
      id: "network-simulation",
      name: "Network Simulation",
      description:
        "Network application for retrieving and displaying web content, focusing on socket programming and TCP/IP protocols",
      techStack: ["C++"],
      links: {
        github: "https://github.com/HassanA01/networksimulation",
        demo: "https://networksimulation.dev",
      },
      featured: false,
    },
  ],

  skills: [
    {
      category: "Languages",
      skills: [
        { name: "Python", proficiency: "expert" },
        { name: "TypeScript", proficiency: "expert" },
        { name: "JavaScript", proficiency: "expert" },
        { name: "Go", proficiency: "advanced" },
        { name: "C#", proficiency: "advanced" },
        { name: "Java", proficiency: "advanced" },
        { name: "C++", proficiency: "intermediate" },
        { name: "C", proficiency: "intermediate" },
      ],
    },
    {
      category: "Frontend",
      skills: [
        { name: "React", proficiency: "expert" },
        { name: "Next.js", proficiency: "advanced" },
        { name: "Angular", proficiency: "advanced" },
        { name: "Tailwind CSS", proficiency: "expert" },
      ],
    },
    {
      category: "Backend",
      skills: [
        { name: "FastAPI", proficiency: "expert" },
        { name: "Flask", proficiency: "advanced" },
        { name: "Express.js", proficiency: "advanced" },
        { name: "Spring Boot", proficiency: "advanced" },
        { name: "Node.js", proficiency: "expert" },
      ],
    },
    {
      category: "Databases",
      skills: [
        { name: "MongoDB", proficiency: "advanced" },
        { name: "PostgreSQL", proficiency: "advanced" },
        { name: "Firebase", proficiency: "advanced" },
        { name: "TimescaleDB", proficiency: "intermediate" },
        { name: "Redis", proficiency: "advanced" },
      ],
    },
    {
      category: "Cloud & DevOps",
      skills: [
        { name: "AWS", proficiency: "advanced" },
        { name: "Docker", proficiency: "advanced" },
        { name: "GCP", proficiency: "advanced" },
        { name: "Grafana", proficiency: "intermediate" },
      ],
    },
    {
      category: "AI / ML",
      skills: [
        { name: "OpenAI", proficiency: "expert" },
        { name: "LangChain", proficiency: "expert" },
        { name: "LangGraph", proficiency: "expert" },
        { name: "ChromaDB", proficiency: "expert" },
        { name: "RAG", proficiency: "expert" },
        { name: "scikit-learn", proficiency: "intermediate" },
      ],
    },
  ],

  education: [
    {
      institution: "University of Toronto",
      degree: "Bachelor of Science",
      field: "Computer Science",
      duration: "2020 - 2025",
      highlights: [
        "Teaching Assistant for 2,000+ students in Python",
        "Improved student grades by 47%",
      ],
    },
  ],

  contact: {
    email: "hassan.aneeq01@gmail.com",
    github: "https://github.com/hassana01",
    linkedin: "https://linkedin.com/in/hassana01",
    portfolio: "https://aneeqhassan.com",
  },

  hobbies: [
    "Soccer",
    "Gaming",
    "Travel",
    "Fitness",
    "Food & Culinary Exploration",
  ],

  recommendations: [
    {
      id: "rec-1",
      author: "Jane Smith",
      role: "Senior Engineering Manager",
      company: "Dayforce",
      text: "Aneeq consistently delivers beyond expectations. His ability to architect complex AI systems while keeping code clean and maintainable is rare for someone at his career stage.",
      linkedIn: "https://linkedin.com/in/janesmith",
    },
    {
      id: "rec-2",
      author: "John Doe",
      role: "Staff Engineer",
      company: "Koho Financial",
      text: "Working with Aneeq was a pleasure. He took ownership of the Google Pay integration end-to-end and drove it to $2M in transactions with minimal oversight.",
    },
    {
      id: "rec-3",
      author: "Alex Chen",
      role: "Engineering Lead",
      company: "Learning Mode AI",
      text: "Aneeq ramped up on our Go microservices stack incredibly fast and shipped production-quality features in his first week. Strong communicator and team player.",
      linkedIn: "https://linkedin.com/in/alexchen",
    },
  ],
};
