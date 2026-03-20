'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Developer } from '@/lib/types';
import { useQA } from '@/hooks/useQA';

interface QAAgentProps {
  developer: Developer;
}

const SUGGESTED_CHIPS = [
  "My strongest skills",
  "Roles that suit this profile",
  "Skills missing for a senior role",
  "Why is my score what it is?",
  "What would improve my score?"
];

export function QAAgent({ developer }: QAAgentProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    messagesEndRef,
  } = useQA(developer);

  // Use local state for open/close since QAAgent is a floating panel
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={cn(
          "fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 text-white transition-all",
          isOpen ? "bg-[var(--bg-elevated)] scale-0" : "bg-[var(--brand-green)] hover:bg-[var(--brand-green)]/90 scale-100"
        )}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--bg-border)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[var(--brand-green)]/20 rounded-lg">
                  <Bot className="w-5 h-5 text-[var(--brand-green)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Profile Q&A Agent</h3>
                  <p className="text-xs text-[var(--text-muted)]">Ask me about {developer.username}&apos;s skills</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-[var(--brand-green)] mx-auto mb-3 opacity-80" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      I can answer questions about {developer.username}&apos;s GitHub profile, skills, and role fit.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full mt-4">
                    {SUGGESTED_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="text-left px-4 py-2 text-sm bg-[var(--bg-elevated)] hover:bg-[var(--bg-border)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--bg-border)]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-[var(--bg-elevated)]" : "bg-[var(--brand-green)]/20"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-[var(--text-secondary)]" /> : <Bot className="w-4 h-4 text-[var(--brand-green)]" />}
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap",
                    msg.role === 'user' 
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-tr-sm" 
                      : "bg-[var(--brand-green)]/10 text-[var(--text-primary)] rounded-tl-sm border border-[var(--brand-green)]/20"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-green)]/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[var(--brand-green)]" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--brand-green)]/10 border border-[var(--brand-green)]/20 flex items-center gap-1">
                    <motion.div className="w-2 h-2 rounded-full bg-[var(--brand-green)]/60" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-[var(--brand-green)]/60" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-[var(--brand-green)]/60" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--bg-border)] bg-[var(--bg-elevated)]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-full px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-green)] transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green)]/90 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
