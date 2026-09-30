"use client";

import { useEffect, useMemo, useState } from "react";
import { ReviewWorkspace, useReviews } from "@/components/review-workspace";
import type { ReviewStatus } from "@/lib/reviews";
import { candidates } from "@/data/candidates";
import { job } from "@/data/job";
import { screenCandidates } from "@/lib/screening";
import { analyzeResumeEvidence } from "@/lib/evidence-analyzer";
import type { EvidenceStatus, EvidenceStrength, ScreenedCandidate } from "@/lib/types";

type IconName = "users" | "briefcase" | "flow" | "shield" | "search" | "arrow" | "check" | "clock" | "pin";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a22 22 0 0 0 18 0M12 11v4"/></>,
    flow: <><rect x="8" y="2" width="8" height="6" rx="1"/><rect x="2" y="16" width="7" height="6" rx="1"/><rect x="15" y="16" width="7" height="6" rx="1"/><path d="M12 8v4M5.5 16v-4h13v4"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    arrow: <path d="m9 5 7 7-7 7"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const detailTabs = [ ["evidence", "Evidence overview"], ["competency", "Technical depth"], ["followup", "Interview prep"], ["review", "Review & notes"] ] as const;
type DetailTab = typeof detailTabs[number][0];

type ViewKey = "candidates" | "criteria" | "logic" | "ai" | "boundaries";

const statusLabel: Record<EvidenceStatus, string> = {
  matched: "Evidence found",
  gap: "Gap",
  unknown: "Unclear"
};

const strengthLabel: Record<EvidenceStrength, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  limited: "Limited evidence",
  unclear: "Unclear"
};

const viewMeta: Record<ViewKey, { breadcrumb: string; title: string; description: string }> = {
  candidates: {
    breadcrumb: "Recruiting / Candidate review",
    title: job.title,
    description: job.summary
  },
  criteria: {
    breadcrumb: "Recruiting / Job criteria",
    title: "เกณฑ์การรับสมัคร",
    description: "ดูว่าอะไรเป็น Must-have, Nice-to-have และระบบตีความแต่ละเกณฑ์อย่างไร"
  },
  logic: {
    breadcrumb: "Recruiting / Screening logic",
    title: "ตรรกะการคัดกรอง",
    description: "อธิบาย flow ตั้งแต่ CV → Evidence → Competency → Missing information → Recruiter review"
  },
  ai: {
    breadcrumb: "Recruiting / AI screening",
    title: "AI Screening Lab",
    description: "วางข้อความจาก Resume แล้วให้ระบบช่วยสกัด skill, evidence, technical depth และคำถามที่ควรถามต่อ"
  },
  boundaries: {
    breadcrumb: "Recruiting / AI boundaries",
    title: "ขอบเขตการใช้ AI",
    description: "กำหนดว่าส่วนไหน AI ช่วยได้ ส่วนไหนไม่ควรใช้ตัดสิน และอะไรต้องให้ recruiter ตรวจสอบ"
  }
};

function StatusPill({ status }: { status: EvidenceStatus }) {
  return <span className={`status-pill status-${status}`}>{statusLabel[status]}</span>;
}

function GroupPill({ group }: { group: ScreenedCandidate["group"] }) {
  const className =
    group === "Strong evidence"
      ? "group-strong"
      : group === "Clarification needed"
        ? "group-clarify"
        : "group-partial";

  return <span className={`group-pill ${className}`}>{group}</span>;
}

function StrengthPill({ strength }: { strength: EvidenceStrength }) {
  return (
    <span className={`strength-pill strength-${strength}`}>
      {strengthLabel[strength]}
    </span>
  );
}

