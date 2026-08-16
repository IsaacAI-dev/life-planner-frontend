'use client';

import { Play } from 'lucide-react';
import { formatClock } from '@/lib/format';
import type { MessageAttachment } from '@/lib/types';

/** Playback surface for a voice-note attachment. Waveform is computed server-side. */
export function VoiceNoteBubble({ note, outgoing }: { note: MessageAttachment; outgoing: boolean }) {
  const bars = note.waveform.length ? note.waveform : Array.from({ length: 28 }, () => 0.5);

  return (
    <div
      className="flex max-w-72 items-center gap-3 rounded-2xl px-3.5 py-3"
      style={{
        background: outgoing ? 'var(--accent)' : 'var(--bubble)',
        color: outgoing ? 'var(--on-accent)' : 'var(--bubble-ink)',
      }}
    >
      <button
        type="button"
        aria-label="Play voice note"
        className="flex size-8 flex-none items-center justify-center rounded-full"
        style={{ background: outgoing ? 'rgba(0,0,0,0.18)' : 'var(--surface-4)' }}
      >
        <Play size={15} />
      </button>

      <div className="flex h-6 flex-1 items-center gap-[2px]">
        {bars.map((level, index) => (
          <span
            key={index}
            className="flex-1 rounded-full bg-current opacity-70"
            style={{ height: `${Math.max(12, level * 100)}%` }}
          />
        ))}
      </div>

      <span className="flex-none text-[11px] font-bold">{formatClock(note.durationSeconds)}</span>
    </div>
  );
}
