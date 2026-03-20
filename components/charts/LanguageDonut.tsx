'use client';

import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface Props {
  languages: Language[];
  className?: string;
}

const COLORS = [
  'var(--brand-green)',
  'var(--score-prof)',
  'var(--score-emerging)',
  'var(--axis-database)',
  'var(--axis-testing)',
  'var(--text-muted)'
];

export function LanguageDonut({ languages, className }: Props) {
  // Sort descending by percentage
  const sorted = [...languages].sort((a, b) => b.percentage - a.percentage);
  
  // Take top 5, merge rest into "Other"
  const topLanguages = sorted.slice(0, 5);
  const otherPercentage = sorted.slice(5).reduce((sum, lang) => sum + lang.percentage, 0);
  
  const data = [
    ...topLanguages,
    ...(otherPercentage > 0 ? [{ name: 'Other', percentage: otherPercentage, repo_count: 0 }] : [])
  ];

  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-48 text-[var(--text-muted)]", className)}>
        No language data
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col items-center gap-4 w-full", className)}
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider self-start">
        Languages
      </h3>

      <div className="h-48 w-48 shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="percentage"
              stroke="var(--bg-base)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-elevated)', 
                borderColor: 'var(--bg-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '12px'
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((lang, idx) => (
          <div key={lang.name} className="flex items-center gap-1.5 text-sm">
            <div 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
            />
            <span className="text-[var(--text-primary)]">{lang.name}</span>
            <span className="font-display text-[var(--text-muted)] text-xs">
              {lang.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
