# SkillLens — Project Structure & User Flow
### Techkriti '26 × Eightfold AI · v5.0

---

## 1. Project Structure

```
skilllens/
├── app/
│   ├── page.tsx                        # Home — username search
│   ├── u/[username]/
│   │   └── page.tsx                    # Developer profile page
│   ├── compare/
│   │   └── page.tsx                    # Side-by-side comparison
│   └── api/
│       ├── profile/[username]/route.ts # Fetch + analyze GitHub profile; compute score + breakdown
│       ├── readme/route.ts             # Batch README fetch + skill extraction (parallel)
│       ├── resume/route.ts             # Upload PDF, extract text, store in Supabase
│       ├── chat/route.ts               # Hiring Agent — Gemini + Supabase persistence
│       └── qa/route.ts                 # Q&A Agent — stateless Gemini call, no DB
│
├── components/
│   ├── profile/
│   │   ├── ProfileCard.tsx             # Avatar, stats, Potential Score badge
│   │   ├── ScoreBreakdown.tsx          # Per-signal breakdown bars (explainability panel)
│   │   ├── RepoExplorer.tsx            # Repo list with filter + sort
│   │   └── PotentialBadge.tsx          # Score badge with tier color + label
│   ├── charts/
│   │   ├── RadarChart.tsx              # D3 skill radar — 6 axes
│   │   ├── LanguageDonut.tsx           # Recharts donut
│   │   └── SkillBars.tsx              # Skill confidence bars with source repo tooltip
│   ├── agent/
│   │   ├── ChatPanel.tsx              # Hiring Agent chat UI
│   │   ├── ChatMessage.tsx            # Message bubble
│   │   ├── SuggestedQuestions.tsx     # Question chips
│   │   └── ResumeUpload.tsx           # PDF upload dropzone
│   ├── qa/
│   │   └── QAPanel.tsx                # Q&A Agent — stateless chat, in-memory only
│   ├── compare/
│   │   └── CompareView.tsx            # Side-by-side layout with skill diff
│   ├── pdf/
│   │   └── PortfolioPDF.tsx           # @react-pdf/renderer — includes explainability summary
│   └── ui/                            # shadcn/ui components
│
├── lib/
│   ├── github.ts                      # GitHub API fetch functions
│   ├── scoring.ts                     # calculateScore() + getScoreBreakdown()
│   ├── skills.ts                      # Skill taxonomy + regex extraction; returns source_repos[]
│   ├── complexity.ts                  # calculateComplexity() per repo
│   ├── prompt.ts                      # buildHiringPrompt() + buildQAPrompt()
│   ├── explainability.ts              # buildExplainabilityReport() — plain-English skill summary
│   ├── supabase.ts                    # Supabase client (browser + server)
│   └── types.ts                       # All TypeScript types incl. ScoreBreakdown, QAMessage
│
├── store/
│   └── index.ts                       # Zustand — theme, comparison, active candidate
│
└── hooks/
    ├── useProfile.ts                  # TanStack Query — fetch + cache profile
    ├── useChat.ts                     # Hiring Agent chat state
    ├── useQA.ts                       # Q&A Agent state (in-memory only, never persisted)
    └── useComparison.ts               # Comparison state
```

**New vs v4.1:**
- `components/profile/ScoreBreakdown.tsx` — new; renders the per-signal breakdown panel
- `lib/explainability.ts` — new; generates the plain-English skill summary shown in UI and PDF
- `lib/prompt.ts` — now exports two builders: `buildHiringPrompt()` and `buildQAPrompt()`
- `app/api/repos/` renamed to `app/api/readme/` — route only handles README batch fetch, not repo list (repos fetched in `/api/profile/`)
- `Skill.source_repos[]` now populated in `lib/skills.ts` and flows through the entire stack

---

## 2. Entry Points

| URL | Behaviour |
|---|---|
| `/` | Home page |
| `/u/[username]` | Loads profile directly, skips Home |
| `/compare?u1=&u2=` | Loads both profiles directly into compare results |

---

## 3. Home Page `/`

- Username text input + Analyze button
- Optional resume upload below the input
- Recently analyzed profiles from localStorage

| Action | Result |
|---|---|
| Username + Analyze | Navigate to `/u/[username]` |
| Username + resume + Analyze | Navigate to `/u/[username]`; resume processed in background |
| Click recent profile | Navigate to `/u/[username]` with cached data |
| Click "Compare two developers" | Navigate to `/compare` |

**Demo note:** The username input accepts any public GitHub username. During judging, the judge can type any username live — no hardcoded demo data.

---

## 4. Developer Profile Page `/u/[username]`

### Loading State

Skeleton shown immediately. Progress steps shown inline:
```
Fetching profile → Fetching repos → Reading READMEs → Extracting skills → Scoring
```
Each step updates as it completes. READMEs are fetched in parallel — profile card renders before skills finish loading.

### Profile Header

Avatar, name, username, bio, stats (followers, repos, stars, account age), Potential Score badge with tier color.

Buttons: **Ask AI** · **Q&A** · **Download PDF** · **Share** · **Compare**

### Tab Navigation

```
[ Overview ]  [ Skills ]  [ Repos ]
```

**Overview**
- Skill Radar Chart (6 axes)
- Language Distribution donut
- Top 5 repo cards (name, stars, complexity score, language)
- **Score Breakdown Panel** — per-signal bars showing exactly how the Potential Score was computed

**Skills**
- Skills grouped by category with confidence bars
- Each skill shows: confidence %, repo count, and expandable source repo list
- Low-confidence skills (<40%) collapsed under "Weak signals" toggle
- Clicking a skill expands the repos that drove it — core explainability interaction

