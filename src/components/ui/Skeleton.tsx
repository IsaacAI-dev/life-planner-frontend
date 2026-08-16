export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-shimmer rounded-xl ${className ?? ''}`} />;
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-26" />
        <Skeleton className="h-26" />
        <Skeleton className="h-26" />
      </div>
      <Skeleton className="h-58" />
    </div>
  );
}
