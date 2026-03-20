'use client';

import { Developer, Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Props {
  dev1: Developer;
  dev2: Developer;
}

export function CompareResults({ dev1, dev2 }: Props) {
  const getWinner = (v1: number, v2: number) => {
    if (v1 > v2) return 1;
    if (v2 > v1) return 2;
    return 0;
  };

  const statRows = [
    { label: 'Public Repos', val1: dev1.public_repos, val2: dev2.public_repos, winner: getWinner(dev1.public_repos, dev2.public_repos) },
    { label: 'Total Stars', val1: dev1.total_stars, val2: dev2.total_stars, winner: getWinner(dev1.total_stars, dev2.total_stars) },
    { label: 'Followers', val1: dev1.followers, val2: dev2.followers, winner: getWinner(dev1.followers, dev2.followers) },
    { label: 'Languages Used', val1: dev1.languages.length, val2: dev2.languages.length, winner: getWinner(dev1.languages.length, dev2.languages.length) },
    { label: 'Skills Detected', val1: dev1.skills.length, val2: dev2.skills.length, winner: getWinner(dev1.skills.length, dev2.skills.length) },
    { label: 'Potential Score', val1: dev1.potential_score, val2: dev2.potential_score, winner: getWinner(dev1.potential_score, dev2.potential_score) },
  ];

  const uniqueSkills1 = dev1.skills.filter(s1 => !dev2.skills.some(s2 => s2.name === s1.name));
  const uniqueSkills2 = dev2.skills.filter(s2 => !dev1.skills.some(s1 => s1.name === s2.name));

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 border-b border-[var(--bg-border)] bg-[var(--bg-elevated)]/50 p-4">
          <div className="text-center font-bold text-[var(--text-primary)]">@{dev1.username}</div>
          <div className="text-center text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Metrics</div>
          <div className="text-center font-bold text-[var(--text-primary)]">@{dev2.username}</div>
        </div>
        
        <div className="flex flex-col">
          {statRows.map((row, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className={cn(
                "grid grid-cols-3 p-4",
                idx !== statRows.length - 1 && "border-b border-[var(--bg-border)]/50"
              )}
            >
              <div className={cn("text-center font-display", row.winner === 1 ? "text-[var(--brand-green)] font-bold" : "text-[var(--text-primary)]")}>
                {row.val1}
              </div>
              <div className="text-center text-sm text-[var(--text-muted)]">
                {row.label}
              </div>
              <div className={cn("text-center font-display", row.winner === 2 ? "text-[#3B82F6] font-bold" : "text-[var(--text-primary)]")}>
                {row.val2}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unique Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dev 1 Unique */}
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[var(--brand-green)] mb-4">Unique to @{dev1.username}</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueSkills1.length > 0 ? uniqueSkills1.map(s => (
              <span key={s.name} className="px-2.5 py-1 text-xs font-display rounded-md bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-secondary)]">
                {s.name}
              </span>
            )) : <span className="text-sm text-[var(--text-muted)]">No distinct skills.</span>}
          </div>
        </div>

        {/* Dev 2 Unique */}
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[#3B82F6] mb-4">Unique to @{dev2.username}</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueSkills2.length > 0 ? uniqueSkills2.map(s => (
              <span key={s.name} className="px-2.5 py-1 text-xs font-display rounded-md bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-secondary)]">
                {s.name}
              </span>
            )) : <span className="text-sm text-[var(--text-muted)]">No distinct skills.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
