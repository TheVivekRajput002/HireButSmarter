// lib/skills.ts — Skill taxonomy, extraction, and aggregation

import { Skill, SkillCategory } from './types';

// ── Skill Taxonomy ────────────────────────────────────────────
// Regex keyword scan against a hardcoded taxonomy. Fast, deterministic, fully explainable.
export const SKILL_TAXONOMY: Record<SkillCategory, string[]> = {
  Frontend: ['React', 'Next.js', 'Nextjs', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'TailwindCSS', 'Tailwind', 'HTML', 'CSS', 'Vite', 'Webpack', 'SCSS', 'SASS', 'jQuery', 'Redux', 'Zustand', 'Framer Motion'],
  Backend: ['Node.js', 'Nodejs', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring', 'Laravel', 'GraphQL', 'REST', 'tRPC', 'NestJS', 'Hono', 'Koa', 'Gin', 'Rails', 'Ruby on Rails'],
  Database: ['PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'SQLite', 'Prisma', 'Drizzle', 'Mongoose', 'DynamoDB', 'Cassandra'],
  DevOps: ['Docker', 'Kubernetes', 'K8s', 'GitHub Actions', 'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify', 'CI/CD', 'Linux', 'Terraform', 'Nginx', 'Jenkins'],
  Mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'SwiftUI', 'Jetpack Compose', 'Ionic'],
  Testing: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'pytest', 'Testing Library', 'Mocha', 'Chai', 'Selenium', 'JUnit'],
};

/**
 * Extract skills from a single text blob (README content, repo description, etc.)
 * Returns a set of skill names found.
 */
export function extractSkillsFromText(text: string): Set<string> {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const [, keywords] of Object.entries(SKILL_TAXONOMY)) {
    for (const keyword of keywords) {
      // Case-insensitive word boundary search
      const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text) || lowerText.includes(keyword.toLowerCase())) {
        found.add(keyword);
      }
    }
  }

  return found;
}

/**
 * Get the category for a given skill name.
 */
export function getSkillCategory(skillName: string): SkillCategory {
  for (const [category, keywords] of Object.entries(SKILL_TAXONOMY)) {
    if (keywords.some(k => k.toLowerCase() === skillName.toLowerCase())) {
      return category as SkillCategory;
    }
  }
  return 'Frontend'; // fallback
}

/**
 * Aggregate skills across all repos.
 * Each skill gets: confidence (repo_count / total_repos), repo_count, source_repos.
 */
export function aggregateSkills(
  repoSkillMap: Map<string, Set<string>>,
  totalRepos: number
): Skill[] {
  const skillMap = new Map<string, { repos: string[]; category: SkillCategory }>();

  for (const [repoName, skills] of repoSkillMap.entries()) {
    for (const skill of skills) {
      if (!skillMap.has(skill)) {
        skillMap.set(skill, { repos: [], category: getSkillCategory(skill) });
      }
      skillMap.get(skill)!.repos.push(repoName);
    }
  }

  const result: Skill[] = [];
  for (const [name, data] of skillMap.entries()) {
    result.push({
      name,
      category: data.category,
      confidence: Math.min(data.repos.length / Math.max(totalRepos, 1), 1),
      repo_count: data.repos.length,
      source_repos: data.repos,
    });
  }

  // Sort by confidence descending
  return result.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract skills from a repo's language + description + README.
 */
export function extractRepoSkills(
  language: string | null,
  description: string | null,
  readmeContent: string | null
): Set<string> {
  const skills = new Set<string>();

  // From language field
  if (language) {
    const langSkills = extractSkillsFromText(language);
    langSkills.forEach(s => skills.add(s));
  }

  // From description
  if (description) {
    const descSkills = extractSkillsFromText(description);
    descSkills.forEach(s => skills.add(s));
  }

  // From README
  if (readmeContent) {
    const readmeSkills = extractSkillsFromText(readmeContent);
    readmeSkills.forEach(s => skills.add(s));
  }

  return skills;
}