export default function Home() {
  const screened = useMemo(() => screenCandidates(candidates), []);
  const [activeView, setActiveView] = useState<ViewKey>("candidates");
  const [selectedId, setSelectedId] = useState(screened[0].id);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const [reviewFilter, setReviewFilter] = useState<"all" | ReviewStatus>("all");
  const [resumeText, setResumeText] = useState(`Full-Stack Developer with 2 years of production experience.
Built React and TypeScript web applications and Node.js/NestJS REST APIs.
Designed PostgreSQL schemas and implemented Redis caching.
Owned an order-processing service end-to-end and deployed it to production.
Reduced API response time from 1.8s to 450ms.
Built an internal RAG assistant using OpenAI API and pgvector.
Worked with GitHub pull requests, code review and GitHub Actions.
Portfolio: github.com/example-developer`);
  const [analysisText, setAnalysisText] = useState(resumeText);
  const evidenceAnalysis = useMemo(() => analyzeResumeEvidence(analysisText), [analysisText]);

  // AI/LLM integration is intentionally parked for now.
  // The previous OpenAI API route is kept in the project for later re-enabling,
  // while this prototype uses the deterministic local evidence analyzer.
  const { reviews, ready, error, save } = useReviews();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const hasUnsavedNotes = Object.entries(drafts).some(([id, note]) => note !== (reviews[id]?.note ?? ""));
  useEffect(() => {
    if (!hasUnsavedNotes) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasUnsavedNotes]);
  const reviewedCount = screened.filter((candidate) => reviews[candidate.id]?.status === "reviewed").length;
  const followupCount = screened.filter((candidate) => reviews[candidate.id]?.status === "followup").length;

  const [detailTab, setDetailTab] = useState<DetailTab>("evidence");

  const filtered = screened.filter((candidate) => {
    const query = search.trim().toLowerCase();
    const searchMatch =
      !query ||
      candidate.name.toLowerCase().includes(query) ||
      candidate.headline.toLowerCase().includes(query) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(query));

    const groupMatch = groupFilter === "All" || candidate.group === groupFilter;
    return searchMatch && groupMatch && (reviewFilter === "all" || (reviews[candidate.id]?.status ?? "unreviewed") === reviewFilter);
  });

  const selected = filtered.find((candidate) => candidate.id === selectedId) ?? filtered[0];
  const currentView = viewMeta[activeView];

  return (
    <main className="app-shell">
      <a className="skip-link" href="#workspace">Skip to workspace</a>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <div className="brand-name">Remuse</div>
            <div className="brand-subtitle">Recruiting workspace</div>
          </div>
        </div>

        <div className="workspace-label">Workspace</div>
        <nav className="nav" aria-label="Main navigation">
          {([
            ["candidates", "Candidate review", "users"],
            ["criteria", "Job criteria", "briefcase"],
            ["logic", "Screening logic", "flow"],
            ["ai", "AI screening", "search"],
            ["boundaries", "AI boundaries", "shield"]
          ] as const).map(([view, label, icon]) => (
            <button key={view} className={`nav-item ${activeView === view ? "active" : ""}`} aria-current={activeView === view ? "page" : undefined} onClick={() => setActiveView(view)}>
              <Icon name={icon}/><span>{label}</span>{view === "candidates" && <span className="nav-count">{screened.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <Icon name="shield" size={22}/>
          <strong>Evidence first.</strong>
          <p>AI structures evidence and gaps. A recruiter owns the hiring decision.</p>
        </div>
        <div className="workspace-footer"><div className="team-avatar">R</div><div><strong>Remuse team</strong><span>Hiring workspace</span></div></div>
      </aside>

      <section className="workspace" id="workspace" tabIndex={-1}>
        <div className="workspace-bar"><div><Icon name="briefcase" size={16}/><span>{currentView.breadcrumb}</span></div><span className="demo-badge"><span className="live-dot"/> Sample workspace <span className="demo-divider">/</span> Device only</span></div>
        <header className="topbar">
          <div>
            <div className="job-label">{activeView === "candidates" ? "Engineering hiring" : "Screening guide"}</div>
            <h1>{currentView.title}</h1>
            <p>{activeView === "candidates" ? "A clearer view of every candidate. Review the evidence, then decide what comes next." : currentView.description}</p>
          </div>

          {activeView === "candidates" ? (
            <button className="secondary-button" onClick={() => setActiveView("criteria")}>
              <Icon name="briefcase" size={16}/> View job criteria <Icon name="arrow" size={14}/>
            </button>
          ) : (
            <button className="secondary-button" onClick={() => setActiveView("candidates")}>
              Back to candidate review
            </button>
          )}
        </header>

        {activeView === "candidates" && (
          <>
            <section className="review-overview" aria-label="Review progress">
              <div className="progress-copy"><span className="progress-icon"><Icon name="users" size={23}/></span><div><strong>Your review workspace</strong><p>{ready ? `${reviewedCount} of ${screened.length} profiles reviewed` : "Loading saved reviews…"}</p></div></div>
              <div className="progress-track"><progress max={screened.length} value={reviewedCount} aria-label="Profiles reviewed"/><span>{Math.round(reviewedCount / screened.length * 100)}% complete</span></div>
              <div className="progress-stat"><strong>{screened.length - reviewedCount}</strong><span>To review</span></div>
              <div className="progress-stat"><strong>{followupCount}</strong><span>Follow-up</span></div>
            </section>
            <div className="review-filter-tabs" role="group" aria-label="Filter by review status">
              {([["all", "All candidates", screened.length], ["unreviewed", "Not reviewed", screened.length - reviewedCount - followupCount], ["followup", "Follow-up", followupCount], ["reviewed", "Reviewed", reviewedCount]] as const).map(([key, label, count]) => <button key={key} className={reviewFilter === key ? "active" : ""} aria-pressed={reviewFilter === key} onClick={() => setReviewFilter(key)} disabled={!ready}>{label}<span>{count}</span></button>)}
            </div>

            <section className="content-grid">
              <div className="candidate-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Candidates <span className="inline-count">{screened.length}</span></h2>
                    <p>Select a profile to review</p>
                  </div>
                  <Icon name="users"/>
                </div>

                <div className="filters">
                  <label className="search-field"><Icon name="search" size={17}/><input
                    aria-label="Search candidates"
                    placeholder="Search candidate or skill…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  /></label>
                  <select
                    aria-label="Filter by evidence group"
                    value={groupFilter}
                    onChange={(event) => setGroupFilter(event.target.value)}
                  >
                    <option value="All">All evidence groups</option>
                    <option>Strong evidence</option>
                    <option>Partial evidence</option>
                    <option>Clarification needed</option>
                  </select>
                </div>

                <div className="queue-meta" aria-live="polite"><span>{filtered.length} of {screened.length} candidates</span><span>Evidence-based review</span></div>
                <div className="candidate-list">
                  {filtered.length === 0 && <div className="empty-state"><Icon name="search" size={28}/><h3>No candidates found</h3><p>Try another name, skill or evidence group.</p><button className="secondary-button" onClick={() => { setSearch(""); setGroupFilter("All"); setReviewFilter("all"); }}>Clear filters</button></div>}
                  {filtered.map((candidate) => (
                    <button
                      key={candidate.id}
                      className={`candidate-row ${candidate.id === selected?.id ? "selected" : ""}`}
                      aria-pressed={candidate.id === selected?.id}
                      onClick={() => setSelectedId(candidate.id)}
                    >
                      <div className={`avatar avatar-tone-${candidate.id.slice(-1)}`}>{candidate.name.split(" ").map((part) => part[0]).join("")}</div>
                      <div className="candidate-copy">
                        <div className="candidate-title-line">
                          <strong>{candidate.name}</strong>
                          <span className={`row-review-status review-${reviews[candidate.id]?.status ?? "unreviewed"}`}>{reviews[candidate.id]?.status === "reviewed" ? "✓ Reviewed" : reviews[candidate.id]?.status === "followup" ? "Follow-up" : `${candidate.experienceYears.toFixed(1)} yrs`}</span>
                        </div>
                        <p>{candidate.headline}</p>
                        <div className="tag-row">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <span className="skill-tag" key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="candidate-meta">
                        <GroupPill group={candidate.group} />
                        <span>{candidate.matchedHard}/{candidate.hardChecks.length} criteria evidenced</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selected ? <div className="detail-panel">
                <div className="detail-toolbar"><span><span className="profile-indicator"/> Candidate profile</span><div className="profile-toolbar-actions"><span>{selected.id}</span><button className="primary-button" onClick={() => setDetailTab("review")}>Write review <Icon name="arrow" size={14}/></button></div></div>
                <div className="detail-header">
                  <div className={`avatar avatar-large avatar-tone-${selected.id.slice(-1)}`}>{selected.name.split(" ").map((part) => part[0]).join("")}</div>
                  <div className="detail-identity">
                    <div className="detail-title-row">
                      <div>
                        
                        <h2>{selected.name}</h2>
                      </div>
                      <GroupPill group={selected.group} />
                    </div>
                    <p>{selected.headline}</p>
                    <div className="meta-row">
                      <span><Icon name="pin" size={14}/>{selected.location}</span>
                      <span><Icon name="briefcase" size={14}/>{selected.experienceYears.toFixed(1)} years experience</span>
                      <span><Icon name="clock" size={14}/>Available in {selected.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-summary">
                  <div className="summary-evidence"><span className="evidence-number">{selected.matchedHard}<small>/{selected.hardChecks.length}</small></span><span>Must-have criteria<br/>with evidence</span></div>
                  <div className="summary-highlight"><strong>At a glance</strong><p>{selected.highlights[0] || "Review the documented experience and open questions below."}</p><span>{selected.unknownHard} unclear <span aria-hidden="true">/</span> {selected.gapHard} gaps to explore</span></div>
                </div>
                <div className="decision-note"><Icon name="shield" size={16}/><span>Evidence supports your review. Hiring decisions stay with your team.</span></div>

                <nav className="detail-tabs" aria-label="Candidate details">
                  {detailTabs.map(([key, label]) => <button key={key} aria-pressed={detailTab === key} className={detailTab === key ? "active" : ""} onClick={() => setDetailTab(key)}>{label}{key === "followup" && <span>{selected.missingInformation.length}</span>}</button>)}
                </nav>
                <div hidden={detailTab !== "review"}><ReviewWorkspace candidateId={selected.id} candidateName={selected.name} review={reviews[selected.id]} ready={ready} error={error} drafts={drafts} onDraft={(id, note) => setDrafts((current) => ({ ...current, [id]: note }))} onSave={save}/></div>
                <section className="detail-section" hidden={detailTab !== "evidence"}>
                  <div className="section-title">
                    <div>
                      
                      <h3>Must-have evidence</h3>
                    </div>
                    <span className="section-summary">
                      {selected.matchedHard} matched · {selected.unknownHard} unclear · {selected.gapHard} gaps
                    </span>
                  </div>

                  <div className="evidence-meter" aria-label={`${selected.matchedHard} of ${selected.hardChecks.length} criteria evidenced`}>
                    {selected.hardChecks.map((check) => <span className={`meter-${check.status}`} key={check.id} title={`${check.label}: ${statusLabel[check.status]}`}/>)}
                  </div>
                  <div className="criteria-list">
                    {selected.hardChecks.map((check) => (
                      <article className="criterion" key={check.id}>
                        <div className="criterion-top">
                          <strong>{check.label}</strong>
                          <StatusPill status={check.status} />
                        </div>
                        <p>{check.evidence}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="detail-section" hidden={detailTab !== "competency"}>
                  <div className="section-title">
                    <div>
                      
                      <h3>Technical competency evidence</h3>
                    </div>
                    <span className="section-summary">
                      ดูคุณภาพของประสบการณ์ ไม่ใช่แค่ keyword หรือจำนวนปี
                    </span>
                  </div>

                  {selected.competencies.map((competency) => (
                    <article className="competency-card" key={competency.skill}>
                      <div className="competency-head">
                        <div>
                          <span className="eyebrow">Skill competency</span>
                          <h4>{competency.skill}</h4>
                        </div>
                        <div className="years-chip">{competency.years.toFixed(1)} years</div>
                      </div>

                      <div className="competency-grid">
                        {competency.dimensions.map((dimension) => (
                          <div className="competency-row" key={dimension.id}>
                            <div className="competency-label">{dimension.label}</div>
                            <StrengthPill strength={dimension.strength} />
                            <p>{dimension.evidence}</p>
                          </div>
                        ))}
                      </div>

                      <div className="evidence-columns">
                        <div className="evidence-box">
                          <span className="callout-label">Evidence from CV</span>
                          <ul>
                            {competency.evidence.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="evidence-box evidence-box-warning">
                          <span className="callout-label">Missing / unclear evidence</span>
                          <ul>
                            {competency.missing.length > 0 ? (
                              competency.missing.map((item) => <li key={item}>{item}</li>)
                            ) : (
                              <li>No major evidence gaps detected for this skill.</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="interview-box">
                        <div>
                          <span className="eyebrow">Suggested validation questions</span>
                          <strong>ถามต่อเฉพาะจุดที่ CV ยังพิสูจน์ไม่ได้</strong>
                        </div>
                        <ol>
                          {competency.interviewQuestions.length > 0 ? (
                            competency.interviewQuestions.map((question) => (
                              <li key={question}>{question}</li>
                            ))
                          ) : (
                            <li>ขอให้ผู้สมัครอธิบาย project ที่แสดง ownership และ technical depth เพิ่มเติม</li>
                          )}
                        </ol>
                      </div>
                    </article>
                  ))}
                </section>

                <section className="detail-section" hidden={detailTab !== "evidence"}>
                  <div className="section-title">
                    <div>
                      
                      <h3>Nice-to-have signals</h3>
                    </div>
                  </div>
                  <div className="soft-grid">
                    {selected.softMatches.map((match) => (
                      <article className="soft-card" key={match.id}>
                        <div className="soft-top">
                          <strong>{match.label}</strong>
                          <span className={`soft-state soft-${match.status}`}>{match.status}</span>
                        </div>
                        <p>{match.evidence}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="detail-section" hidden={detailTab !== "followup"}>
                  <div className="section-title">
                    <div>
                      
                      <h3>Recruiter follow-up</h3>
                    </div>
                  </div>

                  <div className="followup-grid">
                    <article className="callout">
                      <span className="callout-label">Strong evidence</span>
                      <ul>
                        {selected.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </article>
                    <article className="callout callout-warning">
                      <span className="callout-label">Clarify before deciding</span>
                      <ul>
                        {selected.missingInformation.length > 0 ? (
                          selected.missingInformation.map((item) => <li key={item}>{item}</li>)
                        ) : (
                          <li>No material evidence gaps detected in the mock profile.</li>
                        )}
                      </ul>
                    </article>
                  </div>
                </section>

                <section className="boundary-card">
                  <div>
                    <span className="eyebrow">AI boundary</span>
                    <h3>What this prototype intentionally does not use</h3>
                  </div>
                  <p>
                    Age, gender, religion, ethnicity, photo, disability, family status and other protected
                    or sensitive traits are excluded. Missing data is surfaced as unclear rather than guessed.
                  </p>
                </section>
              </div> : <div className="detail-panel detail-empty"><Icon name="users" size={36}/><h2>Your next review starts here</h2><p>Adjust your filters to find a candidate and explore their evidence.</p></div>}
            </section>
          </>
        )}

        {activeView === "criteria" && (
          <section className="view-page">
            <div className="criteria-columns">
              <article className="page-panel">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">Required evidence</span>
                    <h2>Must-have criteria</h2>
                  </div>
                  <span className="count-badge">{job.mustHave.length} criteria</span>
                </div>
                <div className="criteria-page-list">
                  {job.mustHave.map((criterion, index) => (
                    <div className="criteria-page-row" key={criterion}>
                      <span className="criteria-number">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{criterion}</strong>
                        <p>
                          ระบบต้องหา evidence ที่เกี่ยวข้องจาก CV; ถ้าข้อมูลไม่พอให้เป็น Unclear แทนการเดา
                        </p>
                      </div>
                      <span className="criteria-type required">Must-have</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="page-panel">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">Additional signals</span>
                    <h2>Nice-to-have criteria</h2>
                  </div>
                  <span className="count-badge">{job.niceToHave.length} criteria</span>
                </div>
                <div className="criteria-page-list">
                  {job.niceToHave.map((criterion, index) => (
                    <div className="criteria-page-row" key={criterion}>
                      <span className="criteria-number">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{criterion}</strong>
                        <p>ใช้เป็นข้อมูลประกอบ ไม่ควรทำให้ผู้สมัครถูกตัดออกโดยอัตโนมัติ</p>
                      </div>
                      <span className="criteria-type optional">Nice-to-have</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article className="page-panel">
              <div className="page-panel-head">
                <div>
                  <span className="eyebrow">Interpretation rules</span>
                  <h2>ระบบตีความเกณฑ์อย่างไร</h2>
                </div>
              </div>
              <div className="rule-grid">
                <div className="rule-card">
                  <strong>Evidence found</strong>
                  <p>มีข้อความหรือประสบการณ์ใน CV ที่สนับสนุนเกณฑ์โดยตรง</p>
                </div>
                <div className="rule-card">
                  <strong>Unclear</strong>
                  <p>ข้อมูลไม่พอ เช่น CV ไม่ระบุ English level หรือไม่บอกบทบาทที่ทำจริง</p>
                </div>
                <div className="rule-card">
                  <strong>Gap</strong>
                  <p>มีข้อมูลชัดเจนว่าประสบการณ์ที่ระบุยังไม่ตรงกับเกณฑ์นั้น</p>
                </div>
                <div className="rule-card">
                  <strong>Transferable evidence</strong>
                  <p>ดูความหมายของประสบการณ์ เช่น Express/NestJS อาจสะท้อน backend API skill แม้ keyword ไม่ตรง</p>
                </div>
              </div>
            </article>
          </section>
        )}

        {activeView === "logic" && (
          <section className="view-page">
            <article className="page-panel">
              <div className="page-panel-head">
                <div>
                  <span className="eyebrow">Screening pipeline</span>
                  <h2>จาก Resume ไปสู่ Recruiter Review</h2>
                </div>
              </div>

              <div className="logic-flow">
                {[
                  ["01", "Parse candidate", "ดึง skill, experience, project, language, portfolio และหลักฐานจาก CV"],
                  ["02", "Must-have evidence", "ตรวจทีละเกณฑ์เป็น Evidence found / Gap / Unclear"],
                  ["03", "Competency depth", "ดู production, complexity, ownership, debugging, performance, testing, architecture"],
                  ["04", "Nice-to-have signals", "มอง domain หรือประสบการณ์เสริมโดยไม่ใช้เป็น automatic reject"],
                  ["05", "Missing evidence", "ระบุสิ่งที่ CV ยังไม่ตอบ และสร้างคำถามสำหรับ interview"],
                  ["06", "Recruiter review", "HR ตรวจหลักฐานและตัดสินใจว่าจะถามต่อหรือดำเนินการขั้นถัดไป"]
                ].map(([step, title, description]) => (
                  <div className="logic-step" key={step}>
                    <div className="logic-step-number">{step}</div>
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="criteria-columns">
              <article className="page-panel">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">Competency depth</span>
                    <h2>ทำไมไม่ดูแค่จำนวนปี</h2>
                  </div>
                </div>
                <div className="logic-list">
                  <div><strong>Production exposure</strong><span>เคยใช้จริงในระบบ production แค่ไหน</span></div>
                  <div><strong>Problem complexity</strong><span>โจทย์ที่แก้มีความซับซ้อนระดับใด</span></div>
                  <div><strong>Ownership</strong><span>ทำตาม task หรือเป็นคนออกแบบ/ตัดสินใจเอง</span></div>
                  <div><strong>Debugging</strong><span>มีหลักฐานการแก้ production incident หรือ root cause หรือไม่</span></div>
                  <div><strong>Performance</strong><span>มี scale, latency, throughput หรือ measurable impact หรือไม่</span></div>
                  <div><strong>Testing</strong><span>มี testing discipline และ quality practice หรือไม่</span></div>
                  <div><strong>Architecture</strong><span>มี design ownership ของ service/schema/workflow หรือไม่</span></div>
                </div>
              </article>

              <article className="page-panel">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">Current grouping</span>
                    <h2>Candidate grouping</h2>
                  </div>
                </div>
                <div className="group-explanation">
                  <div>
                    <span className="group-pill group-strong">Strong evidence</span>
                    <p>ไม่มี Gap และมี Unclear ไม่เกิน 1 ข้อ</p>
                  </div>
                  <div>
                    <span className="group-pill group-partial">Partial evidence</span>
                    <p>มีหลักฐานบางส่วน แต่ยังต้องอ่านรายละเอียดและตรวจเพิ่ม</p>
                  </div>
                  <div>
                    <span className="group-pill group-clarify">Clarification needed</span>
                    <p>มี Unclear อย่างน้อย 2 ข้อ หรือมี Gap ตั้งแต่ 3 ข้อขึ้นไป</p>
                  </div>
                </div>
                <div className="decision-note logic-warning">
                  <strong>Prototype rule</strong>
                  <span>Grouping ใช้เพื่อจัดระเบียบการอ่าน ไม่ใช่ automatic reject หรือคำตัดสินว่าใครเก่งกว่า</span>
                </div>
              </article>
            </div>
          </section>
        )}


        {activeView === "ai" && (
          <section className="view-page">
            <div className="criteria-columns ai-screening-layout">
              <article className="page-panel">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">Resume input</span>
                    <h2>ทดลองวิเคราะห์ Resume</h2>
                  </div>
                  <span className="count-badge">Prototype</span>
                </div>

                <p className="ai-helper">
                  วางข้อความจาก Resume หรือประสบการณ์ทำงานด้านล่าง ระบบจะช่วยสกัดหลักฐานที่เกี่ยวข้องกับเกณฑ์งาน
                  โดยไม่ตัดสินว่าควรจ้างหรือไม่จ้าง
                </p>

                <textarea
                  className="resume-input"
                  aria-label="Resume text for evidence analysis"
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  rows={17}
                  placeholder="Paste resume text here..."
                />

                <div className="ai-actions">
                  <button
                    className="primary-button ai-primary"
                    onClick={() => setAnalysisText(resumeText.trim())}
                    disabled={!resumeText.trim()}
                  >
                    Analyze evidence
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setResumeText("");
                      setAnalysisText("");
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div className="decision-note ai-note">
                  <Icon name="shield" size={16}/>
                  <span>
                    ตอนนี้ใช้ deterministic evidence analyzer ตัวเดิมก่อน ส่วน OpenAI integration ถูกพักไว้ชั่วคราว
                  </span>
                </div>
              </article>

              <article className="page-panel">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">Extracted evidence</span>
                    <h2>ข้อมูลที่ระบบอ่านได้</h2>
                  </div>
                  <span className="count-badge">{evidenceAnalysis.extractedSkills.length} skills</span>
                </div>

                {analysisText.trim() ? (
                  <>
                    <div className="ai-skill-cloud">
                      {evidenceAnalysis.extractedSkills.length > 0 ? (
                        evidenceAnalysis.extractedSkills.map((skill) => (
                          <span className="skill-tag ai-skill" key={skill}>{skill}</span>
                        ))
                      ) : (
                        <p className="ai-empty-copy">ยังไม่พบ skill จากข้อความตัวอย่างนี้</p>
                      )}
                    </div>

                    <div className="ai-findings">
                      {evidenceAnalysis.findings.map((finding) => (
                        <article className="ai-finding" key={finding.label}>
                          <div className="criterion-top">
                            <strong>{finding.label}</strong>
                            <span className={`status-pill status-${finding.status === "found" ? "matched" : "unknown"}`}>
                              {finding.status === "found" ? "Evidence found" : "Unclear"}
                            </span>
                          </div>
                          {finding.evidence.length > 0 ? (
                            <ul>
                              {finding.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}
                            </ul>
                          ) : (
                            <p>ไม่พบหลักฐานชัดเจนในข้อความ Resume ที่ให้มา</p>
                          )}
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="ai-empty-state">
                    <Icon name="search" size={28}/>
                    <h3>ยังไม่มีข้อความให้วิเคราะห์</h3>
                    <p>วาง Resume ทางซ้ายแล้วกด Analyze evidence</p>
                  </div>
                )}
              </article>
            </div>

            {analysisText.trim() && (
              <div className="criteria-columns">
                <article className="page-panel">
                  <div className="page-panel-head">
                    <div>
                      <span className="eyebrow">Technical depth</span>
                      <h2>Competency signals</h2>
                    </div>
                  </div>

                  <div className="competency-grid">
                    {evidenceAnalysis.competencies.map((item) => (
                      <div className="competency-row" key={item.label}>
                        <div className="competency-label">{item.label}</div>
                        <StrengthPill strength={item.level} />
                        <p>{item.evidence}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="page-panel">
                  <div className="page-panel-head">
                    <div>
                      <span className="eyebrow">Missing evidence</span>
                      <h2>คำถามสำหรับตรวจสอบต่อ</h2>
                    </div>
                  </div>

                  <div className="interview-box ai-interview-box">
                    <div>
                      <span className="eyebrow">Suggested questions</span>
                      <strong>ถามเฉพาะจุดที่ Resume ยังไม่ตอบ</strong>
                    </div>
                    <ol>
                      {evidenceAnalysis.followUpQuestions.length > 0 ? (
                        evidenceAnalysis.followUpQuestions.map((question) => (
                          <li key={question}>{question}</li>
                        ))
                      ) : (
                        <li>ยังไม่พบช่องว่างหลักจากข้อความตัวอย่าง ควรยืนยันรายละเอียดด้วย interview หรือ work sample ต่อไป</li>
                      )}
                    </ol>
                  </div>
                </article>
              </div>
            )}
          </section>
        )}

        {activeView === "boundaries" && (
          <section className="view-page">
            <div className="boundary-columns">
              <article className="page-panel boundary-allow">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">AI can help</span>
                    <h2>สิ่งที่ AI ช่วยได้</h2>
                  </div>
                </div>
                <ul className="boundary-list">
                  <li>สกัด skill, project, experience และ technical evidence จาก CV</li>
                  <li>เชื่อมความหมายของประสบการณ์กับ job criteria แม้ keyword ไม่ตรงกัน</li>
                  <li>แยก Evidence found, Gap และ Unclear</li>
                  <li>วิเคราะห์ technical competency จากหลักฐานที่เขียนไว้</li>
                  <li>ระบุข้อมูลที่ขาดและเสนอคำถามสำหรับ interview</li>
                  <li>จัดโครงสร้างข้อมูลให้ recruiter review ได้เร็วขึ้น</li>
                </ul>
              </article>

              <article className="page-panel boundary-block">
                <div className="page-panel-head">
                  <div>
                    <span className="eyebrow">AI should not decide</span>
                    <h2>สิ่งที่ AI ไม่ควรใช้ตัดสิน</h2>
                  </div>
                </div>
                <ul className="boundary-list">
                  <li>อายุ เพศ เชื้อชาติ ศาสนา รูปถ่าย สถานะครอบครัว หรือข้อมูลอ่อนไหวอื่น</li>
                  <li>เดานิสัย ความฉลาด หรือความสามารถจากชื่อ รูป หรือมหาวิทยาลัย</li>
                  <li>ถือว่าข้อมูลที่ไม่เขียนใน CV เท่ากับไม่มีความสามารถ</li>
                  <li>ตัดผู้สมัครอัตโนมัติเพราะ keyword ไม่ตรง</li>
                  <li>สร้าง overall score ที่ดูแม่นยำแต่ไม่มี evidence รองรับ</li>
                  <li>ตัดสินแทน recruiter ว่าควรจ้างหรือไม่จ้าง</li>
                </ul>
              </article>
            </div>

            <article className="page-panel decision-owner-panel">
              <div>
                <span className="eyebrow">Decision ownership</span>
                <h2>AI = Decision support · Recruiter = Decision maker</h2>
                <p>
                  Prototype นี้ออกแบบให้ AI ช่วยอ่านและจัดหลักฐาน แต่การประเมินขั้นสุดท้ายควรตรวจสอบด้วย
                  interview, work sample หรือ assessment ที่เกี่ยวข้องกับงาน
                </p>
              </div>
              <button className="primary-button" onClick={() => setActiveView("candidates")}>
                Review candidates
              </button>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}
