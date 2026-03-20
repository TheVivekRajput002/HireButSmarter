'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/Navbar';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { CompareRadarChart } from '@/components/compare/CompareRadarChart';
import { CompareResults } from '@/components/compare/CompareResults';
import { ArrowLeftRight, Search, Share2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryU1 = searchParams.get('u1') || '';
  const queryU2 = searchParams.get('u2') || '';

  const [inputU1, setInputU1] = useState(queryU1);
  const [inputU2, setInputU2] = useState(queryU2);

  // Keep inputs mapped to query if navigating via back/forward
  useEffect(() => {
    setInputU1(queryU1);
    setInputU2(queryU2);
  }, [queryU1, queryU2]);

  const { data: dev1, isLoading: load1, error: err1 } = useProfile(queryU1);
  const { data: dev2, isLoading: load2, error: err2 } = useProfile(queryU2);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputU1 && inputU2) {
      router.push(`/compare?u1=${inputU1}&u2=${inputU2}`);
    }
  };

  const handleSwap = () => {
    setInputU1(inputU2);
    setInputU2(inputU1);
    router.push(`/compare?u1=${inputU2}&u2=${inputU1}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Comparison link copied!');
  };

  const isResultsMode = !!(queryU1 && queryU2);
  const isLoading = load1 || load2;
  const hasError = !!(err1 || err2);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col font-body">
      <Navbar />

      <main className="flex-1 w-full max-w-[1152px] mx-auto p-4 md:p-6 pb-24 space-y-8">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--bg-border)]">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-6 h-6 text-[var(--brand-green)]" />
              Developer Comparison
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Compare skills, complexity, and open-source impact side-by-side.
            </p>
          </div>

          <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Developer 1" 
              value={inputU1} 
              onChange={e => setInputU1(e.target.value)} 
              className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-green)]"
            />
            <button 
              type="button" 
              onClick={handleSwap} 
              className="p-2 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors flex items-center justify-center shrink-0"
              title="Swap Users"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              placeholder="Developer 2" 
              value={inputU2} 
              onChange={e => setInputU2(e.target.value)} 
              className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-green)]"
            />
            <button 
              type="submit" 
              disabled={!inputU1 || !inputU2 || isLoading}
              className="px-4 py-2 bg-[var(--brand-green)] text-[#0D0F14] font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
            >
              Compare
            </button>
          </form>
        </div>

        {/* Empty State */}
        {!isResultsMode && !isLoading && !hasError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center justify-center mb-6">
              <ArrowLeftRight className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ready to Compare</h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              Enter two GitHub usernames above to see a detailed side-by-side comparison of their skills, repos, and potential scores.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="h-64 rounded-xl bg-[var(--bg-elevated)]" />
            <div className="h-64 rounded-xl bg-[var(--bg-elevated)]" />
            <div className="col-span-1 md:col-span-2 h-96 rounded-xl bg-[var(--bg-elevated)] mt-6" />
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center">
            Could not load one or both profiles. Please check the usernames and try again.
          </div>
        )}

        {/* Results State */}
        {isResultsMode && !isLoading && dev1 && dev2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col gap-6"
          >
            <div className="flex justify-end mb-2">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg hover:border-[var(--brand-green)] transition-all"
              >
                <Share2 className="w-4 h-4" /> Share Comparison
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative">
              <ProfileCard developer={dev1} className="h-full" />
              <ProfileCard developer={dev2} className="h-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overlapping Radar */}
              <div className="lg:col-span-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl p-6 flex flex-col items-center justify-center">
                <CompareRadarChart 
                  skills1={dev1.skills} 
                  skills2={dev2.skills} 
                  color1="var(--brand-green)" 
                  color2="#3B82F6" 
                />
                <div className="flex gap-4 mt-6 text-sm font-display">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--brand-green)]" />
                    <span className="text-[var(--text-primary)]">@{dev1.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                    <span className="text-[var(--text-primary)]">@{dev2.username}</span>
                  </div>
                </div>
              </div>

              {/* Stats Matrix & Unique Skills */}
              <div className="lg:col-span-2">
                <CompareResults dev1={dev1} dev2={dev2} />
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-base)]" />}>
      <ComparePageContent />
    </Suspense>
  );
}
