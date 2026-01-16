import React, { useState } from 'react';
import * as Icons from '../icons';
import { useLanguage } from '../../context/LanguageContext';

interface AccessPoint {
    id: string;
    name: string;
    type: 'turnstile' | 'door_lock' | 'gate';
    ipAddress: string;
    status: 'online' | 'offline' | 'maintenance';
    location: string;
}

const DoorsReadersSettings: React.FC = () => {
    const { t } = useLanguage();
    const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([
        { id: '1', name: 'Turnichet Principal', type: 'turnstile', ipAddress: '192.168.1.101', status: 'online', location: 'Recepție' },
        { id: '2', name: 'Ușă Staff', type: 'door_lock', ipAddress: '192.168.1.102', status: 'online', location: 'Spate' },
        { id: '3', name: 'Poartă Auto', type: 'gate', ipAddress: '192.168.1.105', status: 'maintenance', location: 'Parcare' },
    ]);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'offline': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'maintenance': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            {showSuccess && (
                <div className="fixed top-20 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-fadeIn flex items-center gap-2 font-bold">
                    <Icons.CheckCircleIcon className="w-5 h-5" />
                    Setări salvate cu succes
                </div>
            )}

            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Turnicheți & Acces</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Gestionează punctele de acces fizic și cititoarele.</p>
                </div>
                <button onClick={handleSave} className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all">
                    Salvează Configurația
                </button>
            </div>

            <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Puncte de Acces Active</h3>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                        <Icons.PlusIcon className="w-4 h-4" />
                        Adaugă Dispozitiv
                    </button>
                </div>

                <div className="space-y-4">
                    {accessPoints.map(point => (
                        <div key={point.id} className="flex items-center justify-between p-6 bg-background-dark/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${point.status === 'online' ? 'bg-primary-500/10 text-primary-500' : 'bg-gray-800 text-gray-400'}`}>
                                    {point.type === 'turnstile' && <Icons.ArrowsRightLeftIcon className="w-6 h-6" />}
                                    {point.type === 'door_lock' && <Icons.LockClosedIcon className="w-6 h-6" />}
                                    {point.type === 'gate' && <Icons.TruckIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">{point.name}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs font-mono text-white/40 bg-black/20 px-2 py-1 rounded">{point.ipAddress}</span>
                                        <span className="text-xs text-white/40 flex items-center gap-1">
                                            <Icons.MapPinIcon className="w-3 h-3" /> {point.location}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(point.status)}`}>
                                    {point.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                        <Icons.Cog6ToothIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors">
                                        <Icons.TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Reguli Globale Acces</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl">
                            <div>
                                <h5 className="font-bold text-sm text-white">Acces Non-Stop</h5>
                                <p className="text-xs text-text-dark-secondary mt-1">Permite accesul membrilor 24/7</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl">
                            <div>
                                <h5 className="font-bold text-sm text-white">Anti-Passback</h5>
                                <p className="text-xs text-text-dark-secondary mt-1">Previne intrarea dublă cu același card</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Integrare Hardware</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-background-dark rounded-xl border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-white uppercase">Controller</span>
                                <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">CONNECTED</span>
                            </div>
                            <div className="text-sm font-mono text-white/60">ZK-BioSecurity V5.0</div>
                        </div>
                        <div className="p-4 bg-background-dark rounded-xl border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-white uppercase">Sync Status</span>
                                <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">AUTO</span>
                            </div>
                            <div className="text-sm text-white/60">Last sync: <span className="text-white">Just now</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoorsReadersSettings;