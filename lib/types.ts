// lib/types.ts — All SkillLens TypeScript types

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'DevOps'
  | 'Mobile'
  | 'Testing';

export type PotentialLabel =
  | 'Beginner'
  | 'Emerging'
  | 'Developing'
  | 'Proficient'
  | 'Expert';

export type ScoreBreakdown = {
  repo_volume: number;        // 0–20
  star_count: number;         // 0–20
  language_diversity: number; // 0–20
  skill_count: number;        // 0–20
  account_activity: number;   // 0–20
};

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  size: number;               // KB
  updated_at: string;
  complexity_score: number;   // 0–100
  skills_detected: string[];
};

export type Skill = {
  name: string;
  category: SkillCategory;
  confidence: number;         // 0–1, repo_count / total_repos
  repo_count: number;
  source_repos: string[];     // Repo names where skill was detected
};

export type Language = {
  name: string;
  percentage: number;         // 0–100
  repo_count: number;
};

export type Developer = {
  id: string;                              // Supabase candidates.id (uuid)
  username: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
  total_stars: number;
  created_at: string;                      // GitHub account creation date (ISO)
  potential_score: number;                 // 0–100
  potential_label: PotentialLabel;
  score_breakdown: ScoreBreakdown;         // Per-signal breakdown for explainability
  consistency_score: number | null;
  commit_quality_score: number | null;
  heatmap_data?: HeatmapData | null;
  commit_quality?: QualityAnalysisData | null;
  skills: Skill[];
  languages: Language[];
  repos: Repo[];
  resume_text: string | null;
  analyzed_at: string;
};

export type ChatMessage = {
  id: string;
  candidate_id: string;       // FK to candidates.id
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

// Q&A Agent only — never persisted
export type QAMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// ── Commit Feature Extensions ──────────────────────────────────
export type DailyCommitCount = {
  date: string;      // "YYYY-MM-DD"
  count: number;
  repos: string[];
};

export type HeatmapStats = {
  total_commits: number;
  active_days: number;
  longest_streak: number;
  current_streak: number;
  peak_day: DailyCommitCount;
  consistency_score: number;
};

export type HeatmapData = {
  weeks: DailyCommitCount[][];
  stats: HeatmapStats;
};

export type CommitDimensions = {
  length: number;
  pattern: number;
  conventional: number;
  imperative: number;
  body: number;
};

export type CommitSample = {
  sha: string;
  message: string;
  score: {
    total: number;
    dimensions: CommitDimensions;
  };
};

export type RepoScore = {
  repo: string;
  commitCount: number;
  repoScore: number;
  dimensions: CommitDimensions;
  samples: {
    best: CommitSample[];
    worst: CommitSample[];
  };
};

export type QualityAnalysisData = {
  aggregateScore: number;
  repoScores: RepoScore[];
};

// ── JD Match Feature ───────────────────────────────────────────
export type JDSkill = {
  name: string;
  category: SkillCategory;
  required: boolean;
};

export type MatchedSkill = JDSkill & {
  confidence: number;
  source_repos: string[];
};

export type MissingSkill = JDSkill;

export type MatchResult = {
  matchScore: number;
  matched: MatchedSkill[];
  missing: MissingSkill[];
  requiredMatched: number;
  requiredTotal: number;
  optionalMatched: number;
  optionalTotal: number;
};

export type JDMatchAnalysis = {
  matchResult: MatchResult;
  aiAnalysis: string;
  jdSkillsDetected: JDSkill[];
};
