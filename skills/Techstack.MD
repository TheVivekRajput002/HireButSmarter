# SkillLens — Tech Stack
### Techkriti '26 × Eightfold AI · v5.0

---

## 1. Languages

| Language | Where used |
|---|---|
| TypeScript | Entire project — strict mode, no `any` |
| SQL | Supabase schema only |

---

## 2. Framework

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Full-stack — frontend + API routes |
| React | 18+ | UI components |
| TypeScript | 5+ | Type safety |

All backend logic lives in Next.js API routes. No separate server.

---

## 3. Styling

| Tool | Purpose |
|---|---|
| TailwindCSS v4 | All styling — utility classes only |
| tailwind-merge | Merge conflicting Tailwind classes |
| clsx | Conditional className construction |

---

## 4. UI Components & Icons

| Tool | Purpose |
|---|---|
| shadcn/ui | Base components — buttons, cards, tabs, dialogs, inputs, tooltips |
| Lucide React | Icons — SVG, tree-shakeable |

---

## 5. Animation

| Tool | Purpose |
|---|---|
| Framer Motion | Page transitions, chat message entrance, chart animations |

---

## 6. Data Visualization

| Tool | Purpose |
|---|---|
| Recharts | Language distribution donut chart |
| D3.js | Skill radar chart — custom SVG, 6 axes |

Score breakdown bars (per-signal explainability panel) are plain Tailwind — no chart library needed.

---

## 7. PDF Generation

| Tool | Purpose |
|---|---|
| @react-pdf/renderer | Client-side portfolio PDF including explainability summary — runs in browser |

---

## 8. Data Fetching & State

| Tool | Purpose |
|---|---|
| TanStack Query v5 | API fetching, caching, loading and error states |
| Zustand | Global state — theme, comparison, active candidate |
| axios | HTTP client inside API routes |

---

## 9. AI — Gemini 1.5 Flash

| Tool | Purpose |
|---|---|
| `@google/generative-ai` | Official Google Gemini SDK |
| Gemini 1.5 Flash | AI model — free tier, 15 req/min, 1M tokens/day |

**Why Gemini 1.5 Flash for this hackathon:**
- 1M token context window — fits full candidate profile + repo list + resume + chat history in a single call
- Fast enough for real-time chat (<3s responses on free tier)
- No credit card required — zero cost for the build phase

**Two API routes:**

- `POST /api/chat` — **Hiring Agent.** Receives `{ candidateId, message, history[] }`, fetches candidate from Supabase, builds grounded prompt via `buildHiringPrompt()`, persists both messages to `chat_messages`.
- `POST /api/qa` — **Q&A Agent.** Receives `{ profileData, message, history[] }`, builds prompt via `buildQAPrompt()` from payload only. Stateless — no Supabase reads or writes.

Both prompts instruct the model to cite specific repos and skills as evidence in every response — satisfying the judging rubric's explainability requirement.

**Rate limit handling:** Gemini free tier is 15 req/min. Responses are not cached (each message is unique), but the profile data passed in the system prompt is cached in Supabase — no redundant GitHub API calls.

---

## 10. Skill Extraction

| Tool | Purpose |
|---|---|
| Custom regex taxonomy | `lib/skills.ts` — keyword scan against hardcoded skill list per category |

No NLP model, no spaCy, no embeddings required for skill extraction. The regex approach is:
- Deterministic — same input always produces same output (auditable)
- Explainable by default — we know exactly which keyword matched in which repo
- Fast — entire README batch processes in milliseconds

Each matched skill carries `source_repos: string[]` — the list of repo names where it was detected. This is the primary explainability signal surfaced in the UI and cited by the AI agents.

---

## 11. Scoring

| Tool | Purpose |
|---|---|
| `lib/scoring.ts` | Pure function — `calculateScore()` + `getScoreBreakdown()` |
| `lib/complexity.ts` | Pure function — `calculateComplexity()` per repo |

`getScoreBreakdown()` returns all 5 per-signal scores (0–20 each) for display in the score breakdown panel. This panel is the core explainability layer for the Potential Score — every number is shown, not just the total.

---

## 12. Resume Processing

| Tool | Purpose |
|---|---|
| pdf-parse | Server-side PDF text extraction |
| formidable | Multipart form / file upload parsing in API routes |

