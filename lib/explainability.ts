// lib/explainability.ts — Build explainability reports

import { Skill, Language } from './types';

interface ExplainabilityEntry {
  skill: string;
  category: string;
  confidence: number;     // 0–1
  repo_count: number;
  source_repos: string[];
  signal: 'strong' | 'mid' | 'weak' | 'absent';
}

/**
 * Build the explainability report from aggregated skills.
 * Groups skills by signal strength and provides per-skill evidence.
 */
export function buildExplainabilityReport(skills: Skill[]): ExplainabilityEntry[] {
  return skills.map(s => ({
    skill: s.name,
    category: s.category,
    confidence: s.confidence,
    repo_count: s.repo_count,
    source_repos: s.source_repos,
    signal: getSignalStrength(s.confidence),
  }));
}

function getSignalStrength(confidence: number): 'strong' | 'mid' | 'weak' | 'absent' {
  if (confidence > 0.7) return 'strong';
  if (confidence >= 0.4) return 'mid';
  if (confidence > 0) return 'weak';
  return 'absent';
}

/**
 * Build a plain-text explainability summary for AI prompts.
 */
export function buildExplainabilitySummary(
  skills: Skill[],
  languages: Language[]
): string {
  const lines: string[] = [];

  lines.push('=== SKILL EXPLAINABILITY REPORT ===\n');

  const strong = skills.filter(s => s.confidence > 0.7);
  const mid = skills.filter(s => s.confidence >= 0.4 && s.confidence <= 0.7);
  const weak = skills.filter(s => s.confidence > 0 && s.confidence < 0.4);

  if (strong.length > 0) {
    lines.push('Strong signals (>70% confidence):');
    for (const s of strong) {
      lines.push(`  ✓ ${s.name} — ${Math.round(s.confidence * 100)}% confidence, found in ${s.repo_count} repo(s): ${s.source_repos.join(', ')}`);
    }
    lines.push('');
  }

  if (mid.length > 0) {
    lines.push('Moderate signals (40–70% confidence):');
    for (const s of mid) {
      lines.push(`  △ ${s.name} — ${Math.round(s.confidence * 100)}% confidence, found in ${s.repo_count} repo(s): ${s.source_repos.join(', ')}`);
    }
    lines.push('');
  }

  if (weak.length > 0) {
    lines.push('Weak signals (<40% confidence):');
    for (const s of weak) {
      lines.push(`  ▽ ${s.name} — ${Math.round(s.confidence * 100)}% confidence, found in ${s.repo_count} repo(s): ${s.source_repos.join(', ')}`);
    }
    lines.push('');
  }

  if (languages.length > 0) {
    lines.push('Language distribution:');
    for (const l of languages) {
      lines.push(`  ${l.name}: ${Math.round(l.percentage)}% (${l.repo_count} repos)`);
    }
  }

  return lines.join('\n');
}
