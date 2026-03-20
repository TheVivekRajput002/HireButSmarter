import { HeatmapData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function CommitFrequencyHeatmap({ data }: { data: HeatmapData }) {
  if (!data || !data.weeks) return null;

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-[#ebedf0] dark:bg-[#161b22]';
      case 1: return 'bg-[#9be9a8] dark:bg-[#0e4429]';
      case 2: return 'bg-[#40c463] dark:bg-[#006d32]';
      case 3: return 'bg-[#30a14e] dark:bg-[#26a641]';
      case 4: return 'bg-[#216e39] dark:bg-[#39d353]';
      default: return 'bg-[#ebedf0] dark:bg-[#161b22]';
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="flex flex-col gap-4 font-body p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Commit Frequency Heatmap</h3>
      
      <div className="flex flex-col">
        {/* Heatmap Grid container */}
        <div className="flex overflow-x-auto hide-scrollbar pb-2">
          <div className="flex gap-1">
            {data.weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <div
                    key={day.date}
                    title={`${day.count} commits on ${day.date}${day.repos.length > 0 ? ` in ${day.repos.join(', ')}` : ''}`}
                    className={cn(
                      "w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-[var(--text-secondary)]",
                      getColorClass(getLevel(day.count))
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <div className="flex items-center gap-4">
            <span>{data.stats.total_commits} total commits</span>
            <span>{data.stats.active_days} active days</span>
            <span>🔥 {data.stats.longest_streak}-day streak</span>
          </div>

          <div className="flex items-center gap-1.5 font-display">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={cn("w-3 h-3 rounded-sm", getColorClass(level))} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