Resume text is stored in Supabase and injected into the Hiring Agent system prompt. The Q&A Agent uses it only if already present in the profile — no separate upload flow.

---

## 13. Database & Storage

| Tool | Purpose |
|---|---|
| Supabase | Managed PostgreSQL — free tier |
| `@supabase/supabase-js` | Client for API routes and components |
| Supabase Storage | Resume PDFs (free tier: 1GB) |

Tables:
- `candidates` — full `Developer` object as JSONB including `score_breakdown` and `skills[].source_repos`
- `chat_messages` — Hiring Agent history only; Q&A Agent is stateless

Profile cache TTL: 1 hour (checked via `analyzed_at`). Stale profiles are re-fetched from GitHub on next request.

---

## 14. Forms & Validation

| Tool | Purpose |
|---|---|
| React Hook Form | Username search + resume upload |
| Zod | Validation for username input and resume upload only |

---

## 15. Local State

| Tool | Purpose |
|---|---|
| localStorage | Theme preference + recently viewed profiles list |

---

## 16. Developer Tooling

| Tool | Purpose |
|---|---|
| pnpm | Package manager |
| ESLint | Linting |
| Prettier | Formatting |

---

## 17. Deployment

| What | Where | Cost |
|---|---|---|
| Frontend + API routes | Vercel | Free |
| Database + Storage | Supabase | Free |
| AI (Gemini 1.5 Flash) | Google AI Studio | Free |

**Total infrastructure cost: $0**

---

## 18. External APIs & Rate Limits

| API | Auth | Free Tier |
|---|---|---|
| GitHub REST API v3 | Personal Access Token | 5,000 req/hr |
| Gemini 1.5 Flash | Google AI Studio API Key | 15 req/min, 1M tokens/day |
| Supabase | Project URL + anon key | 500MB DB, 1GB storage |

**GitHub rate limit strategy:** All calls go through server-side API routes. Profile data cached in Supabase for 1 hour — a repeated demo with the same username makes zero GitHub API calls after the first load.

---

## 19. Environment Variables

```bash
GITHUB_TOKEN=                         # GitHub Personal Access Token
GEMINI_API_KEY=                       # Google AI Studio API key
NEXT_PUBLIC_SUPABASE_URL=             # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Safe to expose to client
SUPABASE_SERVICE_ROLE_KEY=            # Server only — never expose to client
```

---

## 20. Key Implementation Notes

- **GitHub API calls** — always via server-side API routes, never from the browser; `GITHUB_TOKEN` never reaches the client
- **Gemini calls** — always server-side; `GEMINI_API_KEY` never reaches the client
- **Explainability** — `Skill.source_repos[]` populated during README extraction; passed into both AI prompts so agents can cite repo names in responses
- **Score breakdown** — `ScoreBreakdown` computed alongside `potential_score` in `lib/scoring.ts`; stored in `profile_data` JSONB and always returned with the profile
- **Hiring Agent** — full history sent as `contents[]` on every Gemini call; model is stateless
- **Q&A Agent** — profile data from client state passed in payload; zero Supabase reads or writes
- **System prompts** — `buildHiringPrompt()` (resume-aware) and `buildQAPrompt()` (GitHub-only) in `lib/prompt.ts`; both include `source_repos` per skill for citation
- **Skill extraction** — `extractSkills(readmeText): string[]` in `lib/skills.ts`; returns matched keywords only — no probabilities, no model
- **Scoring** — `calculateScore()` and `getScoreBreakdown()` are pure functions; no side effects
- **Demo resilience** — Supabase cache means the live demo works even if GitHub API is slow or rate-limited during judging

---

## 21. What Is Deliberately Not Used

Per the hackathon's strategic guidance and the scope of Impact Area 01:

| Tool | Why excluded |
|---|---|
| spaCy / NER models | Regex taxonomy is faster, deterministic, and more explainable for this use case |
| sentence-transformers / embeddings | Not needed — skill matching is keyword-based, not semantic |
| FAISS / vector store | No vector similarity required for Impact Area 01 |
| Python / FastAPI | Next.js API routes cover all backend needs; single-language stack is simpler to demo |
| Streamlit | React/Next.js gives a production-quality UI in the same time |
| Redis / Celery | Supabase caching is sufficient; no async task queue needed |

---

_SkillLens Tech Stack · Techkriti '26 × Eightfold AI · v5.0 · 2026_