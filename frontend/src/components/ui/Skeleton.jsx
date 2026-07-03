import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-surface-alt rounded-btn ${className}`} />
);

export const SkeletonStatCard = () => (
  <div className="bg-surface border border-border rounded-card p-5 flex items-center gap-4">
    <div className="w-12 h-12 bg-surface-alt rounded-btn animate-pulse flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-12" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-36" />
      <Skeleton className="h-3 w-52" />
    </div>
    <Skeleton className="h-5 w-16 rounded-pill" />
  </div>
);

export const SkeletonCard = ({ rows = 3 }) => (
  <div className="bg-surface border border-border rounded-card p-5 space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-24' : 'w-full'}`} />
    ))}
  </div>
);
