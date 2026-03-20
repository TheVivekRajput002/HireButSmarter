'use client';

interface Props {
  chips: string[];
  onSelect: (chip: string) => void;
}

export function SuggestedQuestions({ chips, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(chip)}
          className="px-3 py-1.5 text-xs font-display bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--brand-green)] hover:text-[var(--brand-green)] transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
