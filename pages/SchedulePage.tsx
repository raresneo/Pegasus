
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useBookings } from '../hooks/useBookings';
import { Booking, Member, AbsenceReason } from '../types';
import * as Icons from '../components/icons';
import { add, sub, startOfToday } from 'date-fns';
import { useCopilot } from '../context/CopilotContext';
import { Type } from '@google/genai';
import ResourceFilter from '../components/ResourceFilter';
import ScheduleSidebar from '../components/ScheduleSidebar';
import CalendarGrid, { ViewType } from '../components/CalendarGrid';
import BookingDrawer from '../components/BookingDrawer';
import RecurringEditModal from '../components/RecurringEditModal';
import PublicBookingForm from '../components/PublicBookingForm';
import { generateIcsContent } from '../lib/ical';
import BookingContextMenu from '../components/BookingContextMenu';
import { useNotifications } from '../context/NotificationContext';

export type EditScope = 'one' | 'future' | 'all';

interface SchedulePageProps {
    navigationContext?: any;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ navigationContext }) => {
    const { resources, members, absenceReasons, addCommunication } = useDatabase();
    const { bookings, addBooking, updateBooking, deleteBooking, refresh } = useBookings({ autoFetch: true });
    const { registerActions, unregisterActions } = useCopilot();
    const { notify } = useNotifications();

    const [currentDate, setCurrentDate] = useState(startOfToday());
    const [view, setView] = useState<ViewType>('week');
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(resources.map(r => r.id));
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedInstanceDate, setSelectedInstanceDate] = useState<string | null>(null);
    const [slotData, setSlotData] = useState<{ startTime: Date, resourceId: string } | null>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [recurringAction, setRecurringAction] = useState<'save' | 'delete'>('save');
    const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);

    const [isPublicBookingOpen, setIsPublicBookingOpen] = useState(false);
    const [publicSlotData, setPublicSlotData] = useState<{ startTime: Date, resourceId: string } | null>(null);

    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(navigationContext?.memberId || null);

    const [isResourceFilterOpen, setResourceFilterOpen] = useState(false);
    const [isScheduleSidebarOpen, setScheduleSidebarOpen] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, booking: Booking } | null>(null);

    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth < 768) {
                setView('list');
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const visibleResources = useMemo(() => resources.filter(r => selectedResourceIds.includes(r.id)), [resources, selectedResourceIds]);

    const filteredBookings = useMemo(() => {
        if (!selectedMemberId) return bookings;
        return bookings.filter(b => b.memberId === selectedMemberId);
    }, [bookings, selectedMemberId]);

    const highlightedDates = useMemo(() => {
        const dates = new Set<string>();
        filteredBookings.forEach(b => {
            dates.add(b.startTime.split('T')[0]);
        });
        return Array.from(dates);
    }, [filteredBookings]);

    const handleBookingClick = (booking: Booking, instanceDate: string) => {
        const originalBooking = bookings.find(b => b.id === booking.id.split('_')[0]) || booking;
        setSelectedBooking(originalBooking);
        setSelectedInstanceDate(instanceDate);
        setSlotData(null);
        setIsDrawerOpen(true);
    };

    const handleSlotClick = (startTime: Date, resourceId: string) => {
        setSelectedBooking(null);
        setSelectedInstanceDate(null);
        setSlotData({ startTime, resourceId });
        setIsDrawerOpen(true);
    };

    const handleContextMenu = (event: React.MouseEvent, booking: Booking) => {
        event.preventDefault();
        setContextMenu({ x: event.pageX, y: event.pageY, booking });
    };

    const handleContextAction = (action: 'edit' | 'delete' | 'attended' | 'scheduled' | 'no-show' | 'cancelled', payload?: any) => {
        if (!contextMenu) return;
        const { booking } = contextMenu;

        switch (action) {
            case 'attended':
            case 'scheduled':
            case 'cancelled':
                updateBooking({ ...booking, status: action }, 'one');
                break;
            case 'no-show':
                const reason = payload as AbsenceReason;
                updateBooking({ ...booking, status: 'no-show' }, 'one');
                if (booking.memberId) {
                    addCommunication(booking.memberId, {
                        type: 'absence',
                        subject: `No-Show: ${reason.name}`,
                        notes: `Membru absent la "${booking.title}". Motiv: ${reason.description}`
                    });
                }
                break;
            case 'edit':
                handleBookingClick(booking, booking.startTime);
                break;
            case 'delete':
                handleDelete(booking);
                break;
        }
        setContextMenu(null);
    };

    const handleSave = async (booking: Booking) => {
        const originalBooking = bookings.find(b => b.id === (booking.seriesId || booking.id));

        try {
            if (originalBooking?.recurrence && (booking.id !== originalBooking.id || booking.isException)) {
                setBookingToEdit(booking);
                setRecurringAction('save');
                setIsRecurringModalOpen(true);
            } else {
                if (bookings.some(b => b.id === booking.id)) {
                    await updateBooking(booking.id, booking);
                } else {
                    await addBooking(booking);
                }
                notify("Programare salvată cu succes!", "success");
            }
        } catch (err: any) {
            if (err.message?.includes('conflict') || err.message?.includes('409')) {
                notify("Conflict de programare! Resursa este deja ocupată în acest interval.", "error");
            } else {
                notify("Eroare la salvarea programării.", "error");
            }
        }
    };

    const handleDelete = async (booking: Booking) => {
        const originalBooking = bookings.find(b => b.id === (booking.seriesId || booking.id.split('_')[0]));
        if (originalBooking?.recurrence) {
            setBookingToEdit(booking);
            setRecurringAction('delete');
            setIsRecurringModalOpen(true);
        } else if (originalBooking) {
            try {
                await deleteBooking(originalBooking.id);
                notify("Sesiune ștearsă.", "info");
            } catch (error) {
                notify("Eroare la ștergere.", "error");
            }
        }
    };

    const handleRecurringConfirm = async (scope: EditScope) => {
        if (bookingToEdit) {
            try {
                if (recurringAction === 'save') {
                    await updateBooking(bookingToEdit, scope);
                    notify("Seria de programări a fost actualizată.", "success");
                } else {
                    await deleteBooking(bookingToEdit, scope);
                    notify("Seria a fost eliminată.", "info");
                }
            } catch (e) {
                notify("A apărut o eroare la salvarea seriei.", "error");
            }
        }
        setIsRecurringModalOpen(false);
        setBookingToEdit(null);
    };

    const handleBookingDrop = async (bookingId: string, newStartTime: Date, newResourceId: string) => {
        const originalBookingId = bookingId.split('_')[0];
        const booking = bookings.find(b => b.id === originalBookingId);
        if (booking) {
            const duration = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();
            const newEndTime = new Date(newStartTime.getTime() + duration);

            const updatedBooking: Booking = {
                ...booking,
                startTime: newStartTime.toISOString(),
                endTime: newEndTime.toISOString(),
                resourceId: newResourceId,
            };

            if (booking.recurrence) {
                updatedBooking.isException = true;
                updatedBooking.id = bookingId;
                handleSave(updatedBooking);
            } else {
                try {
                    await updateBooking(booking.id, updatedBooking);
                } catch (err: any) {
                    notify("Mutare imposibilă: conflict de resurse.", "error");
                }
            }
        }
    };

    const handleShareSlot = (startTime: Date, resourceId: string) => {
        setPublicSlotData({ startTime, resourceId });
        setIsPublicBookingOpen(true);
    };

    const handlePublicBookingSubmit = (formData: { name: string; email: string; phone: string }) => {
        console.log("Cerere rezervare publică:", formData, publicSlotData);
    };

    const handleSyncCalendar = () => {
        const icsContent = generateIcsContent(bookings, members, resources);
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agenda_fitable.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const createBookingAction = {
            functionDeclaration: {
                name: 'createBooking',
                description: 'Creează o programare nouă pentru un membru cu o resursă.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        member_name: { type: Type.STRING, description: 'Numele membrului.' },
                        resource_name: { type: Type.STRING, description: 'Numele resursei (ex: "Studio Yoga", "Antrenor Bob").' },
                        start_time: { type: Type.STRING, description: 'Data și ora de start în format ISO 8601.' },
                        duration_minutes: { type: Type.NUMBER, description: 'Durata în minute.' },
                        title: { type: Type.STRING, description: 'Titlul programării.' }
                    },
                    required: ['member_name', 'resource_name', 'start_time', 'duration_minutes', 'title'],
                },
            },
            handler: async (args: any) => {
                const member = members.find(m => `${m.firstName} ${m.lastName}`.toLowerCase() === args.member_name.toLowerCase());
                const resource = resources.find(r => r.name.toLowerCase() === args.resource_name.toLowerCase());
                if (!member || !resource) {
                    return { message: `Nu am găsit membrul "${args.member_name}" sau resursa "${args.resource_name}".` };
                }
                const startTime = new Date(args.start_time);
                const endTime = add(startTime, { minutes: args.duration_minutes });

                const newBooking: Booking = {
                    id: `b_${Date.now()}`,
                    locationId: resource.locationId,
                    title: args.title,
                    resourceId: resource.id,
                    memberId: member.id,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    color: 'blue',
                    status: 'scheduled'
                };
                const success = addBooking(newBooking);
                if (!success) return { message: `Eroare: Resursa "${resource.name}" este deja ocupată în acest interval.` };
                return { message: `Am programat "${args.title}" pentru ${member.firstName} cu ${resource.name}.` };
            },
        };

        const findBookingsAction = {
            functionDeclaration: {
                name: 'findBookings',
                description: 'Găsește programările existente pentru un membru, resursă sau zi.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        member_name: { type: Type.STRING, description: 'Numele membrului.' },
                        date: { type: Type.STRING, description: 'Data căutată (YYYY-MM-DD).' },
                    },
                },
            },
            handler: async (args: any) => {
                let foundBookings: Booking[] = [];
                const searchDate = args.date ? new Date(args.date) : new Date();

                if (args.member_name) {
                    const member = members.find(m => `${m.firstName} ${m.lastName}`.toLowerCase() === args.member_name.toLowerCase());
                    if (member) {
                        foundBookings = bookings.filter(b => b.memberId === member.id && b.startTime.startsWith(searchDate.toISOString().split('T')[0]));
                    }
                }
                if (foundBookings.length > 0) {
                    return {
                        message: `Am găsit ${foundBookings.length} programări pentru ${args.member_name} pe ${searchDate.toLocaleDateString()}:`,
                        data: foundBookings.map(b => `${b.title} la ora ${new Date(b.startTime).toLocaleTimeString()}`)
                    };
                }
                return { message: `Nu am găsit nicio programare pentru ${args.member_name} în acea zi.` };
            }
        };

        registerActions([createBookingAction, findBookingsAction]);
        return () => unregisterActions();
    }, [registerActions, unregisterActions, members, resources, addBooking, bookings]);


    const handleDateChange = (date: Date) => {
        setCurrentDate(date);
    };

    const handleToday = () => setCurrentDate(startOfToday());
    const handlePrev = () => setCurrentDate(prev => view === 'month' ? sub(prev, { months: 1 }) : sub(prev, { days: view === 'day' ? 1 : 7 }));
    const handleNext = () => setCurrentDate(prev => view === 'month' ? add(prev, { months: 1 }) : add(prev, { days: view === 'day' ? 1 : 7 }));

    return (
        <div className="flex h-full -m-4 sm:-m-6 md:-m-8" onContextMenu={(e) => e.preventDefault()}>
            <ResourceFilter
                resources={resources}
                selectedResourceIds={selectedResourceIds}
                onFilterChange={setSelectedResourceIds}
                isOpen={isResourceFilterOpen}
                onClose={() => setResourceFilterOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 p-4 border-b border-border-dark flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center rounded-md border border-border-dark bg-card-dark">
                            <button onClick={handlePrev} className="p-2 border-r border-border-dark hover:bg-white/5 active:bg-white/10 transition-colors"><Icons.ChevronLeftIcon className="w-5 h-5" /></button>
                            <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold hover:bg-white/5 active:bg-white/10 transition-colors">Azi</button>
                            <button onClick={handleNext} className="p-2 border-l border-border-dark hover:bg-white/5 active:bg-white/10 transition-colors"><Icons.ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold capitalize text-primary-500">{currentDate.toLocaleString('ro-RO', { month: 'long', year: 'numeric' })}</h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between sm:justify-end">
                        {/* Mobile: Sidebar Toggle */}
                        <button onClick={() => setScheduleSidebarOpen(true)} className="md:hidden p-2 rounded-md bg-card-dark border border-border-dark hover:bg-white/5 text-text-secondary"><Icons.CalendarIcon className="w-5 h-5" /></button>

                        <div className="flex items-center gap-2">
                            {/* Desktop: Print */}
                            <button onClick={() => window.print()} className="hidden sm:block p-2 rounded-md bg-card-dark border border-border-dark hover:bg-white/5 text-text-secondary no-print"><Icons.PrinterIcon className="w-5 h-5" /></button>

                            {/* Mobile Filters Trigger */}
                            <button onClick={() => setResourceFilterOpen(true)} className="md:hidden p-2 rounded-md bg-card-dark border border-border-dark hover:bg-white/5 text-text-secondary"><Icons.AdjustmentsIcon className="w-5 h-5" /></button>

                            {/* View Switcher */}
                            <div className="flex items-center bg-background-dark rounded-md p-1 border border-border-dark overflow-x-auto max-w-full">
                                {(['day', 'week', 'month', 'list'] as ViewType[]).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`px-3 py-1 text-sm font-semibold rounded capitalize transition-all whitespace-nowrap ${view === v ? 'bg-primary-500 text-black shadow-lg' : 'text-text-secondary hover:text-white'}`}
                                    >
                                        {v === 'list' ? 'Agendă' : v === 'week' ? 'Săpt' : v === 'month' ? 'Lună' : 'Zi'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 relative printable-area">
                    <CalendarGrid
                        currentDate={currentDate}
                        bookings={filteredBookings}
                        resources={visibleResources}
                        members={members}
                        onBookingClick={handleBookingClick}
                        onBookingDrop={handleBookingDrop}
                        onShareSlot={handleShareSlot}
                        onSlotClick={handleSlotClick}
                        view={view}
                        onContextMenu={handleContextMenu}
                        absenceReasons={absenceReasons}
                    />
                </div>
            </div>
            <ScheduleSidebar
                currentDate={currentDate}
                onDateChange={handleDateChange}
                onSyncCalendar={handleSyncCalendar}
                members={members}
                onMemberSelect={setSelectedMemberId}
                selectedMemberId={selectedMemberId}
                highlightedDates={highlightedDates}
                isOpen={isScheduleSidebarOpen}
                onClose={() => setScheduleSidebarOpen(false)}
                visibleBookings={filteredBookings}
                visibleResources={visibleResources}
            />
            <BookingDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                resources={resources}
                members={members}
                selectedBooking={selectedBooking}
                selectedInstanceDate={selectedInstanceDate}
                slotData={slotData}
            />
            <RecurringEditModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                onConfirm={handleRecurringConfirm}
                action={recurringAction}
            />
            <PublicBookingForm
                isOpen={isPublicBookingOpen}
                onClose={() => setIsPublicBookingOpen(false)}
                onSubmit={handlePublicBookingSubmit}
                slotData={publicSlotData}
                resources={resources}
            />
            {contextMenu && (
                <BookingContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    booking={contextMenu.booking}
                    onClose={() => setContextMenu(null)}
                    onAction={handleContextAction}
                    absenceReasons={absenceReasons}
                />
            )}
        </div>
    );
};

export default SchedulePage;
