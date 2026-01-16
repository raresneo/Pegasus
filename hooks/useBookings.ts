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

    const updateBooking = async (id: string, updates: Partial<Booking>) => {
        try {
            setLoading(true);
            const updated = await bookingsAPI.update(id, updates);
            setBookings(prev => prev.map(b => b.id === id ? updated : b));
            return updated;
        } catch (err: any) {
            setError(err.message || 'Failed to update booking');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (id: string) => {
        try {
            setLoading(true);
            await bookingsAPI.delete(id);
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
