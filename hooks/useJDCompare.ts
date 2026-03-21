'use client';

import { useState, useCallback } from 'react';
import { Developer, MatchResult, JDSkill } from '@/lib/types';
import { extractJDSkills } from '@/lib/jd-parser';
import { computeMatchScore } from '@/lib/jd-matcher';

interface UseJDCompareReturn {
  jdText: string;
  setJDText: (text: string) => void;
  matchResult1: MatchResult | null;
  matchResult2: MatchResult | null;
  jdSkills: JDSkill[];
  aiVerdict: string | null;
  isAnalyzing: boolean;
  analyzeCompare: (dev1: Developer, dev2: Developer) => Promise<void>;
  clearCompare: () => void;
}

export function useJDCompare(): UseJDCompareReturn {
  const [jdText, setJDText] = useState('');
  const [matchResult1, setMatchResult1] = useState<MatchResult | null>(null);
  const [matchResult2, setMatchResult2] = useState<MatchResult | null>(null);
  const [jdSkills, setJDSkills] = useState<JDSkill[]>([]);
  const [aiVerdict, setAIVerdict] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCompare = useCallback(async (dev1: Developer, dev2: Developer) => {
    if (jdText.length < 50 || isAnalyzing) return;

    setIsAnalyzing(true);
    setAIVerdict(null);

    try {
      // Step 1: Extract JD skills (shared for both devs)
      const extractedSkills = extractJDSkills(jdText);
      setJDSkills(extractedSkills);

      // Step 2: Compute match scores for both
      const result1 = computeMatchScore(extractedSkills, dev1.skills);
      const result2 = computeMatchScore(extractedSkills, dev2.skills);
      setMatchResult1(result1);
      setMatchResult2(result2);

      // Step 3: Build developer contexts for Gemini
      const buildContext = (dev: Developer) => {
        const skillsList = dev.skills
          .map(s => `${s.name} (Conf: ${Math.round(s.confidence * 100)}%, in: ${s.source_repos.join(', ')})`)
          .join('; ');
        return {
          username: dev.username,
          score: dev.potential_score,
          label: dev.potential_label,
          skills_with_confidence_and_repo_list: skillsList,
          resume_text: dev.resume_text || 'Not provided',
        };
      };

      // Step 4: Gemini comparative analysis
      const response = await fetch('/api/analysis/jd-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dev1Context: buildContext(dev1),
          dev2Context: buildContext(dev2),
          matchResult1: result1,
          matchResult2: result2,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Comparison failed');

      setAIVerdict(data.analysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setAIVerdict(`Comparison error: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [jdText, isAnalyzing]);

  const clearCompare = useCallback(() => {
    setJDText('');
    setMatchResult1(null);
    setMatchResult2(null);
    setJDSkills([]);
    setAIVerdict(null);
  }, []);

  return {
    jdText,
    setJDText,
    matchResult1,
    matchResult2,
    jdSkills,
    aiVerdict,
    isAnalyzing,
    analyzeCompare,
    clearCompare,
  };
}
