// store/index.ts — Zustand global store

import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface AppStore {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Comparison
  compareUser1: string;
  compareUser2: string;
  setCompareUser1: (username: string) => void;
  setCompareUser2: (username: string) => void;
  swapCompareUsers: () => void;
  clearComparison: () => void;

  // Active candidate (for AI panel context)
  activeCandidateId: string | null;
  setActiveCandidateId: (id: string | null) => void;

  // UI panels
  isChatOpen: boolean;
  isQAOpen: boolean;
  setChatOpen: (open: boolean) => void;
  setQAOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Theme — default dark
  theme: 'dark',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('skilllens-theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('skilllens-theme', next);
      }
      return { theme: next };
    }),

  // Comparison
  compareUser1: '',
  compareUser2: '',
  setCompareUser1: (username) => set({ compareUser1: username }),
  setCompareUser2: (username) => set({ compareUser2: username }),
  swapCompareUsers: () =>
    set((state) => ({
      compareUser1: state.compareUser2,
      compareUser2: state.compareUser1,
    })),
  clearComparison: () => set({ compareUser1: '', compareUser2: '' }),

  // Active candidate
  activeCandidateId: null,
  setActiveCandidateId: (id) => set({ activeCandidateId: id }),

  // UI panels
  isChatOpen: false,
  isQAOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open, isQAOpen: false }),
  setQAOpen: (open) => set({ isQAOpen: open, isChatOpen: false }),
}));
