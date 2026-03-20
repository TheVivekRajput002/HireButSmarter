# SkillLens — Frontend Guidelines
### Techkriti '26 × Eightfold AI · Design System v5.0

---

## 1. Color System

All colors defined as CSS variables in `globals.css`. Never hardcode hex values in components.

```css
:root {
  --bg-base:        #0D0F14;   /* page background */
  --bg-surface:     #151820;   /* cards, panels */
  --bg-elevated:    #1C2030;   /* modals, dropdowns, hover states */
  --bg-border:      #252A3A;   /* borders, dividers */

  --brand-green:    #5BC451;   /* Potential Score, active states, CTAs */
  --brand-green-dim:#3A7D2E;   /* muted green for backgrounds */
  --brand-navy:     #1A1A2E;   /* header, cover areas */

  --text-primary:   #F0F2F8;
  --text-secondary: #8B92A8;
  --text-muted:     #4A5066;

  --score-expert:   #5BC451;   /* 81–100 */
  --score-prof:     #3B82F6;   /* 61–80 */
  --score-dev:      #F59E0B;   /* 41–60 */
  --score-emerging: #F97316;   /* 21–40 */
  --score-beginner: #EF4444;   /* 0–20 */

  --error:          #EF4444;
  --warning:        #F59E0B;
  --success:        #5BC451;

  --axis-frontend:  #5BC451;
  --axis-backend:   #3B82F6;
  --axis-devops:    #F59E0B;
  --axis-database:  #A855F7;
  --axis-mobile:    #F97316;
  --axis-testing:   #EC4899;

  /* Explainability signal colors */
  --signal-strong:  #5BC451;   /* confidence >70% */
  --signal-mid:     #F59E0B;   /* confidence 40–70% */
  --signal-weak:    #4A5066;   /* confidence <40% */
  --signal-absent:  #252A3A;   /* skill not detected */
}
```

---

## 2. Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
```

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Score | Space Mono | 700 | 48–64px |
| H1 | DM Sans | 600 | 28px |
| H2 | DM Sans | 600 | 20px |
| H3 | DM Sans | 500 | 16px |
| Body | DM Sans | 400 | 14px |
| Labels / Badges | Space Mono | 400 | 11–12px |
| Usernames / Code | Space Mono | 400 | 13px |
| Stat numbers | Space Mono | 700 | 24–32px |

- `Space Mono` — numbers, scores, usernames, badges, any data output
- `DM Sans` — all prose, labels, descriptions
- Never use Inter, Roboto, or system-ui

---

## 3. Spacing

8px base grid. Stick to Tailwind scale: `p-2 p-3 p-4 p-6 p-8 p-12 p-16` — no arbitrary values.

---

## 4. Component Rules

### Cards
- Standard: `var(--bg-surface)` · Elevated / active: `var(--bg-elevated)`
- Border: always `var(--bg-border)` — never transparent or colored
- Radius: `rounded-xl` for cards, `rounded-lg` for buttons/inputs, `rounded-full` only for avatars and score badges

### Buttons

| Type | Use | Background | Text | Hover |
|---|---|---|---|---|
| Primary | Analyze, Send, Download | `--brand-green` | `#0D0F14` (dark) | `brightness-110` |
| Secondary | Compare, Cancel | `--bg-elevated` | `--text-primary` | border + text → `--brand-green` |
| Ghost | Tabs, nav | transparent | `--text-secondary` | text → `--text-primary`, bg → `--bg-elevated` |

All buttons: flat (no shadows), `transition-all`, `active:scale-95`.

### Inputs
- Background `--bg-elevated`, border `--bg-border`, font `Space Mono`
- Focus: green border + green ring — never blue, no default browser outline

### Badges
- Score badge: `--brand-green-dim` bg, `--brand-green` border and text, `rounded-full`
- Skill badge: `--bg-elevated` bg, `--bg-border` border, `--text-secondary` text, `rounded-md`

### Dividers
- `div` with `border-t border-[var(--bg-border)]` — never `<hr>`

---

## 5. Potential Score Display

The score is the hero element. Color is always tier-driven — never static.

| Range | Label | Color |
|---|---|---|
| 81–100 | Expert | `--score-expert` |
| 61–80 | Proficient | `--score-prof` |
| 41–60 | Developing | `--score-dev` |
| 21–40 | Emerging | `--score-emerging` |
| 0–20 | Beginner | `--score-beginner` |

- Number: `Space Mono` 700, 48px, tier color
- Label: `Space Mono`, `rounded-full`, matching border + text color
- `/100`: `--text-muted`, uppercase, wide tracking

---

## 6. Score Breakdown Panel (`ScoreBreakdown.tsx`)

The breakdown panel is a first-class explainability component — not decorative. It renders the `ScoreBreakdown` object from the `Developer` type and must always appear directly below the score badge.

Each of the 5 signals renders as a labeled progress bar:

```
Potential Score: 74 / 100  (Proficient)

Repo Volume        ████████████████░░░░  16 / 20
Star Count         ██████████████░░░░░░  14 / 20
Language Diversity ██████████████████░░  18 / 20
Skill Count        ████████████████████  20 / 20
Account Activity   ██████░░░░░░░░░░░░░░   6 / 20
```

**Visual rules:**
- Bar track: `--bg-elevated`, height 6px, `rounded-full`
- Bar fill: `--brand-green` for ≥15/20 · `--warning` for 8–14/20 · `--score-beginner` for <8/20
- Label: `DM Sans` 13px `--text-secondary`
- Value: `Space Mono` 12px right-aligned `--text-primary`
- Animate fill width from 0 on mount — same pattern as Skill Bars

