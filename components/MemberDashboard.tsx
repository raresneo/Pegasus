
import React, { useMemo, useState } from 'react';
import { Member, MenuItem } from '../types';
import * as Icons from './icons';
import { useDatabase } from '../context/DatabaseContext';
import { membershipTiers } from '../lib/data';
import { findMenuItemById } from '../lib/utils';
import { menuItems } from '../lib/menu';
import { parseISO, format, isFuture } from 'date-fns';
import FormModal from './FormModal';

interface MemberDashboardProps {
    member: Member;
    onNavigate: (item: MenuItem, context?: any) => void;
}

const DigitalCardModal: React.FC<{ isOpen: boolean; onClose: () => void; member: Member }> = ({ isOpen, onClose, member }) => {
    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Pegasus Digital Pass">
            <div className="flex flex-col items-center p-8 text-center animate-fadeIn">
                <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-black via-primary-900 to-primary-600 rounded-[2.5rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(212,175,55,0.3)] relative overflow-hidden mb-12 border border-white/10">
                    <div className="absolute top-[-40%] right-[-20%] w-80 h-80 bg-primary-500/20 rounded-full blur-[80px]"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between items-start text-left">
                        <div className="flex justify-between w-full items-start">
                             <div>
                                <h4 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Pegasus</h4>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mt-1">Elite Member Status</p>
                             </div>
                             <div className="w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl">
                                <Icons.LogoIcon className="w-9 h-9 text-primary-500" />
                             </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black uppercase tracking-tight">{member.firstName} {member.lastName}</p>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
                                <Icons.ShieldCheckIcon className="w-3 h-3" /> Membru din {format(parseISO(member.joinDate), 'MMMM yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-8 right-10 flex flex-col items-end">
                         <div className="p-3 bg-white rounded-2xl shadow-2xl">
                            {/* Simulated High-Density QR */}
                            <div className="w-14 h-14 grid grid-cols-4 gap-1 p-0.5">
                                {[...Array(16)].map((_,i) => <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`}></div>)}
                            </div>
                         </div>
                         <p className="text-[8px] font-black uppercase mt-2 tracking-widest text-white/40">Secured via MyBrain™</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[3rem] border-[8px] border-gray-50 mb-8 shadow-inner">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${member.id}`} alt="Member QR" width="180" height="180" />
                </div>
                
                <p className="text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary max-w-xs mx-auto leading-relaxed">Scanează codul la terminalul Pegasus pentru acces instant.</p>
                <button onClick={onClose} className="premium-btn mt-10 w-full py-5 bg-gray-100 dark:bg-card-dark rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all hover:bg-primary-500 hover:text-black">Închide Portalul</button>
            </div>
        </FormModal>
    );
};

const StatCard: React.FC<{ icon: React.FC<any>, label: string, value: string, color: string, subValue?: string }> = ({ icon: Icon, label, value, color, subValue }) => (
    <div className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-between gap-6 border border-white/5 relative overflow-hidden group">
        <div className={`absolute -top-6 -right-6 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700`}>
            <Icon className="w-32 h-32" />
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-light-secondary dark:text-text-dark-secondary opacity-40 mb-3">{label}</p>
            <p className={`text-4xl font-black tracking-tighter ${color}`}>{value}</p>
            {subValue && <p className="text-[11px] font-bold text-text-light-secondary dark:text-white/30 mt-2 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary-500" />{subValue}</p>}
        </div>
        <div className={`w-10 h-10 rounded-2xl ${color.replace('text', 'bg')}/10 border border-white/5 flex items-center justify-center shadow-lg`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
    </div>
);

const MemberDashboard: React.FC<MemberDashboardProps> = ({ member, onNavigate }) => {
    const { bookings } = useDatabase();
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    const upcomingBookings = useMemo(() => {
        return bookings
            .filter(b => b.memberId === member.id && isFuture(parseISO(b.startTime)))
            .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
            .slice(0, 5);
    }, [bookings, member.id]);

    const tier = membershipTiers.find(t => t.id === member.membership.tierId);
    
    const handleNavigation = (id: string) => {
        const item = findMenuItemById(menuItems, id);
        if (item) onNavigate(item);
    };

    return (
        <div className="space-y-12 pb-24 animate-fadeIn">
            <DigitalCardModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} member={member} />

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Salut, {member.firstName}!</h1>
                    <p className="text-white/40 mt-4 font-bold text-lg tracking-tight">Ești pregătit pentru sesiunea ta de <span className="text-primary-500">Performanță</span>?</p>
                </div>
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => setIsQrModalOpen(true)}
                        className="premium-btn bg-white dark:bg-card-dark text-black dark:text-white px-8 py-4 rounded-[1.5rem] border border-white/10 font-black flex items-center gap-3 shadow-2xl hover:scale-105"
                    >
                        <Icons.IdentificationIcon className="w-5 h-5 text-primary-500" /> Pass Digital
                    </button>
                    <div className="flex items-center gap-4 bg-primary-500/10 px-8 py-4 rounded-[1.5rem] border border-primary-500/20 shadow-inner">
                        <Icons.StarIcon className="w-7 h-7 text-yellow-500 fill-current animate-pulse" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary-400 opacity-60">Status Loialitate</p>
                            <p className="text-2xl font-black text-white">{member.loyalty?.points || 0} FITPTS</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Icons.TicketIcon} label="Plan curent" value={tier?.name || 'Fără Plan'} color="text-primary-500" subValue={`Expiră la ${format(parseISO(member.membership.endDate), 'dd MMM yyyy')}`} />
                <StatCard icon={Icons.FireIcon} label="Health Index" value={`${member.healthScore}%`} color={member.healthScore! > 70 ? 'text-green-500' : 'text-orange-500'} subValue="Scor vitalitate live" />
                <StatCard icon={Icons.GiftIcon} label="Rang Elite" value={member.loyalty?.tier || 'Bronze'} color="text-accent" subValue={`${250 - (member.loyalty?.points || 0)} pts până la Silver`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Icons.CalendarIcon className="w-48 h-48 text-white" /></div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3 text-primary-500">
                        <Icons.CalendarPlusIcon className="w-5 h-5" /> Agenda Viitoare
                    </h3>
                    {upcomingBookings.length > 0 ? (
                        <div className="space-y-5 relative z-10">
                            {upcomingBookings.map(b => (
                                <div key={b.id} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-3xl border border-white/5 group hover:border-primary-500/50 transition-all cursor-pointer">
                                    <div className="flex gap-6 items-center">
                                        <div className={`w-3 h-12 rounded-full bg-${b.color}-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}></div>
                                        <div>
                                            <p className="font-black text-lg text-white leading-tight uppercase tracking-tighter">{b.title}</p>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{format(parseISO(b.startTime), "EEEE, dd MMM 'la' HH:mm")}</p>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:text-black">
                                        <Icons.ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10 relative z-10">
                             <Icons.CalendarIcon className="w-16 h-16 text-white/10 mx-auto mb-5" />
                             <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Nicio programare activă</p>
                             <button onClick={() => handleNavigation('schedule')} className="premium-btn mt-6 text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-white transition-colors">Rezervă acum &rarr;</button>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Icons.GiftIcon className="w-64 h-64" /></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">Valorifică<br/>Punctele Tale</h3>
                        <p className="text-white/70 font-medium text-lg leading-relaxed max-w-sm">Ai acumulat suficiente puncte pentru recompense VIP. Alege dintr-o gamă variată de produse și reduceri.</p>
                    </div>
                    <div className="mt-12 flex gap-4 relative z-10">
                        <button onClick={() => handleNavigation('referrals')} className="premium-btn flex-1 bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95">Recomandă & Câștigă</button>
                        <button className="premium-btn flex-1 bg-black/40 border border-white/20 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-black/60 backdrop-blur-md">Catalog Premii</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
