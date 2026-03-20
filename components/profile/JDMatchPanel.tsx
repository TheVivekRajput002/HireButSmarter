'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Developer, MatchResult } from '@/lib/types';
import { CheckCircle2, XCircle, Circle, ChevronDown, ChevronUp, Sparkles, RotateCcw, Search } from 'lucide-react';

interface Props {
  developer: Developer;
  jdText: string;
  setJDText: (text: string) => void;
  matchResult: MatchResult | null;
  aiAnalysis: string | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onClear: () => void;
}

const MAX_CHARS = 5000;
const MIN_CHARS = 50;

export function JDMatchPanel({
  developer,
  jdText,
  setJDText,
  matchResult,
  aiAnalysis,
  isAnalyzing,
  onAnalyze,
  onClear,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllMatched, setShowAllMatched] = useState(false);

  const charCount = jdText.length;
  const canAnalyze = charCount >= MIN_CHARS && charCount <= MAX_CHARS && !isAnalyzing;

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

  return (
    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-[var(--bg-elevated)]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--brand-green)]/15 rounded-lg">
            <Search className="w-5 h-5 text-[var(--brand-green)]" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Job Description Match</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {matchResult ? `${matchResult.matchScore}/100 — ${getScoreLabel(matchResult.matchScore)}` : 'Paste a JD to analyze fit'}
            </p>
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
              {/* Input state */}
              {!matchResult && (
                <div className="space-y-3">
                  <textarea
                    value={jdText}
                    onChange={e => setJDText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Paste a job description here to analyze how well this candidate matches the required skills..."
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
                          Analyze Match
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Results state */}
              {matchResult && (
                <div className="space-y-5">
                  {/* Score Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
                          <motion.circle
                            cx="36" cy="36" r="30" fill="none"
                            stroke={getScoreColor(matchResult.matchScore)}
                            strokeWidth="6"
                            strokeDasharray={`${(matchResult.matchScore / 100) * 188.5} 188.5`}
                            strokeLinecap="round"
                            initial={{ strokeDasharray: '0 188.5' }}
                            animate={{ strokeDasharray: `${(matchResult.matchScore / 100) * 188.5} 188.5` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-[var(--text-primary)]">
                          {matchResult.matchScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-[var(--text-primary)]">{getScoreLabel(matchResult.matchScore)}</span>
                        <div className="flex gap-4 text-xs text-[var(--text-muted)] mt-1">
                          <span>Required: {matchResult.requiredMatched}/{matchResult.requiredTotal}</span>
                          <span>Optional: {matchResult.optionalMatched}/{matchResult.optionalTotal}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClear}
                      className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--bg-elevated)]"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear & Re-run
                    </button>
                  </div>

                  {/* Matched Skills */}
                  {matchResult.matched.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-3">Matched Skills</h4>
                      <div className="space-y-2">
                        {(showAllMatched ? matchResult.matched : matchResult.matched.slice(0, 5)).map((skill, i) => (
                          <div key={skill.name} className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-[var(--brand-green)]/5 border border-[var(--brand-green)]/10">
                            <CheckCircle2 className="w-4 h-4 text-[var(--brand-green)] shrink-0" />
                            <span className="font-semibold text-[var(--text-primary)] w-28 truncate">{skill.name}</span>
                            <span className="text-xs text-[var(--text-muted)] font-display">{Math.round(skill.confidence * 100)}%</span>
                            <span className="text-xs text-[var(--text-muted)]">·</span>
                            <span className="text-xs text-[var(--text-muted)] truncate">{skill.source_repos.length} repos</span>
                            {!skill.required && (
                              <span className="ml-auto text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">optional</span>
                            )}
                          </div>
                        ))}
                        {matchResult.matched.length > 5 && (
                          <button
                            onClick={() => setShowAllMatched(!showAllMatched)}
                            className="text-xs text-[var(--brand-green)] hover:underline"
                          >
                            {showAllMatched ? 'Show less' : `+${matchResult.matched.length - 5} more`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {matchResult.missing.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-3">Missing Skills</h4>
                      <div className="space-y-2">
                        {matchResult.missing.map((skill) => (
                          <div key={skill.name} className={cn(
                            "flex items-center gap-3 text-sm p-2.5 rounded-lg border",
                            skill.required
                              ? "bg-[var(--error)]/5 border-[var(--error)]/10"
                              : "bg-[var(--bg-elevated)]/30 border-[var(--bg-border)]"
                          )}>
                            {skill.required
                              ? <XCircle className="w-4 h-4 text-[var(--error)] shrink-0" />
                              : <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                            }
                            <span className="font-semibold text-[var(--text-primary)]">{skill.name}</span>
                            <span className={cn(
                              "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded",
                              skill.required
                                ? "text-[var(--error)] bg-[var(--error)]/10"
                                : "text-[var(--text-muted)] bg-[var(--bg-elevated)]"
                            )}>
                              {skill.required ? 'required' : 'optional'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-3">AI Analysis</h4>
                    {isAnalyzing ? (
                      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)] animate-pulse space-y-2">
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[90%]" />
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[75%]" />
                        <div className="h-3 bg-[var(--bg-border)] rounded w-[85%]" />
                      </div>
                    ) : aiAnalysis ? (
                      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis}
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
