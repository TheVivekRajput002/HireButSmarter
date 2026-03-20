// lib/jd-parser.ts — Client-side JD skill extraction using existing taxonomy

import { SKILL_TAXONOMY, getSkillCategory } from './skills';
import { JDSkill } from './types';

/**
 * Extract skills from a job description by scanning against the existing taxonomy.
 * Runs entirely client-side — no API call needed.
 */
export function extractJDSkills(jdText: string): JDSkill[] {
  const lowerText = jdText.toLowerCase();
  const found: JDSkill[] = [];
  const seen = new Set<string>();

  for (const [, keywords] of Object.entries(SKILL_TAXONOMY)) {
    for (const keyword of keywords) {
      if (seen.has(keyword.toLowerCase())) continue;

      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');

      if (pattern.test(jdText) || lowerText.includes(keyword.toLowerCase())) {
        seen.add(keyword.toLowerCase());
        found.push({
          name: keyword,
          category: getSkillCategory(keyword),
          required: isRequired(jdText, keyword),
        });
      }
    }
  }

  return found;
}

/**
 * Heuristic: if the keyword appears near "required"/"must"/"need" it's required.
 * If near "nice to have"/"preferred"/"bonus"/"optional" it's optional.
 * Default: required (safer assumption for gap analysis).
 */
function isRequired(jdText: string, keyword: string): boolean {
  const idx = jdText.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return true;

  const start = Math.max(0, idx - 100);
  const end = Math.min(jdText.length, idx + keyword.length + 100);
  const surrounding = jdText.slice(start, end).toLowerCase();

  return !/(nice.to.have|preferred|bonus|plus|optional|ideally|familiarity)/i.test(surrounding);
}
