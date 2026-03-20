# SkillLens — Backend Schema
### Techkriti '26 × Eightfold AI · v5.0

---

## 1. API Routes

```
app/api/
├── profile/[username]/route.ts   # Fetch + analyze profile; compute score + breakdown
├── readme/route.ts               # Batch README fetch + skill extraction (parallel)
├── resume/route.ts               # Upload PDF, extract text, store in Supabase
├── chat/route.ts                 # Hiring Agent — Gemini + Supabase persistence
└── qa/route.ts                   # Q&A Agent — stateless Gemini call, no DB
```

---

## 2. TypeScript Types

```ts
// lib/types.ts

export type Developer = {
  id: string                          // Supabase candidates.id (uuid)
  username: string
  avatar_url: string
  name: string | null
  bio: string | null
  followers: number
  public_repos: number
  total_stars: number
  created_at: string                  // GitHub account creation date (ISO)
  potential_score: number             // 0–100
  potential_label: PotentialLabel
  score_breakdown: ScoreBreakdown     // Per-signal breakdown for explainability panel
  skills: Skill[]
  languages: Language[]
  repos: Repo[]
  resume_text: string | null
  analyzed_at: string
}

export type ScoreBreakdown = {
  repo_volume:        number          // 0–20
  star_count:         number          // 0–20
  language_diversity: number          // 0–20
  skill_count:        number          // 0–20
  account_activity:   number          // 0–20
}

export type Repo = {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  size: number                        // KB
  updated_at: string
  complexity_score: number            // 0–100
  skills_detected: string[]
}

export type Skill = {
  name: string
  category: SkillCategory
  confidence: number                  // 0–1, repo_count / total_repos
  repo_count: number
  source_repos: string[]              // Repo names where skill was detected — drives explainability
}

export type Language = {
  name: string
  percentage: number                  // 0–100
  repo_count: number
}

export type ChatMessage = {
  id: string
  candidate_id: string                // FK to candidates.id
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// Q&A Agent only — never persisted
export type QAMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type SkillCategory =
  | 'Frontend' | 'Backend' | 'Database'
  | 'DevOps'   | 'Mobile'  | 'Testing'

export type PotentialLabel =
  | 'Beginner' | 'Emerging' | 'Developing'
  | 'Proficient' | 'Expert'
```

---

## 3. Supabase Schema

```sql
create table candidates (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  profile_data  jsonb not null,    -- full Developer object incl. score_breakdown + skills[].source_repos
  resume_text   text,
  analyzed_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index candidates_username_idx on candidates (username);

-- Hiring Agent only — Q&A Agent is stateless, never persisted
create table chat_messages (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  created_at    timestamptz not null default now()
);

create index chat_messages_candidate_idx on chat_messages (candidate_id, created_at);
```

No auth, no RLS — public tool, no user accounts.

---

## 4. API Routes

---

### `GET /api/profile/[username]`

**Logic:**
1. Check Supabase — if `analyzed_at` within 1 hour, return cached `Developer`
2. Fetch from GitHub: user profile + top 30 repos (sorted by updated)
3. Compute `complexity_score` per repo, aggregate `languages[]`
4. Compute `potential_score` + `score_breakdown` via `lib/scoring.ts`
5. Upsert into `candidates` — `skills[]` is empty at this point (populated by `/api/readme`)
6. Return `Developer`

**Response `200`:** `{ data: Developer }`

**Errors:**
```ts
{ error: 'User not found',                                          code: 'USER_NOT_FOUND'  } // 404
{ error: 'GitHub rate limit reached. Try again in X minutes.',      code: 'RATE_LIMITED', retry_after: number } // 429
{ error: 'Something went wrong',                                    code: 'INTERNAL_ERROR'  } // 500
```

**GitHub calls:**
```
GET /users/{username}
GET /users/{username}/repos?per_page=30&sort=updated
```

---

### `POST /api/readme`

Batch fetches READMEs in parallel. Called after `/api/profile` so the profile card renders immediately while skills load progressively.

**Request body:** `{ username: string; repos: { name: string }[] }`