**Repos**
- Full repo list with filter by language/keyword
- Sort by stars / forks / complexity / recency / A–Z
- Each repo shows its complexity score badge with breakdown tooltip

---

### 4.1 Explainability Report

Visible on the Overview tab, below the Score Breakdown Panel. Generated by `lib/explainability.ts`.

Plain-English format:
```
Signal Summary for @username

✓ React — detected in 7 repos (confidence: 92%)
    Strongest signals: ecommerce-app, blog-platform, portfolio-v2

✓ Docker — detected in 3 repos (confidence: 58%)
    Strongest signals: devops-demo, api-service

△ Testing — low signal (confidence: 18%)
    Only detected in: todo-app

✗ Mobile — not detected in any repository
```

This report is also included in the PDF export and injected into both AI agent prompts as supporting evidence.

---

### 4.2 AI Hiring Agent Panel

Opened via **Ask AI**. Persistent per session — chat history saved to Supabase.

| State | Notice |
|---|---|
| No resume | Yellow: "Answering from GitHub data only" + upload prompt |
| Resume uploaded | Green: "AI has access to GitHub + resume" |

Suggested chips: "Top 3 strengths" · "Roles that suit them" · "Any red flags?" · "Frontend strength" · "Resume vs GitHub match"

| Action | Result |
|---|---|
| Click chip | Sends question immediately |
| Type + Send / Enter | AI responds in <5s, cites specific repos as evidence |
| Upload resume | Extracts text, updates AI context, success toast |
| Close panel | Collapses; history preserved in Supabase |

AI scope: skills, repos, role fit, resume consistency. Every response cites the repo or resume line it draws from. Will not invent data.

---

### 4.3 AI Profile Q&A Agent Panel

Opened via **Q&A**. Stateless — no persistence. Available immediately after profile load, no resume required.

| State | Behaviour |
|---|---|
| No resume | GitHub data only; no upload prompt shown |
| Resume present | Auto-detects and includes resume context silently |

Suggested chips: "My strongest skills" · "Roles that suit this profile" · "Skills I'm missing for a senior role" · "Why is my score X?" · "What would improve my score?"

| Action | Result |
|---|---|
| Click chip | Sends question immediately |
| Type + Send / Enter | AI responds in <5s |
| Close panel | Clears conversation; not recoverable |
| Revisit page | Fresh session, no history |

Q&A Agent scope: self-assessment, gap analysis, score explainability, role fit. Grounded in GitHub data (+ resume if present). Will not answer off-topic.

**Difference from Hiring Agent:**

| | Hiring Agent | Q&A Agent |
|---|---|---|
| Resume required | Yes | No |
| Persisted | Yes, Supabase | No, in-memory |
| Primary user | Recruiter | Developer or recruiter |
| Explainability focus | Role fit, resume match | Score breakdown, gap analysis |

---

### 4.4 Header Buttons

| Button | Result |
|---|---|
| Ask AI | Opens Hiring Agent panel |
| Q&A | Opens Q&A Agent panel |
| Download PDF | Opens PDF preview modal |
| Share | Copies `/u/[username]` to clipboard |
| Compare | Navigates to `/compare?u1=[username]` |

---

## 5. PDF Export Modal

1. Opens with live browser-rendered preview
2. Shows: profile header, Potential Score + breakdown, top skills with confidence, top 3 repos, explainability summary
3. Toggle which repos to include
4. Download → saves to device

Explainability summary is included in the PDF — judges reviewing printed or PDF submissions will see the evidence chain, not just a score.

---

## 6. Compare Page `/compare`

**Empty state:** Two username inputs; Developer 1 pre-filled if arrived from a profile.

**Results state:**
- Two Profile Cards side-by-side with Potential Scores and tier labels
- Overlapping Radar Charts on shared axes (two colors, semi-transparent)
- Stat table — winner per metric highlighted green; Score Breakdown shown per candidate
- Skill diff: unique skills each developer has that the other doesn't

| Action | Result |
|---|---|
| Click developer name/avatar | Navigate to `/u/[username]` |
| Ask AI (either side) | Opens Hiring Agent for that candidate |
| Q&A (either side) | Opens Q&A Agent for that candidate |
| Share Comparison | Copies `/compare?u1=&u2=` to clipboard |
| Swap | Swaps left/right positions |
| Change a username | Clears that side and re-analyzes |

---

## 7. Error States

| Scenario | Message |
|---|---|
| Username not found | "No GitHub user found for '[username]'" |
| API rate limited | "GitHub rate limit reached — try again in X minutes" |
| No public repos | "No public repositories" in Repos tab |
| Partial analysis | "X of Y repos analyzed — some could not be reached" |
| Resume too large | "Resume must be under 5MB" |
| Resume not PDF | "Only PDF files are supported" |
| AI fails | "Something went wrong — please try again" |
| PDF fails | Toast: "PDF generation failed — try again" |
| Network error | Full-page error with Retry button |

**Rate limit resilience:** Profiles cached in Supabase for 1 hour. Repeated analysis of the same username during the demo makes zero GitHub API calls.

---

## 8. Persistent UI

Present on all pages except Home:
- **Navbar:** Logo → `/` · Mini username input · Compare link · Theme toggle
- **Toasts:** Bottom-right, auto-dismiss after 3s

---

## 9. Sitemap

```
/                        → Home
/u/[username]            → Developer Profile
  ?tab=overview          → Overview (default)
  ?tab=skills            → Skills tab
  ?tab=repos             → Repos tab
/compare                 → Compare (empty)
/compare?u1=&u2=         → Compare (results)
```

---

_SkillLens Project Structure & User Flow · Techkriti '26 × Eightfold AI · v5.0 · 2026_