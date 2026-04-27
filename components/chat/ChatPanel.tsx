'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Developer, MatchResult } from '@/lib/types';
import { useAppStore } from '@/store';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ResumeUpload } from './ResumeUpload';

interface Props {
  developer: Developer;
  matchResult?: MatchResult | null;
}

const HIRING_CHIPS = [
  "Top 3 strengths",
  "Best role fit",
  "Any red flags?",
  "Commit history analysis",
  "Code quality signals",
];

const JD_CHIPS = [
  "Why does this candidate score this?",
  "Can they grow into the missing skills?",
  "Resume vs JD match",
];

const RESUME_CHIPS = [
  "Summarize work experience",
  "Key technical skills from resume",
  "Education background",
  "Resume vs GitHub consistency",
  "Career progression",
];

export function ChatPanel({ developer, matchResult }: Props) {
  const { isChatOpen, setChatOpen } = useAppStore();
  const {
    messages,
    input,
    setInput,
    isLoading,
    resumeFileName,
    handleSend,
    handleResumeUpload,
    handleResumeClear,
    hasResume,
    messagesEndRef,
  } = useChat(developer, matchResult);
  const [resumeExpanded, setResumeExpanded] = useState(true);

  const chips = hasResume 
    ? (matchResult 
        ? [...RESUME_CHIPS.slice(0, 2), ...JD_CHIPS, ...HIRING_CHIPS.slice(0, 1)] 
        : [...RESUME_CHIPS, ...HIRING_CHIPS.slice(0, 2)])
    : (matchResult 
        ? [...JD_CHIPS, ...HIRING_CHIPS.slice(0, 2)] 
        : HIRING_CHIPS);

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setChatOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 w-full sm:w-[550px] z-50",
              "flex flex-col bg-[var(--bg-surface)] border-l border-[var(--bg-border)] shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--bg-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--brand-green)]/20 rounded-lg">
                  <Bot className="w-5 h-5 text-[var(--brand-green)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                    Ask about @{developer.username}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Hiring Agent</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status bar */}
            <div className={cn(
              "px-4 py-2 text-xs font-display flex items-center gap-2 border-b border-[var(--bg-border)]",
              hasResume
                ? "bg-[var(--brand-green-dim)]/30 text-[var(--brand-green)]"
                : "bg-[var(--warning)]/10 text-[var(--warning)]"
            )}>
              <span className={cn("w-2 h-2 rounded-full", hasResume ? "bg-[var(--brand-green)]" : "bg-[var(--warning)]")} />
              {hasResume ? 'GitHub + resume data' : 'Answering from GitHub data only'}
            </div>

            {/* Resume section */}
            <div className="border-b border-[var(--bg-border)]">
              <button
                onClick={() => setResumeExpanded(!resumeExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50 transition-colors"
              >
                <span>Resume Upload</span>
                {resumeExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <AnimatePresence>
                {resumeExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      <ResumeUpload
                        onUpload={handleResumeUpload}
                        uploadedFileName={resumeFileName}
                        onClear={handleResumeClear}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
                  <div className="text-center">
                    <Bot className="w-10 h-10 text-[var(--brand-green)] mx-auto mb-3 opacity-60" />
                    <p className="text-sm text-[var(--text-secondary)] max-w-[280px]">
                      I&apos;m a hiring assistant. Ask me anything about this candidate — I&apos;ll cite specific repos and resume evidence.
                    </p>
                  </div>
                  <SuggestedQuestions chips={chips} onSelect={handleSend} />
                </div>
              )}

              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-green)]/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[var(--brand-green)]" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-elevated)] flex items-center gap-1.5">
                    <motion.div className="w-2 h-2 rounded-full bg-[var(--brand-green)]" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-[var(--brand-green)]" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-[var(--brand-green)]" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested chips when there are messages */}
            {messages.length > 0 && messages.length < 4 && (
              <div className="px-4 py-2 border-t border-[var(--bg-border)]/50">
                <SuggestedQuestions chips={chips.slice(0, 3)} onSelect={handleSend} />
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[var(--bg-border)] bg-[var(--bg-elevated)]">
              <form
                onSubmit={e => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about this candidate..."
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-full px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-green)] transition-colors font-display"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-[var(--brand-green)] text-[#0D0F14] rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
