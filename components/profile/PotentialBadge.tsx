import { Developer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PotentialLabel } from '@/lib/types';
import { useEffect, useState } from 'react';

interface Props {
  score: number;
  label: PotentialLabel;
  className?: string;
}

export function PotentialBadge({ score, label, className }: Props) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) {
      return;
    }
    
    // Animate over 1.5s
    const totalDuration = 1500;
    let startTime: number | null = null;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / totalDuration, 1);
      
      // Easing out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayScore(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const getColorClass = (label: PotentialLabel) => {
    switch (label) {
      case 'Expert': return 'score-expert border-[var(--score-expert)]';
      case 'Average': return 'score-prof border-[var(--score-prof)]';
      case 'Beginner': return 'score-dev border-[var(--score-dev)]';
      case 'Learning': return 'score-beginner border-[var(--score-beginner)]';
      default: return 'text-[var(--text-primary)] border-[var(--bg-border)]';
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn(
        "flex flex-col items-center justify-center p-6 w-32 h-32 rounded-full border-[3px] bg-[var(--bg-elevated)]",
        getColorClass(label)
      )}>
        <div className="flex items-baseline font-display">
          <span className="text-5xl font-bold tracking-tighter">{displayScore}</span>
          <span className="text-xl text-[var(--text-muted)] tracking-widest leading-none ml-1">/100</span>
        </div>
      </div>
      <div className={cn(
        "px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase border bg-[var(--bg-elevated)]",
        getColorClass(label)
      )}>
        {label}
      </div>
    </div>
  );
}
