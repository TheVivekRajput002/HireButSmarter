import { ScoreBreakdown } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Props {
  breakdown: ScoreBreakdown;
  className?: string;
}

export function ScoreBreakdownPanel({ breakdown, className }: Props) {
  const signals = [
    { key: 'repo_volume', label: 'Repo Volume', value: breakdown.repo_volume },
    { key: 'star_count', label: 'Star Count', value: breakdown.star_count },
    { key: 'language_diversity', label: 'Language Diversity', value: breakdown.language_diversity },
    { key: 'skill_count', label: 'Skill Count', value: breakdown.skill_count },
    { key: 'account_activity', label: 'Account Activity', value: breakdown.account_activity },
  ];

  const getBarColor = (val: number) => {
    if (val >= 15) return 'bg-[var(--brand-green)]';
    if (val >= 8) return 'bg-[var(--warning)]';
    return 'bg-[var(--score-beginner)]';
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
        Score Breakdown
      </h4>
      
      {signals.map((signal, idx) => (
        <div key={signal.key} className="flex items-center gap-4">
          <div className="w-40 text-sm text-[var(--text-secondary)]">
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
    </div>
  );
}
