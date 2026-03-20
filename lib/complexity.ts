// lib/complexity.ts — Repository complexity scoring

import { GitHubRepo } from './github';

/**
 * Calculate complexity score (0–100) for a single repository.
 *
 * Weighted formula:
 *   - Stars:       25% — capped at 100 stars
 *   - Forks:       15% — capped at 50 forks
 *   - Size:        20% — capped at 50,000 KB
 *   - Description: 10% — bonus for having a description
 *   - Recency:     30% — updated in last 90/180/365 days
 */
export function calculateComplexity(repo: GitHubRepo): number {
  // Stars — 0 to 25
  const starScore = Math.min(repo.stargazers_count / 100, 1) * 25;

  // Forks — 0 to 15
  const forkScore = Math.min(repo.forks_count / 50, 1) * 15;

  // Size — 0 to 20 (larger repos indicate more code)
  const sizeScore = Math.min(repo.size / 50000, 1) * 20;

  // Description — 0 or 10
  const descScore = repo.description && repo.description.length > 10 ? 10 : 0;

  // Recency — 0 to 30
  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / 86400000;
  let recencyScore = 0;
  if (daysSinceUpdate < 30) recencyScore = 30;
  else if (daysSinceUpdate < 90) recencyScore = 25;
  else if (daysSinceUpdate < 180) recencyScore = 15;
  else if (daysSinceUpdate < 365) recencyScore = 8;
  else recencyScore = 3;

  return Math.round(starScore + forkScore + sizeScore + descScore + recencyScore);
}
