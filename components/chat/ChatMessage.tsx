'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-[var(--bg-elevated)]" : "bg-[var(--brand-green)]/20"
        )}
      >
        {isUser
          ? <User className="w-4 h-4 text-[var(--text-secondary)]" />
          : <Bot className="w-4 h-4 text-[var(--brand-green)]" />
        }
      </div>
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-[var(--brand-green-dim)] border border-[var(--brand-green)]/30 text-[var(--text-primary)] rounded-tr-sm"
            : "bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-tl-sm"
        )}
      >
        {content}
      </div>
    </div>
  );
}
