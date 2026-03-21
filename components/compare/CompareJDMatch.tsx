'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Developer, MatchResult } from '@/lib/types';
import {
  CheckCircle2,
  XCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  Search,
  Trophy,
  Crown,
} from 'lucide-react';

interface Props {
  dev1: Developer;
  dev2: Developer;
  jdText: string;
  setJDText: (text: string) => void;
  matchResult1: MatchResult | null;
  matchResult2: MatchResult | null;
  aiVerdict: string | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onClear: () => void;
}

const MAX_CHARS = 5000;
const MIN_CHARS = 50;

export function CompareJDMatch({
  dev1,
  dev2,
  jdText,
  setJDText,
  matchResult1,
  matchResult2,
  aiVerdict,
  isAnalyzing,
  onAnalyze,
  onClear,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllMatched1, setShowAllMatched1] = useState(false);
  const [showAllMatched2, setShowAllMatched2] = useState(false);

  const charCount = jdText.length;
  const canAnalyze = charCount >= MIN_CHARS && charCount <= MAX_CHARS && !isAnalyzing;
  const hasResults = !!(matchResult1 && matchResult2);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--score-expert)';
    if (score >= 60) return 'var(--score-prof)';
    if (score >= 40) return 'var(--score-dev)';
    return 'var(--score-beginner)';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Partial Match';
    return 'Weak Match';
  };

  const getWinner = (): 0 | 1 | 2 => {
    if (!matchResult1 || !matchResult2) return 0;
    if (matchResult1.matchScore > matchResult2.matchScore) return 1;
    if (matchResult2.matchScore > matchResult1.matchScore) return 2;
    return 0;
  };

  const winner = getWinner();

  const summaryText = hasResults
    ? `${matchResult1!.matchScore} vs ${matchResult2!.matchScore} — ${winner === 1 ? `@${dev1.username} leads` : winner === 2 ? `@${dev2.username} leads` : 'Tied'}`
    : 'Paste a JD to compare candidates';

  // Render a score gauge
  const ScoreGauge = ({ score, username, isWinner, color }: { score: number; username: string; isWinner: boolean; color: string }) => (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {isWinner && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 z-10"
          >
            <Crown className="w-5 h-5" style={{ color }} />
          </motion.div>
        )}
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--bg-elevated)" strokeWidth="5" />
          <motion.circle
            cx="36" cy="36" r="30" fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="5"
            strokeDasharray={`${(score / 100) * 188.5} 188.5`}
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 188.5' }}
            animate={{ strokeDasharray: `${(score / 100) * 188.5} 188.5` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-[var(--text-primary)]">
          {score}
        </span>
      </div>
      <div className="text-center">
        <span className="text-sm font-bold text-[var(--text-primary)] block">@{username}</span>
        <span className="text-xs text-[var(--text-muted)]">{getScoreLabel(score)}</span>
      </div>
    </div>
  );

  // Render skill list for one dev
  const SkillList = ({ result, showAll, setShowAll, accentColor }: {
    result: MatchResult;
    showAll: boolean;
    setShowAll: (v: boolean) => void;
    accentColor: string;
  }) => (
    <div className="space-y-4">
      {/* Matched */}
      {result.matched.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">Matched ({result.matched.length})</h5>
          <div className="space-y-1.5">
            {(showAll ? result.matched : result.matched.slice(0, 4)).map(skill => (
              <div key={skill.name} className="flex items-center gap-2 text-xs p-2 rounded-md bg-[var(--brand-green)]/5 border border-[var(--brand-green)]/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-green)] shrink-0" />
                <span className="font-semibold text-[var(--text-primary)] truncate">{skill.name}</span>
                <span className="text-[var(--text-muted)] font-display ml-auto shrink-0">{Math.round(skill.confidence * 100)}%</span>
              </div>
            ))}
            {result.matched.length > 4 && (
              <button onClick={() => setShowAll(!showAll)} className="text-[10px] hover:underline" style={{ color: accentColor }}>
                {showAll ? 'Show less' : `+${result.matched.length - 4} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Missing */}
      {result.missing.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">Missing ({result.missing.length})</h5>
          <div className="space-y-1.5">
            {result.missing.map(skill => (
              <div key={skill.name} className={cn(
                "flex items-center gap-2 text-xs p-2 rounded-md border",
                skill.required
                  ? "bg-[var(--error)]/5 border-[var(--error)]/10"
                  : "bg-[var(--bg-elevated)]/30 border-[var(--bg-border)]"
              )}>
                {skill.required
                  ? <XCircle className="w-3.5 h-3.5 text-[var(--error)] shrink-0" />
                  : <Circle className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                }
                <span className="font-semibold text-[var(--text-primary)] truncate">{skill.name}</span>
                <span className={cn(
                  "ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                  skill.required ? "text-[var(--error)] bg-[var(--error)]/10" : "text-[var(--text-muted)] bg-[var(--bg-elevated)]"
                )}>
                  {skill.required ? 'req' : 'opt'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-[var(--bg-elevated)]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--brand-green)]/15 rounded-lg">
            <Trophy className="w-5 h-5 text-[var(--brand-green)]" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">JD Comparison Match</h3>
            <p className="text-xs text-[var(--text-muted)]">{summaryText}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              {/* Input State */}
              {!hasResults && (
                <div className="space-y-3">
                  <textarea
                    value={jdText}
                    onChange={e => setJDText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Paste a job description here to compare both candidates against the required skills..."
                    className="w-full h-36 p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-green)] transition-colors resize-none font-body"
                    disabled={isAnalyzing}
                  />
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-display",
                      charCount < MIN_CHARS ? "text-[var(--warning)]" : "text-[var(--text-muted)]"
                    )}>
                      {charCount} / {MAX_CHARS} chars {charCount < MIN_CHARS && `(min ${MIN_CHARS})`}
                    </span>
                    <button
                      onClick={onAnalyze}
                      disabled={!canAnalyze}
                      className="px-4 py-2 bg-[var(--brand-green)] text-[#0D0F14] text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <motion.div className="w-4 h-4 border-2 border-[#0D0F14]/30 border-t-[#0D0F14] rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Compare Against JD
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Results State */}
              {hasResults && matchResult1 && matchResult2 && (
                <div className="space-y-6">
                  {/* Score Header — side by side */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8 sm:gap-12 flex-1 justify-center">
                      <ScoreGauge
                        score={matchResult1.matchScore}
                        username={dev1.username}
                        isWinner={winner === 1}
                        color="var(--brand-green)"
                      />

                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">vs</span>
                        {winner !== 0 && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: winner === 1 ? 'var(--brand-green)' : '#3B82F6',
                              color: '#0D0F14',
                            }}
                          >
                            +{Math.abs(matchResult1.matchScore - matchResult2.matchScore)} pts
                          </motion.span>
                        )}
                      </div>

                      <ScoreGauge
                        score={matchResult2.matchScore}
                        username={dev2.username}
                        isWinner={winner === 2}
                        color="#3B82F6"
                      />
                    </div>

                    <button
                      onClick={onClear}
                      className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--bg-elevated)] shrink-0 self-start"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  </div>

                  {/* Requirement summary bar */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)]">
                      <div className="text-xs text-[var(--text-muted)] mb-1 font-semibold">@{dev1.username}</div>
                      <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                        <span>Required: <strong className="text-[var(--text-primary)]">{matchResult1.requiredMatched}/{matchResult1.requiredTotal}</strong></span>
                        <span>Optional: <strong className="text-[var(--text-primary)]">{matchResult1.optionalMatched}/{matchResult1.optionalTotal}</strong></span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)]">
                      <div className="text-xs text-[var(--text-muted)] mb-1 font-semibold">@{dev2.username}</div>
                      <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                        <span>Required: <strong className="text-[var(--text-primary)]">{matchResult2.requiredMatched}/{matchResult2.requiredTotal}</strong></span>
                        <span>Optional: <strong className="text-[var(--text-primary)]">{matchResult2.optionalMatched}/{matchResult2.optionalTotal}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side skill lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)]">
                      <h4 className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--brand-green)' }}>
                        @{dev1.username} Skills
                      </h4>
                      <SkillList
                        result={matchResult1}
                        showAll={showAllMatched1}
                        setShowAll={setShowAllMatched1}
                        accentColor="var(--brand-green)"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)]">
                      <h4 className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: '#3B82F6' }}>
                        @{dev2.username} Skills
                      </h4>
                      <SkillList
                        result={matchResult2}
                        showAll={showAllMatched2}
                        setShowAll={setShowAllMatched2}
                        accentColor="#3B82F6"
                      />
                    </div>
                  </div>

                  {/* AI Verdict */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Verdict
                    </h4>
                    {isAnalyzing ? (
                      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)] animate-pulse space-y-2">
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[90%]" />
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[75%]" />
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[85%]" />
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[60%]" />
                      </div>
                    ) : aiVerdict ? (
                      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                        {aiVerdict}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
