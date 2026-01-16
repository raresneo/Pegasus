
import React, { useState, useMemo, useEffect } from 'react';
import { Member, Booking, ProgressPhoto, MemberReview } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import { useNotifications } from '../../context/NotificationContext';
import { format, parseISO, isFuture } from 'date-fns';
import { ro } from 'date-fns/locale';

interface MemberKioskViewProps {
    member: Member;
    onExit: () => void;
}

type KioskTab = 'home' | 'schedule' | 'progress' | 'feedback' | 'chat';

const MemberKioskView: React.FC<MemberKioskViewProps> = ({ member, onExit }) => {
    const { bookings, addBooking, addProgressPhoto, addMemberReview, addMessage, locations, currentLocationId, addCheckIn } = useDatabase();
    const currentLoc = useMemo(() => locations.find(l => l.id === currentLocationId) || locations[0], [locations, currentLocationId]);
    
    const { notify } = useNotifications();
    const [activeTab, setActiveTab] = useState<KioskTab>('home');
    const [reviewStars, setReviewStars] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [hasCheckedIn, setHasCheckedIn] = useState(false);

    // Auto-logout after inactivity
    useEffect(() => {
        const timer = setTimeout(onExit, 120000); // 2 minutes
        return () => clearTimeout(timer);
    }, [onExit, activeTab]);

    const upcomingBookings = useMemo(() => 
        bookings.filter(b => b.memberId === member.id && isFuture(parseISO(b.startTime)))
        .sort((a,b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
        .slice(0, 3)
    , [bookings, member.id]);

    const handleConfirmEntry = () => {
        addCheckIn(member.id, 'qr', currentLoc.id);
        setHasCheckedIn(true);
        notify("Check-in reușit! Antrenament plăcut.", "success");
    };

    const handleQuickBook = (title: string) => {
        const now = new Date();
        const startTime = new Date(now.getTime() + 15 * 60000); 
        const endTime = new Date(startTime.getTime() + 60 * 60000);

        addBooking({
            id: `kiosk_b_${Date.now()}`,
            locationId: currentLoc.id,
            title,
            resourceId: 'res1', 
            memberId: member.id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            color: 'blue',
            status: 'scheduled'
        });
        notify(`Te-ai programat la ${title}!`, 'success');
        setActiveTab('schedule');
    };

    const handleUploadPhoto = () => {
        addProgressPhoto(member.id, {
            url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop',
            weight: 78.5,
            notes: 'Sesiune kiosk recepție'
        });
        notify('Fotografie adăugată în jurnalul tău!', 'success');
    };

    const handleSubmitReview = () => {
        if (!reviewComment) return;
        addMemberReview({
            memberId: member.id,
            targetId: 'gym_001',
            stars: reviewStars,
            comment: reviewComment
        });
        setIsReviewSubmitted(true);
        setTimeout(() => {
            setIsReviewSubmitted(false);
            setReviewComment('');
            setReviewStars(5);
        }, 3000);
    };

    const handleSendHelpRequest = () => {
        if (!chatInput) return;
        addMessage({
            channelId: 'c1',
            content: `[KIOSK RECEPTIE - SOLICITARE AJUTOR]: ${chatInput}`,
            authorId: 'u3' 
        });
        setChatInput('');
        notify('Mesajul a fost trimis către recepție!', 'success');
    };

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col font-sans animate-fadeIn">
            <header className="h-24 bg-white/5 backdrop-blur-xl border-b border-white/10 px-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-primary-500/20">
                        {member.avatar}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase leading-none italic">{member.firstName} {member.lastName}</h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary-400 mt-1">Pegasus Member Hub • v1.8</p>
                    </div>
                </div>
                <button onClick={onExit} className="bg-red-500 hover:bg-red-600 px-10 py-4 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-500/30 transition-all active:scale-95">
                    Finalizează Sesiunea
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <nav className="w-40 border-r border-white/5 flex flex-col py-12 gap-8 bg-black/30">
                    {[
                        { id: 'home', icon: Icons.HomeIcon, label: 'Acasă' },
                        { id: 'schedule', icon: Icons.CalendarIcon, label: 'Agenda' },
                        { id: 'progress', icon: Icons.ChartBarIcon, label: 'Progres' },
                        { id: 'feedback', icon: Icons.StarIcon, label: 'Feedback' },
                        { id: 'chat', icon: Icons.ChatBubbleLeftEllipsisIcon, label: 'Ajutor' },
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as KioskTab)}
                            className={`flex flex-col items-center gap-3 transition-all ${activeTab === tab.id ? 'text-primary-500 scale-110' : 'text-white/30 hover:text-white hover:scale-105'}`}
                        >
                            <tab.icon className="w-10 h-10" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <main className="flex-1 overflow-y-auto p-16 bg-gradient-to-br from-background-dark via-black/40 to-background-dark relative">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                         <Icons.LogoIcon className="w-96 h-96" />
                    </div>

                    {activeTab === 'home' && (
                        <div className="space-y-16 animate-fadeInUp max-w-5xl mx-auto">
                            {!hasCheckedIn ? (
                                <button 
                                    onClick={handleConfirmEntry}
                                    className="w-full py-16 bg-primary-500 hover:bg-primary-600 text-black rounded-[4rem] shadow-[0_30px_70px_rgba(212,175,55,0.4)] transition-all animate-pulse group overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 gold-shimmer opacity-40"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <Icons.CheckCircleIcon className="w-20 h-20 mb-6" />
                                        <span className="text-4xl font-black uppercase tracking-[0.2em]">Confirmă Intrarea</span>
                                        <span className="text-sm font-bold uppercase opacity-60 mt-4 tracking-widest italic">Validare sesiune pentru {currentLoc.name}</span>
                                    </div>
                                </button>
                            ) : (
                                <div className="w-full py-12 bg-green-500/10 border-2 border-green-500/30 text-green-500 rounded-[4rem] flex flex-col items-center justify-center animate-scaleIn">
                                    <Icons.CheckCircleIcon className="w-16 h-16 mb-4" />
                                    <span className="text-3xl font-black uppercase tracking-[0.2em]">Intrare Validată</span>
                                    <span className="text-xs font-bold uppercase mt-2 tracking-widest">Spor la antrenament! Înregistrat la {format(new Date(), 'HH:mm')}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-inner">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary-400 opacity-60">Status Abonament</h3>
                                    <p className="text-6xl font-black tracking-tighter uppercase italic">{member.membership.tierId.replace('tier', 'Lvl ')}</p>
                                    <div className="flex items-center gap-3 text-green-400 font-black uppercase text-sm">
                                        <Icons.ShieldCheckIcon className="w-6 h-6" /> Membru Activ Pegas
                                    </div>
                                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Valabil până la {format(parseISO(member.membership.endDate), 'dd MMMM yyyy', { locale: ro })}</p>
                                </div>
                                <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute inset-0 gold-shimmer opacity-20 pointer-events-none"></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/60 relative z-10">Elite FITPoints</h3>
                                    <p className="text-8xl font-black text-white relative z-10 tracking-tighter">{member.loyalty?.points || 0}</p>
                                    <button className="bg-white text-primary-700 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.3em] mt-8 hover:scale-105 transition-transform shadow-xl relative z-10">Catalog Recompense</button>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <h3 className="text-2xl font-black uppercase tracking-tighter border-l-8 border-primary-500 pl-6 italic">Shortcuts</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <button onClick={() => handleQuickBook('Sesiune Forță')} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-primary-500 transition-all text-center group shadow-sm">
                                        <Icons.CalendarPlusIcon className="w-14 h-14 mx-auto mb-6 text-primary-500 group-hover:scale-110 transition-transform" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Booking Rapid</p>
                                    </button>
                                    <button onClick={() => setActiveTab('progress')} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-primary-500 transition-all text-center group shadow-sm">
                                        <Icons.ChartPieIcon className="w-14 h-14 mx-auto mb-6 text-orange-500 group-hover:scale-110 transition-transform" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Statistici Core</p>
                                    </button>
                                    <button onClick={() => setActiveTab('feedback')} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-primary-500 transition-all text-center group shadow-sm">
                                        <Icons.StarIcon className="w-14 h-14 mx-auto mb-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Review Sesiune</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-10 animate-fadeInUp max-w-4xl mx-auto">
                            <h2 className="text-4xl font-black tracking-tight uppercase italic border-b border-white/5 pb-8">Agenda Viitoare</h2>
                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-6">
                                    {upcomingBookings.map(b => (
                                        <div key={b.id} className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex items-center justify-between group shadow-lg">
                                            <div className="flex gap-8 items-center">
                                                <div className={`w-4 h-20 rounded-full bg-${b.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}></div>
                                                <div>
                                                    <p className="text-2xl font-black tracking-tight uppercase">{b.title}</p>
                                                    <p className="text-md text-white/50 font-bold uppercase tracking-widest mt-2">{format(parseISO(b.startTime), "EEEE, dd MMMM 'ora' HH:mm", { locale: ro })}</p>
                                                </div>
                                            </div>
                                            <button className="bg-red-500/10 p-5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                <Icons.XCircleIcon className="w-8 h-8" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32 bg-white/5 rounded-[4rem] border-4 border-dashed border-white/5">
                                     <Icons.CalendarIcon className="w-24 h-24 mx-auto mb-6 opacity-10" />
                                     <p className="text-xl font-black uppercase tracking-widest opacity-30">Nicio programare în sistem</p>
                                </div>
                            )}
                            <button onClick={() => handleQuickBook('Clasă Grup Pegas')} className="w-full py-8 bg-primary-500 text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl active:scale-95 transition-all hover:bg-primary-600">
                                Rezervă Clasă Live
                            </button>
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="space-y-12 animate-fadeInUp max-w-5xl mx-auto">
                            <div className="flex justify-between items-center">
                                <h2 className="text-4xl font-black tracking-tight uppercase italic">Monitorizare Progres</h2>
                                <button onClick={handleUploadPhoto} className="bg-primary-500 text-black px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                                    <Icons.PlusIcon className="w-6 h-6" /> Jurnal Foto
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="aspect-[4/5] bg-white/5 rounded-[4rem] border border-white/10 relative overflow-hidden flex flex-col justify-end p-8 group shadow-2xl">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop')] bg-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s]"></div>
                                    <div className="relative z-10 bg-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                                        <p className="text-xs font-black uppercase tracking-[0.4em] text-primary-400 mb-2">Octombrie 2024</p>
                                        <p className="text-4xl font-black tracking-tighter">79.2 KG</p>
                                        <div className="mt-4 flex gap-2">
                                             <div className="h-1.5 flex-1 bg-primary-500 rounded-full"></div>
                                             <div className="h-1.5 flex-1 bg-white/10 rounded-full"></div>
                                             <div className="h-1.5 flex-1 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="aspect-[4/5] bg-white/5 rounded-[4rem] border-4 border-dashed border-white/5 flex items-center justify-center text-center p-12 hover:border-primary-500 transition-all cursor-pointer group shadow-inner">
                                    <div>
                                        <Icons.ViewGridIcon className="w-20 h-20 mx-auto mb-8 opacity-10 group-hover:opacity-100 group-hover:text-primary-500 transition-all" />
                                        <p className="text-sm font-black text-white/20 uppercase tracking-[0.3em] leading-loose group-hover:text-white transition-colors">Apasă pentru a actualiza evoluția ta vizuală</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="space-y-12 animate-fadeInUp max-w-3xl mx-auto">
                            <h2 className="text-4xl font-black tracking-tight uppercase italic text-center">Standard de Excelență</h2>
                            {!isReviewSubmitted ? (
                                <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 space-y-12 shadow-2xl">
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-8">Evaluează experiența ta de azi</p>
                                        <div className="flex justify-center gap-6">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button key={s} onClick={() => setReviewStars(s)} className={`p-6 rounded-3xl transition-all ${reviewStars >= s ? 'bg-primary-500 text-black scale-125 shadow-[0_0_40px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/20'}`}>
                                                    <Icons.StarIcon className="w-10 h-10 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-4">Gânduri sau Sugestii</label>
                                        <textarea 
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            rows={5} 
                                            placeholder="Ex: Ambianța a fost perfectă..."
                                            className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] p-8 text-lg font-bold outline-none focus:ring-4 focus:ring-primary-500 shadow-inner"
                                        />
                                    </div>
                                    <button onClick={handleSubmitReview} className="w-full py-8 bg-primary-500 text-black rounded-3xl font-black uppercase tracking-[0.4em] text-sm shadow-[0_20px_50px_rgba(212,175,55,0.3)] active:scale-95 transition-all hover:bg-primary-600">
                                        Trimite Review Pegas
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-green-500/10 p-20 rounded-[4rem] border-2 border-green-500/30 text-center animate-scaleIn">
                                    <Icons.CheckCircleIcon className="w-24 h-24 text-green-400 mx-auto mb-8 shadow-2xl shadow-green-500/20" />
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">Feedback Recepționat!</h3>
                                    <p className="text-lg text-green-300/60 mt-4 font-bold">Vă mulțumim pentru contribuția la standardul Pegas.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="space-y-12 animate-fadeInUp max-w-3xl mx-auto">
                            <h2 className="text-4xl font-black tracking-tight uppercase italic text-center">Asistență Rapidă</h2>
                            <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 space-y-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                     <Icons.ChatBubbleLeftEllipsisIcon className="w-40 h-40" />
                                </div>
                                <div className="flex gap-8 items-start relative z-10">
                                    <div className="p-6 bg-primary-500/20 rounded-[2.5rem] shadow-inner">
                                        <Icons.ChatAltIcon className="w-12 h-12 text-primary-500" />
                                    </div>
                                    <div>
                                        <p className="font-black text-2xl uppercase tracking-tighter">Aveți nevoie de intervenție?</p>
                                        <p className="text-md text-white/50 leading-relaxed font-bold mt-2 uppercase tracking-tight">Trimite un mesaj prioritar recepției. Echipa Pegas va interveni în maximum 3 minute.</p>
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <textarea 
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        rows={4} 
                                        placeholder="Ex: Solicitați un prosop curat / Vestiar blocat..."
                                        className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] p-8 text-lg font-bold outline-none focus:ring-4 focus:ring-primary-500 shadow-inner"
                                    />
                                    <button onClick={handleSendHelpRequest} className="w-full py-8 bg-primary-500 text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-[0_20px_50px_rgba(212,175,55,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4">
                                        <Icons.PaperAirplaneIcon className="w-6 h-6" /> Trimite Semnal Prioritar
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl flex gap-6 items-center border border-white/10 animate-pulse">
                                <Icons.InformationCircleIcon className="w-10 h-10 text-white flex-shrink-0" />
                                <p className="text-sm text-white font-black uppercase tracking-widest leading-relaxed">Agentul Pegasus AI monitorizează toate solicitările 24/7. Intervenția umană este disponibilă până la ora 22:00.</p>
                            </div>
                        </div>
                    )}

                </main>
            </div>
            
            <footer className="h-20 border-t border-white/5 px-12 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">Operational Core Connection Active • {currentLoc.name}</p>
                </div>
                <p className="text-xl font-black tabular-nums tracking-widest">{format(new Date(), 'HH:mm')}</p>
            </footer>
        </div>
    );
};

export default MemberKioskView;
