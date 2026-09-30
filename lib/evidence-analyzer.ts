export type EvidenceFinding = {
  label: string;
  status: "found" | "unclear";
  evidence: string[];
};

export type CompetencySignal = {
  label: string;
  level: "strong" | "moderate" | "limited" | "unclear";
  evidence: string;
};

export type EvidenceAnalysis = {
  extractedSkills: string[];
  findings: EvidenceFinding[];
  competencies: CompetencySignal[];
  followUpQuestions: string[];
};

const skillRules: Array<[string, RegExp]> = [
  ["JavaScript", /\bjavascript\b|\bjs\b/i],
  ["TypeScript", /\btypescript\b|\bts\b/i],
  ["React", /\breact(?:\.js)?\b/i],
  ["Next.js", /\bnext(?:\.js)?\b/i],
  ["Node.js", /\bnode(?:\.js)?\b/i],
  ["NestJS", /\bnest(?:js)?\b/i],
  ["Express", /\bexpress(?:\.js)?\b/i],
  ["PostgreSQL", /\bpostgres(?:ql)?\b/i],
  ["MySQL", /\bmysql\b/i],
  ["MongoDB", /\bmongodb\b|\bmongo\b/i],
  ["Redis", /\bredis\b/i],
  ["Git", /\bgit(?:hub|lab)?\b|pull request|code review/i],
  ["AI / LLM", /\bllm\b|openai|rag|prompt|embedding|vector database|langchain|ai workflow/i]
];

function lines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function evidenceFor(text: string, pattern: RegExp, limit = 3) {
  return lines(text).filter((line) => pattern.test(line)).slice(0, limit);
}

function signal(
  label: string,
  text: string,
  strongPattern: RegExp,
  moderatePattern: RegExp,
  unclearText: string
): CompetencySignal {
  const strongEvidence = evidenceFor(text, strongPattern, 1)[0];
  if (strongEvidence) return { label, level: "strong", evidence: strongEvidence };

  const moderateEvidence = evidenceFor(text, moderatePattern, 1)[0];
  if (moderateEvidence) return { label, level: "moderate", evidence: moderateEvidence };

  return { label, level: "unclear", evidence: unclearText };
}

