/**
 * Loading Skeleton Components
 * Reusable skeleton components for better loading states
 */

import React from 'react';

/**
 * Generic skeleton loader
 */
interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
}) => {
    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || undefined,
    };

    return (
        <div
            className={`bg-white/5 animate-pulse ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

/**
 * Card skeleton for member/product cards
 */
export const CardSkeleton: React.FC<{ variant?: 'grid' | 'list' }> = ({ variant = 'grid' }) => {
    if (variant === 'list') {
        return (
            <div className="glass-card rounded-2xl p-4 flex items-center gap-6">
                <Skeleton variant="rectangular" width={48} height={48} className="flex-shrink-0" />

                <div className="flex-1 space-y-3">
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="60%" height={12} />
                </div>

                <Skeleton width={24} height={24} variant="circular" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col">
            <div className="flex items-center justify-center mb-4">
                <Skeleton variant="circular" width={80} height={80} />
            </div>

            <div className="space-y-3 flex-1">
                <Skeleton width="60%" height={16} className="mx-auto" />
                <Skeleton width="40%" height={12} className="mx-auto" />
                <Skeleton width="80%" height={10} className="mx-auto mt-6" />
            </div>

            <div className="mt-6 flex gap-2 justify-center">
                <Skeleton width={60} height={24} className="rounded-full" />
                <Skeleton width={60} height={24} className="rounded-full" />
            </div>
        </div>
    );
};

/**
 * Table skeleton
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 4,
}) => {
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`header-${i}`} height={20} />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={16} />
                    ))}
                </div>
            ))}
        </div>
    );
};

/**
 * Dashboard stat card skeleton
 */
export const StatCardSkeleton: React.FC = () => {
    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton width={40} height={40} variant="rectangular" />
                <Skeleton width={24} height={24} variant="circular" />
            </div>

            <Skeleton width="50%" height={32} className="mb-2" />
            <Skeleton width="70%" height={14} />
        </div>
    );
};

/**
 * Full page skeleton for members/products pages
 */
export const PageSkeleton: React.FC<{ variant?: 'grid' | 'list' }> = ({ variant = 'grid' }) => {
    return (
        <div className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton width={200} height={32} />
                <Skeleton width={120} height={40} className="rounded-lg" />
            </div>

            {/* Filters skeleton */}
            <div className="flex gap-4">
                <Skeleton width={200} height={40} className="rounded-lg" />
                <Skeleton width={150} height={40} className="rounded-lg" />
                <Skeleton width={150} height={40} className="rounded-lg" />
            </div>

            {/* Content skeleton */}
            {variant === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <CardSkeleton key={i} variant="grid" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardSkeleton key={i} variant="list" />
                    ))}
                </div>
            )}
        </div>
    );
};
