# SkillLens — Product Requirements Document
### Techkriti '26 × Eightfold AI · Hackathon Edition · v5.0

---

## 1. What It Is

SkillLens is a **Talent Intelligence system** built for the post-resume era. It defeats AI-spam applications by surfacing verified capability signals directly from a developer's public GitHub — extracting real project complexity, language usage, and skill evidence — then letting recruiters have a grounded AI conversation about any candidate without needing to read a single line of code.

**Impact Area targeted: Area 01 — Signal Extraction & Verification**

> "Build a system that surfaces genuine evidence of a candidate's abilities through sources beyond their resume — open-source contributions, project histories, problem-solving traces."

SkillLens directly addresses this by treating GitHub as the primary signal source and the resume as a secondary corroboration layer — not the other way around.

---

## 2. The Problem

The modern hiring pipeline has two simultaneous failures:

**The AI-Spam Flood** — Generative AI has made it trivial to produce perfectly optimised, largely synthetic resumes. Recruiters cannot distinguish genuine competence signals from polished noise.

**Skill Half-Life Collapse** — The average technical skill becomes obsolete in under 2.5 years. Matching static credentials to static job descriptions is fundamentally backward-looking.

The result: hiring systems need to verify actual human capability from real-world artefacts — not parse PDFs.

SkillLens solves this by:
- Pulling verified, tamper-resistant signals from public GitHub activity
- Scoring candidates against real evidence (commits, repos, README complexity, language usage)
- Making every AI score **explainable** — "We believe this candidate has React skill because it appears in 7 repos with a combined complexity score of 74"
- Letting a non-technical recruiter have an intelligent, grounded conversation about any candidate in under 60 seconds

---

## 3. Goals

1. Analyze any public GitHub profile in under 3 seconds
2. Extract skills from repositories and README files automatically
3. Compute an explainable Potential Score (0–100) with a visible per-signal breakdown
4. Generate a plain-English explainability report: *"We believe this candidate has X skill because of Y"*
5. Let recruiters chat with an AI agent — answers grounded entirely in GitHub + resume data
6. Let developers self-assess their own profile via a stateless Q&A agent
7. Show skills visually on a radar chart
8. Compare two developers side-by-side
9. Export a one-page portfolio PDF per candidate

---

## 4. Users

**Recruiter** — enters a GitHub username, optionally uploads a resume, then asks the AI anything about the candidate. Wants plain-English answers with cited evidence, not raw stats.

**Hiring Manager** — wants to compare two candidates directly and ask the AI to explain the difference.

**Developer (indirect)** — their public GitHub and resume become their profile. Can use the Q&A Agent to understand how their profile reads to a hiring system before a recruiter sees it.

---

## 5. Features

### Phase 1 — Profile Viewer (Hours 1–2)

*Priority: nail the data pipeline first. UI comes after extraction works.*

| Feature | What it does |
|---|---|
| GitHub Username Search | Input a username, fetch public profile from GitHub API |
| Developer Profile Card | Avatar, name, bio, followers, public repos, total stars, account age |
| Repository Explorer | List all public repos: name, description, language, stars, forks, last updated |
| Filter & Sort | Filter by language or keyword; sort by stars, forks, recency, alphabetical |
| Dark / Light Theme | System-aware toggle; preference saved in localStorage |

### Phase 2 — Intelligence & Scoring (Hours 2–4)

*Priority: skill extraction + scoring logic must be solid before touching the AI agent.*

| Feature | What it does |
|---|---|
| Language Distribution Chart | Donut chart of language breakdown across all repos |
| README Skill Extraction | Regex keyword scan of READMEs to detect technologies and frameworks |
| Repository Complexity Score | 0–100 per repo: stars + forks + size + description + recency |
| Skill Aggregation | Deduplicate and merge skills across all repos; compute confidence per skill |
| Potential Score | Weighted 0–100 from GitHub signals with per-signal breakdown (see Section 6) |
| **Explainability Report** | Plain-English summary: which skills were found, in which repos, with what confidence — *"React detected in 7 repos (confidence: 92%) — strongest signal: ecommerce-app, blog-platform"* |
| Skill Radar Chart | Spider chart — 6 axes: Frontend, Backend, DevOps, Database, Mobile, Testing |
| Profile Storage | Save analyzed profiles to Supabase for AI agent to query |

### Phase 3 — AI Hiring Agent (Hours 4–5)

| Feature | What it does |
|---|---|
| Resume Upload | Recruiter uploads candidate PDF; text extracted and stored in Supabase |
| AI Candidate Agent | Chat interface — recruiter asks questions, Gemini answers grounded in GitHub + resume |
| Grounded Responses | AI answers only from the candidate's actual data — no hallucinated skills |
| Explainability by Default | Every AI response cites the specific repo or resume line that supports the claim |
| Conversation History | Chat history persisted per candidate session |
| Suggested Questions | Pre-built chips to help recruiters get started |

### Phase 4 — AI Profile Q&A Agent

A stateless, self-serve AI assistant embedded on every profile page. Available immediately after profile load — no resume upload required.

