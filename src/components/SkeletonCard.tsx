interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <div className={`glass-card p-5 space-y-3 ${className}`}>
      <div className="skeleton-shimmer h-4 w-1/3 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-shimmer h-3 rounded" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}
