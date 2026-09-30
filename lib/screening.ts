import type {
  Candidate,
  CriterionResult,
  EvidenceStrength,
  ScreenedCandidate,
  SkillCompetency,
  SoftMatch
} from "@/lib/types";

const result = (
  id: string,
  label: string,
  status: CriterionResult["status"],
  evidence: string
): CriterionResult => ({ id, label, status, evidence });

function hasSkill(candidate: Candidate, values: string[]) {
  const normalized = candidate.skills.map((skill) => skill.toLowerCase());
  return values.some((value) => normalized.some((skill) => skill.includes(value)));
}

function buildJavascriptCompetency(candidate: Candidate): SkillCompetency {
  const text = [
    ...candidate.highlights,
    ...Object.values(candidate.evidence)
  ].join(" ").toLowerCase();

  const skillName = hasSkill(candidate, ["typescript"]) ? "JavaScript / TypeScript" : "JavaScript";
  const production: EvidenceStrength = candidate.productionWeb ? "strong" : "unclear";
  const complexity: EvidenceStrength =
    candidate.fullStackAreas.length === 4 && candidate.aiHandsOn
      ? "strong"
      : candidate.fullStackAreas.length === 4
        ? "moderate"
        : candidate.fullStackAreas.length >= 2
          ? "limited"
          : "unclear";

  const ownership: EvidenceStrength =
    /owned|designed|architecture|from scratch/.test(text)
      ? "strong"
      : /implemented|developed|built|maintained/.test(text)
        ? "moderate"
        : "unclear";

  const debugging: EvidenceStrength =
    /incident|debug|root cause|production issue/.test(text)
      ? "strong"
      : /maintained|supporting production|production/.test(text)
        ? "moderate"
        : "unclear";

  const performance: EvidenceStrength =
    /latency|response time|performance|optim|throughput|requests\/day|orders\/day/.test(text)
      ? "strong"
      : "unclear";

  const testing: EvidenceStrength =
    hasSkill(candidate, ["jest", "vitest", "cypress", "playwright"])
      ? "strong"
      : /test|testing|code review|github actions/.test(text)
        ? "moderate"
        : "unclear";

  const architecture: EvidenceStrength =
    /designed|architecture|schema|service|workflow/.test(text)
      ? "strong"
      : candidate.fullStackAreas.includes("backend")
        ? "moderate"
        : "unclear";

  const dimensions = [
    {
      id: "production",
      label: "Production exposure",
      strength: production,
      evidence: candidate.evidence.production
    },
    {
      id: "complexity",
      label: "Problem complexity",
      strength: complexity,
      evidence: candidate.evidence.fullstack
    },
    {
      id: "ownership",
      label: "Ownership",
      strength: ownership,
      evidence: candidate.highlights[0] ?? "No ownership evidence stated."
    },
    {
      id: "debugging",
      label: "Debugging / incidents",
      strength: debugging,
      evidence:
        debugging === "unclear"
          ? "CV does not provide concrete debugging or incident examples."
          : "Production support / maintenance evidence is present in the profile."
    },
    {
      id: "performance",
      label: "Performance",
      strength: performance,
      evidence:
        performance === "unclear"
          ? "No measurable performance or scale evidence found."
          : "Profile includes performance, scale, latency, or throughput evidence."
    },
    {
      id: "testing",
      label: "Testing discipline",
      strength: testing,
      evidence:
        testing === "unclear"
          ? "Testing approach is not described."
          : "Testing or engineering-quality practices are visible in the profile."
    },
    {
      id: "architecture",
      label: "Architecture / design",
      strength: architecture,
      evidence:
        architecture === "unclear"
          ? "Architecture ownership is not clear from the CV."
          : "Design, service, schema, or workflow evidence is present."
    }
  ];

  const weakDimensions = dimensions.filter(
    (dimension) => dimension.strength === "unclear" || dimension.strength === "limited"
  );

  const interviewQuestions = weakDimensions.slice(0, 4).map((dimension) => {
    const questions: Record<string, string> = {
      complexity: "เล่าโจทย์ JavaScript/TypeScript ที่ซับซ้อนที่สุดที่คุณเคยแก้ และอะไรทำให้มันยาก?",
      ownership: "มี feature หรือ service ไหนที่คุณเป็นคนออกแบบและตัดสินใจทางเทคนิคเองตั้งแต่ต้นบ้าง?",
      debugging: "Production bug ที่ยากที่สุดที่คุณเคย debug คืออะไร และหา root cause อย่างไร?",
      performance: "เคยแก้ performance issue ด้วย JavaScript/Node.js ไหม และวัดผลก่อน-หลังอย่างไร?",
      testing: "คุณวาง testing strategy ของ feature สำคัญอย่างไร?",
      architecture: "ช่วยอธิบาย architecture ของระบบที่คุณมี ownership มากที่สุดได้ไหม?",
      production: "คุณเคยดูแลระบบ production จริงในส่วนไหน และรับผิดชอบอะไรบ้าง?"
    };
    return questions[dimension.id] ?? `ช่วยขยายหลักฐานด้าน ${dimension.label} เพิ่มเติมได้ไหม?`;
  });

  return {
    skill: skillName,
    years: candidate.experienceYears,
    dimensions,
    evidence: [
      candidate.evidence.typescript,
      candidate.evidence.production,
      candidate.evidence.fullstack
    ],
    missing: weakDimensions.map(
      (dimension) => `${dimension.label}: หลักฐานใน CV ยังไม่เพียงพอ`
    ),
    interviewQuestions
  };
}

