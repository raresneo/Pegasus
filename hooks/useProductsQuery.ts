/**
 * React Query hooks for Products
 * Replaces manual state management with automatic caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../lib/apiClient';
import { queryKeys } from '../lib/queryClient';
import { Product } from '../types';
import { useNotifications } from '../context/NotificationContext';

/**
 * Fetch all products with caching
 */
export const useProducts = () => {
    return useQuery({
        queryKey: queryKeys.products.lists(),
        queryFn: () => productsAPI.getAll(),
        staleTime: 3 * 60 * 1000, // 3 minutes (products change more frequently)
    });
};

/**
 * Fetch single product by ID
 */
export const useProduct = (id: string) => {
    return useQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => productsAPI.getById(id),
        enabled: !!id,
    });
};

/**
 * Create new product
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();

    return useMutation({
        mutationFn: (data: Partial<Product>) => productsAPI.create(data),

        onMutate: async (newProduct) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
            const previousProducts = queryClient.getQueryData(queryKeys.products.lists());

            queryClient.setQueryData(queryKeys.products.lists(), (old: Product[] = []) => [
                ...old,
                { ...newProduct, id: `temp-${Date.now()}` } as Product,
            ]);

            return { previousProducts };
        },

        onError: (err, newProduct, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(queryKeys.products.lists(), context.previousProducts);
            }
            showNotification('Eroare la crearea produsului', 'error');
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
            showNotification('Produs creat cu succes', 'success');
        },
    });
};

/**
 * Update product with optimistic update
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
            productsAPI.update(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });
            await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

            const previousProduct = queryClient.getQueryData(queryKeys.products.detail(id));
            const previousProducts = queryClient.getQueryData(queryKeys.products.lists());

            queryClient.setQueryData(queryKeys.products.detail(id), (old: Product | undefined) =>
                old ? { ...old, ...data } : old
            );

            queryClient.setQueryData(queryKeys.products.lists(), (old: Product[] = []) =>
                old.map((product) => (product.id === id ? { ...product, ...data } : product))
            );

            return { previousProduct, previousProducts, id };
        },

        onError: (err, variables, context) => {
            if (context?.previousProduct) {
                queryClient.setQueryData(queryKeys.products.detail(context.id), context.previousProduct);
            }
            if (context?.previousProducts) {
                queryClient.setQueryData(queryKeys.products.lists(), context.previousProducts);
            }
            showNotification('Eroare la actualizarea produsului', 'error');
        },

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
            showNotification('Produs actualizat cu succes', 'success');
        },
    });
};

/**
 * Delete product
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();

    return useMutation({
        mutationFn: (id: string) => productsAPI.delete(id),

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
            const previousProducts = queryClient.getQueryData(queryKeys.products.lists());

            queryClient.setQueryData(queryKeys.products.lists(), (old: Product[] = []) =>
                old.filter((product) => product.id !== id)
            );

            return { previousProducts, id };
        },

        onError: (err, id, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(queryKeys.products.lists(), context.previousProducts);
            }
            showNotification('Eroare la ștergerea produsului', 'error');
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
            showNotification('Produs șters cu succes', 'success');
        },
    });
};

/**
 * Bulk update products (for stock adjustments)
 */
export const useBulkUpdateProducts = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();

    return useMutation({
        mutationFn: (updates: Array<{ id: string; data: Partial<Product> }>) =>
            productsAPI.bulkUpdate(updates),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
            showNotification('Produse actualizate cu succes', 'success');
        },

        onError: () => {
            showNotification('Eroare la actualizarea produselor', 'error');
        },
    });
};
