import React, { useMemo, useState } from 'react';
import { Member } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import {
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { format, isPast, isFuture } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ClientBookingsPageProps {
    member: Member;
    onBack: () => void;
}

const ClientBookingsPage: React.FC<ClientBookingsPageProps> = ({ member, onBack }) => {
    const { bookings } = useDatabase();
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

    const memberBookings = useMemo(() => {
        const filtered = bookings.filter(b => b.memberId === member.id);

        switch (filter) {
            case 'upcoming':
                return filtered
                    .filter(b => isFuture(new Date(b.startTime)))
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            case 'past':
                return filtered
                    .filter(b => isPast(new Date(b.endTime)))
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            default:
                return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        }
    }, [bookings, member.id, filter]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'attended':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'no-show':
                return <XCircleIcon className="w-5 h-5 text-red-400" />;
            case 'cancelled':
                return <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />;
            default:
                return <CalendarIcon className="w-5 h-5 text-blue-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            scheduled: 'Programat',
            attended: 'Prezent',
            'no-show': 'Absent',
            cancelled: 'Anulat'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            attended: 'bg-green-500/20 text-green-400 border-green-500/30',
            'no-show': 'bg-red-500/20 text-red-400 border-red-500/30',
            cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
        return colors[status] || colors.scheduled;
    };

    const stats = useMemo(() => {
        const allBookings = bookings.filter(b => b.memberId === member.id);
        return {
            total: allBookings.length,
            upcoming: allBookings.filter(b => isFuture(new Date(b.startTime)) && b.status === 'scheduled').length,
            attended: allBookings.filter(b => b.status === 'attended').length,
            noShow: allBookings.filter(b => b.status === 'no-show').length
        };
    }, [bookings, member.id]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Rezervările Mele</h1>
                    <p className="text-gray-400">Istoricul și managementul rezervărilor</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    ← Înapoi
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <CalendarIcon className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.total}</h3>
                    <p className="text-sm text-gray-400">Total Rezervări</p>
                </div>

                <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <ClockIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.upcoming}</h3>
                    <p className="text-sm text-gray-400">Viitoare</p>
                </div>

                <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.attended}</h3>
                    <p className="text-sm text-gray-400">Participări</p>
                </div>

                <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <XCircleIcon className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.noShow}</h3>
                    <p className="text-sm text-gray-400">Absențe</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center space-x-4">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            Toate
                        </button>
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'upcoming'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            Viitoare
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'past'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            Trecute
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800">
                {memberBookings.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {memberBookings.map(booking => (
                            <div
                                key={booking.id}
                                className="p-6 hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            {getStatusIcon(booking.status)}
                                            <h3 className="text-lg font-semibold text-white">{booking.title}</h3>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {format(new Date(booking.startTime), 'EEEE, d MMMM yyyy', { locale: ro })}
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="w-4 h-4 mr-2" />
                                                {format(new Date(booking.startTime), 'HH:mm', { locale: ro })} - {format(new Date(booking.endTime), 'HH:mm', { locale: ro })}
                                            </div>
                                        </div>

                                        {booking.recurrence && (
                                            <div className="mt-2">
                                                <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                                                    Recurent: {booking.recurrence.rule}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>

                                        {booking.status === 'scheduled' && isFuture(new Date(booking.startTime)) && (
                                            <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                                                Anulează
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-2">
                            {filter === 'upcoming' && 'Nu ai rezervări viitoare'}
                            {filter === 'past' && 'Nu ai rezervări trecute'}
                            {filter === 'all' && 'Nu ai rezervări'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientBookingsPage;
