'use client';

import { Developer } from '@/lib/types';
import { PotentialBadge } from './PotentialBadge';
import { Github, Users, Star, Clock, Download, Share2, Bot, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PDFModal } from '../pdf/PDFModal';

interface Props {
  developer: Developer;
  className?: string;
}

export function ProfileCard({ developer, className }: Props) {
  const { setChatOpen, setQAOpen } = useAppStore();
  const router = useRouter();
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard'); // Replace with proper toast later
  };

  const handleCompare = () => {
    router.push(`/compare?u1=${developer.username}`);
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]", className)}>
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        
        {/* Left: Avatar & Badges */}
        <div className="flex flex-col items-center gap-4">
          <img 
            src={developer.avatar_url} 
            alt={developer.username} 
            className="w-24 h-24 rounded-full border-2 border-[var(--bg-border)] bg-[var(--bg-elevated)]"
            loading="lazy"
          />
        </div>

        {/* Center: Info */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {developer.name || developer.username}
            </h1>
            <a 
              href={`https://github./${developer.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-[var(--text-secondary)] hover:text-[var(--brand-green)] transition-colors font-display inline-flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              @{developer.username}
            </a>
          </div>

          {developer.bio && (
            <p className="text-[var(--text-primary)] leading-relaxed max-w-lg">
              {developer.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-sm text-[var(--text-muted)] font-display">
            <div className="flex items-center gap-1.5" title="Followers">
              <Users className="w-4 h-4" />
              <span>{developer.followers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Public Repos">
              <Github className="w-4 h-4" />
              <span>{developer.public_repos.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Total Stars">
              <Star className="w-4 h-4" />
              <span>{developer.total_stars.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Account Age">
              <Clock className="w-4 h-4" />
              <span>{new Date(developer.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Right: Potential Score */}
        <div className="flex justify-center md:justify-end">
          <PotentialBadge score={developer.potential_score} label={developer.potential_label} />
        </div>
      </div>

      <div className="border-t border-[var(--bg-border)]" />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={() => setChatOpen(true)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-[var(--brand-green)] text-[#0D0F14] font-semibold hover:brightness-110 active:scale-95 transition-all text-sm"
        >
          <Bot className="w-4 h-4" />
          Ask AI
        </button>
        <button 
          onClick={() => setQAOpen(true)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--bg-border)] hover:border-[var(--brand-green)] active:scale-95 transition-all text-sm font-semibold"
        >
          <HelpCircle className="w-4 h-4" />
          Q&A
        </button>
        
        <div className="hidden md:block flex-1" />

        <button 
          onClick={() => setIsPdfOpen(true)}
          className="flex items-center justify-center gap-2 px-3 h-10 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all text-sm"
          title="Download PDF"
        >
          <Download className="w-4 h-4" />
          <span className="hidden lg:inline">PDF</span>
        </button>
        <button 
          onClick={handleCompare}
          className="flex items-center justify-center gap-2 px-3 h-10 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all text-sm"
          title="Compare Developer"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden lg:inline">Compare</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-3 h-10 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all text-sm"
          title="Share Profile"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden lg:inline">Share</span>
        </button>
      </div>

      <PDFModal 
        developer={developer} 
        open={isPdfOpen} 
        onClose={() => setIsPdfOpen(false)} 
      />
    </div>
  );
}
