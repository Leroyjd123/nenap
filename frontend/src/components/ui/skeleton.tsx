import { cn } from '@/lib/cn';

/** Calm placeholder bar (.ph) with a soft shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-[5px] bg-line animate-pulse', className)} />;
}

/** A skeleton shaped like a note card, for the dashboard loading state. */
export function NoteCardSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-[var(--r)] p-[var(--pad)] shadow-1">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-full mt-3" />
      <Skeleton className="h-3 w-4/5 mt-2" />
      <Skeleton className="h-3 w-24 mt-4" />
    </div>
  );
}