**Logic:**
1. Fetch all READMEs in parallel via `Promise.all()`
2. Base64 decode → `extractSkills(readmeText)` per README → builds `source_repos[]` per skill
3. `aggregateSkills(skillsPerRepo, totalRepos)` → `Skill[]` with confidence + source_repos
4. `buildExplainabilityReport(skills)` → plain-English summary stored alongside skills
5. Update `profile_data.skills` in Supabase
6. Return aggregated skills

**Response `200`:**
```ts
{
  skills: Skill[]                              // incl. source_repos[] per skill
  skills_per_repo: { [repoName: string]: string[] }
  explainability_report: string                // plain-English summary for UI + PDF
}
```

**Errors:**
```ts
{ error: 'Rate limited during README fetch', code: 'RATE_LIMITED', completed: number, total: number } // 429
{ error: 'username and repos[] are required', code: 'BAD_REQUEST' }                                   // 400
```

**GitHub calls:**
```
GET /repos/{username}/{repo}/readme   (× N repos, parallel)
```

---

### `POST /api/resume`

**Request:** `multipart/form-data` — `file: File` (PDF, max 5MB), `username: string`

**Logic:**
1. Validate: `application/pdf`, max 5MB
2. Extract text via `pdf-parse(buffer)`
3. Update `candidates.resume_text` by username

**Response `200`:** `{ success: true, characters_extracted: number }`

**Errors:**
```ts
{ error: 'Only PDF files are supported',                            code: 'INVALID_FILE_TYPE'    } // 400
{ error: 'File must be under 5MB',                                  code: 'FILE_TOO_LARGE'       } // 400
{ error: 'Analyze the GitHub profile first',                        code: 'CANDIDATE_NOT_FOUND'  } // 404
{ error: 'Could not extract text. Ensure it is not a scanned PDF.', code: 'EXTRACTION_FAILED'    } // 422
```

---

### `POST /api/chat`

Hiring Agent. Persists both messages to Supabase.

**Request body:**
```ts
{
  candidate_id: string
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
}
```

**Logic:**
1. Fetch candidate from Supabase by `candidate_id` (gets `profile_data` + `resume_text`)
2. `buildHiringPrompt(developer)` — includes `skills[].source_repos` for citation
3. Call Gemini 1.5 Flash: system prompt + history + message
4. Persist user message + AI response to `chat_messages`
5. Return response

**Response `200`:** `{ message: string, message_id: string }`

**Errors:**
```ts
{ error: 'Candidate not found',      code: 'CANDIDATE_NOT_FOUND' } // 404
{ error: 'Message cannot be empty',  code: 'BAD_REQUEST'         } // 400
{ error: 'AI is busy.',              code: 'AI_RATE_LIMITED'     } // 429
{ error: 'AI failed to respond.',    code: 'AI_ERROR'            } // 500
```

---

### `POST /api/qa`

Q&A Agent. Stateless — no Supabase reads or writes.

**Request body:**
```ts
{
  profile_data: Developer             // Full Developer object from client state
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
}
```

**Logic:**
1. `buildQAPrompt(profile_data)` — GitHub-only prompt; includes `source_repos` per skill
2. Call Gemini 1.5 Flash: system prompt + history + message
3. Return response — no persistence

**Response `200`:** `{ message: string }`

**Errors:**
```ts
{ error: 'profile_data and message are required', code: 'BAD_REQUEST'     } // 400
{ error: 'AI is busy.',                           code: 'AI_RATE_LIMITED' } // 429
{ error: 'AI failed to respond.',                 code: 'AI_ERROR'        } // 500
```

---

## 5. Core Library Functions

Pure functions — no side effects, no API calls, no database access.

---

### `lib/scoring.ts`

```ts
export function calculateScore(developer: Developer): number
export function getScoreLabel(score: number): PotentialLabel
export function getScoreBreakdown(developer: Developer): ScoreBreakdown
```

**Formula:**
```ts
const repoScore     = Math.min(developer.public_repos / 30, 1) * 20
const starScore     = Math.min(developer.total_stars / 500, 1) * 20
const langScore     = Math.min(developer.languages.length / 8, 1) * 20
const skillScore    = Math.min(developer.skills.length / 20, 1) * 20
const recentRepos   = developer.repos.filter(r =>
  (Date.now() - new Date(r.updated_at).getTime()) / 86400000 <= 90
).length
const activityScore = Math.min(recentRepos / developer.repos.length, 1) * 20

return Math.round(repoScore + starScore + langScore + skillScore + activityScore)
```

