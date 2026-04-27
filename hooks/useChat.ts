'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Developer, MatchResult } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StructuredResumeData {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  contact: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
}

interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  resumeText: string | null;
  resumeFileName: string | null;
  structuredResumeData: StructuredResumeData | null;
  handleSend: (text: string) => Promise<void>;
  handleResumeUpload: (text: string, fileName: string, structuredData?: StructuredResumeData) => void;
  handleResumeClear: () => void;
  hasResume: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useChat(developer: Developer, matchResult?: MatchResult | null): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [structuredResumeData, setStructuredResumeData] = useState<StructuredResumeData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const generateContext = useCallback(() => {
    const skillsList = developer.skills
      .map(s => `${s.name} (Conf: ${Math.round(s.confidence * 100)}%, in: ${s.source_repos.join(', ')})`)
      .join('; ');

    const topRepos = developer.repos
      .slice(0, 5)
      .map(r => `${r.name}: ${r.description || 'No description'} (Stars: ${r.stars}, Lang: ${r.language}, Complexity: ${r.complexity_score})`)
      .join(' | ');

    const languagePercentages = developer.languages
      .map(l => `${l.name}: ${Math.round(l.percentage)}%`)
      .join(', ');

    // Format structured resume data for better context
    const formattedResumeData = structuredResumeData ? {
      skills: structuredResumeData.skills.join(', ') || 'None detected',
      experience: structuredResumeData.experience.map(exp => 
        `${exp.title} at ${exp.company} (${exp.duration}): ${exp.description.slice(0, 2).join('; ')}`
      ).join(' | ') || 'None detected',
      education: structuredResumeData.education.map(edu => 
        `${edu.degree} from ${edu.institution} (${edu.year})`
      ).join(' | ') || 'None detected',
      contact: {
        email: structuredResumeData.contact.email || 'Not found',
        github: structuredResumeData.contact.github || 'Not found',
        linkedin: structuredResumeData.contact.linkedin || 'Not found'
      }
    } : null;

    return {
      username: developer.username,
      score: developer.potential_score,
      label: developer.potential_label,
      repo_count: developer.public_repos,
      total_stars: developer.total_stars,
      skills_with_confidence_and_repo_list: skillsList,
      top_5_repos_with_complexity_and_description: topRepos,
      language_percentages: languagePercentages,
      consistency_score: developer.consistency_score,
      active_days: developer.heatmap_data?.stats.active_days,
      commit_quality_score: developer.commit_quality_score,
      commits_analyzed: developer.commit_quality?.repoScores.reduce((acc, r) => acc + r.commitCount, 0),
      resume_text: resumeText || 'No resume uploaded',
      structured_resume_data: formattedResumeData,
      jd_match_context: matchResult ? {
        matchScore: matchResult.matchScore,
        requiredMatched: matchResult.requiredMatched,
        requiredTotal: matchResult.requiredTotal,
        optionalMatched: matchResult.optionalMatched,
        optionalTotal: matchResult.optionalTotal,
        missingRequired: matchResult.missing.filter(s => s.required).map(s => s.name).join(', '),
        missingOptional: matchResult.missing.filter(s => !s.required).map(s => s.name).join(', '),
      } : null,
    };
  }, [developer, resumeText, structuredResumeData, matchResult]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          developerContext: generateContext(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, something went wrong: ${message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, generateContext]);

  const handleResumeUpload = useCallback((text: string, fileName: string, structuredData?: StructuredResumeData) => {
    console.log('useChat - Resume upload received:', {
      textLength: text.length,
      fileName,
      hasStructuredData: !!structuredData,
      structuredDataKeys: structuredData ? Object.keys(structuredData) : []
    });
    setResumeText(text);
    setResumeFileName(fileName);
    setStructuredResumeData(structuredData || null);
  }, []);

  const handleResumeClear = useCallback(() => {
    setResumeText(null);
    setResumeFileName(null);
    setStructuredResumeData(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    resumeText,
    resumeFileName,
    structuredResumeData,
    handleSend,
    handleResumeUpload,
    handleResumeClear,
    hasResume: !!resumeText,
    messagesEndRef,
  };
}