export function screenCandidate(candidate: Candidate): ScreenedCandidate {
  const experienceStatus =
    candidate.experienceYears >= 1 && candidate.experienceYears <= 3
      ? "matched"
      : "gap";

  const jsTsStatus = hasSkill(candidate, ["javascript", "typescript"])
    ? "matched"
    : "unknown";

  const fullStackStatus =
    candidate.fullStackAreas.length === 4
      ? "matched"
      : candidate.fullStackAreas.length >= 2
        ? "unknown"
        : "gap";

  const aiStatus = candidate.aiHandsOn ? "matched" : "gap";

  const thaiStatus =
    candidate.thaiLevel === "native" || candidate.thaiLevel === "near-native"
      ? "matched"
      : candidate.thaiLevel === "unknown"
        ? "unknown"
        : "gap";

  const englishStatus =
    candidate.englishLevel === "working" || candidate.englishLevel === "fluent"
      ? "matched"
      : candidate.englishLevel === "unknown"
        ? "unknown"
        : "gap";

  const hardChecks: CriterionResult[] = [
    result("experience", "1–3 years production web experience", experienceStatus, candidate.evidence.experience),
    result("typescript", "JavaScript / TypeScript", jsTsStatus, candidate.evidence.typescript),
    result(
      "production",
      "Production web development",
      candidate.productionWeb ? "matched" : "gap",
      candidate.evidence.production
    ),
    result("fullstack", "Frontend + Backend + API + Database", fullStackStatus, candidate.evidence.fullstack),
    result("ai", "Hands-on AI / LLM experience", aiStatus, candidate.evidence.ai),
    result(
      "git",
      "Git + collaborative development",
      candidate.gitTeamwork ? "matched" : "unknown",
      candidate.evidence.git
    ),
    result("thai", "Thai native / near-native", thaiStatus, candidate.evidence.thai),
    result("english", "Working English", englishStatus, candidate.evidence.english),
    result(
      "portfolio",
      "Portfolio / repository",
      candidate.portfolioUrl ? "matched" : "unknown",
      candidate.evidence.portfolio
    )
  ];

  const domainMatch = (domain: string) =>
    candidate.domains.some((item) => item.toLowerCase().includes(domain.toLowerCase()));

  const softMatches: SoftMatch[] = [
    {
      id: "backend",
      label: "Backend platform / modern database",
      status:
        candidate.fullStackAreas.includes("backend") && candidate.fullStackAreas.includes("database")
          ? "strong"
          : candidate.fullStackAreas.includes("backend")
            ? "partial"
            : "none",
      evidence: candidate.evidence.fullstack
    },
    {
      id: "workflow",
      label: "AI workflow / logic",
      status: candidate.aiHandsOn ? (domainMatch("AI workflow") ? "strong" : "partial") : "none",
      evidence: candidate.evidence.ai
    },
    {
      id: "video",
      label: "Video-related product",
      status: domainMatch("video") ? "strong" : "none",
      evidence: domainMatch("video")
        ? "Candidate has explicit video-product experience."
        : "No video-product evidence found."
    },
    {
      id: "hrmarket",
      label: "HR tech / marketplace",
      status: domainMatch("marketplace") ? "strong" : "none",
      evidence: domainMatch("marketplace")
        ? "Candidate has marketplace domain experience."
        : "No direct HR-tech / marketplace evidence found."
    }
  ];

  const matchedHard = hardChecks.filter((item) => item.status === "matched").length;
  const unknownHard = hardChecks.filter((item) => item.status === "unknown").length;
  const gapHard = hardChecks.filter((item) => item.status === "gap").length;

  let group: ScreenedCandidate["group"] = "Partial evidence";
  if (gapHard === 0 && unknownHard <= 1) {
    group = "Strong evidence";
  } else if (unknownHard >= 2 || gapHard >= 3) {
    group = "Clarification needed";
  }

  const competencies =
    candidate.skillCompetencies && candidate.skillCompetencies.length > 0
      ? candidate.skillCompetencies
      : [buildJavascriptCompetency(candidate)];

  return {
    ...candidate,
    hardChecks,
    softMatches,
    competencies,
    matchedHard,
    unknownHard,
    gapHard,
    group
  };
}

export function screenCandidates(candidates: Candidate[]) {
  return candidates.map(screenCandidate);
}
