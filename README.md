# Remuse AI Candidate Screening Prototype

ต้นแบบระบบ AI ช่วยคัดกรองผู้สมัครสำหรับตำแหน่ง Full-Stack / AI Engineer

## เป้าหมาย
ระบบต้องช่วยตอบให้ recruiter เข้าใจได้ว่า:
- ทำไมผู้สมัครคนนี้จึงเหมาะกับงานนี้
- มีหลักฐานอะไรจาก CV สนับสนุน
- มีช่องว่างหรือความเสี่ยงอะไร
- ยังขาดข้อมูลอะไรที่ควรถามเพิ่ม

> ระบบนี้ไม่ควรตัดสินแทน recruiter แบบอัตโนมัติ แต่ควรช่วยจัดโครงสร้างข้อมูลและแสดงเหตุผลประกอบการตัดสินใจ

## Scope Prototype
Input:
- Candidate profile / CV
- Job Description
- Optional candidate/company preference data

Output:
- Hard-filter result
- Soft-match analysis
- Evidence from CV
- Missing information / gaps
- Recommendation summary for recruiter review

## Suggested stack
เพื่อทำ prototype ให้เสร็จภายใน 4-5 ชั่วโมง:
- Next.js + TypeScript
- Tailwind CSS
- Mock JSON data ก่อน
- AI integration แยกไว้ใน service layer เพื่อเปลี่ยน provider ได้ภายหลัง

## Folder structure
```
remuse-ai-candidate-screening/
├── app/                 # pages / routes
├── components/          # reusable UI
├── lib/                 # screening logic / AI adapter
├── data/                # mock candidates + job descriptions
├── docs/
│   └── requirement.md
└── README.md
```

## Screening design
### 1. Hard filters
ใช้เฉพาะเงื่อนไขที่จำเป็นจริง เช่น:
- ประสบการณ์ขั้นต่ำ
- JavaScript / TypeScript
- เคยทำ production web application
- ทำ frontend + backend + API + database
- Git / teamwork
- ภาษาไทยและอังกฤษตามระดับที่ระบุ

ถ้าข้อมูลไม่พอ ให้แสดง `unknown` แทนการตีตก

### 2. Soft matching
วิเคราะห์แบบยืดหยุ่น:
- AI / LLM hands-on experience
- Backend platform / database
- Video-related product
- HR tech / marketplace
- ความใกล้เคียงของประสบการณ์ ไม่อิง keyword อย่างเดียว

### 3. Evidence
ทุกข้อควรมี:
- matched criterion
- evidence text จาก CV
- confidence
- missing information

### 4. Additional information
Candidate:
- career goal
- expected salary
- preferred work style
- technology preference
- management style preference

Company:
- team / manager profile
- work environment
- management style
- culture
- career growth

ข้อมูลเหล่านี้ควรเป็นข้อมูลประกอบ ไม่ใช่ hard reject เว้นแต่ JD ระบุชัด

### 5. AI boundary
AI ควร:
- สกัดข้อมูลจาก CV
- map evidence กับ criteria
- อธิบายข้อดี/ข้อจำกัด
- flag missing data
- ช่วยสรุปให้ recruiter

AI ไม่ควร:
- ตัดสินจากเพศ อายุ เชื้อชาติ ศาสนา รูปถ่าย หรือข้อมูลอ่อนไหว
- เดาคุณลักษณะส่วนตัวที่ไม่มีหลักฐาน
- reject อัตโนมัติจากข้อมูลที่หาย
- ให้คะแนนโดยไม่มี evidence

## Initial prototype flow
```
Candidate + JD
   ↓
CV/JD Parser
   ↓
Hard Filter
   ↓
Soft Match
   ↓
Evidence + Gaps
   ↓
Recruiter Review
```

## Review workspace

- Run `npm run dev -- --port 3001` and open `http://localhost:3001`.
- Search by name or skill and combine evidence groups with review-status filters.
- Use **Write review** to add notes, mark a profile reviewed, or flag follow-up. These are recruiter workflow states, not hiring decisions.
- Notes and review status persist in this browser using `localStorage` (`remuse.reviews.v1`). Changing status also saves the current note. Drafts survive candidate/filter/view switches during the session; leaving with unsaved notes prompts a warning.
- The interface uses sample candidates and deterministic screening rules. It does not upload CVs, call an AI provider, authenticate users, or synchronize review data between devices/team members. Clearing browser storage removes saved reviews.
- Verify with `npm run typecheck`, `npm run build`, and `node --test tests/reviews.test.mjs` (Node.js 22.18+).
