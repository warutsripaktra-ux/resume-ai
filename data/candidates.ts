import type { Candidate } from "@/lib/types";

export const candidates: Candidate[] = [
  {
    id: "C-001",
    name: "Narin P.",
    headline: "Full-Stack Developer • TypeScript / Node.js / React",
    experienceYears: 2.6,
    location: "Bangkok",
    availability: "2 weeks",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "OpenAI API"],
    productionWeb: true,
    fullStackAreas: ["frontend", "backend", "api", "database"],
    aiHandsOn: true,
    aiSummary: "Built a RAG support assistant with OpenAI API and pgvector.",
    gitTeamwork: true,
    thaiLevel: "native",
    englishLevel: "working",
    portfolioUrl: "github.com/narin-labs",
    domains: ["marketplace", "AI workflow"],
    highlights: [
      "Owned production features across frontend and backend",
      "Implemented RAG retrieval and prompt evaluation",
      "Worked in a 6-person product squad"
    ],
    evidence: {
      experience: "2 years 7 months building production web products.",
      typescript: "Daily TypeScript across Next.js frontend and Node.js services.",
      production: "Maintained checkout and order workflows serving production traffic.",
      fullstack: "React/Next.js UI, Node.js API, PostgreSQL schema and queries.",
      ai: "Built an internal RAG assistant using OpenAI API + pgvector.",
      git: "Pull request workflow with code review and GitHub Actions.",
      thai: "Thai: native.",
      english: "English: working proficiency; collaborated with regional PM.",
      portfolio: "Public GitHub contains production-style side projects."
    },
    missingInformation: ["No direct HR-tech experience stated."]
  },
  {
    id: "C-002",
    name: "Mali K.",
    headline: "Frontend Engineer • React / TypeScript",
    experienceYears: 2.1,
    location: "Nonthaburi",
    availability: "1 month",
    skills: ["TypeScript", "React", "Next.js", "Jest", "Storybook"],
    productionWeb: true,
    fullStackAreas: ["frontend", "api"],
    aiHandsOn: false,
    gitTeamwork: true,
    thaiLevel: "native",
    englishLevel: "working",
    portfolioUrl: "github.com/mali-ui",
    domains: ["e-commerce"],
    highlights: [
      "Strong production frontend ownership",
      "Built reusable design-system components",
      "Integrated REST and GraphQL APIs"
    ],
    evidence: {
      experience: "2 years 1 month in production web frontend roles.",
      typescript: "TypeScript used across React and Next.js applications.",
      production: "Shipped customer-facing e-commerce features.",
      fullstack: "Frontend and API integration are clear; backend/database ownership not shown.",
      ai: "No hands-on AI / LLM implementation described.",
      git: "GitHub flow, pull requests and team code review.",
      thai: "Thai: native.",
      english: "English: working proficiency.",
      portfolio: "GitHub portfolio provided."
    },
    missingInformation: [
      "Backend implementation experience is unclear.",
      "Database ownership is unclear.",
      "No hands-on AI / LLM evidence in CV."
    ]
  },
  {
    id: "C-003",
    name: "Thanawat S.",
    headline: "Backend Developer • Node.js / MongoDB / AI Integrations",
    experienceYears: 3.4,
    location: "Bangkok",
    availability: "Immediately",
    skills: ["JavaScript", "Node.js", "NestJS", "MongoDB", "Redis", "LLM API"],
    productionWeb: true,
    fullStackAreas: ["backend", "api", "database"],
    aiHandsOn: true,
    aiSummary: "Integrated LLM summarization and structured extraction into a CRM workflow.",
    gitTeamwork: true,
    thaiLevel: "native",
    englishLevel: "working",
    portfolioUrl: "github.com/thanawat-services",
    domains: ["CRM", "AI workflow"],
    highlights: [
      "Designed NestJS services and MongoDB models",
      "Implemented LLM extraction with validation and fallbacks",
      "Operated Redis queues in production"
    ],
    evidence: {
      experience: "3 years 5 months in backend product development.",
      typescript: "JavaScript is strong; TypeScript appears in recent NestJS project.",
      production: "Production CRM services and asynchronous jobs.",
      fullstack: "Backend/API/database are strong; frontend ownership is not shown.",
      ai: "Used an LLM API for summarization and structured CRM extraction.",
      git: "Git feature branches, pull requests and release collaboration.",
      thai: "Thai: native.",
      english: "English: working proficiency.",
      portfolio: "Repository link provided with backend service examples."
    },
    missingInformation: [
      "Frontend implementation experience is unclear.",
      "Experience is slightly above the stated 1-3 year range; recruiter should confirm whether the range is strict."
    ]
  },
  {
    id: "C-004",
    name: "Ploy R.",
    headline: "Software Engineer • React / FastAPI / Computer Vision",
    experienceYears: 1.7,
    location: "Chiang Mai",
    availability: "3 weeks",
    skills: ["TypeScript", "React", "Python", "FastAPI", "PostgreSQL", "Computer Vision"],
    productionWeb: true,
    fullStackAreas: ["frontend", "backend", "api", "database"],
    aiHandsOn: true,
    aiSummary: "Delivered a video-analysis prototype and integrated model output into a web workflow.",
    gitTeamwork: true,
    thaiLevel: "near-native",
    englishLevel: "fluent",
    portfolioUrl: "github.com/ploy-builds",
    domains: ["video", "AI workflow"],
    highlights: [
      "Built video-processing UI and API",
      "Connected model inference results to a review dashboard",
      "Comfortable across TypeScript and Python"
    ],
    evidence: {
      experience: "1 year 8 months of production web and ML product work.",
      typescript: "React frontend is written in TypeScript.",
      production: "Deployed internal and customer-facing review tools.",
      fullstack: "React UI, FastAPI service, REST API, PostgreSQL.",
      ai: "Hands-on computer vision workflow; LLM-specific experience is not explicit.",
      git: "GitHub pull requests and pair programming.",
      thai: "Thai: near-native.",
      english: "English: fluent.",
      portfolio: "Portfolio includes video-analysis project."
    },
    missingInformation: [
      "LLM-specific hands-on work is unclear; AI experience is primarily computer vision."
    ]
  },
  {
    id: "C-005",
    name: "Krit T.",
    headline: "Full-Stack Developer • Vue / Node.js",
    experienceYears: 2.9,
    location: "Bangkok",
    availability: "1 month",
    skills: ["JavaScript", "Vue", "Node.js", "Express", "MySQL"],
    productionWeb: true,
    fullStackAreas: ["frontend", "backend", "api", "database"],
    aiHandsOn: false,
    gitTeamwork: true,
    thaiLevel: "native",
    englishLevel: "unknown",
    domains: ["internal tools"],
    highlights: [
      "Full-stack ownership of internal business applications",
      "Designed REST APIs and relational schemas",
      "Experience supporting production incidents"
    ],
    evidence: {
      experience: "2 years 11 months in full-stack web development.",
      typescript: "JavaScript is documented; TypeScript usage is not shown.",
      production: "Maintained internal production systems.",
      fullstack: "Vue frontend, Node.js backend, REST APIs and MySQL.",
      ai: "No AI / LLM project evidence found.",
      git: "Git is listed with team branch workflow.",
      thai: "Thai: native.",
      english: "English level is not provided.",
      portfolio: "No portfolio or repository link included."
    },
    missingInformation: [
      "TypeScript proficiency is unclear.",
      "English level is missing.",
      "Portfolio / repository is missing.",
      "No hands-on AI / LLM evidence."
    ]
  }
];