---

### `lib/complexity.ts`

```ts
export function calculateComplexity(repo: Repo): number
```

**Formula:**
```ts
const starScore    = Math.min(repo.stars / 100, 1) * 25
const forkScore    = Math.min(repo.forks / 50, 1) * 20
const sizeScore    = Math.min(repo.size / 5000, 1) * 20
const descScore    = repo.description ? 15 : 0
const langScore    = repo.language ? 10 : 0
const recencyDays  = (Date.now() - new Date(repo.updated_at).getTime()) / 86400000
const recencyScore = Math.max(0, 1 - recencyDays / 365) * 10

return Math.round(starScore + forkScore + sizeScore + descScore + langScore + recencyScore)
```

---

### `lib/skills.ts`

```ts
export const SKILL_TAXONOMY: Record<SkillCategory, string[]> = {
  Frontend:  ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'TypeScript',
              'TailwindCSS', 'HTML', 'CSS', 'Vite', 'Webpack', 'Sass'],
  Backend:   ['Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring',
              'Laravel', 'GraphQL', 'REST', 'tRPC', 'Hono', 'Bun'],
  Database:  ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase',
              'Firebase', 'SQLite', 'Prisma', 'Drizzle', 'DynamoDB'],
  DevOps:    ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'GCP',
              'Vercel', 'Netlify', 'CI/CD', 'Linux', 'Nginx', 'Terraform'],
  Mobile:    ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo'],
  Testing:   ['Jest', 'Vitest', 'Cypress', 'Playwright', 'pytest',
              'Testing Library', 'Storybook'],
}

// Extract matched skill names from a single README
export function extractSkills(readmeText: string): string[]

// Aggregate across all repos → Skill[] with confidence + source_repos
export function aggregateSkills(
  skillsPerRepo: Record<string, string[]>,
  totalRepos: number
): Skill[]
```

`aggregateSkills` builds `source_repos[]` per skill — this is the primary explainability signal used in the UI, AI prompts, and PDF export.

---

### `lib/explainability.ts`

```ts
// Generates the plain-English explainability report shown in Overview tab + PDF
export function buildExplainabilityReport(skills: Skill[]): string
```

Output format:
```
✓ React       — confidence 92%, found in 7 repos: ecommerce-app, blog-platform, portfolio-v2
△ Docker      — confidence 58%, found in 3 repos: devops-demo, api-service
▽ Testing     — confidence 18%, low signal (1 repo): todo-app
✗ Mobile      — not detected in any repository
```

Called in `/api/readme` — result stored in `profile_data` and returned to client.

---

### `lib/prompt.ts`

```ts
export function buildHiringPrompt(developer: Developer): string
export function buildQAPrompt(developer: Developer): string
```

Both prompts include `skills[].source_repos` so every AI response can cite specific repo names as evidence. `buildHiringPrompt` additionally injects `resume_text` (truncated to 3,000 chars). `buildQAPrompt` operates on GitHub data only.

---

### `lib/supabase.ts`

```ts
// Browser client — client components
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server client — API routes only
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## 6. GitHub API Headers

```ts
const GITHUB_HEADERS = {
  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}
```

Rate limit response: check `x-ratelimit-remaining` header on every call. If `0` and status `403`, return `RATE_LIMITED` with `retry_after` in minutes.

---

## 7. Caching Strategy

| Data | Location | TTL |
|---|---|---|
| Developer profile | Supabase `candidates` | 1 hour — re-analyzed if stale |
| Hiring Agent chat history | Supabase `chat_messages` | Permanent |
| Resume text | Supabase `candidates.resume_text` | Permanent — overwritten on re-upload |
| Q&A Agent conversation | Component state only | Page session — cleared on close |
| Recent profiles list | localStorage | Session |
| Theme preference | localStorage | Permanent |

---

## 8. Environment Variables

```bash
GITHUB_TOKEN=
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Safe to expose to client
SUPABASE_SERVICE_ROLE_KEY=            # Server only — never expose to client
```

---

_SkillLens Backend Schema · Techkriti '26 × Eightfold AI · v5.0 · 2026_