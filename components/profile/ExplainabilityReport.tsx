import { Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, MinusCircle } from 'lucide-react';

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

  return (
    <div className={cn("flex flex-col gap-4 font-body", className)}>
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        Signal Summary
      </h3>
      
      <div className="flex flex-col gap-3">
        {displaySkills.map((skill) => (
          <div key={skill.name} className="flex gap-4">
            <div className="pt-0.5 shrink-0">
              {getSignalIcon(skill.confidence)}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className={cn("font-bold text-base", getSignalColor(skill.confidence))}>
                  {skill.name}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  — confidence {Math.round(skill.confidence * 100)}%, found in {skill.repo_count} repo{skill.repo_count !== 1 ? 's' : ''}
                </span>
              </div>
              
              {skill.repo_count > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1 ml-2 pl-4 border-l-2 border-[var(--bg-border)]">
                  <span className="text-xs text-[var(--text-muted)] font-display">Strongest signals:</span>
                  <div className="text-xs text-[var(--text-secondary)] font-display truncate max-w-full">
                    {skill.source_repos.slice(0, 4).join(' · ')}
                    {skill.source_repos.length > 4 && ` · +${skill.source_repos.length - 4} more`}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="flex gap-4 pt-2">
            <div className="w-4" /> {/* Indent */}
            <div className="text-sm text-[var(--text-muted)] italic">
              + {remainingCount} other skills with lower confidence detected. See Skills tab for full list.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