| Feature | What it does |
|---|---|
| Instant Q&A | Floating chat panel on any profile — no upload needed |
| GitHub-Only Mode | Operates on public GitHub data alone; auto-upgrades if resume is present |
| Developer Self-Assessment | Developers understand how their GitHub reads to a hiring system |
| Role Fit Queries | "Would I fit a backend role at a startup?" — verdict grounded in repo + skill data |
| Gap Analysis | "What skills am I missing for a senior DevOps role?" — gaps against target role |
| Skill Explainability | "Why is my Frontend score 68?" — agent explains exactly which repos and keywords drove it |
| Stateless per Visit | No persistence — conversation lives only for the page visit |

**How it differs from the Hiring Agent:**

| | AI Hiring Agent | Q&A Agent |
|---|---|---|
| Primary user | Recruiter | Developer or Recruiter |
| Resume required | Yes | No (optional) |
| Persisted | Yes, Supabase | No, in-memory |
| Focus | Deep hiring evaluation | Self-assessment, gap analysis, explainability |

### Phase 5 — Export & Compare (Hours 5–6)

| Feature | What it does |
|---|---|
| Developer Comparison | Side-by-side with stat differentials and overlapping radar chart |
| Portfolio PDF Export | One-page PDF: profile + skills + top 3 repos + Potential Score + explainability summary |

---

## 6. Potential Score Logic

Fully computable from GitHub API data alone. Every signal is shown to the user — no black box.

| Signal | Weight | How it's measured |
|---|---|---|
| Repo volume | 20% | Public repos count, capped at 30 |
| Star count | 20% | Total stars across all repos, capped at 500 |
| Language diversity | 20% | Number of distinct languages used |
| Skill count | 20% | Unique skills detected from README files |
| Account activity | 20% | Repos updated in last 90 days / total repos |

**Score labels:**
- 0–20 → Beginner · 21–40 → Emerging · 41–60 → Developing · 61–80 → Proficient · 81–100 → Expert

**Score breakdown panel** (always shown alongside the score):
```
Potential Score: 74 / 100  (Proficient)

  Repo Volume      ████████████████░░░░  16/20
  Star Count       ██████████████░░░░░░  14/20
  Language Diversity ██████████████████░░  18/20
  Skill Count      ████████████████████  20/20
  Account Activity ██████░░░░░░░░░░░░░░   6/20
```

This breakdown is the core explainability layer for the Potential Score — judges will look for this.

---

## 7. Skill Extraction & Explainability

Regex keyword scan against a hardcoded taxonomy. Fast, deterministic, fully explainable.

| Category | Keywords |
|---|---|
| Frontend | React, Next.js, Vue, Angular, Svelte, TypeScript, TailwindCSS, HTML, CSS, Vite |
| Backend | Node.js, Express, FastAPI, Django, Flask, Spring, Laravel, GraphQL, REST, tRPC |
| Database | PostgreSQL, MySQL, MongoDB, Redis, Supabase, Firebase, SQLite, Prisma |
| DevOps | Docker, Kubernetes, GitHub Actions, AWS, GCP, Vercel, Netlify, CI/CD, Linux |
| Mobile | React Native, Flutter, Swift, Kotlin, Expo |
| Testing | Jest, Vitest, Cypress, Playwright, pytest, Testing Library |

Each skill gets a confidence score (0–1) based on `repo_count / total_repos`.

**Explainability output per skill (shown in UI and cited in AI responses):**
```
React         ████████████████████  confidence: 92%  found in: 7 repos
              └─ ecommerce-app, blog-platform, portfolio-v2, ...

Docker        ████████████░░░░░░░░  confidence: 58%  found in: 3 repos
              └─ devops-demo, k8s-playground, api-service
```

---

## 8. AI Agents — How They Work

### Hiring Agent

Recruiter-facing. Resume-aware. Conversation persisted.

System prompt grounded in candidate data:

```
You are a technical hiring assistant. Answer ONLY from the candidate data below.
Do not invent skills or experience. Cite specific repos or resume lines as evidence.
Keep responses to 3–5 sentences. If you cannot answer from the data, say so.

--- CANDIDATE DATA ---
GitHub: {username} | Score: {score}/100 ({label}) | Repos: {repo_count} | Stars: {total_stars}
Skills: {skills_with_confidence_and_repo_list}
Top Repos: {top_5_repos_with_complexity_and_description}
Languages: {language_percentages}
Resume: {extracted_resume_text}
--- END ---
```

Suggested chips: "Top 3 strengths" · "Best role fit" · "Any red flags?" · "Frontend strength" · "Resume vs GitHub match"

### Q&A Agent

Developer-facing. GitHub-only by default. Stateless.

```
You are an AI profile assistant for a developer's public GitHub.
Answer ONLY from the GitHub data below. Do not invent skills or scores.
When asked about role fit or gaps, reason from detected skill categories.

--- GITHUB DATA ---
GitHub: {username} | Score: {score}/100 ({label}) | Repos: {repo_count}
Skills: {skills_with_confidence}
Top Repos: {top_5_repos}
Languages: {language_percentages}
--- END ---
```

