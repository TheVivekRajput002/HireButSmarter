'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseComparisonReturn {
  user1: string;
  user2: string;
  setUser1: (value: string) => void;
  setUser2: (value: string) => void;
  swap: () => void;
  compare: (u1: string, u2: string) => void;
  shareLink: () => void;
  isReady: boolean;
}

/**
 * Hook for managing comparison state via URL search params.
 * Keeps the URL as the single source of truth so links are shareable.
 */
export function useComparison(): UseComparisonReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const user1 = searchParams.get('u1') || '';
  const user2 = searchParams.get('u2') || '';
  const isReady = !!(user1 && user2);

  const setUser1 = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('u1', value);
    router.push(`/compare?${params.toString()}`);
  }, [router, searchParams]);

  const setUser2 = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('u2', value);
    router.push(`/compare?${params.toString()}`);
  }, [router, searchParams]);

  const swap = useCallback(() => {
    if (user1 || user2) {
      router.push(`/compare?u1=${user2}&u2=${user1}`);
    }
  }, [router, user1, user2]);

  const compare = useCallback((u1: string, u2: string) => {
    if (u1 && u2) {
      router.push(`/compare?u1=${u1}&u2=${u2}`);
    }
  }, [router]);

  const shareLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
  }, []);

  return {
    user1,
    user2,
    setUser1,
    setUser2,
    swap,
    compare,
    shareLink,
    isReady,
  };
}
