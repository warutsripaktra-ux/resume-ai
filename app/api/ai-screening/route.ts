import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { job } from "@/data/job";

export const runtime = "nodejs";

const screeningSchema = z.object({
  extractedSkills: z.array(
    z.object({
      name: z.string(),
      evidence: z.array(z.string()).max(3)
    })
  ),
  criteriaFindings: z.array(
    z.object({
      criterion: z.string(),
      status: z.enum(["evidence_found", "unclear", "explicit_gap"]),
      rationale: z.string(),
      evidence: z.array(z.string()).max(3)
    })
  ),
  competencyEvidence: z.array(
    z.object({
      dimension: z.enum([
        "Production exposure",
        "Problem complexity",
        "Ownership",
        "Debugging / incidents",
        "Performance / scale",
        "Testing discipline",
        "Architecture / design"
      ]),
      strength: z.enum(["strong", "moderate", "limited", "unclear"]),
      rationale: z.string(),
      evidence: z.array(z.string()).max(3)
    })
  ),
  missingInformation: z.array(z.string()).max(8),
  followUpQuestions: z.array(z.string()).max(6),
  notes: z.array(z.string()).max(5)
});

const SYSTEM_PROMPT = `
You are an evidence-extraction assistant for a recruiter reviewing software-engineering resumes.

Your job is to structure JOB-RELATED EVIDENCE from the resume. You are NOT making a hiring decision, ranking candidates, estimating employability, or recommending hire/reject.

Rules:
- Use only evidence stated in the supplied resume text.
- Never infer or use age, gender, ethnicity, religion, disability, family status, photo, nationality, health, sexual orientation, or other sensitive/protected traits.
- Do not infer personality, intelligence, honesty, culture fit, or motivation.
- Missing information must be "unclear", not treated as a negative.
- Use "explicit_gap" only when the resume explicitly states information that conflicts with a criterion (for example, a stated duration below a required minimum). Never use explicit_gap merely because evidence is absent.
- Evidence strength means strength of DOCUMENTED EVIDENCE, not the person's actual ability.
- Prefer transferable semantic evidence. Example: "designed NestJS REST services" can support backend/API experience even if the exact phrase "backend API development" is absent.
- Keep evidence grounded in short snippets or concise paraphrases from the resume.
- Do not create an overall score.
- Do not compare this candidate to other candidates.
- Follow-up questions should verify missing job-related evidence.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = typeof body?.resumeText === "string" ? body.resumeText.trim() : "";

    if (!resumeText) {
      return NextResponse.json(
        { ok: false, code: "EMPTY_RESUME", error: "Resume text is required." },
        { status: 400 }
      );
    }

    if (resumeText.length > 30000) {
      return NextResponse.json(
        { ok: false, code: "RESUME_TOO_LONG", error: "Resume text must be 30,000 characters or less." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          code: "OPENAI_API_KEY_MISSING",
          error: "OPENAI_API_KEY is not configured. Add it to .env.local and restart the dev server."
        },
        { status: 503 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-5.6-terra";

    const response = await client.responses.parse({
      model,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            "JOB CRITERIA",
            "Must-have:",
            ...job.mustHave.map((item) => `- ${item}`),
            "",
            "Nice-to-have:",
            ...job.niceToHave.map((item) => `- ${item}`),
            "",
            "RESUME TEXT",
            resumeText
          ].join("\n")
        }
      ],
      text: {
        format: zodTextFormat(screeningSchema, "resume_evidence_screening")
      }
    });

    if (!response.output_parsed) {
      return NextResponse.json(
        { ok: false, code: "AI_OUTPUT_EMPTY", error: "The AI response did not contain a structured result." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "openai",
      model,
      result: response.output_parsed
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI screening error.";
    return NextResponse.json(
      { ok: false, code: "AI_SCREENING_FAILED", error: message },
      { status: 500 }
    );
  }
}
