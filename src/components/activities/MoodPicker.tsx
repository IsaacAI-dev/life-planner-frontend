'use client';

import { MOOD_LABELS } from '@/lib/constants';

interface MoodPickerProps {
  value: number | null;
  onChange: (mood: number) => void;
}

/** Cycles 1–5 on click. Mood is stored on the day note (PUT /days/:date/note). */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const current = value ?? 4;

  return (
    <button
      type="button"
      onClick={() => onChange((current % 5) + 1)}
      className="flex items-center gap-2.5"
      aria-label={`Mood: ${MOOD_LABELS[current]}. Tap to change.`}
    >
      <span className="size-9 rounded-full bg-accent" />
      <span className="flex flex-col items-start">
        <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Mood</span>
        <span className="text-sm font-bold">{MOOD_LABELS[current]}</span>
      </span>
    </button>
  );
}
