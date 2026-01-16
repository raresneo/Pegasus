
import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Member } from '../types';
import * as Icons from '../components/icons';
import { useNotifications } from '../context/NotificationContext';
import { parseISO, isAfter, format } from 'date-fns';
import MemberKioskView from '../components/kiosk/MemberKioskView';

const AccessTerminalPage: React.FC = () => {
    const { members, addCheckIn, locations, currentLocationId } = useDatabase();
    const { notify } = useNotifications();
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'denied' | 'checking'>('idle');
    const [foundMember, setFoundMember] = useState<Member | null>(null);
    const [activeKioskMember, setActiveKioskMember] = useState<Member | null>(null);
    const [message, setMessage] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const currentLoc = locations.find(l => l.id === currentLocationId) || locations[0];
    const selfCheckInUrl = `${window.location.origin}/checkin/${currentLoc.id}`;

    useEffect(() => {
        if (status === 'idle' && !isCameraActive && !activeKioskMember) {
            inputRef.current?.focus();
        }
    }, [status, isCameraActive, activeKioskMember]);

    const handleVerify = (idOrEmail: string, mode: 'checkin' | 'kiosk' = 'checkin') => {
        if (!idOrEmail) return;
        setStatus('checking');
        const member = members.find(m => m.id === idOrEmail || m.email.toLowerCase() === idOrEmail.toLowerCase() || m.phone === idOrEmail);

        setTimeout(() => {
            if (!member) {
                setStatus('denied');
                setMessage('Membru negăsit în baza de date Pegasus.');
                setTimeout(() => setStatus('idle'), 3000);
                return;
            }

            const isExpired = isAfter(new Date(), parseISO(member.membership.endDate));
            const isActive = member.membership.status === 'active';
            const isFrozen = member.membership.status === 'frozen';

            if (mode === 'kiosk') {
                setActiveKioskMember(member);
                setStatus('idle');
                setInput('');
                return;
            }

            if (isActive && !isExpired) {
                addCheckIn(member.id, 'qr', currentLoc.id);
                setStatus('success');
                setFoundMember(member);
                setMessage(`BINE AI VENIT, ${member.firstName.toUpperCase()}!`);
                notify(`Acces permis la ${currentLoc.name}: ${member.firstName}`, 'success');
                setTimeout(() => {
                    setStatus('idle');
                    setFoundMember(null);
                    setInput('');
                }, 3500);
            } else {
                setStatus('denied');
                setFoundMember(member);
                if (isFrozen) {
                    setMessage('Cont suspendat temporar.');
                } else if (isExpired) {
                    setMessage('Abonament expirat. Achită la recepție.');
                } else {
                    setMessage('Contract inactiv sau anulat.');
                }
                setTimeout(() => {
                    setStatus('idle');
                    setFoundMember(null);
                    setInput('');
                }, 3500);
            }
        }, 800);
    };

    const handleKeypad = (val: string) => {
        if (val === 'clear') setInput('');
        else if (val === 'enter') handleVerify(input);
        else setInput(prev => prev + val);
    };

    const simulateScan = () => {
        if (!isCameraActive) return;
        // Picks a random active member for simulation
        const randomActive = members.find(m => m.membership.status === 'active') || members[0];
        if (randomActive) {
            handleVerify(randomActive.id);
        }
    };

    if (activeKioskMember) {
        return <MemberKioskView member={activeKioskMember} onExit={() => setActiveKioskMember(null)} />;
    }

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                
                {/* QR Display Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 flex flex-col items-center text-center shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-6 border border-primary-500/20 px-3 py-1 rounded-full">Stativ Recepție</h3>
                    <div className="bg-white p-6 rounded-3xl mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] group cursor-pointer relative">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selfCheckInUrl)}`} alt="Self Check-in QR" className="group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                            <Icons.SearchIcon className="w-8 h-8 text-primary-500" />
                        </div>
                    </div>
                    <p className="text-sm font-black leading-tight mb-2 uppercase tracking-tighter">Scanează cu telefonul tău</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-8">HUB: {currentLoc.name}</p>
                    
                    <button 
                        onClick={() => handleVerify(input || members[0]?.id, 'kiosk')}
                        className="w-full py-5 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all shadow-xl group"
                    >
                        <Icons.UserCircleIcon className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Portal Self-Service</span>
                    </button>
                </div>

                {/* Main Scanning Area */}
                <div className="flex flex-col items-center text-center space-y-10 animate-fadeIn">
                    <div className={`w-72 h-72 rounded-[4rem] bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-500 ${status === 'denied' ? 'animate-shake' : ''}`}>
                        {isCameraActive ? (
                            <div className="w-full h-full bg-black flex items-center justify-center relative cursor-pointer" onClick={simulateScan}>
                                <div className="absolute inset-0 opacity-40 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndzRwM2NueXN2YXo0eXN2YXo0eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGpxV7V6/giphy.gif')] bg-cover"></div>
                                <div className="z-10 flex flex-col items-center">
                                     <Icons.ViewGridIcon className="w-16 h-16 text-primary-500 mb-3 animate-pulse" />
                                     <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-black/60 px-4 py-1 rounded-full">Scan Mock Active</span>
                                     <p className="text-[8px] mt-2 opacity-50 uppercase font-black">(Click to Simulate Scan)</p>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 shadow-[0_0_20px_rgba(212,175,55,1)] animate-scan"></div>
                            </div>
                        ) : (
                            status === 'idle' && (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Icons.IdentificationIcon className="w-20 h-20 text-primary-500/40 mb-3" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30">Terminal Pegas</span>
                                </div>
                            )
                        )}

                        {status === 'checking' && (
                             <div className="absolute inset-0 bg-background-dark/80 flex items-center justify-center z-20">
                                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                             </div>
                        )}
                        {status === 'success' && (
                            <div className="absolute inset-0 rounded-[4rem] bg-green-600 flex flex-col items-center justify-center animate-scaleIn shadow-2xl z-30">
                                <Icons.CheckCircleIcon className="w-32 h-32 text-white" />
                                <span className="mt-4 font-black uppercase tracking-[0.3em] text-sm">Validat</span>
                            </div>
                        )}
                        {status === 'denied' && (
                            <div className="absolute inset-0 rounded-[4rem] bg-red-600 flex flex-col items-center justify-center animate-scaleIn shadow-2xl z-30">
                                <Icons.XCircleIcon className="w-32 h-32 text-white" />
                                <span className="mt-4 font-black uppercase tracking-[0.3em] text-sm">Refuzat</span>
                            </div>
                        )}
                        
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary-500 rounded-tl-[2rem] z-10"></div>
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary-500 rounded-tr-[2rem] z-10"></div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary-500 rounded-bl-[2rem] z-10"></div>
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary-500 rounded-br-[2rem] z-10"></div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
                            {status === 'idle' ? 'Ready!' : status === 'checking' ? 'Processing...' : status === 'success' ? 'Welcome!' : 'Access Denied'}
                        </h1>
                        <p className={`text-sm font-black uppercase tracking-[0.3em] ${status === 'denied' ? 'text-red-400' : 'text-primary-500/60'}`}>
                            {message || (isCameraActive ? 'Scan QR Code Now' : 'Introduceți Codul')}
                        </p>
                    </div>

                    {foundMember && status !== 'checking' && (
                        <div className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 animate-fadeInUp shadow-2xl max-w-sm">
                            <div className="w-20 h-20 bg-primary-500/20 rounded-2xl flex items-center justify-center font-black text-2xl border-2 border-primary-500/20 text-primary-500">
                                {foundMember.avatar}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-black text-xl leading-none uppercase tracking-tighter truncate">{foundMember.firstName} {foundMember.lastName}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-3 px-3 py-1 rounded-lg inline-block ${status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {status === 'success' ? `Activ: ${format(parseISO(foundMember.membership.endDate), 'dd MMM')}` : 'Plată Restantă'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Keypad Controls */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl flex flex-col">
                    <button 
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className={`mb-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all ${isCameraActive ? 'bg-red-500 text-white shadow-xl shadow-red-500/30' : 'bg-primary-500 text-black shadow-lg shadow-primary-500/30 hover:scale-105'}`}
                    >
                        {isCameraActive ? <Icons.XCircleIcon className="w-5 h-5"/> : <Icons.ViewGridIcon className="w-5 h-5"/>}
                        {isCameraActive ? 'Oprește Scanarea' : 'Pornește Scanner QR'}
                    </button>

                    <div className="mb-8 relative">
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={input}
                            readOnly
                            placeholder="COD_PEGA_MEMBER"
                            className="w-full bg-black/60 border-2 border-white/10 rounded-2xl p-5 text-center text-3xl font-black tracking-[0.3em] text-primary-500 outline-none placeholder:opacity-10 shadow-inner"
                        />
                        <div className="absolute -bottom-2 -right-2 p-3 bg-primary-500 rounded-xl text-black shadow-xl">
                            <Icons.KeyIcon className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <button key={n} onClick={() => handleKeypad(n.toString())} className="h-20 bg-white/5 hover:bg-white/10 rounded-2xl text-2xl font-black transition-all active:scale-90 flex items-center justify-center border border-white/5 hover:border-white/20">
                                {n}
                            </button>
                        ))}
                        <button onClick={() => handleKeypad('clear')} className="h-20 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 font-black flex items-center justify-center border border-red-500/20">
                            <Icons.XIcon className="w-8 h-8"/>
                        </button>
                        <button onClick={() => handleKeypad('0')} className="h-20 bg-white/5 hover:bg-white/10 rounded-2xl text-2xl font-black flex items-center justify-center border border-white/5">0</button>
                        <button onClick={() => handleKeypad('enter')} className="h-20 bg-green-600 hover:bg-green-700 rounded-2xl text-white font-black flex items-center justify-center shadow-xl shadow-green-600/20 active:scale-95 transition-all">
                            <Icons.CheckIcon className="w-10 h-10"/>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-10 flex flex-col items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                <Icons.LogoIcon className="w-8 h-8 text-primary-500 animate-glow-violet rounded-lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-dark-secondary">Pegasus Entry Engine v1.8 • Active Secure Link</p>
            </div>
        </div>
    );
};

export default AccessTerminalPage;
