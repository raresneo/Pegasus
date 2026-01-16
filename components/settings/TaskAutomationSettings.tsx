import React, { useState } from 'react';
import * as Icons from '../icons';

const TaskAutomationSettings: React.FC = () => {
    const [automations, setAutomations] = useState([
        { id: '1', title: 'Onboarding Membru Nou', trigger: 'Membru Înregistrat', action: 'Creează Task', isActive: true },
        { id: '2', title: 'Feedback După 30 Zile', trigger: '30 Zile de la Înscriere', action: 'Trimite Mesaj', isActive: true },
        { id: '3', title: 'Alertă Abonament Expirat', trigger: 'Abonament Expirat', action: 'Notifică Manager', isActive: false },
    ]);

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Automatizări & Fluxuri</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Definește acțiuni automate bazate pe evenimente din sistem.</p>
                </div>
                <button className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <Icons.PlusIcon className="w-4 h-4" />
                    Automatizare Nouă
                </button>
            </div>

            <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                <div className="space-y-4">
                    {automations.map(auto => (
                        <div key={auto.id} className="flex items-center justify-between p-6 bg-background-dark/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${auto.isActive ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-800 text-gray-500'}`}>
                                    <Icons.BoltIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{auto.title}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                                        <span className="flex items-center gap-1"><Icons.PlayCircleIcon className="w-3 h-3" /> Trigger: {auto.trigger}</span>
                                        <span className="text-white/20">&rarr;</span>
                                        <span className="flex items-center gap-1"><Icons.CommandLineIcon className="w-3 h-3" /> Action: {auto.action}</span>
                                    </div>
                                </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={auto.isActive} onChange={() => {
                                    setAutomations(automations.map(a => a.id === auto.id ? { ...a, isActive: !a.isActive } : a));
                                }} />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Sugestii Inteligente</h3>
                    <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl border border-white/10 flex items-start gap-4">
                        <Icons.SparklesIcon className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                        <div>
                            <h5 className="font-bold text-white text-sm">Automatizează Urările de La Mulți Ani</h5>
                            <p className="text-xs text-white/60 mt-1 mb-3">Sistemul poate trimite automat un email personalizat și un voucher cadou membrilor de ziua lor.</p>
                            <button className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">Activează Acum</button>
                        </div>
                    </div>
                </div>

                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Icons.QueueListIcon className="w-8 h-8 text-white/40" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Log Activitate Robot</h3>
                    <p className="text-sm text-white/40 mt-2 mb-4">Vezi istoricul tuturor acțiunilor executate automat.</p>
                    <button className="text-xs text-primary-500 font-bold uppercase tracking-wider hover:underline">Vezi Raportul Complet</button>
                </div>
            </div>
        </div>
    );
};

export default TaskAutomationSettings;