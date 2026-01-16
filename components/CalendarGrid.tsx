
import React, { useMemo, DragEvent, useState, MouseEvent } from 'react';
import { Booking, Resource, Member, AbsenceReason } from '../types';
import * as Icons from './icons';
import ListView from './ListView';

export type ViewType = 'day' | 'week' | 'month' | 'list';

interface CalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
  resources: Resource[];
  members: Member[];
  onBookingClick: (booking: Booking, instanceDate: string) => void;
  onBookingDrop: (bookingId: string, newStartTime: Date, newResourceId: string) => void;
  onShareSlot: (startTime: Date, resourceId: string) => void;
  onSlotClick: (startTime: Date, resourceId: string) => void;
  view: ViewType;
  // Added missing properties to props interface
  onContextMenu?: (event: React.MouseEvent, booking: Booking) => void;
  absenceReasons?: AbsenceReason[];
}

const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const expandRecurringBookings = (bookings: Booking[], viewStartDate: Date, viewEndDate: Date): Booking[] => {
    const instances: Booking[] = [];
    
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

// --- Common Constants & Functions for Day/Week Views ---
const CALENDAR_START_HOUR = 7;
const ROW_HEIGHT_IN_REM = 4;
const PIXELS_PER_REM = 16;
const PIXELS_PER_HOUR = ROW_HEIGHT_IN_REM * PIXELS_PER_REM;
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60;

const timeSlots = Array.from({ length: 17 }, (_, i) => CALENDAR_START_HOUR + i); // 7 AM to 11 PM

const TimeGutter: React.FC = () => (
    <div className="w-16 flex-shrink-0">{/* Time Column */}
        {timeSlots.map(hour => (
            <div key={hour} className="h-16 text-right pr-2 border-r border-border-light dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 relative -top-2">
                    {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                </span>
            </div>
        ))}
    </div>
);

interface SuggestedSlot {
    slotTime: Date;
    priority: 1 | 2; // 1 for high (consolidation), 2 for medium (adjacency)
}

const DayColumn: React.FC<{
    date: Date;
    bookings: Booking[];
    resourceId: string;
    onBookingClick: (b: Booking, instanceDate: string) => void;
    onBookingDrop: (bookingId: string, newStartTime: Date, newResourceId: string) => void;
    onShareSlot: (startTime: Date, resourceId: string) => void;
    onSlotClick: (startTime: Date, resourceId: string) => void;
    // Added onContextMenu to DayColumn props
    onContextMenu?: (event: React.MouseEvent, booking: Booking) => void;
}> = ({ date, bookings, resourceId, onBookingClick, onBookingDrop, onShareSlot, onSlotClick, onContextMenu }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const suggestedSlots = useMemo((): SuggestedSlot[] => {
        const slotMap = new Map<number, SuggestedSlot>();
        const sortedBookings = [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
        // Priority 1: Consolidation gaps (<= 60 mins)
        for (let i = 0; i < sortedBookings.length - 1; i++) {
            const bookingA = sortedBookings[i];
            const bookingB = sortedBookings[i + 1];
            const gapStart = new Date(bookingA.endTime);
            const gapEnd = new Date(bookingB.startTime);
            const gapMinutes = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60);
    
            if (gapMinutes > 0 && gapMinutes <= 60) {
                let currentSlotTime = new Date(gapStart);
                while (currentSlotTime.getTime() < gapEnd.getTime()) {
                    const slot = { slotTime: new Date(currentSlotTime), priority: 1 as const };
                    slotMap.set(slot.slotTime.getTime(), slot);
                    currentSlotTime.setMinutes(currentSlotTime.getMinutes() + 30);
                }
            }
        }
    
        // Priority 2: Adjacency
        for (let hour = CALENDAR_START_HOUR; hour < 23; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, minute, 0, 0);
    
                if (slotMap.has(slotTime.getTime())) continue; // Skip if already a high-priority slot
    
                const slotEndTime = new Date(slotTime.getTime() + 30 * 60 * 1000);
    
                const isBusy = bookings.some(b => {
                    const bookingStart = new Date(b.startTime);
                    const bookingEnd = new Date(b.endTime);
                    return Math.max(slotTime.getTime(), bookingStart.getTime()) < Math.min(slotEndTime.getTime(), bookingEnd.getTime());
                });
    
                if (isBusy) continue;
    
                const isAfterBooking = bookings.some(b => new Date(b.endTime).getTime() === slotTime.getTime());
                const isBeforeBooking = bookings.some(b => new Date(b.startTime).getTime() === slotEndTime.getTime());
    
                if (isAfterBooking || isBeforeBooking) {
                     const slot = { slotTime, priority: 2 as const };
                     slotMap.set(slot.slotTime.getTime(), slot);
                }
            }
        }
        
        return Array.from(slotMap.values());
    }, [date, bookings]);

    const handleDragStart = (e: DragEvent<HTMLDivElement>, booking: Booking) => {
        e.dataTransfer.setData('booking', JSON.stringify(booking));
    };

    const calculateTimeFromY = (y: number, rectTop: number): Date => {
        const relativeY = y - rectTop;
        const minutesFromStart = Math.round(relativeY / PIXELS_PER_MINUTE);
        const snappedMinutes = Math.round(minutesFromStart / 15) * 15;
        
        const newTime = new Date(date);
        newTime.setHours(CALENDAR_START_HOUR, snappedMinutes, 0, 0);
        return newTime;
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const bookingJSON = e.dataTransfer.getData('booking');
        if (!bookingJSON) return;
        
        const booking: Booking = JSON.parse(bookingJSON);
        const newStartTime = calculateTimeFromY(e.clientY, e.currentTarget.getBoundingClientRect().top);

        onBookingDrop(booking.id, newStartTime, resourceId);
    };

    const handleGridClick = (e: MouseEvent<HTMLDivElement>) => {
        // Prevent click event when interacting with an existing booking
        if ((e.target as HTMLElement).closest('[draggable="true"]')) {
            return;
        }
        const newStartTime = calculateTimeFromY(e.clientY, e.currentTarget.getBoundingClientRect().top);
        onSlotClick(newStartTime, resourceId);
    };

    const handleShareClick = (hour: number, minute: number) => {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        onShareSlot(slotTime, resourceId);
    }

    return (
        <div 
            className={`relative border-r border-border-light dark:border-gray-700 ${isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={handleGridClick}
        >
            {timeSlots.map(hour => (
                 <div key={hour} className="h-16 border-b border-border-light dark:border-gray-700 group relative">
                    <button onClick={(e) => { e.stopPropagation(); handleShareClick(hour, 0); }} className="absolute top-1 right-1 z-10 hidden group-hover:block p-1 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-primary-500 hover:text-white">
                       <Icons.CalendarPlusIcon className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleShareClick(hour, 30); }} className="absolute top-1/2 -translate-y-1/2 right-1 z-10 hidden group-hover:block p-1 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-primary-500 hover:text-white">
                       <Icons.CalendarPlusIcon className="w-4 h-4" />
                    </button>
                 </div>
            ))}
            {suggestedSlots.map(({ slotTime, priority }) => {
                const startMinutes = (slotTime.getHours() - CALENDAR_START_HOUR) * 60 + slotTime.getMinutes();
                const top = startMinutes * PIXELS_PER_MINUTE;
                const height = 30 * PIXELS_PER_MINUTE;
                
                const priorityClasses = {
                    1: 'bg-green-200 dark:bg-green-800/50 border-l-4 border-green-500', // High priority
                    2: 'bg-green-100 dark:bg-green-900/30', // Medium priority
                };

                return (
                    <div
                        key={slotTime.toISOString()}
                        title={priority === 1 ? 'High-priority slot' : 'Suggested slot'}
                        className={`absolute left-0 right-0 opacity-80 z-0 group flex items-center justify-center p-1 text-center ${priorityClasses[priority]}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                    >
                        <span className="text-xs font-semibold text-green-800 dark:text-green-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           {priority === 1 ? 'Consolidate appointment' : 'Suggested slot'}
                        </span>
                    </div>
                )
            })}
            {bookings.map(booking => {
                const startTime = new Date(booking.startTime);
                const endTime = new Date(booking.endTime);
                const startMinutes = (startTime.getHours() - CALENDAR_START_HOUR) * 60 + startTime.getMinutes();
                const durationMinutes = Math.max(15, (endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Min height 15 mins
                const top = startMinutes * PIXELS_PER_MINUTE;
                const height = durationMinutes * PIXELS_PER_MINUTE;
                
                return (
                     <div key={booking.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, booking)}
                        onClick={(e) => { e.stopPropagation(); onBookingClick(booking, booking.startTime); }}
                        // Added onContextMenu to booking element
                        onContextMenu={(e) => onContextMenu && onContextMenu(e, booking)}
                        className={`absolute left-1 right-1 p-1 rounded-md border-l-4 overflow-hidden text-xs cursor-pointer bg-${booking.color}-100 dark:bg-${booking.color}-900/80 border-${booking.color}-500 text-${booking.color}-800 dark:text-${booking.color}-200 z-[1]`}
                        style={{ top: `${top}px`, height: `${height}px` }}>
                        <p className="font-bold truncate">{booking.title}</p>
                    </div>
                );
            })}
        </div>
    );
};


