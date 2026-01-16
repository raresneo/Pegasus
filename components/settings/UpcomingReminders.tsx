
import React, { useMemo, useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';
import { format, parseISO, isSameDay, addDays, startOfToday } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { generateNotificationUrls } from '../../lib/notifications';

const UpcomingReminders: React.FC = () => {
    const { bookings, members, notificationTemplates, messageLocalization, resources, locations } = useDatabase();
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

    const tomorrow = addDays(startOfToday(), 1);
    const locale = messageLocalization.language === 'ro' ? ro : enUS;

    const reminders = useMemo(() => {
        return bookings
            .filter(b => isSameDay(parseISO(b.startTime), tomorrow) && b.memberId && b.status === 'scheduled')
            .map(b => {
                const member = members.find(m => m.id === b.memberId);
                const resource = resources.find(r => r.id === b.resourceId);
                const location = locations.find(l => l.id === b.locationId);
                
                let urls = null;
                if (member) {
                    urls = generateNotificationUrls(member, b, notificationTemplates, messageLocalization, undefined, resource, location);
                }

                return {
                    booking: b,
                    member,
                    resource,
                    urls
                };
            })
            .filter(r => r.member !== undefined);
    }, [bookings, tomorrow, members, notificationTemplates, messageLocalization, resources, locations]);

    const handleMarkAsNotified = (id: string) => {
        setNotifiedIds(prev => new Set([...Array.from(prev), id]));
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Generator Remindere Automate</h2>
                    <p className="text-sm text-text-dark-secondary mt-1">Ședințe programate pentru mâine: <span className="text-primary-500 font-bold">{format(tomorrow, 'eeee, dd MMMM', { locale })}</span></p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                        <Icons.CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{notifiedIds.size} Notificați</span>
                    </div>
                </div>
            </header>

            {reminders.length === 0 ? (
                <div className="py-20 text-center bg-card-dark rounded-[2.5rem] border-2 border-dashed border-white/5 opacity-30 flex flex-col items-center">
                    <Icons.CalendarIcon className="w-16 h-16 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Nicio ședință programată pentru mâine.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reminders.map(({ booking, member, urls }) => {
                        const isNotified = notifiedIds.has(booking.id);
                        return (
                            <div key={booking.id} className={`bg-white dark:bg-card-dark p-6 rounded-3xl border transition-all ${isNotified ? 'border-green-500/30 opacity-60' : 'border-white/5 hover:border-primary-500/30'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center font-black text-primary-500 text-xl border border-primary-500/20">
                                            {member?.avatar}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-lg uppercase tracking-tight truncate">{member?.firstName} {member?.lastName}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-text-dark-secondary">
                                                <span className="flex items-center gap-1.5"><Icons.ClockIcon className="w-3.5 h-3.5 text-primary-500" /> {format(parseISO(booking.startTime), 'HH:mm')}</span>
                                                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                                <span className="truncate">{booking.title}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {urls && (
                                            <>
                                                <a 
                                                    href={urls.email.reminder} 
                                                    onClick={() => handleMarkAsNotified(booking.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                                                >
                                                    <Icons.MailIcon className="w-4 h-4" /> Email
                                                </a>
                                                <a 
                                                    href={urls.sms.reminder} 
                                                    onClick={() => handleMarkAsNotified(booking.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                                                >
                                                    <Icons.ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> SMS
                                                </a>
                                                <a 
                                                    href={urls.whatsapp.reminder} 
                                                    onClick={() => handleMarkAsNotified(booking.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-600/20"
                                                >
                                                    <Icons.WhatsAppIcon className="w-4 h-4" /> WhatsApp
                                                </a>
                                            </>
                                        )}
                                        {isNotified && (
                                            <div className="p-3 bg-green-500 text-black rounded-xl animate-scaleIn">
                                                <Icons.CheckIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="p-8 bg-primary-500/5 rounded-[2.5rem] border border-primary-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary-500 text-black rounded-2xl flex items-center justify-center shadow-lg">
                        <Icons.SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-tight">Automatizare MyBrain™</h4>
                        <p className="text-xs text-text-dark-secondary font-medium">Platforma poate trimite automat aceste remindere la ora 18:00 în ziua anterioară.</p>
                    </div>
                 </div>
                 <button className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-500 transition-all">Activare Pilot Automat</button>
            </div>
        </div>
    );
};

export default UpcomingReminders;
