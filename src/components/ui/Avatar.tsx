import { initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  online?: boolean;
}

export function Avatar({ name, src, size = 40, className, online = false }: AvatarProps) {
  return (
    <span className="relative inline-flex flex-none">
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-accent bg-cover bg-center font-extrabold text-on-accent',
          className,
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.34,
          backgroundImage: src ? `url(${src})` : undefined,
        }}
      >
        {src ? null : initialsOf(name)}
      </span>
      {online ? (
        <span
          className="absolute right-0 bottom-0 rounded-full border-2 bg-green-ink"
          style={{ width: size * 0.28, height: size * 0.28, borderColor: 'var(--surface-2)' }}
        />
      ) : null}
    </span>
  );
}
