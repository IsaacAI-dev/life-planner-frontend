import { ImageOff } from 'lucide-react';

interface ImageSlotProps {
  placeholder: string;
  src?: string | null;
  alt?: string;
  shape?: 'rect' | 'circle';
  className?: string;
}

/**
 * Renders the real asset once `src` is available from the backend (see
 * MARKETING_ENDPOINTS.md). Until then, or if a specific slot was never
 * uploaded, this falls back to a labelled drop-slot placeholder — the
 * mechanism the handoff design itself uses for photography.
 */
export function ImageSlot({ placeholder, src, alt, shape = 'rect', className }: ImageSlotProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external, backend-owned asset host
      <img
        src={src}
        alt={alt ?? placeholder}
        loading="lazy"
        className={`h-full w-full object-cover ${shape === 'circle' ? 'rounded-full' : ''} ${className ?? ''}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed p-4 text-center ${
        shape === 'circle' ? 'rounded-full' : ''
      } ${className ?? ''}`}
      style={{ borderColor: 'var(--lp-line-str)', background: 'var(--lp-surf-in)' }}
    >
      <ImageOff size={shape === 'circle' ? 14 : 22} style={{ color: 'var(--lp-tx-4)' }} />
      {shape === 'circle' ? null : (
        <span className="max-w-48 text-[11px] leading-snug font-semibold" style={{ color: 'var(--lp-tx-4)' }}>
          {placeholder}
        </span>
      )}
    </div>
  );
}