---

## 7. Explainability Report (`lib/explainability.ts` output)

Rendered on the Overview tab below the Score Breakdown Panel. Uses a fixed format with four states per skill:

```
✓  React       ████████████████████  92%   found in 7 repos
               └─ ecommerce-app · blog-platform · portfolio-v2
△  Docker      ████████████░░░░░░░░  58%   found in 3 repos
               └─ devops-demo · api-service
▽  Testing     ████░░░░░░░░░░░░░░░░  18%   low signal — 1 repo
✗  Mobile      ░░░░░░░░░░░░░░░░░░░░   0%   not detected
```

**Visual rules:**
- `✓` strong (>70%): `--signal-strong` icon + bar fill
- `△` mid (40–70%): `--signal-mid` icon + bar fill
- `▽` weak (<40%): `--signal-weak` icon + bar fill
- `✗` absent: `--signal-absent` bar, `--text-muted` text
- Source repos: `Space Mono` 11px `--text-muted`, indented, separated by ` · `
- Clicking a skill row expands/collapses the source repo list (Framer Motion, 150ms)
- "Weak signals" (<40%) collapsed by default under a toggle

---

## 8. Charts

**Radar (D3):** `--bg-surface` bg · `--bg-border` grid lines at 30% opacity · axis labels `Space Mono` 11px `--text-secondary` · fill per axis color at 20% opacity, stroke at 80%, 2px · fade + scale in on mount

**Language Donut (Recharts):** Inner 55%, outer 80% · 2px `--bg-base` stroke between segments · custom legend to the right · tooltip `--bg-elevated`, mono font

**Skill Confidence Bars (`SkillBars.tsx`):** 4px `rounded-full` track · fill: `--signal-strong` >70%, `--signal-mid` 40–70%, `--signal-weak` <40% · animate width from 0 on mount · hovering a bar shows a tooltip listing `source_repos[]`

---

## 9. Animation Rules

Framer Motion for all animations. Fast, purposeful — nothing decorative.

- Page enter: stagger children `0.06s`, fade up 12px over 250ms
- Card hover: lift `-2px`, 150ms
- Button press: `scale(0.96)`
- Score: count-up on mount
- Score breakdown bars: animate fill width from 0 on mount, stagger 50ms between bars
- Explainability row expand: height + opacity, 150ms `easeOut`
- Chat messages: slide in from bottom, 200ms
- Max duration: 400ms · easing: `easeOut` everywhere · charts animate once on mount only

---

## 10. Layout

- All pages: `--bg-base` bg, max-width `1152px`, centered
- Profile page: two-column desktop (`1fr + 380px` sticky agent panel), single column mobile
- Compare page: always two equal columns — horizontal scroll on mobile, never stack

---

## 11. Chat Panels

Applies to both `ChatPanel.tsx` (Hiring Agent) and `QAPanel.tsx` (Q&A Agent). Visual rules are identical — only header label and status bar differ.

- Panel: `--bg-surface`, full height, sticky desktop
- Header: `Bot` icon · "Ask about [username]" (Hiring) or "Q&A — [username]" (Q&A) · `X` close
- Status bar (Hiring Agent only):
  - No resume: `--warning` bg, yellow text — "Answering from GitHub data only"
  - Resume uploaded: `--brand-green-dim` bg, `--brand-green` text — "GitHub + resume"
- User bubbles: `--brand-green-dim` bg, `--brand-green` border, right-aligned
- AI bubbles: `--bg-elevated`, left-aligned, no border
- Bubble text: 14px `DM Sans`
- Suggested chips: `--bg-elevated` bg, `--bg-border` border · hover → `--brand-green` border + text
- Loading: three animated dots in `--brand-green`
- Send: icon-only `ArrowRight` in `--brand-green`

---

## 12. Skeletons & Loading

- All async areas get a skeleton — never a blank space
- Skeleton: `--bg-elevated` bg, `animate-pulse`, must match exact shape of loaded content
- Spinners only for: send button, PDF generation, resume upload
- Profile card skeleton renders immediately; skill bars and radar animate in after README batch completes

---

## 13. Responsive

| Breakpoint | Tailwind | Notes |
|---|---|---|
| Mobile | default | Single column; AI panels → bottom sheet |
| Tablet | `md:` 768px | Two columns |
| Desktop | `lg:` 1024px | Sticky agent panel |
| Wide | `xl:` 1280px | Max 1152px centered |

Mobile: radar chart scales to single column · compare page horizontal scroll · both AI panels are slide-up bottom sheets triggered by their respective header buttons.

---

## 14. Icons

Lucide React only. Sizes: 16px inline · 20px in buttons · 24px standalone.

| Context | Icon |
|---|---|
| GitHub | `Github` |
| Stars | `Star` |
| Forks | `GitFork` |
| Send | `ArrowRight` |
| Upload | `Upload` |
| Download PDF | `FileDown` |
| Share | `Link2` |
| Compare | `ArrowLeftRight` |
| AI / Agent | `Bot` |
| Close | `X` |
| Success / Strong signal | `CheckCircle2` |
| Error | `AlertCircle` |
| Warning / Weak signal | `AlertTriangle` |
| Expand | `ChevronDown` |
| Absent signal | `MinusCircle` |

---

_SkillLens Frontend Guidelines · Techkriti '26 × Eightfold AI · v5.0 · 2026_