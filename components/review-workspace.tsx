"use client";

import { useEffect, useState } from "react";
import { parseReviews, REVIEW_STORAGE_KEY, type Review, type Reviews, type ReviewStatus } from "@/lib/reviews";

export const reviewLabels: Record<ReviewStatus, string> = {
  unreviewed: "Not reviewed", reviewed: "Reviewed", followup: "Needs follow-up"
};

export function useReviews() {
  const [reviews, setReviews] = useState<Reviews>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try { setReviews(parseReviews(localStorage.getItem(REVIEW_STORAGE_KEY))); }
    catch { setError("Saved reviews could not be loaded. Your next save will replace the local copy."); }
    setReady(true);
  }, []);

  function save(id: string, change: Partial<Pick<Review, "note" | "status">>) {
    const previous = reviews[id] ?? { status: "unreviewed" as ReviewStatus, note: "" };
    const next = { ...reviews, [id]: { ...previous, ...change, updatedAt: new Date().toISOString() } };
    try {
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(next));
      setReviews(next);
      setError("");
      return true;
    } catch {
      setError("Could not save in this browser. Keep your note here and try saving again.");
      return false;
    }
  }
  return { reviews, ready, error, save };
}

type Props = {
  candidateId: string;
  candidateName: string;
  review?: Review;
  ready: boolean;
  error: string;
  drafts: Record<string, string>;
  onDraft: (id: string, note: string) => void;
  onSave: (id: string, change: Partial<Pick<Review, "note" | "status">>) => boolean;
};

export function ReviewWorkspace({ candidateId, candidateName, review, ready, error, drafts, onDraft, onSave }: Props) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const note = drafts[candidateId] ?? review?.note ?? "";
  const dirty = note !== (review?.note ?? "");
  const status = review?.status ?? "unreviewed";

  function updateStatus(next: ReviewStatus) {
    if (onSave(candidateId, { status: next, note })) setMessages((current) => ({ ...current, [candidateId]: `${reviewLabels[next]} · Saved on this device` }));
  }

  return <section className="review-workspace" aria-label={`Review notes for ${candidateName}`}>
    <div className="review-heading"><div><h3>Your review</h3><p>Capture what matters for the next conversation.</p></div><span className={`review-status review-${status}`}>{reviewLabels[status]}</span></div>
    <div className="review-actions">
      <button className={status === "reviewed" ? "primary-button is-complete" : "primary-button"} disabled={!ready} onClick={() => updateStatus(status === "reviewed" ? "unreviewed" : "reviewed")} aria-pressed={status === "reviewed"}>{status === "reviewed" ? "✓ Reviewed · Undo" : "Mark as reviewed"}</button>
      <button className="secondary-button" disabled={!ready} onClick={() => updateStatus(status === "followup" ? "unreviewed" : "followup")} aria-pressed={status === "followup"}>{status === "followup" ? "Remove follow-up" : "Needs follow-up"}</button>
    </div>
    <label className="note-label" htmlFor="review-note">Recruiter notes <span>Only on this device</span></label>
    <textarea id="review-note" rows={3} maxLength={5000} value={note} disabled={!ready} placeholder="Add observations, questions, or next steps…" onChange={(event) => { onDraft(candidateId, event.target.value); setMessages((current) => ({ ...current, [candidateId]: "" })); }}/>
    <div className="note-footer"><span role="status">{dirty ? "Unsaved changes" : messages[candidateId] || (review?.updatedAt ? "Saved on this device" : "Notes are not shared with your team")}</span><button className="save-note" disabled={!ready || !dirty} onClick={() => {
      if (onSave(candidateId, { note })) setMessages((current) => ({ ...current, [candidateId]: "Note saved on this device" }));
    }}>Save note</button></div>
    {error && <p className="save-error" role="alert">{error}</p>}
  </section>;
}
