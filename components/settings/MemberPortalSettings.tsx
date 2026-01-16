
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';

const MemberPortalSettings: React.FC = () => {
    const { onlineHubSettings, updateOnlineHubSettings } = useDatabase();
    const [welcomeMsg, setWelcomeMsg] = useState('Ești pregătit pentru performanță?');
    const [themeColor, setThemeColor] = useState('#D4AF37');

    const toggleModule = (id: string) => {
        // Logica de vizibilitate module pentru membru (simulată via onlineHubSettings)
        console.log("Toggle visibility for member module:", id);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn pb-20">
            <header>
                <h1 className="text-3xl font-black tracking-tight uppercase">Customizare Portal Membri</h1>
                <p className="text-text-dark-secondary">Definește experiența digitală a clienților tăi în aplicația mobilă Pegasus.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-border-light dark:border-border-dark space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary-500">Identitate Vizuală Portal</h3>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-60">Mesaj Întâmpinare (Welcome)</label>
                            <input 
                                type="text" 
                                value={welcomeMsg} 
                                onChange={e => setWelcomeMsg(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark font-bold outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="pt-4">
                             <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Culoare Accent Card Digital</label>
                             <div className="flex gap-4">
                                {['#D4AF37', '#8B5CF6', '#10B981', '#EF4444', '#3B82F6'].map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setThemeColor(c)}
                                        className={`w-12 h-12 rounded-2xl transition-all ${themeColor === c ? 'ring-4 ring-white scale-110 shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                             </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-border-light dark:border-border-dark">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Funcționalități Active Membru</h3>
                        <div className="space-y-4">
                            {[
                                { id: 'm_progress', label: 'Jurnal Progres Foto', desc: 'Permite membrilor să-și încarce evoluția fizică.' },
                                { id: 'm_booking', label: 'Self-Booking Clase', desc: 'Membrii se pot programa singuri la clase din aplicație.' },
                                { id: 'm_referral', label: 'Sistem Recomandări', desc: 'Afișează link-ul de partener în dashboard-ul clientului.' },
                                { id: 'm_chat', label: 'Suport Live Chat', desc: 'Buton de asistență rapidă către recepție.' }
                            ].map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-background-dark/50 rounded-2xl border border-border-light dark:border-border-dark">
                                    <div>
                                        <p className="font-bold text-sm">{item.label}</p>
                                        <p className="text-xs opacity-50">{item.desc}</p>
                                    </div>
                                    <button onClick={() => toggleModule(item.id)} className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-40 mb-6">Previzualizare Live App</p>
                    <div className="w-[280px] h-[560px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative">
                         <div className="h-full w-full bg-black flex flex-col p-6 space-y-6">
                            <div className="h-40 rounded-[2rem] p-6 flex flex-col justify-end relative overflow-hidden" style={{ backgroundColor: themeColor }}>
                                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                                <h4 className="text-white font-black text-lg relative z-10 leading-none">Alex Popescu</h4>
                                <p className="text-white/60 text-[8px] uppercase tracking-widest font-bold mt-1">Elite Level Member</p>
                            </div>
                            <div className="space-y-4">
                                <p className="text-white font-black text-sm uppercase tracking-tighter">{welcomeMsg}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Fixed missing GridIcon by using ViewGridIcon */}
                                    {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"><Icons.ViewGridIcon className="w-6 h-6 opacity-20" /></div>)}
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberPortalSettings;
