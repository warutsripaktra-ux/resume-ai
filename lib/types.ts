export type EvidenceStatus = "matched" | "gap" | "unknown";

export type CriterionResult = {
  id: string;
  label: string;
  status: EvidenceStatus;
  evidence: string;
};

export type SoftMatch = {
  id: string;
  label: string;
  status: "strong" | "partial" | "none";
  evidence: string;
};

export type EvidenceStrength = "strong" | "moderate" | "limited" | "unclear";

export type CompetencyDimension = {
  id: string;
  label: string;
  strength: EvidenceStrength;
  evidence: string;
};

export type SkillCompetency = {
  skill: string;
  years: number;
  dimensions: CompetencyDimension[];
  evidence: string[];
  missing: string[];
  interviewQuestions: string[];
};

export type Candidate = {
  id: string;
  name: string;
  headline: string;
  experienceYears: number;
  location: string;
  availability: string;
  skills: string[];
  productionWeb: boolean;
  fullStackAreas: Array<"frontend" | "backend" | "api" | "database">;
  aiHandsOn: boolean;
  aiSummary?: string;
  gitTeamwork: boolean;
  thaiLevel: "native" | "near-native" | "basic" | "unknown";
  englishLevel: "working" | "fluent" | "basic" | "unknown";
  portfolioUrl?: string;
  domains: string[];
  highlights: string[];
  evidence: Record<string, string>;
  missingInformation: string[];
  skillCompetencies?: SkillCompetency[];
};

export type ScreenedCandidate = Candidate & {
  hardChecks: CriterionResult[];
  softMatches: SoftMatch[];
  competencies: SkillCompetency[];
  matchedHard: number;
  unknownHard: number;
  gapHard: number;
  group: "Strong evidence" | "Partial evidence" | "Clarification needed";
};
