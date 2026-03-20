'use client';

import { Developer } from '@/lib/types';
import { X, Download, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { PortfolioPDF } from './PortfolioPDF';

// We must dynamically import the PDF components to avoid "document is not defined" SSR errors
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), { ssr: false });
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), { ssr: false });

interface Props {
  developer: Developer;
  open: boolean;
  onClose: () => void;
}

export function PDFModal({ developer, open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setMounted(false), 300); // give time for exit anim
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  if (!mounted && !open) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className={`relative w-full max-w-5xl h-[90vh] bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bg-border)] bg-[var(--bg-base)]/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Portfolio Export • @{developer.username}
          </h2>
          <div className="flex items-center gap-3">
            <PDFDownloadLink
              document={<PortfolioPDF developer={developer} />}
              fileName={`${developer.username}_skilllens.pdf`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-green)] text-[#0D0F14] font-semibold rounded-lg hover:brightness-110 transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </PDFDownloadLink>

            <button
              onClick={onClose}
              className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-black/10 rounded-b-2xl overflow-hidden relative">
          <PDFViewer width="100%" height="100%" className="border-none rounded-b-2xl">
            <PortfolioPDF developer={developer} />
          </PDFViewer>
          
          {/* Fallback loader before iframe initializes */}
          <div className="absolute inset-0 z-[-1] flex items-center justify-center text-[var(--text-muted)]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>

      </div>
    </div>
  );
}
