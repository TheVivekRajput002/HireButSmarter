'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Moon, Search, Sun, ArrowLeftRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppStore();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/u/${search.trim()}`);
      setSearch('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--bg-border)] bg-[var(--bg-base)]/80 backdrop-blur-md">
      <div className="container mx-auto max-w-[1152px] h-16 px-4 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[var(--brand-green)] flex items-center justify-center overflow-hidden">
            <Image src="/logo.jpg" alt="HireButSmarter Logo" width={32} height={32} className="object-cover" />
          </div>
          <span className="font-display ml-1 font-bold text-xl tracking-tight hidden sm:block text-[var(--brand-green)]">
            HireButSmarter
          </span>
        </Link>
        
        {/* Middle: Mini Search */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search GitHub user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full h-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--bg-border)]",
                "pl-10 pr-4 text-sm font-display text-[var(--text-primary)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent",
                "placeholder:text-[var(--text-muted)] transition-all"
              )}
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="flex items-center gap-2 px-3 h-9 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        
      </div>
    </nav>
  );
}
