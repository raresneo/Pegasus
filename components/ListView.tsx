
import React, { useMemo } from 'react';
import { Booking, Member, Resource } from '../types';
import { format, parseISO, startOfDay } from 'date-fns';

interface ListViewProps {
    bookings: Booking[];
    members: Member[];
    resources: Resource[];
    onBookingClick: (booking: Booking, instanceDate: string) => void;
    currentDate: Date;
}

const expandRecurringBookings = (bookings: Booking[], viewStartDate: Date, viewEndDate: Date): Booking[] => {
    const instances: Booking[] = [];
    const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
    
    bookings.forEach(booking => {
        if (booking.recurrence && booking.seriesId) {
            const recurrenceEndDate = new Date(booking.recurrence.endDate);
            let current = new Date(booking.startTime);
            const exceptionDates = (booking.recurrence.exceptionDates || []).map(d => toYYYYMMDD(new Date(d)));

            while (current <= recurrenceEndDate && current < viewEndDate) {
                if (current >= viewStartDate && !exceptionDates.includes(toYYYYMMDD(current))) {
                    const duration = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();
                    const instanceEndTime = new Date(current.getTime() + duration);
                    instances.push({
                        ...booking,
                        id: `${booking.id}_${current.toISOString()}`,
                        startTime: current.toISOString(),
                        endTime: instanceEndTime.toISOString(),
                        recurrence: undefined, 
                    });
                }
                
                switch (booking.recurrence.rule) {
                    case 'daily': current.setDate(current.getDate() + 1); break;
                    case 'weekly': current.setDate(current.getDate() + 7); break;
                    case 'monthly': current.setMonth(current.getMonth() + 1); break;
                }
            }
        } 
        else if (!booking.recurrence) {
            const bookingStartTime = new Date(booking.startTime);
            if (bookingStartTime >= viewStartDate && bookingStartTime < viewEndDate) {
                instances.push(booking);
            }
        }
    });
    return instances;
};

const ListView: React.FC<ListViewProps> = ({ bookings, members, resources, onBookingClick, currentDate }) => {

    const dayBookings = useMemo(() => {
        const start = startOfDay(currentDate);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        const expanded = expandRecurringBookings(bookings, start, end);
        return expanded.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    }, [bookings, currentDate]);
    
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);
    const resourceMap = useMemo(() => new Map(resources.map(r => [r.id, r])), [resources]);

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b dark:border-gray-700">
                Agendă pentru {format(currentDate, 'EEEE, d MMMM yyyy')}
            </h2>
            {dayBookings.length > 0 ? (
                 <ul className="space-y-3">
                    {dayBookings.map(booking => {
                        const member = booking.memberId ? memberMap.get(booking.memberId) : null;
                        const resource = resourceMap.get(booking.resourceId);

                        return (
                            <li key={booking.id}
                                onClick={() => onBookingClick(booking, booking.startTime)}
                                className={`p-4 rounded-lg shadow-sm cursor-pointer border-l-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow border-${booking.color}-500`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{booking.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {format(parseISO(booking.startTime), 'p')} - {format(parseISO(booking.endTime), 'p')}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-sm text-gray-600 dark:text-gray-300 mt-2 sm:mt-0 sm:text-right">
                                        {resource && <p><strong>Resursă:</strong> {resource.name}</p>}
                                        {member && <p><strong>Client:</strong> {member.firstName} {member.lastName}</p>}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <p>Nu sunt programări pentru această zi.</p>
                </div>
            )}
        </div>
    );
};

export default ListView;
