import { QualityAnalysisData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export function CommitQualityPanel({ data }: { data: QualityAnalysisData }) {
  if (!data) return null;

  const getQualityLabel = (score: number) => {
    if (score <= 20) return 'Needs Improvement';
    if (score <= 40) return 'Basic';
    if (score <= 60) return 'Developing';
    if (score <= 80) return 'Good';
    return 'Excellent';
  };

  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-[var(--score-expert)]';
    if (val >= 60) return 'bg-[var(--score-prof)]';
    if (val >= 40) return 'bg-[var(--score-dev)]';
    return 'bg-[var(--score-beginner)]';
  };

  const aggregateDimensions = data.repoScores.reduce((acc, repo) => {
    return {
      length: acc.length + (repo.dimensions.length * repo.commitCount),
      pattern: acc.pattern + (repo.dimensions.pattern * repo.commitCount),
      conventional: acc.conventional + (repo.dimensions.conventional * repo.commitCount),
      imperative: acc.imperative + (repo.dimensions.imperative * repo.commitCount),
      body: acc.body + (repo.dimensions.body * repo.commitCount),
      totalCommits: acc.totalCommits + repo.commitCount
    }
  }, { length: 0, pattern: 0, conventional: 0, imperative: 0, body: 0, totalCommits: 0 });

  const tC = aggregateDimensions.totalCommits || 1;
  const metrics = [
    { label: 'Descriptive Length', score: (aggregateDimensions.length / tC) * 100 },
    { label: 'Clean Patterns', score: (aggregateDimensions.pattern / tC) * 100 },
    { label: 'Conventional Format', score: (aggregateDimensions.conventional / tC) * 100 },
    { label: 'Imperative Mood', score: (aggregateDimensions.imperative / tC) * 100 },
    { label: 'Detailed Body', score: (aggregateDimensions.body / tC) * 100 }
  ];

  const reposAnalyzed = data.repoScores.filter(r => r.commitCount > 0);

  return (
    <div className="flex flex-col gap-6 font-body p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Commit Quality</h3>
          <span className="text-sm text-[var(--text-muted)]">Analyzed {tC} commits across {reposAnalyzed.length} repos</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="font-display text-2xl font-bold text-[var(--text-primary)] mb-1">
            {data.aggregateScore} <span className="text-sm font-body text-[var(--text-muted)]">/ 100</span>
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--bg-border)] text-[var(--text-secondary)]">
            {getQualityLabel(data.aggregateScore)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
        {/* Dimensions */}
        <div className="flex flex-col gap-4 border-r border-[var(--bg-border)]/50 pr-4">
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">Scoring Dimensions</h4>
          {metrics.map((m, i) => (
             <div key={m.label} className="flex items-center gap-3">
               <span className="text-sm text-[var(--text-secondary)] w-36 truncate">{m.label}</span>
               <div className="flex-1 h-[6px] rounded-full bg-[var(--bg-elevated)] overflow-hidden relative">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${m.score}%` }}
                   transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                   className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor(m.score))}
                 />
               </div>
               <span className="text-xs font-display text-[var(--text-muted)] w-8 text-right">{Math.round(m.score)}%</span>
             </div>
          ))}
        </div>

        {/* Repos Score breakdown */}
        <div className="flex flex-col gap-4">
           <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">Repository Breakdown</h4>
           <div className="flex flex-col gap-3">
              {reposAnalyzed.slice(0, 4).map((r, idx) => (
                <div key={r.repo} className="flex justify-between items-center group">
                  <div className="flex flex-col w-32 truncate pr-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{r.repo}</span>
                    <span className="text-xs text-[var(--text-muted)]">{r.commitCount} commits</span>
                  </div>
                  <div className="flex-1 px-4">
                     <div className="h-[4px] rounded-full bg-[var(--bg-elevated)] overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${r.repoScore * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + (idx * 0.1) }}
                        className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor(r.repoScore * 100))}
                      />
                     </div>
                  </div>
                  <span className="text-xs font-display text-[var(--text-primary)] min-w-[30px] text-right">
                    {Math.round(r.repoScore * 100)}
                  </span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Examples section if available */}
      {reposAnalyzed.length > 0 && reposAnalyzed[0].samples.best.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--bg-border)]/50">
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-4">Sample Commits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              {reposAnalyzed[0].samples.best.map((c, i) => (
                <div key={c.sha + i} className="flex items-start gap-2 text-sm p-3 rounded-md bg-[var(--brand-green)]/5 border border-[var(--brand-green)]/10">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-green)] shrink-0 mt-0.5" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[var(--text-primary)] truncate font-display text-xs" title={c.message}>{c.message}</span>
                    <span className="text-[var(--text-muted)] text-[10px] mt-1">Excellent pattern</span>
                  </div>
                </div>
              ))}
            </div>
            {reposAnalyzed[0].samples.worst && reposAnalyzed[0].samples.worst.length > 0 && (
              <div className="flex flex-col gap-2">
                {reposAnalyzed[0].samples.worst.map((c, i) => (
                  <div key={c.sha + i} className="flex items-start gap-2 text-sm p-3 rounded-md bg-[var(--error)]/5 border border-[var(--error)]/10">
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[var(--text-secondary)] truncate font-display text-xs" title={c.message}>{c.message}</span>
                    <span className="text-[var(--text-muted)] text-[10px] mt-1">Needs improvement</span>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
