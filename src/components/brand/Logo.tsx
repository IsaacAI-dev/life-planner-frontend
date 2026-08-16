interface LogoProps {
  size?: number;
  className?: string;
}

/** The Dawn mark. Gradient ids are suffixed so multiple instances stay valid. */
export function LogoMark({ size = 32, className }: LogoProps) {
  const gradientId = `dawn-${size}`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D4530" />
          <stop offset="1" stopColor="#E0B184" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
      <g stroke="#2B1D16" fill="#2B1D16" strokeLinecap="round">
        <path d="M20 15 V45 H47" strokeWidth="5.6" fill="none" />
        <path d="M26.5 42.2 A8 8 0 0 1 42.5 42.2 Z" />
        <line x1="27" y1="28.6" x2="29.6" y2="26" strokeWidth="3" />
        <line x1="42" y1="28.6" x2="39.4" y2="26" strokeWidth="3" />
        <line x1="34.5" y1="24" x2="34.5" y2="20.5" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 32 }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} className="rounded-lg" />
      <span className="font-display text-base font-semibold tracking-tight">Life Planner</span>
    </div>
  );
}
