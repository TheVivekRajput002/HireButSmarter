'use client';

import { useState, useCallback } from 'react';
import { Developer, MatchResult, JDSkill } from '@/lib/types';
import { extractJDSkills } from '@/lib/jd-parser';
import { computeMatchScore } from '@/lib/jd-matcher';

interface UseJDMatchReturn {
  jdText: string;
  setJDText: (text: string) => void;
  matchResult: MatchResult | null;
  jdSkills: JDSkill[];
  aiAnalysis: string | null;
  isAnalyzing: boolean;
  analyzeMatch: (developer: Developer) => Promise<void>;
  clearMatch: () => void;
}

export function useJDMatch(): UseJDMatchReturn {
  const [jdText, setJDText] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [jdSkills, setJDSkills] = useState<JDSkill[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMatch = useCallback(async (developer: Developer) => {
    if (jdText.length < 50 || isAnalyzing) return;

    setIsAnalyzing(true);
    setAIAnalysis(null);

    try {
      // Step 1: Client-side skill extraction
      const extractedSkills = extractJDSkills(jdText);
      setJDSkills(extractedSkills);

      // Step 2: Client-side match scoring
      const result = computeMatchScore(extractedSkills, developer.skills);
      setMatchResult(result);

      // Step 3: Build developer context for Gemini
      const skillsList = developer.skills
        .map(s => `${s.name} (Conf: ${Math.round(s.confidence * 100)}%, in: ${s.source_repos.join(', ')})`)
        .join('; ');

      const developerContext = {
        username: developer.username,
        score: developer.potential_score,
        label: developer.potential_label,
        skills_with_confidence_and_repo_list: skillsList,
        resume_text: developer.resume_text || 'Not provided',
      };

      // Step 4: Gemini explainability call
      const response = await fetch('/api/analysis/jd-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerContext, matchResult: result }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');

      setAIAnalysis(data.analysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setAIAnalysis(`Analysis error: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [jdText, isAnalyzing]);

  const clearMatch = useCallback(() => {
    setJDText('');
    setMatchResult(null);
    setJDSkills([]);
    setAIAnalysis(null);
  }, []);

  return {
    jdText,
    setJDText,
    matchResult,
    jdSkills,
    aiAnalysis,
    isAnalyzing,
    analyzeMatch,
    clearMatch,
  };
}
