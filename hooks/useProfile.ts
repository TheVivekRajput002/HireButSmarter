'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Developer } from '@/lib/types';
import { useAppStore } from '@/store';
import { useEffect } from 'react';

/**
 * Fetches and caches a developer profile from the real API.
 * Calls GET /api/profile/[username] which triggers:
 *   GitHub fetch → skill extraction → scoring → Supabase save
 */
export function useProfile(username: string) {
  const { setActiveCandidateId } = useAppStore();

  const query = useQuery<Developer>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await axios.get<Developer>(`/api/profile/${username}`);
      return data;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 mins — avoid re-fetching for the same user
    retry: 1,
  });

  // Update global active candidate for AI agents
  useEffect(() => {
    if (query.data?.id) {
      setActiveCandidateId(query.data.id);
    }
  }, [query.data?.id, setActiveCandidateId]);

  return query;
}

export function useHeatmap(username: string) {
  return useQuery({
    queryKey: ['heatmap', username],
    queryFn: async () => {
      const { data } = await axios.get(`/api/github/heatmap?username=${username}`);
      return data;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

export function useCommitQuality(username: string, repos: string[]) {
  const reposStr = repos.slice(0, 5).join(',');
  return useQuery({
    queryKey: ['commit-quality', username, reposStr],
    queryFn: async () => {
      const { data } = await axios.get(`/api/github/commit-quality?username=${username}&repos=${reposStr}`);
      return data;
    },
    enabled: !!username && repos.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

