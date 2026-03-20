'use client';

import { useState, useMemo } from 'react';
import { Repo } from '@/lib/types';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, Star, GitFork, Clock, Code, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  repos: Repo[];
  compact?: boolean; // compact mode for sidebar top-repos widget
}

type SortKey = 'stars' | 'forks' | 'updated_at' | 'complexity_score' | 'name';

function getComplexityTier(score: number) {
  if (score >= 80) return { label: 'Expert', color: 'var(--score-expert)' };
  if (score >= 60) return { label: 'Pro', color: 'var(--score-prof)' };
  if (score >= 40) return { label: 'Mid', color: 'var(--score-dev)' };
  if (score >= 20) return { label: 'Basic', color: 'var(--score-emerging)' };
  return { label: 'Low', color: 'var(--score-beginner)' };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function RepoExplorer({ repos, compact = false }: Props) {
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('complexity_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Unique languages for filter dropdown
  const languages = useMemo(() => {
    const langs = new Set(repos.map(r => r.language).filter(Boolean) as string[]);
    return Array.from(langs).sort();
  }, [repos]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...repos];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.skills_detected.some(s => s.toLowerCase().includes(q))
      );
    }

    // Language filter
    if (langFilter !== 'all') {
      result = result.filter(r => r.language === langFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'stars': cmp = a.stars - b.stars; break;
        case 'forks': cmp = a.forks - b.forks; break;
        case 'updated_at': cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(); break;
        case 'complexity_score': cmp = a.complexity_score - b.complexity_score; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [repos, search, langFilter, sortKey, sortAsc]);

  const sortLabels: Record<SortKey, string> = {
    stars: 'Stars',
    forks: 'Forks',
    updated_at: 'Recent',
    complexity_score: 'Complexity',
    name: 'Name',
  };

  // Compact mode: top repos widget for sidebar
  if (compact) {
    const topRepos = [...repos].sort((a, b) => b.complexity_score - a.complexity_score).slice(0, 3);
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Top Repos</h3>
        {topRepos.map((repo, i) => {
          const tier = getComplexityTier(repo.complexity_score);
          return (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)] hover:border-[var(--brand-green)]/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-green)] transition-colors truncate">
                  {repo.name}
                </span>
                <span
                  className="text-xs font-display font-bold px-2 py-0.5 rounded-full"
                  style={{ color: tier.color, backgroundColor: `${tier.color}20` }}
                >
                  {repo.complexity_score}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-display">
                {repo.language && <span>{repo.language}</span>}
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
              </div>
            </a>
          );
        })}
        {topRepos.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No repositories found.</p>
        )}
      </div>
    );
  }

  // Full repo explorer
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search repos or skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg text-sm font-display text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-green)] transition-colors"
          />
        </div>

        {/* Language filter */}
        <select
          value={langFilter}
          onChange={e => setLangFilter(e.target.value)}
          className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg text-sm font-display text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-green)] transition-colors cursor-pointer"
        >
          <option value="all">All Languages</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg text-sm font-display text-[var(--text-primary)] hover:border-[var(--brand-green)] transition-colors w-full sm:w-auto"
          >
            <ArrowUpDown className="w-4 h-4 text-[var(--text-muted)]" />
            {sortLabels[sortKey]}
            <ChevronDown className={cn("w-3 h-3 text-[var(--text-muted)] transition-transform", sortOpen && "rotate-180")} />
          </button>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 z-20 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg shadow-xl overflow-hidden min-w-[140px]"
            >
              {(Object.keys(sortLabels) as SortKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => {
                    if (sortKey === key) setSortAsc(!sortAsc);
                    else { setSortKey(key); setSortAsc(false); }
                    setSortOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-border)] transition-colors",
                    sortKey === key ? "text-[var(--brand-green)] font-semibold" : "text-[var(--text-secondary)]"
                  )}
                >
                  {sortLabels[key]} {sortKey === key && (sortAsc ? '↑' : '↓')}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--text-muted)] font-display">
        {filtered.length} {filtered.length === 1 ? 'repository' : 'repositories'}
        {search || langFilter !== 'all' ? ' matched' : ''}
      </p>

      {/* Repo cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((repo, i) => {
          const tier = getComplexityTier(repo.complexity_score);
          return (
            <motion.div
              key={repo.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] hover:border-[var(--brand-green)]/30 transition-colors group flex flex-col gap-3"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-display font-bold text-[var(--text-primary)] hover:text-[var(--brand-green)] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Code className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate">{repo.name}</span>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                </div>
                {/* Complexity badge */}
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-display font-bold shrink-0"
                  style={{ color: tier.color, backgroundColor: `${tier.color}15`, border: `1px solid ${tier.color}30` }}
                >
                  {repo.complexity_score}
                  <span className="text-[10px] opacity-70">{tier.label}</span>
                </div>
              </div>

              {/* Description */}
              {repo.description && (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{repo.description}</p>
              )}

              {/* Skills pills */}
              {repo.skills_detected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {repo.skills_detected.slice(0, 5).map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 text-[10px] font-display bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-secondary)] rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {repo.skills_detected.length > 5 && (
                    <span className="px-2 py-0.5 text-[10px] font-display text-[var(--text-muted)]">
                      +{repo.skills_detected.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-display mt-auto pt-1 border-t border-[var(--bg-border)]/50">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-green)]" />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{timeAgo(repo.updated_at)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-10 h-10 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-secondary)] font-semibold">No repositories match your filters</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Try a different search term or language.</p>
        </div>
      )}
    </div>
  );
}
