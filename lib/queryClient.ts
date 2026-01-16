/**
 * React Query Configuration
 * Setup for API caching, background refetching, and optimistic updates
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { AppError, NetworkError } from './errors';

/**
 * Global error handler for queries
 */
const onQueryError = (error: unknown) => {
    console.error('Query error:', error);

    // Handle specific error types
    if (error instanceof NetworkError) {
        // Could show a global toast notification here
        console.warn('Network error in query:', error.message);
    } else if (error instanceof AppError) {
        console.error('App error in query:', error.message, error.statusCode);
    }
};

/**
 * Global error handler for mutations
 */
const onMutationError = (error: unknown) => {
    console.error('Mutation error:', error);

    if (error instanceof AppError) {
        console.error('Mutation failed:', error.message, error.statusCode);
    }
};

/**
 * Create QueryClient with optimized defaults
 */
export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: onQueryError,
    }),
    mutationCache: new MutationCache({
        onError: onMutationError,
    }),
    defaultOptions: {
        queries: {
            // Caching configuration
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5min
            gcTime: 30 * 60 * 1000, // 30 minutes - cache time (formerly cacheTime)

            // Refetch configuration
            refetchOnWindowFocus: true, // Refetch when user returns to tab
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: true, // Refetch when component mounts

            // Retry configuration
            retry: (failureCount, error) => {
                // Don't retry on client errors (4xx)
                if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
                    return false;
                }
                // Retry up to 2 times for server errors
                return failureCount < 2;
            },
            retryDelay: (attemptIndex) => {
                // Exponential backoff: 1s, 2s, 4s
                return Math.min(1000 * 2 ** attemptIndex, 30000);
            },

            // Performance
            structuralSharing: true, // Reduce re-renders
        },
        mutations: {
            // Retry only once for mutations
            retry: 1,
            retryDelay: 1000,
        },
    },
});

/**
 * Query key factory for consistent keys across the app
 */
export const queryKeys = {
    // Members
    members: {
        all: ['members'] as const,
        lists: () => [...queryKeys.members.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.members.lists(), filters] as const,
        details: () => [...queryKeys.members.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.members.details(), id] as const,
    },

    // Bookings
    bookings: {
        all: ['bookings'] as const,
        lists: () => [...queryKeys.bookings.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.bookings.lists(), filters] as const,
        details: () => [...queryKeys.bookings.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
        conflicts: (data: any) => [...queryKeys.bookings.all, 'conflicts', data] as const,
    },

    // Payments
    payments: {
        all: ['payments'] as const,
        lists: () => [...queryKeys.payments.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.payments.lists(), filters] as const,
        byMember: (memberId: string) => [...queryKeys.payments.all, 'member', memberId] as const,
    },

    // Products
    products: {
        all: ['products'] as const,
        lists: () => [...queryKeys.products.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.products.details(), id] as const,
    },

    // Tasks
    tasks: {
        all: ['tasks'] as const,
        lists: () => [...queryKeys.tasks.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.tasks.lists(), filters] as const,
        details: () => [...queryKeys.tasks.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    },

    // Prospects
    prospects: {
        all: ['prospects'] as const,
        lists: () => [...queryKeys.prospects.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.prospects.lists(), filters] as const,
        details: () => [...queryKeys.prospects.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.prospects.details(), id] as const,
    },

    // Assets
    assets: {
        all: ['assets'] as const,
        lists: () => [...queryKeys.assets.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.assets.lists(), filters] as const,
        details: () => [...queryKeys.assets.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.assets.details(), id] as const,
    },

    // Reports
    reports: {
        revenue: (params: any) => ['reports', 'revenue', params] as const,
        members: (params: any) => ['reports', 'members', params] as const,
        bookings: (params: any) => ['reports', 'bookings', params] as const,
        overview: ['reports', 'overview'] as const,
    },
};

/**
 * Utility to invalidate all queries of a certain type
 */
export const invalidateQueries = {
    members: () => queryClient.invalidateQueries({ queryKey: queryKeys.members.all }),
    bookings: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
    payments: () => queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
    tasks: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    prospects: () => queryClient.invalidateQueries({ queryKey: queryKeys.prospects.all }),
    assets: () => queryClient.invalidateQueries({ queryKey: queryKeys.assets.all }),
};
