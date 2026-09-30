export type ReviewStatus = "unreviewed" | "reviewed" | "followup";
export type Review = { status: ReviewStatus; note: string; updatedAt: string };
export type Reviews = Record<string, Review>;
export const REVIEW_STORAGE_KEY = "remuse.reviews.v1";

export function parseReviews(raw: string | null): Reviews {
  if (!raw) return {};
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid review data");
  const result: Reviews = {};
  for (const [id, review] of Object.entries(value)) {
    if (!review || typeof review !== "object" || !("status" in review) || !("note" in review) || !("updatedAt" in review)) continue;
    if (!["unreviewed", "reviewed", "followup"].includes(String(review.status)) || typeof review.note !== "string" || typeof review.updatedAt !== "string") continue;
    result[id] = { status: review.status as ReviewStatus, note: review.note, updatedAt: review.updatedAt };
  }
  return result;
}
