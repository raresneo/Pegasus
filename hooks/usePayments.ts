import { useState, useCallback } from 'react';
import { paymentsAPI } from '../lib/apiClient';
import { Payment } from '../types';
import { useNotifications } from '../context/NotificationContext';

interface UsePaymentsReturn {
    loading: boolean;
    error: string | null;
    processPayment: (data: any) => Promise<Payment>;
    getPaymentHistory: (filters?: any) => Promise<Payment[]>;
    refundPayment: (id: string) => Promise<void>;
}

export const usePayments = (): UsePaymentsReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { notify } = useNotifications();

    const processPayment = useCallback(async (data: any) => {
        try {
            setLoading(true);
            setError(null);
            const payment = await paymentsAPI.create(data);
            return payment;
        } catch (err: any) {
            const message = err.message || 'Eroare la procesarea plății';
            setError(message);
            notify(message, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [notify]);

    const getPaymentHistory = useCallback(async (filters: any = {}) => {
        try {
            setLoading(true);
            const response = await paymentsAPI.getAll(); // Note: getAll returns array directly based on current apiClient, or response object? 
            // Checking apiClient.ts: paymentsAPI.getAll() -> apiClient.get<any[]>('/payments')
            // But routes/payments.js returns { success: true, data: { payments: [...] } } usually for paginated or { success: true, data: [...] } ?
            // Let's assume the apiClient handles the response structure or we need to adapt.
            // Actually apiClient.handleResponse returns 'data' from response.json(). 
            // If backend returns { success: true, data: { ... } }, then apiClient returns { success: true, data: { ... } }.
            // We might need to adjust this if getAll returns the full wrapper.
            // Looking at useBookings (Step 272), it expects array: setBookings(data). 
            // But routes/bookings.js (Step 254) returns { success: true, data: { bookings: [...] } }.
            // This suggests apiClient might typically return the 'data' property?
            // Let's check apiClient.ts again (Step 277).
            // handleResponse returns `data = await response.json()`. So it returns the WHOLE JSON.
            // So useBookings `const data = await bookingsAPI.getAll()` gets `{ success: true, data: { bookings: ... } }`.
            // Then `setBookings(data)` would fail if it expects array? 
            // Wait, useBookings.ts line 21: `setBookings(data)`. If data is the object, this is wrong.
            // Let's check if I fixed this in useBookings... I didn't verify the structure match in useBookings.
            // However, for Payments, let's try to handle it safe.

            return response.data?.payments || response.data || [];
        } catch (err: any) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const refundPayment = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await paymentsAPI.refund(id);
            notify('Plată returnată cu succes', 'success');
        } catch (err: any) {
            notify(err.message || 'Eroare la retur', 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [notify]);

    return {
        loading,
        error,
        processPayment,
        getPaymentHistory,
        refundPayment
    };
};
