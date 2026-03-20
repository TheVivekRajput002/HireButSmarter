'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, Github, ArrowRight, Zap, ShieldCheck, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';

// ─── RetroGrid (from new component) ────────────────────────────────────────────
interface RetroGridProps {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lightLineColor?: string;
  darkLineColor?: string;
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = 'gray',
  darkLineColor = 'gray',
}: RetroGridProps) => {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--opacity': opacity,
    '--light-line': lightLineColor,
    '--dark-line': darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden [perspective:200px]',
        'opacity-[var(--opacity)]',
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] to-transparent to-90%" />
    </div>
  );
};

// ─── Home Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [recentProfiles, setRecentProfiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load recent profiles from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('skilllens-recent');
    if (saved) {
      try {
        setRecentProfiles(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    const target = username.trim();

    // Save to recents
    const updatedRecents = [target, ...recentProfiles.filter((p) => p !== target)].slice(0, 5);
    localStorage.setItem('skilllens-recent', JSON.stringify(updatedRecents));

    router.push(`/u/${target}`);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col font-body">
      <Navbar />

      {/* Radial purple glow — from new component */}
      <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <main className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* RetroGrid background */}
        <RetroGrid
          angle={65}
          opacity={0.4}
          cellSize={50}
          lightLineColor="#3a3a3a"
          darkLineColor="#2a2a2a"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-8 py-8"
        >
          {/* Badge — from old component */}
          <motion.div variants={item}>
            <h1 className="text-sm text-gray-400 group font-display mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/10 via-gray-400/10 to-transparent border-[2px] border-white/10 rounded-3xl w-fit inline-flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--brand-green)]" />
              Talent Intelligence v5.0
              <ChevronRight className="inline w-4 h-4 ml-1 group-hover:translate-x-1 duration-300" />
            </h1>
          </motion.div>

          {/* Headline — new component's gradient style, old component's copy */}
          <motion.div variants={item} className="space-y-4">
            <h2 className="text-5xl md:text-7xl tracking-tighter font-display bg-clip-text text-transparent mx-auto bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,255,255,0.65)_100%)]">
              Decode GitHub.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-green)] to-emerald-300">
                Discover Talent.
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed">
              Extract verified skills, measure project complexity, and uncover a developer&apos;s
              true potential — instantly.
            </p>
          </motion.div>

          {/* Search Form — old component's full logic, new component's CTA style */}
          <motion.div variants={item} className="w-full max-w-lg">
            <form onSubmit={handleSubmit} className="relative group">
              {/* Glow ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-green)] to-emerald-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative flex items-center bg-[var(--bg-surface)] border-none rounded-xl p-2 shadow-2xl transition-all">
                <Github className="w-6 h-6 text-[var(--text-muted)] ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter GitHub username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 px-4 py-3 text-lg font-display text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
                  autoFocus
                  required
                />
                {/* Spinning border CTA — from new component */}
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px] shrink-0">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#5BC451_0%,#1a4a14_50%,#5BC451_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[var(--bg-surface)] text-xs font-medium backdrop-blur-3xl">
                    <button
                      type="submit"
                      disabled={!username.trim() || isSubmitting}
                      className="inline-flex rounded-full text-center items-center justify-center bg-gradient-to-tr from-zinc-300/10 via-[var(--brand-green)]/20 to-transparent text-[var(--brand-green)] border-[var(--brand-green)]/30 border-[1px] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 py-3 px-6 font-bold gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-[var(--brand-green)]/30 border-t-[var(--brand-green)] rounded-full animate-spin" />
                      ) : (
                        <>
                          Analyze <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </span>
              </div>
            </form>
          </motion.div>

          {/* Recent Profiles — old component, unchanged logic */}
          {recentProfiles.length > 0 && (
            <motion.div variants={item} className="flex flex-col items-center">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold mb-3">
                Recently Analyzed
              </span>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {recentProfiles.map((p) => (
                  <button
                    key={p}
                    onClick={() => router.push(`/u/${p}`)}
                    className="px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-[var(--brand-green)] hover:border-[var(--brand-green)] transition-colors font-display text-sm flex items-center gap-2"
                  >
                    @{p}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Compare Button Context */}
          <motion.div variants={item}>
            <button
              onClick={() => router.push('/compare')}
              className="px-5 py-2 rounded-full border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all font-display text-sm mt-2 flex items-center gap-2"
            >
              Compare two developers <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Feature Cards — old component's content, new component's card style */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-16 w-full"
          >
            {[
              { title: 'Verified Skills', desc: 'Extracted directly from code, not resumes.', icon: ShieldCheck },
              { title: 'Deep Complexity', desc: 'Score stars, forks, size, and recency.', icon: Zap },
              { title: 'AI Assistant', desc: 'Ask complex questions about any candidate.', icon: Search },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent border-[2px] border-white/5 flex flex-col gap-3 text-left hover:border-[var(--brand-green)]/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--brand-green)]">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}