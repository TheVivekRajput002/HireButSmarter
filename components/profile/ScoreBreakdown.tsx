import { ScoreBreakdown } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Props {
  breakdown: ScoreBreakdown;
  consistencyScore?: number | null;
  commitQualityScore?: number | null;
  className?: string;
}

export function ScoreBreakdownPanel({ breakdown, consistencyScore, commitQualityScore, className }: Props) {
  const signals = [
    { key: 'repo_volume', label: 'Repo Volume', value: breakdown.repo_volume },
    { key: 'star_count', label: 'Star Count', value: breakdown.star_count },
    { key: 'language_diversity', label: 'Language Diversity', value: breakdown.language_diversity },
    { key: 'skill_count', label: 'Skill Count', value: breakdown.skill_count },
    { key: 'account_activity', label: 'Account Activity', value: breakdown.account_activity },
  ];

  const getBarColor = (val: number, isPercent = false) => {
    if (isPercent) {
      if (val >= 80) return 'bg-[var(--score-expert)]';
      if (val >= 60) return 'bg-[var(--score-prof)]';
      if (val >= 40) return 'bg-[var(--score-dev)]';
      return 'bg-[var(--score-beginner)]';
    }
    if (val >= 15) return 'bg-[var(--brand-green)]';
    if (val >= 8) return 'bg-[var(--warning)]';
    return 'bg-[var(--score-beginner)]';
  };

  const getLabel = (score: number) => {
    if (score <= 20) return 'Sporadic';
    if (score <= 40) return 'Occasional';
    if (score <= 60) return 'Regular';
    if (score <= 80) return 'Consistent';
    return 'Highly Active';
  };
  
  const getQualityLabel = (score: number) => {
    if (score <= 20) return 'Needs Improvement';
    if (score <= 40) return 'Basic';
    if (score <= 60) return 'Developing';
    if (score <= 80) return 'Good';
    return 'Excellent';
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
        Score Breakdown
      </h4>
      
      {signals.map((signal, idx) => (
        <div key={signal.key} className="flex items-center gap-4 group">
          <div className="w-40 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {signal.label}
          </div>
          
          <div className="flex-1 h-[6px] rounded-full bg-[var(--bg-elevated)] overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(signal.value / 20) * 100}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
              className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor(signal.value))}
            />
          </div>
          
          <div className="w-12 text-right font-display text-xs text-[var(--text-primary)]">
            {signal.value} / 20
          </div>
        </div>
      ))}
      
      {(consistencyScore != null || commitQualityScore != null) && (
        <div className="my-2 border-t border-[var(--bg-border)] relative">
          <span className="absolute -top-3 right-0 bg-[var(--bg-surface)] px-2 text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            Supplemental
          </span>
        </div>
      )}
      
      {consistencyScore != null && (
        <div className="flex items-center gap-4 group">
          <div className="w-40 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" title={getLabel(consistencyScore)}>
            Commit Consistency
          </div>
          
          <div className="flex-1 h-[6px] rounded-full bg-[var(--bg-elevated)] overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${consistencyScore}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor(consistencyScore, true))}
            />
          </div>
          
          <div className="w-12 font-display text-xs text-right whitespace-nowrap text-[var(--text-primary)]" title={getLabel(consistencyScore)}>
             {consistencyScore} <span className="text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>
      )}

      {commitQualityScore != null && (
        <div className="flex items-center gap-4 group">
          <div className="w-40 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" title={getQualityLabel(commitQualityScore)}>
            Commit Quality
          </div>
          
          <div className="flex-1 h-[6px] rounded-full bg-[var(--bg-elevated)] overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${commitQualityScore}%` }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor(commitQualityScore, true))}
            />
          </div>
          
          <div className="w-12 font-display text-xs text-right whitespace-nowrap text-[var(--text-primary)]" title={getQualityLabel(commitQualityScore)}>
            {commitQualityScore} <span className="text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>
      )}
    </div>
  );
}
