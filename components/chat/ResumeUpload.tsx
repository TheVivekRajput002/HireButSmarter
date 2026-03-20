'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onUpload: (text: string, fileName: string) => void;
  uploadedFileName?: string | null;
  onClear: () => void;
}

export function ResumeUpload({ onUpload, uploadedFileName, onClear }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFile = async (file: File) => {
    setError(null);

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File size must be under 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to parse PDF');
      }

      const data = await response.json();
      onUpload(data.text, file.name);
    } catch {
      setError('Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Already uploaded state
  if (uploadedFileName) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-green-dim)]/30 border border-[var(--brand-green)]/20">
        <FileText className="w-5 h-5 text-[var(--brand-green)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)] truncate">{uploadedFileName}</p>
          <p className="text-xs text-[var(--brand-green)]">Resume loaded</p>
        </div>
        <button
          onClick={onClear}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-center",
          isDragging
            ? "border-[var(--brand-green)] bg-[var(--brand-green)]/5"
            : "border-[var(--bg-border)] hover:border-[var(--text-muted)] bg-[var(--bg-elevated)]/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <Upload className={cn("w-6 h-6", isDragging ? "text-[var(--brand-green)]" : "text-[var(--text-muted)]")} />
        <div>
          <p className="text-xs text-[var(--text-secondary)]">
            {isUploading ? 'Processing...' : 'Drop PDF here or click to upload'}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">PDF only · Max 5MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-[var(--error)]">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
