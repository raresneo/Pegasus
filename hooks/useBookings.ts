import { useState, useEffect, useCallback } from 'react';
import { bookingsAPI } from '../lib/apiClient';
import { Booking } from '../types';

interface UseBookingsOptions {
    autoFetch?: boolean;
}

export const useBookings = (options: UseBookingsOptions = {}) => {
    const { autoFetch = true } = options;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookingsAPI.getAll();
            setBookings(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchBookings();
        }
    }, [autoFetch, fetchBookings]);

    const addBooking = async (bookingData: Partial<Booking>) => {
        try {
            setLoading(true);
            // Backend handles conflict checking and returns 409 if conflict exists
            const newBooking = await bookingsAPI.create(bookingData);
            setBookings(prev => [newBooking, ...prev]);
            return newBooking;
        } catch (err: any) {
            // Re-throw to let component handle the specific error (e.g. 409 Conflict)
            setError(err.message || 'Failed to add booking');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateBooking = async (idOrBooking: string | Booking, updatesOrScope: Partial<Booking> | string = {}) => {
        try {
            setLoading(true);
            let id: string;
            let updates: Partial<Booking>;
            let scope: string | undefined;

            if (typeof idOrBooking === 'string') {
                id = idOrBooking;
                updates = updatesOrScope as Partial<Booking>;
            } else {
                id = idOrBooking.id;
                updates = idOrBooking;
                scope = updatesOrScope as string;
            }

            // If scope is provided, we might need a different API call or pass it in query params
            // For now assuming the API handles it in the body if we pass it, or we just ignore if not supported by backend yet.
            // If the ID represents an instance (e.g. id_date), we might need to handle that.

            const updated = await bookingsAPI.update(id, { ...updates, scope });
            setBookings(prev => prev.map(b => b.id === id ? updated : b));
            return updated;
        } catch (err: any) {
            setError(err.message || 'Failed to update booking');
            console.error(err);
            throw err; // Re-throw for component handling
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (idOrBooking: string | Booking, scope?: string) => {
        try {
            setLoading(true);
            const id = typeof idOrBooking === 'string' ? idOrBooking : idOrBooking.id;

            // Pass scope if exists? Assuming API needs it.
            await bookingsAPI.delete(id, { scope });

            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete booking');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id: string) => {
        return updateBooking(id, { status: 'cancelled' });
    };

    const confirmBooking = async (id: string) => {
        return updateBooking(id, { status: 'confirmed' });
    };

    const refresh = () => {
        fetchBookings();
    };

    return {
        bookings,
        loading,
        error,
        addBooking,
        updateBooking,
        deleteBooking,
        cancelBooking,
        confirmBooking,
        refresh
    };
};
