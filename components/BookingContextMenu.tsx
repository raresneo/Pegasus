
import React, { useRef, useState, useMemo } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { AbsenceReason, Booking } from '../types';
import * as Icons from './icons';
import { useDatabase } from '../context/DatabaseContext';
import { generateNotificationUrls } from '../lib/notifications';

interface ContextMenuProps {
    x: number;
    y: number;
    booking: Booking;
    onClose: () => void;
    onAction: (action: 'edit' | 'delete' | 'attended' | 'scheduled' | 'no-show' | 'cancelled', payload?: any) => void;
    absenceReasons: AbsenceReason[];
}

const BookingContextMenu: React.FC<ContextMenuProps> = ({ x, y, booking, onClose, onAction, absenceReasons }) => {
    const { members, notificationTemplates, messageLocalization, resources, locations } = useDatabase();
    const menuRef = useRef(null);
    useClickOutside(menuRef, onClose);

    const [showAbsenceSubmenu, setShowAbsenceSubmenu] = useState(false);
    const [showReminderSubmenu, setShowReminderSubmenu] = useState(false);

    const menuStyle: React.CSSProperties = { 
        position: 'fixed',
        top: y, 
        left: x 
    };

    const handleNoShow = (reason: AbsenceReason) => {
        onAction('no-show', reason);
        onClose();
    };

    const member = useMemo(() => members.find(m => m.id === booking.memberId), [members, booking.memberId]);
    const resource = useMemo(() => resources.find(r => r.id === booking.resourceId), [resources, booking.resourceId]);
    const location = useMemo(() => locations.find(l => l.id === booking.locationId), [locations, booking.locationId]);
    
    const notificationUrls = useMemo(() => {
        if (!member) return null;
        return generateNotificationUrls(member, booking, notificationTemplates, messageLocalization, undefined, resource, location);
    }, [member, booking, notificationTemplates, messageLocalization, resource, location]);

    const isPastBooking = new Date(booking.startTime) < new Date();

    return (
        <div ref={menuRef} style={menuStyle} className="absolute z-50 w-64 bg-card-dark rounded-md shadow-lg border border-border-dark p-1 text-sm animate-fadeIn">
            {!showAbsenceSubmenu && !showReminderSubmenu ? (
                <ul>
                    {isPastBooking && booking.status === 'scheduled' && (
                        <li onClick={() => onAction('attended')} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer text-green-400 font-bold"><Icons.CheckCircleIcon className="w-4 h-4"/> Marcare Prezent</li>
                    )}
                    
                    {notificationUrls && (
                         <li onMouseEnter={() => setShowReminderSubmenu(true)} className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer text-primary-400">
                            <span className="flex items-center gap-3"><Icons.BullhornIcon className="w-4 h-4"/> Notificare / Reminder</span>
                            <Icons.ChevronRightIcon className="w-4 h-4"/>
                        </li>
                    )}

                    {(booking.status === 'attended' || booking.status === 'no-show') && (
                        <li onClick={() => onAction('scheduled')} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer"><Icons.CalendarIcon className="w-4 h-4"/> Reset to Scheduled</li>
                    )}
                    {isPastBooking && booking.status === 'scheduled' && (
                        <li onMouseEnter={() => setShowAbsenceSubmenu(true)} className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer">
                            <span className="flex items-center gap-3"><Icons.XCircleIcon className="w-4 h-4 text-red-500"/> Mark as No-Show</span>
                            <Icons.ChevronRightIcon className="w-4 h-4"/>
                        </li>
                    )}
                    <div className="my-1 h-px bg-border-dark" />
                    <li onClick={() => onAction('edit')} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer"><Icons.PencilIcon className="w-4 h-4"/> Editează Programarea</li>
                    <li onClick={() => onAction('delete')} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer text-red-400 font-bold"><Icons.TrashIcon className="w-4 h-4"/> Șterge Sesiunea</li>
                </ul>
            ) : showAbsenceSubmenu ? (
                 <ul onMouseLeave={() => setShowAbsenceSubmenu(false)}>
                    <li onClick={() => setShowAbsenceSubmenu(false)} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer text-text-dark-secondary"><Icons.ChevronLeftIcon className="w-4 h-4"/> Back</li>
                    <div className="my-1 h-px bg-border-dark" />
                    {absenceReasons.map(reason => (
                        <li key={reason.id} onClick={() => handleNoShow(reason)} className="px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer">{reason.name}</li>
                    ))}
                </ul>
            ) : (
                <ul className="max-h-[80vh] overflow-y-auto" onMouseLeave={() => setShowReminderSubmenu(false)}>
                    <li onClick={() => setShowReminderSubmenu(false)} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-border-dark cursor-pointer text-text-dark-secondary"><Icons.ChevronLeftIcon className="w-4 h-4"/> Back</li>
                    <div className="my-1 h-px bg-border-dark" />
                    
                    <div className="px-3 py-1 text-[10px] uppercase font-black tracking-widest text-text-dark-secondary opacity-50">WhatsApp</div>
                    {notificationTemplates.filter(t => t.channel === 'whatsapp').map(t => (
                        <a key={t.id} href={generateNotificationUrls(member!, booking, [t], messageLocalization, undefined, resource, location).whatsapp[t.type]} target="_blank" className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-green-500/10 text-green-500 cursor-pointer">
                            <Icons.WhatsAppIcon className="w-4 h-4"/> {t.name}
                        </a>
                    ))}

                    <div className="my-1 h-px bg-border-dark" />
                    <div className="px-3 py-1 text-[10px] uppercase font-black tracking-widest text-text-dark-secondary opacity-50">SMS</div>
                    {notificationTemplates.filter(t => t.channel === 'sms').map(t => (
                        <a key={t.id} href={generateNotificationUrls(member!, booking, [t], messageLocalization, undefined, resource, location).sms[t.type]} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-blue-500/10 text-blue-400 cursor-pointer">
                            <Icons.ChatBubbleLeftEllipsisIcon className="w-4 h-4"/> {t.name}
                        </a>
                    ))}

                    <div className="my-1 h-px bg-border-dark" />
                    <div className="px-3 py-1 text-[10px] uppercase font-black tracking-widest text-text-dark-secondary opacity-50">Email</div>
                    {notificationTemplates.filter(t => t.channel === 'email').map(t => (
                        <a key={t.id} href={generateNotificationUrls(member!, booking, [t], messageLocalization, undefined, resource, location).email[t.type]} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-indigo-500/10 text-indigo-300 cursor-pointer">
                            <Icons.MailIcon className="w-4 h-4"/> {t.name}
                        </a>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BookingContextMenu;
