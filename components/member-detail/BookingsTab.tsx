
import React, { useMemo } from 'react';
import { Member } from '../../types';
import { mockBookings, mockResources } from '../../lib/data';
import * as Icons from '../icons';
import { format, parseISO } from 'date-fns';

interface BookingsTabProps {
    member: Member;
    onNavigateToBooking: () => void;
}

const getStatusChip = (status: 'Showed' | 'No Show' | 'Cancelled no Charge' | 'Scheduled') => {
    const colors = {
        'Showed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'No Show': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Cancelled no Charge': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'Scheduled': 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
    };
    return <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-tight rounded-full ${colors[status] || colors.Scheduled}`}>{status}</span>;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ member, onNavigateToBooking }) => {
    const memberBookings = useMemo(() => {
        return mockBookings
            .filter(b => b.memberId === member.id)
            .map((b, i) => ({
                ...b,
                status: b.status === 'scheduled' ? 'Scheduled' : (i % 2 === 0 ? 'Showed' : 'No Show'),
                membershipUsed: 'Pro Access - Monthly',
                price: 'Used Pack'
            }))
            .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
    }, [member]);

    const resourceMap = useMemo(() => new Map(mockResources.map(r => [r.id, r])), []);

    return (
        <div className="space-y-8 animate-fadeIn">
            <section className="bg-white dark:bg-card-dark rounded-[2rem] border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark/30 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Programări & Istoric Sesiuni</h3>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Urmărește activitatea planificată a membrului.</p>
                    </div>
                     <div className="flex space-x-2">
                        <button className="flex items-center bg-white dark:bg-background-dark border border-border-light dark:border-border-dark px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                            <Icons.PrinterIcon className="w-4 h-4 mr-2" />
                            Print
                        </button>
                        <button onClick={onNavigateToBooking} className="flex items-center bg-primary-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95">
                            <Icons.PlusIcon className="w-4 h-4 mr-2" />
                            Programare Nouă
                        </button>
                    </div>
                </div>

                {memberBookings.length === 0 ? (
                    <div className="text-center py-20 text-text-dark-secondary opacity-30 flex flex-col items-center">
                        <Icons.CalendarIcon className="w-16 h-16 mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Nicio programare găsită pentru acest membru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] font-black uppercase tracking-widest text-text-dark-secondary bg-gray-50 dark:bg-background-dark/50">
                               <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Interval Orar</th>
                                    <th className="px-6 py-4">Resursă / Antrenor</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Abonament Folosit</th>
                                    <th className="px-6 py-4">Acțiuni</th>
                               </tr>
                            </thead>
                             <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {memberBookings.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-background-dark/30 transition-colors">
                                        <td className="px-6 py-4 font-bold">{format(parseISO(b.startTime), 'EEEE dd MMM yyyy')}</td>
                                        <td className="px-6 py-4 font-medium text-text-dark-secondary">{format(parseISO(b.startTime), 'HH:mm')} - {format(parseISO(b.endTime), 'HH:mm')}</td>
                                        <td className="px-6 py-4">{resourceMap.get(b.resourceId)?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{getStatusChip(b.status as any)}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-primary-500">{b.membershipUsed}</td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-primary-500/10 rounded-lg text-primary-500 transition-colors">
                                                <Icons.PencilIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default BookingsTab;
