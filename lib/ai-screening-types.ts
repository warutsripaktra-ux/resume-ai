export type AIScreeningCriterionStatus = "evidence_found" | "unclear" | "explicit_gap";
export type AIEvidenceStrength = "strong" | "moderate" | "limited" | "unclear";

export type AISkillEvidence = {
  name: string;
  evidence: string[];
};

export type AICriterionFinding = {
  criterion: string;
  status: AIScreeningCriterionStatus;
  rationale: string;
  evidence: string[];
};

export type AICompetencyEvidence = {
  dimension:
    | "Production exposure"
    | "Problem complexity"
    | "Ownership"
    | "Debugging / incidents"
    | "Performance / scale"
    | "Testing discipline"
    | "Architecture / design";
  strength: AIEvidenceStrength;
  rationale: string;
  evidence: string[];
};

export type AIScreeningResult = {
  extractedSkills: AISkillEvidence[];
  criteriaFindings: AICriterionFinding[];
  competencyEvidence: AICompetencyEvidence[];
  missingInformation: string[];
  followUpQuestions: string[];
  notes: string[];
};

export type AIScreeningResponse =
  | {
      ok: true;
      provider: "openai";
      model: string;
      result: AIScreeningResult;
    }
  | {
      ok: false;
      error: string;
      code?: string;
    };