export function analyzeResumeEvidence(text: string): EvidenceAnalysis {
  const extractedSkills = skillRules
    .filter(([, pattern]) => pattern.test(text))
    .map(([skill]) => skill);

  const findings: EvidenceFinding[] = [
    {
      label: "JavaScript / TypeScript",
      status: /\bjavascript\b|\btypescript\b|\bjs\b|\bts\b/i.test(text) ? "found" : "unclear",
      evidence: evidenceFor(text, /\bjavascript\b|\btypescript\b|\bjs\b|\bts\b/i)
    },
    {
      label: "Production web experience",
      status: /production|deployed|release|live system|customer-facing|production incident/i.test(text) ? "found" : "unclear",
      evidence: evidenceFor(text, /production|deployed|release|live system|customer-facing|production incident/i)
    },
    {
      label: "Frontend + Backend + API + Database",
      status:
        /(react|next|vue|angular)/i.test(text) &&
        /(node|nest|express|fastapi|spring|\.net)/i.test(text) &&
        /(api|rest|graphql)/i.test(text) &&
        /(postgres|mysql|mongodb|sql server|database)/i.test(text)
          ? "found"
          : "unclear",
      evidence: evidenceFor(text, /react|next|vue|angular|node|nest|express|api|rest|graphql|postgres|mysql|mongodb|database/i)
    },
    {
      label: "Hands-on AI / LLM",
      status: /\bllm\b|openai|rag|prompt|embedding|vector database|langchain|ai workflow/i.test(text) ? "found" : "unclear",
      evidence: evidenceFor(text, /\bllm\b|openai|rag|prompt|embedding|vector database|langchain|ai workflow/i)
    },
    {
      label: "Git + collaborative development",
      status: /\bgit\b|github|gitlab|pull request|code review|branch/i.test(text) ? "found" : "unclear",
      evidence: evidenceFor(text, /\bgit\b|github|gitlab|pull request|code review|branch/i)
    },
    {
      label: "Portfolio / repository",
      status: /github\.com|gitlab\.com|portfolio|repository|repo\b/i.test(text) ? "found" : "unclear",
      evidence: evidenceFor(text, /github\.com|gitlab\.com|portfolio|repository|repo\b/i)
    }
  ];

  const competencies: CompetencySignal[] = [
    signal(
      "Production exposure",
      text,
      /production incident|on-call|deployed to production|production traffic|customer-facing/i,
      /production|deployed|release|live system/i,
      "CV ยังไม่มีหลักฐานชัดว่าดูแลระบบ production ในระดับใด"
    ),
    signal(
      "Problem complexity",
      text,
      /distributed|queue|event-driven|concurrency|high volume|scalable|microservice|real-time/i,
      /workflow|integration|service|api|database/i,
      "CV ยังไม่อธิบายความซับซ้อนของโจทย์ที่รับผิดชอบ"
    ),
    signal(
      "Ownership",
      text,
      /owned|led|designed|architected|from scratch|end-to-end/i,
      /implemented|developed|built|maintained/i,
      "CV ยังไม่ชัดว่าผู้สมัครมี ownership ระดับใด"
    ),
    signal(
      "Debugging / incidents",
      text,
      /root cause|incident|debugged|memory leak|race condition|postmortem/i,
      /troubleshoot|bug fix|production support|support request/i,
      "ไม่พบตัวอย่างการ debug หรือแก้ production incident"
    ),
    signal(
      "Performance / scale",
      text,
      /reduced .*%|improved .*%|latency|throughput|requests per|orders per|response time|performance optimization/i,
      /cache|redis|optimi[sz]ed|performance/i,
      "ไม่พบ measurable impact ด้าน performance หรือ scale"
    ),
    signal(
      "Testing discipline",
      text,
      /integration test|e2e|end-to-end|test coverage|cypress|playwright|jest|vitest/i,
      /unit test|testing|test/i,
      "CV ยังไม่บอก testing strategy"
    ),
    signal(
      "Architecture / design",
      text,
      /architected|system design|designed .*service|designed .*schema|event-driven|microservice/i,
      /designed|service|schema|workflow|module/i,
      "CV ยังไม่ชัดว่ามี architecture/design ownership หรือไม่"
    )
  ];

  const followUpQuestions: string[] = [];
  const unclearLabels = new Set(
    competencies.filter((item) => item.level === "unclear").map((item) => item.label)
  );

  if (unclearLabels.has("Ownership")) {
    followUpQuestions.push("ช่วยเล่า feature หรือ service ที่คุณเป็นคนออกแบบและตัดสินใจทางเทคนิคเองตั้งแต่ต้นได้ไหม?");
  }
  if (unclearLabels.has("Debugging / incidents")) {
    followUpQuestions.push("Production bug ที่ยากที่สุดที่คุณเคย debug คืออะไร และหา root cause อย่างไร?");
  }
  if (unclearLabels.has("Performance / scale")) {
    followUpQuestions.push("เคยแก้ performance issue หรือระบบที่มี load สูงไหม และวัดผลก่อน-หลังอย่างไร?");
  }
  if (unclearLabels.has("Testing discipline")) {
    followUpQuestions.push("คุณวาง testing strategy ของ feature สำคัญอย่างไร?");
  }
  if (unclearLabels.has("Architecture / design")) {
    followUpQuestions.push("ช่วยอธิบาย architecture ของระบบที่คุณมี ownership มากที่สุดได้ไหม?");
  }

  findings
    .filter((item) => item.status === "unclear")
    .slice(0, 2)
    .forEach((item) => {
      followUpQuestions.push(`CV ยังไม่ชัดเรื่อง "${item.label}" — ขอให้ผู้สมัครยกตัวอย่างประสบการณ์ที่เกี่ยวข้องเพิ่มเติม`);
    });

  return {
    extractedSkills,
    findings,
    competencies,
    followUpQuestions: followUpQuestions.slice(0, 6)
  };
}