Suggested chips: "My strongest skills" · "Roles that suit this profile" · "Skills missing for a senior role" · "Why is my score X?" · "What would improve my score?"

---

## 9. Explainability — First-Class Feature

Explainability is 20% of the judging rubric and a non-negotiable requirement per the problem statement. It is built into every layer of SkillLens — not added at the end.

| Layer | How explainability is delivered |
|---|---|
| Potential Score | Per-signal breakdown bar always shown alongside the number |
| Skill detection | Each skill shows confidence %, repo count, and repo names |
| AI responses | Every answer cites the specific repo or resume line it's drawing from |
| PDF export | Explainability summary included on the one-page portfolio |
| Q&A Agent | "Why is my score X?" directly explains the breakdown in plain English |

**Minimum explainability bar (from problem statement):**
> "At minimum: show which skills matched, which were missing, and what confidence score was assigned."

SkillLens exceeds this — it shows which specific repos drove each skill signal.

---

## 10. Data Sources

| Source | What is fetched |
|---|---|
| GitHub REST API `/users/{username}` | Avatar, name, bio, followers, public_repos, created_at |
| GitHub REST API `/users/{username}/repos` | All public repos: name, description, language, stars, forks, updated_at, size |
| GitHub REST API `/repos/{owner}/{repo}/readme` | README content (base64 decoded) for skill extraction |
| Uploaded PDF resume | Text extracted server-side using pdf-parse |
| Supabase | Candidate profiles, resume text, Hiring Agent chat history |
| Gemini 1.5 Flash | AI responses grounded in candidate context |

---

## 11. Core Data Shape

```ts
type Developer = {
  id: string
  username: string
  avatar_url: string
  name: string | null
  bio: string | null
  followers: number
  public_repos: number
  total_stars: number
  created_at: string
  potential_score: number           // 0–100
  potential_label: PotentialLabel
  score_breakdown: ScoreBreakdown   // Per-signal breakdown for explainability
  skills: Skill[]
  languages: Language[]
  repos: Repo[]
  resume_text: string | null
  analyzed_at: string
}

type ScoreBreakdown = {
  repo_volume: number         // 0–20
  star_count: number          // 0–20
  language_diversity: number  // 0–20
  skill_count: number         // 0–20
  account_activity: number    // 0–20
}

type Repo = {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  updated_at: string
  size: number
  complexity_score: number    // 0–100
  skills_detected: string[]
}

type Skill = {
  name: string
  category: SkillCategory
  confidence: number          // 0–1
  repo_count: number
  source_repos: string[]      // Repo names where this skill was detected — drives explainability
}

type ChatMessage = {
  id: string
  candidate_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// Q&A Agent only — never persisted
type QAMessage = {
  role: 'user' | 'assistant'
  content: string
}
```

---

## 12. Supabase Schema

```sql
create table candidates (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  profile_data  jsonb not null,
  resume_text   text,
  analyzed_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index candidates_username_idx on candidates (username);

-- Hiring Agent only — Q&A Agent is stateless
create table chat_messages (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  created_at    timestamptz not null default now()
);

create index chat_messages_candidate_idx on chat_messages (candidate_id, created_at);
```

---

## 13. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Profile load time | < 3 seconds for up to 30 repos |
| README fetching | Parallel — all READMEs fetched simultaneously |
| AI response time | < 5 seconds per message |
| GitHub rate limit | Graceful degradation — partial data with warning |
| Resume upload | PDF only, max 5MB |
| Q&A Agent | Available immediately after profile load — no upload required |
| Deployment | Vercel — single command |
| Cost | Zero — Gemini free tier + Supabase free tier |
| Auth | None — no login required |

---

## 14. Judging Alignment

| Criterion | Weight | How SkillLens addresses it |
|---|---|---|
| Problem Depth & Relevance | 25% | Directly targets Impact Area 01 — genuine GitHub signal extraction, not resume parsing |
| Technical Execution | 25% | Working skill extraction, complexity scoring, Gemini AI agent, Supabase persistence |
| Explainability & Fairness | 20% | Per-skill repo citations, score breakdown panel, AI responses with evidence — explainability is first-class, not bolted on |
| Innovation | 15% | Dual-agent architecture (Hiring Agent + Q&A Agent); confidence-weighted skill extraction with repo-level attribution |
| Demo & Communication | 15% | Live GitHub username input during demo; judges can paste any username and see results in real time |

---

## 15. Out of Scope

- Python / FastAPI backend (Next.js API routes only)
- spaCy, XGBoost, or any ML model
- Celery, Redis, task queues
- User accounts or authentication
- Stack Overflow / LinkedIn / Dev.to integration
- Skill timeline chart
- Team or org-level features
- Voice input
- Bias/demographic check (Impact Area 04 — out of scope for this build)
- Skill adjacency graph (Impact Area 02 — future work)

---

_SkillLens · Techkriti '26 × Eightfold AI · PRD v5.0 · 2026_