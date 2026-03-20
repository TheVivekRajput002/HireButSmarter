// lib/scoring.ts — Potential Score logic

import { ScoreBreakdown, PotentialLabel } from './types';
import { GitHubRepo } from './github';
import { Skill } from './types';

/**
 * Calculate score breakdown from GitHub signals.
 * Each signal is 0–20, total is 0–100.
 *
 * | Signal             | Weight | How it's measured                          |
 * |--------------------|--------|--------------------------------------------|
 * | Repo volume        | 20%    | Public repos count, capped at 30           |
 * | Star count         | 20%    | Total stars across all repos, capped at 500|
 * | Language diversity  | 20%    | Number of distinct languages used          |
 * | Skill count        | 20%    | Unique skills detected from README files   |
 * | Account activity   | 20%    | Repos updated in last 90 days / total repos|
 */
export function getScoreBreakdown(
  repos: GitHubRepo[],
  totalStars: number,
  skills: Skill[]
): ScoreBreakdown {
  const repoCount = repos.length;

  // Repo volume: 0–20, capped at 30 repos
  const repo_volume = Math.round(Math.min(repoCount / 30, 1) * 20);

  // Star count: 0–20, capped at 500 stars
  const star_count = Math.round(Math.min(totalStars / 500, 1) * 20);

  // Language diversity: 0–20, based on distinct languages
  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  const language_diversity = Math.round(Math.min(languages.size / 8, 1) * 20);

  // Skill count: 0–20, based on unique skills detected
  const skill_count = Math.round(Math.min(skills.length / 15, 1) * 20);

  // Account activity: 0–20, repos updated in last 90 days / total
  const ninetyDaysAgo = Date.now() - 90 * 86400000;
  const recentRepos = repos.filter(r => new Date(r.updated_at).getTime() > ninetyDaysAgo).length;
  const account_activity = repoCount > 0
    ? Math.round((recentRepos / repoCount) * 20)
    : 0;

  return { repo_volume, star_count, language_diversity, skill_count, account_activity };
}

/**
 * Calculate the total potential score (0–100) from a breakdown.
 */
export function calculateScore(breakdown: ScoreBreakdown): number {
  return breakdown.repo_volume
    + breakdown.star_count
    + breakdown.language_diversity
    + breakdown.skill_count
    + breakdown.account_activity;
}

/**
 * Get the human-readable label for a score.
 */
export function getScoreLabel(score: number): PotentialLabel {
  if (score >= 81) return 'Expert';
  if (score >= 61) return 'Proficient';
  if (score >= 41) return 'Developing';
  if (score >= 21) return 'Emerging';
  return 'Beginner';
}
