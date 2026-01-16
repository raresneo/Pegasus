
import React, { useState, useEffect, useMemo } from 'react';
import { Member } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { generateNotificationUrls } from '../../lib/notifications';

interface MemberDetailSidebarProps {
    member: Member;
    onBack: () => void;
    onCheckIn: () => void;
    onShowVisitHistory: () => void;
    onNavigateToBooking: () => void;
    onShowPurchase: () => void;
    profileCompleteness: number;
}

const MemberDetailSidebar: React.FC<MemberDetailSidebarProps> = ({ member, onBack, onCheckIn, onShowVisitHistory, onNavigateToBooking, onShowPurchase, profileCompleteness }) => {
    const { updateMemberNotes, messageLocalization, locations, currentLocationId } = useDatabase();
    const { user } = useAuth();
    const [notes, setNotes] = useState(member.notes || '');
    const [isNotesDirty, setIsNotesDirty] = useState(false);
    const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

    const location = locations.find(l => l.id === currentLocationId) || locations[0];
    
    // Obținem link-ul WhatsApp optimizat
    const directLinks = useMemo(() => {
        return generateNotificationUrls(member, undefined, [], messageLocalization, undefined, undefined, location);
    }, [member, messageLocalization, location]);

    useEffect(() => {
        setNotes(member.notes || '');
        setIsNotesDirty(false);
    }, [member]);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        setIsNotesDirty(true);
    };

    const handleSaveNotes = () => {
        updateMemberNotes(member.id, notes);
        setIsNotesDirty(false);
    };

    const handleCopyLink = () => {
        const link = `fitable.app/members/${member.id}`;
        navigator.clipboard.writeText(link);
        setShowCopyConfirmation(true);
        setTimeout(() => setShowCopyConfirmation(false), 2000);
    };

    const openWhatsApp = () => {
        window.open(directLinks.whatsapp.direct, '_blank');
    };

    const actionItems = [
        { id: 'whatsapp', label: 'WhatsApp', icon: 'WhatsAppIcon', handler: openWhatsApp, activeColor: 'text-green-500' },
        { id: 'checkin', label: 'Check-in', icon: 'CheckCircleIcon', handler: onCheckIn },
        { id: 'history', label: 'Visit History', icon: 'ClipboardListIcon', handler: onShowVisitHistory },
        { id: 'booking', label: 'Booking', icon: 'CalendarIcon', handler: onNavigateToBooking },
        { id: 'purchase', label: 'Purchase', icon: 'ShoppingCartIcon', handler: onShowPurchase },
        { id: 'share', label: showCopyConfirmation ? 'Link Copied!' : 'Share', icon: 'ShareIcon', handler: handleCopyLink },
    ];
    
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm p-5 space-y-6">
            {user?.role !== 'member' && (
                <button onClick={onBack} className="flex items-center text-sm font-bold text-primary-500 hover:text-primary-600 mb-2 transition-colors">
                    <Icons.ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Back to All Members
                </button>
            )}
            <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-4xl mb-4 border-2 border-primary-500/20 shadow-inner">
                    {member.avatar}
                </div>
                <h2 className="text-xl font-black text-text-light-primary dark:text-text-dark-primary">{member.firstName} {member.lastName}</h2>
                <p className="text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary tracking-widest uppercase mt-1">ID: #{member.id}</p>
            </div>

             <div className="border-t border-border-light dark:border-border-dark pt-5">
                <h3 className="text-xs font-black text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest mb-2">Profile Progress</h3>
                <div className="w-full bg-gray-100 dark:bg-background-dark rounded-full h-2 overflow-hidden">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${profileCompleteness}%` }}></div>
                </div>
                <p className="text-[10px] font-black text-text-light-secondary dark:text-text-dark-secondary text-right mt-1.5">{Math.round(profileCompleteness)}% Complete</p>
            </div>

            <div>
                <h3 className="text-xs font-black text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest mb-3">Member Actions</h3>
                <ul className="space-y-1">
                    {actionItems.map(item => {
                        const Icon = Icons[item.icon as keyof typeof Icons] || Icons.DocumentTextIcon;
                        return (
                             <li key={item.id}>
                                <button onClick={item.handler} disabled={showCopyConfirmation} className={`flex w-full items-center p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-semibold transition-all ${item.activeColor || 'text-text-light-primary dark:text-text-dark-primary'}`}>
                                    <Icon className={`w-5 h-5 mr-3 ${item.activeColor ? '' : 'text-gray-400 dark:text-text-dark-secondary'}`} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>

             <div className="border-t border-border-light dark:border-border-dark pt-5">
                <h3 className="text-xs font-black text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest mb-3">Internal Notes</h3>
                <textarea
                    value={notes}
                    onChange={handleNotesChange}
                    rows={4}
                    placeholder="Add member notes..."
                    className="w-full p-3 bg-gray-50 dark:bg-background-dark rounded-xl text-sm border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                ></textarea>
                {isNotesDirty && (
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => { setNotes(member.notes || ''); setIsNotesDirty(false); }} className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                        <button onClick={handleSaveNotes} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-all">Save</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDetailSidebar;
