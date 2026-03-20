'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Developer, QAMessage } from '@/lib/types';

interface UseQAReturn {
  messages: QAMessage[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSend: (text: string) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useQA(developer: Developer): UseQAReturn {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      .map(r => `${r.name}: ${r.description || 'No description'} (Stars: ${r.stars}, Lang: ${r.language})`)
      .join(' | ');

    const languagePercentages = developer.languages
      .map(l => `${l.name}: ${Math.round(l.percentage)}%`)
      .join(', ');

    return {
      username: developer.username,
      score: developer.potential_score,
      label: developer.potential_label,
      repo_count: developer.public_repos,
      skills_with_confidence: skillsList,
      top_5_repos: topRepos,
      language_percentages: languagePercentages,
    };
  }, [developer]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages: QAMessage[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          developerContext: generateContext(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. The `/api/qa` endpoint may not be configured yet (Phase 9).'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, generateContext]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    messagesEndRef,
  };
}
