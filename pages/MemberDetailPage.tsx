
import React, { useState, useMemo } from 'react';
import { Member, MenuItem } from '../types';
import * as Icons from '../components/icons';
import MemberDetailSidebar from '../components/member-detail/MemberDetailSidebar';
import DetailsTab from '../components/member-detail/DetailsTab';
import MembershipTab from '../components/member-detail/MembershipTab';
import BillingTab from '../components/member-detail/BillingTab';
import BookingsTab from '../components/member-detail/BookingsTab';
import CommunicationTab from '../components/member-detail/CommunicationTab';
import TrainingTab from '../components/member-detail/TrainingTab';
import VisitHistoryModal from '../components/member-detail/VisitHistoryModal';
import PurchaseModal from '../components/member-detail/PurchaseModal';
import { useDatabase } from '../context/DatabaseContext';

interface MemberDetailPageProps {
    member: Member;
    onBack: () => void;
    onNavigate: (item: MenuItem, context?: any) => void;
    scheduleMenuItem?: MenuItem;
}

type Tab = 'details' | 'membership' | 'billing' | 'communication' | 'bookings' | 'training';

const getStatusChip = (status: Member['membership']['status']) => {
    const statusInfo = {
        active: { text: 'Contract Activ', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
        frozen: { text: 'Suspendat', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        cancelled: { text: 'Anulat', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        expired: { text: 'Expirat', color: 'bg-white/5 text-white/40 border-white/10' },
    };
    const { text, color } = statusInfo[status] || statusInfo.expired;
    return (
        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border ${color} shadow-inner`}>
            {text}
        </span>
    );
};

const MemberDetailPage: React.FC<MemberDetailPageProps> = ({ member, onBack, onNavigate, scheduleMenuItem }) => {
    const { members, updateMember, addCheckIn } = useDatabase();
    const currentMember = members.find(m => m.id === member.id) || member;

    const [activeTab, setActiveTab] = useState<Tab>('details');
    const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
    const [isVisitHistoryOpen, setIsVisitHistoryOpen] = useState(false);
    const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
    
    const tabs: {id: Tab, label: string, icon: any}[] = [
        { id: 'details', label: 'Identitate Profil', icon: Icons.UserCircleIcon },
        { id: 'membership', label: 'Plan de Acces', icon: Icons.TicketIcon },
        { id: 'billing', label: 'Situație Financiară', icon: Icons.CurrencyDollarIcon },
        { id: 'communication', label: 'Log Comunicare', icon: Icons.ChatAltIcon },
        { id: 'bookings', label: 'Agenda Sesiuni', icon: Icons.CalendarIcon },
        { id: 'training', label: 'Fișă Antrenament', icon: Icons.FireIcon },
    ];

    const profileCompleteness = useMemo(() => {
        const fields = [
            currentMember.phone,
            currentMember.dob,
            currentMember.gender,
            currentMember.occupation,
            currentMember.organization,
            currentMember.emergencyContact?.name,
            currentMember.emergencyContact?.cell,
        ];
        const filledCount = fields.filter(Boolean).length;
        return (filledCount / fields.length) * 100;
    }, [currentMember]);

    const handleCheckIn = () => {
        addCheckIn(currentMember.id);
        setShowCheckInSuccess(true);
        setTimeout(() => setShowCheckInSuccess(false), 3000);
    };

    const handleNavigateToBooking = () => {
        if (scheduleMenuItem) {
            onNavigate(scheduleMenuItem, { memberId: currentMember.id });
        }
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'details': return <DetailsTab member={currentMember} onSave={updateMember} />;
            case 'membership': return <MembershipTab member={currentMember} />;
            case 'billing': return <BillingTab member={currentMember} />;
            case 'bookings': return <BookingsTab member={currentMember} onNavigateToBooking={handleNavigateToBooking}/>;
            case 'communication': return <CommunicationTab member={currentMember} />;
            case 'training': return <TrainingTab member={currentMember} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12 pb-32 animate-fadeIn">
            <VisitHistoryModal 
                isOpen={isVisitHistoryOpen}
                onClose={() => setIsVisitHistoryOpen(false)}
                member={currentMember}
            />
            <PurchaseModal
                isOpen={isPurchaseOpen}
                onClose={() => setIsPurchaseOpen(false)}
                member={currentMember}
            />

            {/* Side Persona Panel */}
            <div className="lg:w-1/4 xl:w-80 flex-shrink-0">
                <MemberDetailSidebar 
                    member={currentMember} 
                    onBack={onBack}
                    onCheckIn={handleCheckIn}
                    onShowVisitHistory={() => setIsVisitHistoryOpen(true)}
                    onNavigateToBooking={handleNavigateToBooking}
                    onShowPurchase={() => setIsPurchaseOpen(true)}
                    profileCompleteness={profileCompleteness}
                />
            </div>

            {/* Content Hub */}
            <div className="flex-1 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                    <div>
                        <div className="flex items-center gap-5 mb-4">
                            <h1 className="text-5xl font-black tracking-tighter uppercase text-white italic leading-none">{currentMember.firstName} {currentMember.lastName}</h1>
                            {getStatusChip(currentMember.membership.status)}
                        </div>
                        <p className="text-white/40 font-bold text-lg tracking-tight flex items-center gap-3">
                             Dosar Inteligence <span className="w-1 h-1 bg-white/20 rounded-full" /> Membru din {new Date(currentMember.joinDate).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    {showCheckInSuccess && (
                        <div className="bg-green-500/10 text-green-400 border border-green-500/30 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest animate-fade-in-up">
                            Check-in validat cu succes
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-3xl border border-white/10 w-fit max-w-full overflow-x-auto no-scrollbar shadow-inner backdrop-blur-md">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 py-3.5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'text-primary-500/60'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="min-h-[500px]">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default MemberDetailPage;
