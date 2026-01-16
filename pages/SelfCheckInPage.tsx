
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Presupunând că folosim router, dar implementăm via context local
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import * as Icons from '../components/icons';
import { useNotifications } from '../context/NotificationContext';

const SelfCheckInPage: React.FC = () => {
    const { locations, members, addCheckIn } = useDatabase();
    const { user, isAuthenticated } = useAuth();
    const { notify } = useNotifications();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // În acest mediu simulăm extragerea ID-ului locației din URL
    const locationId = window.location.pathname.split('/').pop() || 'loc_central';
    const location = locations.find(l => l.id === locationId);
    const member = members.find(m => m.email === user?.email);

    const handleCheckIn = () => {
        if (!member) return;
        setStatus('loading');
        
        setTimeout(() => {
            addCheckIn(member.id, 'qr');
            setStatus('success');
            notify(`Te-ai înregistrat cu succes la ${location?.name}!`, 'success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-[2.5rem] shadow-2xl border border-border-light dark:border-border-dark p-10 overflow-hidden relative">
                
                {status === 'success' ? (
                    <div className="space-y-6 py-10 animate-scaleIn">
                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                            <Icons.CheckIcon className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Antrenament Plăcut!</h2>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Check-in-ul tău a fost validat pentru <strong>{location?.name}</strong>.</p>
                        <button onClick={() => window.location.href = '/'} className="mt-8 px-8 py-4 bg-gray-100 dark:bg-background-dark rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">Mergi la Dashboard</button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                             <div className="p-4 bg-primary-500/10 rounded-2xl inline-block mb-4">
                                <Icons.MapPinIcon className="w-10 h-10 text-primary-500" />
                             </div>
                             <h1 className="text-2xl font-black uppercase tracking-tighter">Ești la {location?.name}?</h1>
                             <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest mt-2 font-bold opacity-60">Confirmă prezența pentru a intra</p>
                        </div>

                        {!isAuthenticated ? (
                            <div className="space-y-4">
                                <p className="text-sm font-medium">Te rugăm să te autentifici pentru a valida check-in-ul.</p>
                                <button onClick={() => window.location.href = '/login'} className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Autentificare</button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-background-dark p-4 rounded-2xl border border-border-light dark:border-border-dark text-left">
                                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-black">{member?.avatar}</div>
                                    <div>
                                        <p className="font-black text-sm">{member?.firstName} {member?.lastName}</p>
                                        <p className="text-[10px] font-bold text-primary-500 uppercase">Membru Verificat</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCheckIn}
                                    disabled={status === 'loading'}
                                    className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/40 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {status === 'loading' ? 'Se validează...' : 'CONFIRMĂ INTRAREA'}
                                </button>
                                
                                <p className="text-[10px] text-text-light-secondary opacity-40 font-bold italic">Check-in-ul folosește locația curentă pentru validare.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SelfCheckInPage;
