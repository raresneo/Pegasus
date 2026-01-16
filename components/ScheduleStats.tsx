import React, { useMemo } from 'react';
import { Booking, Resource } from '../types';
import * as Icons from './icons';

interface ScheduleStatsProps {
    bookings: Booking[];
    resources: Resource[];
}

const StatCard: React.FC<{ icon: React.FC<any>, value: string | number, label: string }> = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-3 p-2 bg-background-dark rounded-md">
        <Icon className="w-5 h-5 text-primary-400" />
        <div>
            <p className="font-bold text-lg">{value}</p>
            <p className="text-xs text-text-dark-secondary">{label}</p>
        </div>
    </div>
);

const ScheduleStats: React.FC<ScheduleStatsProps> = ({ bookings, resources }) => {
    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const attended = bookings.filter(b => b.status === 'attended').length;
        const noShows = bookings.filter(b => b.status === 'no-show').length;
        const attendedAndNoShows = attended + noShows;
        const attendanceRate = attendedAndNoShows > 0 ? ((attended / attendedAndNoShows) * 100) : 0;
        
        // A simple capacity utilization calculation
        const totalHoursBooked = bookings.reduce((acc, b) => {
            const duration = (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60);
            return acc + duration;
        }, 0);
        
        // Assuming an 8 hour day for utilization calculation, this is a simplification.
        const totalHoursAvailable = resources.length * 8; 
        const utilization = totalHoursAvailable > 0 ? (totalHoursBooked / totalHoursAvailable) * 100 : 0;

        return { totalBookings, attended, noShows, attendanceRate, utilization };
    }, [bookings, resources]);

    return (
        <div className="p-2 border-t border-border-dark mt-4">
             <h3 className="text-sm font-semibold mb-2 px-1">Statistics for View</h3>
             <div className="grid grid-cols-2 gap-2">
                <StatCard icon={Icons.CalendarIcon} value={stats.totalBookings} label="Total Bookings" />
                <StatCard icon={Icons.UsersIcon} value={stats.attended} label="Attended" />
                <StatCard icon={Icons.XCircleIcon} value={stats.noShows} label="No-Shows" />
                <StatCard icon={Icons.ChartPieIcon} value={`${stats.attendanceRate.toFixed(0)}%`} label="Attendance" />
             </div>
        </div>
    );
};

export default ScheduleStats;
