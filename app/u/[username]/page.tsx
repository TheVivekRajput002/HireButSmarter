
"use client"

import { use, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/Navbar';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ScoreBreakdownPanel } from '@/components/profile/ScoreBreakdown';
import { ExplainabilityReport } from '@/components/profile/ExplainabilityReport';
import { RadarChart } from '@/components/charts/RadarChart';
import { LanguageDonut } from '@/components/charts/LanguageDonut';
import { SkillBars } from '@/components/charts/SkillBars';
import { RepoExplorer } from '@/components/profile/RepoExplorer';
import { cn } from '@/lib/utils';
import { FileWarning } from 'lucide-react';
import { QAAgent } from '@/components/profile/QAAgent';
import { ChatPanel } from '@/components/chat/ChatPanel';

interface Props {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: Props) {
  // Setup standard unwrap of Next.js 15+ promise params 
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  
  const { data: developer, isLoading, error } = useProfile(username);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'repos'>('overview');

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col font-body">
      <Navbar />

      <main className="flex-1 w-full max-w-[1152px] mx-auto p-4 md:p-6 pb-24">
        {/* Loading State */}
        {isLoading && (
          <div className="w-full space-y-6 animate-pulse">
            <div className="h-48 rounded-xl bg-[var(--bg-elevated)]" />
            <div className="flex gap-4 border-b border-[var(--bg-border)] pb-2">
              <div className="h-8 w-24 rounded bg-[var(--bg-elevated)]" />
              <div className="h-8 w-24 rounded bg-[var(--bg-elevated)]" />
              <div className="h-8 w-24 rounded bg-[var(--bg-elevated)]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 rounded-xl bg-[var(--bg-elevated)]" />
              </div>
              <div className="space-y-4">
                <div className="h-32 rounded-xl bg-[var(--bg-elevated)]" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-surface)] rounded-xl border border-[var(--error)]/30 mt-12">
            <FileWarning className="w-12 h-12 text-[var(--error)] mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Failed to load profile</h2>
            <p className="text-[var(--text-secondary)]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(error as any)?.response?.data?.error || error.message || 'Unknown error occurred'}
            </p>
          </div>
        )}

        {/* Loaded State */}
        {developer && (
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-8">
            <motion.div variants={item}>
              <ProfileCard developer={developer} />
            </motion.div>

            {/* Tabs */}
            <motion.div variants={item} className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-[var(--bg-border)] hide-scrollbar overflow-x-auto">
                {(['overview', 'skills', 'repos'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-3 text-sm font-semibold capitalize transition-all relative whitespace-nowrap",
                      activeTab === tab ? "text-[var(--brand-green)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-t-lg"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-green)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                      {/* Left: Charts */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex flex-col items-center justify-center">
                            <RadarChart skills={developer.skills} />
                          </div>
                          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex flex-col items-center justify-center overflow-hidden">
                            <LanguageDonut languages={developer.languages} />
                          </div>
                        </div>
                        
                        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
                          <ExplainabilityReport skills={developer.skills} />
                        </div>
                      </div>

                      {/* Right: Breakdown & AI panels */}
                      <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
                          <ScoreBreakdownPanel breakdown={developer.score_breakdown} />
                        </div>
                        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
                          <RepoExplorer repos={developer.repos} compact />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'skills' && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] min-h-[400px]"
                    >
                      <SkillBars skills={developer.skills} />
                    </motion.div>
                  )}

                  {activeTab === 'repos' && (
                    <motion.div
                      key="repos"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] min-h-[400px]"
                    >
                      <RepoExplorer repos={developer.repos} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            <QAAgent developer={developer} />
            <ChatPanel developer={developer} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
