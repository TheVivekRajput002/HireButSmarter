'use client';

import { Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  skills: Skill[];
  className?: string;
}

export function SkillBars({ skills, className }: Props) {
  // Group by category, ignore absent skills entirely
  const validSkills = skills.filter(s => s.confidence > 0);
  const grouped = validSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Sort categories by highest total confidence
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const sumA = grouped[a].reduce((sum, s) => sum + s.confidence, 0);
    const sumB = grouped[b].reduce((sum, s) => sum + s.confidence, 0);
    return sumB - sumA;
  });

  if (validSkills.length === 0) {
    return (
      <div className={cn("text-center py-12 text-[var(--text-muted)]", className)}>
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No verified skills found in public repositories.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {sortedCategories.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            {category}
          </h4>
          <div className="flex flex-col gap-2">
            {grouped[category]
              .sort((a, b) => b.confidence - a.confidence)
              .map((skill, idx) => (
                <ExpandableSkillRow key={skill.name} skill={skill} index={idx} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpandableSkillRow({ skill, index }: { skill: Skill; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = Math.round(skill.confidence * 100);

  let barColorClass = "bg-[var(--signal-weak)]";
  if (percentage > 70) barColorClass = "bg-[var(--signal-strong)]";
  else if (percentage >= 40) barColorClass = "bg-[var(--signal-mid)]";

  return (
    <div className="flex flex-col border border-transparent hover:border-[var(--bg-border)] rounded-lg transition-colors overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-4 group cursor-pointer p-2 rounded-t-lg bg-transparent hover:bg-[var(--bg-elevated)] transition-colors text-left"
      >
        <div className="w-32 font-medium text-[var(--text-primary)] flex items-center justify-between">
          <span className="truncate">{skill.name}</span>
          <ChevronDown className={cn(
            "w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
        
        <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.5), ease: "easeOut" }}
            className={cn("h-full rounded-full", barColorClass)}
          />
        </div>
        
        <div className="w-24 text-right flex items-center justify-end gap-3 text-sm">
          <span className="font-display font-medium text-[var(--text-primary)] w-10">{percentage}%</span>
          <span className="text-[var(--text-muted)] text-xs hidden sm:inline-block w-16">
            {skill.repo_count} repo{skill.repo_count !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-[var(--bg-surface)] border-t border-[var(--bg-border)] p-3 px-4"
          >
            <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Found in repositories:</div>
            <div className="flex flex-wrap gap-2">
              {skill.source_repos.map(repo => (
                <div key={repo} className="px-2 py-1 text-xs font-display rounded bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-secondary)]">
                  {repo}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
