# SkillLens — Implementation Tasks

## Phase 0: Foundation ✅
- [x] Install all dependencies (framer-motion, recharts, d3, lucide-react, @tanstack/react-query, zustand, axios, @google/generative-ai, @supabase/supabase-js, pdf-parse, @react-pdf/renderer, react-hook-form, zod, tailwind-merge, clsx)
- [x] Set up [globals.css](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/app/globals.css) with full color system & typography
- [x] Set up [layout.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/app/layout.tsx) with fonts (Space Mono, DM Sans), metadata, QueryProvider
- [x] Create [lib/types.ts](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/lib/types.ts) with all TypeScript types
- [x] Create [lib/supabase.ts](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/lib/supabase.ts) (browser + server clients)
- [x] Create [lib/utils.ts](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/lib/utils.ts) (cn utility)
- [x] Create [providers/QueryProvider.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/providers/QueryProvider.tsx)
- [x] Create [store/index.ts](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/store/index.ts) (Zustand — theme, comparison, active candidate)
- [x] Create [.env.local](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/.env.local) template

## Phase 1: Frontend — Home Page ✅
- [x] Build Home page ([app/page.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/app/page.tsx)) — username search input, analyze button, recent profiles, compare link
- [x] Create Navbar component (logo, mini search, compare link, theme toggle)

## Phase 2: Frontend — Profile Page Shell ✅
- [x] Build Profile page route (`app/u/[username]/page.tsx`)
- [x] Build [ProfileCard.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/profile/ProfileCard.tsx) — avatar, stats, Potential Score badge
- [x] Build [PotentialBadge.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/profile/PotentialBadge.tsx) — tier-colored score badge
- [x] Build [ScoreBreakdown.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/profile/ScoreBreakdown.tsx) — per-signal breakdown bars
- [x] Build tab navigation (Overview / Skills / Repos)

## Phase 3: Frontend — Charts & Skill Visualization ✅
- [x] Build [RadarChart.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/charts/RadarChart.tsx) (D3, 6 axes)
- [x] Build [LanguageDonut.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/charts/LanguageDonut.tsx) (Recharts, custom legend)
- [x] Build [SkillBars.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/charts/SkillBars.tsx) (Confidence bars, expandable rows)
- [x] Build [ExplainabilityReport.tsx](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/components/profile/ExplainabilityReport.tsx) (Signal summary)
- [x] Wire charts into Profile Overview and Skills tabs

## Phase 4: Frontend — Repo Explorer ✅
- [x] Build `RepoExplorer.tsx` — repo list, filter, sort, complexity badge

## Phase 5: Frontend — AI Agent Panels ✅
- [x] Build `ChatPanel.tsx` (Hiring Agent) — chat UI, status bar, suggested chips
- [x] Build `ChatMessage.tsx` — message bubbles
- [x] Build `SuggestedQuestions.tsx` — question chips
- [x] Build `ResumeUpload.tsx` — PDF upload dropzone
- [x] Build `QAPanel.tsx` — stateless Q&A agent

## Phase 6: Frontend — Compare & PDF ✅
- [x] Build Compare page (`app/compare/page.tsx`)
- [x] Build `CompareView.tsx` — side-by-side layout (`CompareRadarChart.tsx` + `CompareResults.tsx`)
- [x] Build `PortfolioPDF.tsx` — PDF export with @react-pdf/renderer
- [x] Build `PDFModal.tsx` — PDF preview modal with download link

## Phase 7: Frontend — Hooks ✅
- [x] Create [hooks/useProfile.ts](file:///c:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/NEXTJS/HireButSmarter/myapp/hooks/useProfile.ts) (TanStack Query)
- [x] Create `hooks/useChat.ts` (Hiring Agent state)
- [x] Create `hooks/useQA.ts` (Q&A Agent state)
- [x] Create `hooks/useComparison.ts`

## Phase 8: Backend — Core Lib Functions ✅
- [x] Create `lib/scoring.ts` — calculateScore, getScoreBreakdown, getScoreLabel
- [x] Create `lib/complexity.ts` — calculateComplexity
- [x] Create `lib/skills.ts` — SKILL_TAXONOMY, extractSkills, aggregateSkills
- [x] Create `lib/explainability.ts` — buildExplainabilityReport
- [x] Create `lib/prompt.ts` — buildHiringPrompt, buildQAPrompt
- [x] Create `lib/github.ts` — GitHub API fetch helpers

## Phase 9: Backend — API Routes ✅
- [x] Create `app/api/profile/[username]/route.ts`
- [x] Create `app/api/resume/route.ts`
- [x] Create `app/api/chat/route.ts`
- [x] Create `app/api/qa/route.ts`
- [x] Update `hooks/useProfile.ts` to call real API

## Phase 10: Verification
- [ ] Run `next build` — verify zero errors
- [ ] Browser test: Home page renders, search works
- [ ] Browser test: Profile page loads with GitHub data
- [ ] Browser test: Charts and skill visualization render
- [ ] Browser test: AI chat panels function