const DayView: React.FC<Omit<CalendarGridProps, 'view' | 'members'>> = ({ currentDate, bookings, resources, onBookingClick, onBookingDrop, onShareSlot, onSlotClick, onContextMenu }) => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayBookings = useMemo(() => expandRecurringBookings(bookings, startOfDay, endOfDay), [bookings, currentDate]);
    
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-auto">
                <div className="min-w-max flex-1 flex">
                    <TimeGutter />
                    <div className="flex-1">
                        <div className="grid sticky top-0 bg-white dark:bg-background-dark z-10 shadow-sm" style={{gridTemplateColumns: `repeat(${resources.length}, minmax(12rem, 1fr))`}}>
                            {resources.map(resource => (
                                <div key={resource.id} className="text-center py-2 border-r border-b border-border-light dark:border-border-dark">
                                    <p className="font-semibold text-text-light-primary dark:text-text-dark-primary">{resource.name}</p>
                                    <p className="text-xs text-text-light-secondary dark:text-gray-500 capitalize">{resource.type}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 grid" style={{gridTemplateColumns: `repeat(${resources.length}, minmax(12rem, 1fr))`}}>
                            {resources.map(resource => (
                                <DayColumn 
                                    key={resource.id}
                                    date={currentDate}
                                    bookings={dayBookings.filter(b => b.resourceId === resource.id)}
                                    resourceId={resource.id}
                                    onBookingClick={onBookingClick}
                                    onBookingDrop={onBookingDrop}
                                    onShareSlot={onShareSlot}
                                    onSlotClick={onSlotClick}
                                    // Passed onContextMenu to DayColumn
                                    onContextMenu={onContextMenu}
                                />
                            ))}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    )
};


const WeekView: React.FC<Omit<CalendarGridProps, 'view' | 'members'>> = (props) => {
    const { currentDate, bookings, resources, onBookingClick, onBookingDrop, onShareSlot, onSlotClick, onContextMenu } = props;

    const weekDays = useMemo(() => {
        const startOfWeek = getStartOfWeek(currentDate);
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            return day;
        });
    }, [currentDate]);
    
    const weekBookings = useMemo(() => {
        const endOfWeek = new Date(weekDays[6]);
        endOfWeek.setHours(23, 59, 59, 999);
        return expandRecurringBookings(bookings, weekDays[0], endOfWeek);
    }, [bookings, weekDays]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
             <div className="flex-1 flex overflow-auto">
                 <div className="min-w-max flex-1 flex">
                    <TimeGutter />
                    <div className="flex-1">
                        <div className="grid sticky top-0 bg-white dark:bg-background-dark z-10 shadow-sm" style={{ gridTemplateColumns: 'repeat(7, minmax(10rem, 1fr))' }}>
                            {weekDays.map(day => (
                                <div key={day.toISOString()} className="text-center py-2 border-r border-b border-border-light dark:border-border-dark">
                                    <p className="text-xs text-text-light-secondary dark:text-gray-500">{day.toLocaleString('default', { weekday: 'short' })}</p>
                                    <p className={`text-lg font-bold ${new Date().toDateString() === day.toDateString() ? 'text-primary-500' : 'text-text-light-primary dark:text-text-dark-primary'}`}>{day.getDate()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7" style={{ gridTemplateColumns: 'repeat(7, minmax(10rem, 1fr))' }}>
                            {weekDays.map(day => (
                                <DayColumn 
                                    key={day.toISOString()}
                                    date={day}
                                    bookings={weekBookings.filter(b => new Date(b.startTime).toDateString() === day.toDateString())}
                                    resourceId={resources[0]?.id} // Simplified for week view: assumes one resource or drop logic handles it
                                    onBookingClick={onBookingClick}
                                    onBookingDrop={onBookingDrop}
                                    onShareSlot={onShareSlot}
                                    onSlotClick={onSlotClick}
                                    // Passed onContextMenu to DayColumn
                                    onContextMenu={onContextMenu}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonthView: React.FC<Omit<CalendarGridProps, 'view' | 'onBookingDrop' | 'onShareSlot' | 'members' | 'resources'>> = ({ currentDate, bookings, onBookingClick, onSlotClick }) => {
    const monthDays = useMemo(() => {
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const days = [];
        
        const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
        for (let i = 0; i < startDayOfWeek; i++) {
            const prevMonthDay = new Date(firstDayOfMonth);
            prevMonthDay.setDate(prevMonthDay.getDate() - (startDayOfWeek - i));
            days.push({ date: prevMonthDay, isCurrentMonth: false });
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        const totalDays = days.length;
        const daysToPad = totalDays > 35 ? 42 - totalDays : 35 - totalDays;

        for (let i = 1; i <= daysToPad; i++) {
             const nextMonthDay = new Date(lastDayOfMonth);
             nextMonthDay.setDate(nextMonthDay.getDate() + i);
             days.push({ date: nextMonthDay, isCurrentMonth: false });
        }

        return days;
    }, [currentDate]);

    const monthBookings = useMemo(() => {
        const startDate = monthDays[0].date;
        const endDate = monthDays[monthDays.length - 1].date;
        endDate.setHours(23, 59, 59, 999);
        return expandRecurringBookings(bookings, startDate, endDate);
    }, [bookings, monthDays]);

    const handleDayClick = (date: Date) => {
        const defaultTime = new Date(date);
        defaultTime.setHours(9, 0, 0, 0); // Default to 9 AM
        // Since month view doesn't have specific resources, we can leave it empty or use the first one
        onSlotClick(defaultTime, ''); 
    };
    
    return (
        <div className="flex-1 flex flex-col overflow-auto">
             <div className="grid grid-cols-7 sticky top-0 bg-white dark:bg-background-dark z-10 shadow-sm">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center py-2 border-b border-r border-border-light dark:border-border-dark font-semibold text-sm text-text-light-primary dark:text-text-dark-primary">
                        {day}
                    </div>
                ))}
             </div>
             <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {monthDays.map(({ date, isCurrentMonth }) => {
                    const bookingsForDay = monthBookings.filter(b => new Date(b.startTime).toDateString() === date.toDateString());
                    const hasBookings = bookingsForDay.length > 0;
                    return (
                        <div key={date.toISOString()} 
                             onClick={() => handleDayClick(date)}
                             className={`relative p-1 border-b border-r border-border-light dark:border-border-dark group cursor-pointer flex flex-col ${!isCurrentMonth ? 'bg-gray-50 dark:bg-background-dark/50' : ''}`}>
                            <p className={`text-sm self-end ${new Date().toDateString() === date.toDateString() ? 'bg-primary-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold' : ''} ${!isCurrentMonth ? 'text-text-light-secondary/40 dark:text-text-dark-secondary/40' : 'text-text-light-primary dark:text-text-dark-primary'}`}>
                                {date.getDate()}
                            </p>
                            
                            <div className="flex-grow overflow-y-auto space-y-1 mt-1">
                                {bookingsForDay.slice(0, 2).map(b => (
                                    <div key={b.id} onClick={(e) => { e.stopPropagation(); onBookingClick(b, b.startTime); }}
                                         className={`p-1 rounded-sm text-xs cursor-pointer truncate bg-${b.color}-100 text-${b.color}-800 dark:bg-${b.color}-900/70 dark:text-${b.color}-200`}>
                                        {b.title}
                                    </div>
                                ))}
                                {bookingsForDay.length > 2 && (
                                    <div className="text-xs text-center text-text-light-secondary dark:text-text-dark-secondary pt-1">
                                        + {bookingsForDay.length - 2} more
                                    </div>
                                )}
                            </div>

                        </div>
                    )
                })}
             </div>
        </div>
    )
};

const CalendarGrid: React.FC<CalendarGridProps> = (props) => {
  switch (props.view) {
    case 'day': return <DayView {...props} />;
    case 'month': return <MonthView {...props} />;
    case 'list': return <ListView {...props} />;
    case 'week':
    default:
      return <WeekView {...props} />;
  }
};

export default CalendarGrid;
