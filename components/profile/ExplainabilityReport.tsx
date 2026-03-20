import { Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, MinusCircle, Github } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  skills: Skill[];
  className?: string;
}

export function ExplainabilityReport({ skills, className }: Props) {
  // Sort descending by confidence so strong signals are at the top
  const sorted = [...skills].sort((a, b) => b.confidence - a.confidence);
  
  // Show max top 8 skills in the summary report, and group the rest
  const displaySkills = sorted.slice(0, 8);
  const remainingCount = sorted.length - 8;

  if (skills.length === 0) {
    return null;
  }

  const getSignalIcon = (confidence: number) => {
    if (confidence === 0) return <MinusCircle className="w-4 h-4 text-[var(--signal-absent)]" />;
    if (confidence < 0.4) return <AlertCircle className="w-4 h-4 text-[var(--signal-weak)]" />;
    if (confidence < 0.7) return <AlertTriangle className="w-4 h-4 text-[var(--signal-mid)]" />;
    return <CheckCircle2 className="w-4 h-4 text-[var(--signal-strong)]" />;
  };

  const getSignalColor = (confidence: number) => {
    if (confidence === 0) return 'text-[var(--text-muted)]';
    if (confidence < 0.4) return 'text-[var(--text-secondary)]';
    if (confidence < 0.7) return 'text-[var(--signal-mid)]';
    return 'text-[var(--signal-strong)]';
  };

  const getProgressColor = (confidence: number) => {
    if (confidence === 0) return 'bg-[var(--signal-absent)]';
    if (confidence < 0.4) return 'bg-[var(--signal-weak)]';
    if (confidence < 0.7) return 'bg-[var(--signal-mid)]';
    return 'bg-[var(--signal-strong)]';
  };

  return (
    <div className={cn("flex flex-col gap-5 font-body", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Signal Summary
        </h3>
        <span className="text-xs text-[var(--text-muted)] font-display bg-[var(--bg-base)] px-2 py-1 rounded-md border border-[var(--bg-border)]">
          Top Detected Skills
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {displaySkills.map((skill, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            key={skill.name} 
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--bg-border)] hover:border-[var(--brand-green)]/30 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="pt-0.5 shrink-0">
                  {getSignalIcon(skill.confidence)}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className={cn("font-bold text-base", getSignalColor(skill.confidence))}>
                      {skill.name}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      found in {skill.repo_count} repo{skill.repo_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {skill.repo_count > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <Github className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {skill.source_repos.slice(0, 3).map((repo) => (
                          <span key={repo} className="px-2 py-0.5 rounded text-xs font-display bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--bg-border)] group-hover:border-[var(--text-muted)] transition-colors">
                            {repo}
                          </span>
                        ))}
                        {skill.source_repos.length > 3 && (
                          <span className="px-2 py-0.5 rounded text-xs font-display bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--bg-border)]">
                            +{skill.source_repos.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0 min-w-[60px] pt-0.5">
                <span className="text-sm font-display font-medium text-[var(--text-primary)]">
                  {Math.round(skill.confidence * 100)}%
                </span>
                <div className="w-16 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.confidence * 100}%` }}
                    transition={{ delay: idx * 0.05 + 0.2, duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full", getProgressColor(skill.confidence))}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: displaySkills.length * 0.05 + 0.2 }}
            className="flex items-center justify-center pt-2"
          >
            <div className="text-sm text-[var(--text-muted)] italic">
              + {remainingCount} other skills with lower confidence detected. See Skills tab for full list.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
