# HireButSmarter

HireButSmarter is a **Talent Intelligence system** built for the post-resume era. It surfaces verified capability signals directly from a developer's public GitHub (extracting real project complexity, language usage, and skill evidence) and enables recruiters to have an AI-driven, data-grounded conversation about any candidate without needing to read a single line of code.

Built for **Techkriti '26 × Eightfold AI · Hackathon Edition IIT Knapur**.

## 🚀 Features

- **GitHub Profile Analysis**: Instantly analyze a developer's GitHub profile to extract languages, skills, and complexity metrics.
- **Explainable Potential Score**: Generates a 0-100 score based on repo volume, star count, language diversity, skill count, and account activity with a fully transparent breakdown.
- **Skill Extraction & Radar**: Automatically detects frontend, backend, database, DevOps, mobile, and testing skills from READMEs and visualizes them.
- **AI Hiring Agent**: Recruiters can upload a resume and chat with an AI agent. The AI's responses are completely grounded in the candidate's actual GitHub and resume data, citing specific repositories.
- **AI Profile Q&A Agent**: A self-serve, stateless AI assistant for developers to assess their own profiles against job roles or detect missing skills.
- **Candidate Comparison**: Compare two candidates side-by-side (stats, radar charts) and evaluate them against a pasted Job Description using AI.
- **Portfolio Export**: Generate and download a one-page PDF portfolio of the candidate's verified skills and top repos.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Components**: Framer Motion, Lucide React
- **Data Visualization**: D3.js, Recharts
- **State Management**: Zustand, TanStack React Query
- **Database**: Supabase
- **AI integration**: Google Gemini (via `@google/generative-ai`)
- **PDF Generation**: `@react-pdf/renderer`, `pdf-parse`

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (for candidate persistence and chat history)
- Gemini API Key

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd myapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🗄️ Supabase Schema Setup

To use the AI Hiring agent features that persist chat and candidate state, execute the following SQL in your Supabase SQL editor:

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

create table chat_messages (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references candidates(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  created_at    timestamptz not null default now()
);

create index chat_messages_candidate_idx on chat_messages (candidate_id, created_at);
```

## 🤝 Explainability First

HireButSmarter operates on the principle that AI scoring must be grounded and explainable:
- Every score shows exactly which metrics contributed to it.
- Every detected skill lists the confidence percentage and the specific repositories where it was found.
- Every claim made by the AI Hiring Agent cites specific evidence from the user's GitHub or resume.
