// lib/prompt.ts — AI prompt builders for Hiring Agent and Q&A Agent

import { Developer } from './types';
import { buildExplainabilitySummary } from './explainability';

/**
 * Build the system prompt for the Hiring Agent.
 * Recruiter-facing. Resume-aware. Conversation persisted.
 */
export function buildHiringPrompt(developer: Developer): string {
  const skillsList = developer.skills
    .map(s => `${s.name} (${Math.round(s.confidence * 100)}% conf, ${s.repo_count} repos: ${s.source_repos.slice(0, 3).join(', ')})`)
    .join('\n  ');

  const topRepos = developer.repos
    .sort((a, b) => b.complexity_score - a.complexity_score)
    .slice(0, 5)
    .map(r => `${r.name}: ${r.description || 'No description'} [Stars: ${r.stars}, Complexity: ${r.complexity_score}, Lang: ${r.language}]`)
    .join('\n  ');

  const langBreakdown = developer.languages
    .map(l => `${l.name}: ${Math.round(l.percentage)}%`)
    .join(', ');

  const explainability = buildExplainabilitySummary(developer.skills, developer.languages);

  return `You are a technical hiring assistant. Answer ONLY from the candidate data below.
Do not invent skills or experience. Cite specific repos or resume lines as evidence.
Keep responses to 3–5 sentences. If you cannot answer from the data, say so.

--- CANDIDATE DATA ---
GitHub: ${developer.username} | Score: ${developer.potential_score}/100 (${developer.potential_label}) | Repos: ${developer.public_repos} | Stars: ${developer.total_stars}

Skills:
  ${skillsList || 'No skills detected'}

Top Repos:
  ${topRepos || 'No repos available'}

Languages: ${langBreakdown || 'No language data'}

${explainability}

Resume: ${developer.resume_text || 'No resume uploaded — answering from GitHub data only'}
--- END ---

Guidelines:
- Always cite the specific repo or resume line that supports your claim
- If comparing skills, reference confidence percentages
- If asked about role fit, reason from detected skill categories
- Never hallucinate skills that aren't in the data above`;
}

/**
 * Build the system prompt for the Q&A Agent.
 * Developer-facing. GitHub-only by default. Stateless.
 */
export function buildQAPrompt(developer: Developer): string {
  const skillsList = developer.skills
    .map(s => `${s.name}: ${Math.round(s.confidence * 100)}% confidence (${s.repo_count} repos)`)
    .join('\n  ');

  const topRepos = developer.repos
    .sort((a, b) => b.complexity_score - a.complexity_score)
    .slice(0, 5)
    .map(r => `${r.name}: ${r.description || 'No description'} [Stars: ${r.stars}, Lang: ${r.language}]`)
    .join('\n  ');

  const langBreakdown = developer.languages
    .map(l => `${l.name}: ${Math.round(l.percentage)}%`)
    .join(', ');

  return `You are an AI profile assistant for a developer's public GitHub.
Answer ONLY from the GitHub data below. Do not invent skills or scores.
When asked about role fit or gaps, reason from detected skill categories.
Keep responses clear and actionable, 3–5 sentences.

--- GITHUB DATA ---
GitHub: ${developer.username} | Score: ${developer.potential_score}/100 (${developer.potential_label}) | Repos: ${developer.public_repos}

Skills:
  ${skillsList || 'No skills detected'}

Top Repos:
  ${topRepos || 'No repos available'}

Languages: ${langBreakdown || 'No language data'}

Score Breakdown:
  Repo Volume: ${developer.score_breakdown.repo_volume}/20
  Star Count: ${developer.score_breakdown.star_count}/20
  Language Diversity: ${developer.score_breakdown.language_diversity}/20
  Skill Count: ${developer.score_breakdown.skill_count}/20
  Account Activity: ${developer.score_breakdown.account_activity}/20
--- END ---

Guidelines:
- When explaining the score, reference specific breakdown values
- For role fit questions, map detected skills to typical role requirements
- For gap analysis, identify missing skill categories
- Never hallucinate skills or repos that aren't listed above`;
}
