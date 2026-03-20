'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Developer } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  resumeText: string | null;
  resumeFileName: string | null;
  handleSend: (text: string) => Promise<void>;
  handleResumeUpload: (text: string, fileName: string) => void;
  handleResumeClear: () => void;
  hasResume: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useChat(developer: Developer): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
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
    };
  }, [developer, resumeText]);

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

  const handleResumeUpload = useCallback((text: string, fileName: string) => {
    setResumeText(text);
    setResumeFileName(fileName);
  }, []);

  const handleResumeClear = useCallback(() => {
    setResumeText(null);
    setResumeFileName(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    resumeText,
    resumeFileName,
    handleSend,
    handleResumeUpload,
    handleResumeClear,
    hasResume: !!resumeText,
    messagesEndRef,
  };
}
