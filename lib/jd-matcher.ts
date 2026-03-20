// lib/jd-matcher.ts — Client-side match score computation

import { Skill } from './types';
import type { JDSkill, MatchedSkill, MissingSkill, MatchResult } from './types';

/**
 * Compute a match score (0–100) by comparing JD skills against candidate skills.
 * Required skills weighted 70%, optional 30%.
 * Runs entirely client-side — no API call needed.
 */
export function computeMatchScore(
  jdSkills: JDSkill[],
  candidateSkills: Skill[]
): MatchResult {
  const candidateMap = new Map(
    candidateSkills.map(s => [s.name.toLowerCase(), s])
  );

  const matched: MatchedSkill[] = [];
  const missing: MissingSkill[] = [];

  for (const jdSkill of jdSkills) {
    const candidate = candidateMap.get(jdSkill.name.toLowerCase());
    if (candidate) {
      matched.push({
        ...jdSkill,
        confidence: candidate.confidence,
        source_repos: candidate.source_repos,
      });
    } else {
      missing.push({ ...jdSkill });
    }
  }

  const requiredTotal = jdSkills.filter(s => s.required).length;
  const requiredMatched = matched.filter(s => s.required).length;
  const optionalTotal = jdSkills.filter(s => !s.required).length;
  const optionalMatched = matched.filter(s => !s.required).length;

  // Required skills weighted 70%, optional 30%
  const requiredScore = requiredTotal ? (requiredMatched / requiredTotal) * 70 : 70;
  const optionalScore = optionalTotal ? (optionalMatched / optionalTotal) * 30 : 30;
  const matchScore = Math.round(requiredScore + optionalScore);

  return {
    matchScore,
    matched,
    missing,
    requiredMatched,
    requiredTotal,
    optionalMatched,
    optionalTotal,
  };
}
