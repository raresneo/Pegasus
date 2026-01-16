import React, { useState } from 'react';
import * as Icons from '../icons';

const WorkoutConfigSettings: React.FC = () => {
    const [exerciseTypes, setExerciseTypes] = useState([
        { id: '1', name: 'Forță', count: 145 },
        { id: '2', name: 'Cardio', count: 32 },
        { id: '3', name: 'Flexibilitate', count: 40 },
        { id: '4', name: 'HIIT', count: 18 },
    ]);

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Antrenamente & Exerciții</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Configurează biblioteca de exerciții și tipurile de antrenamente.</p>
                </div>
                <button className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <Icons.PlusIcon className="w-4 h-4" />
                    Adaugă Categorie
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Categorii Exerciții</h3>
                    <div className="space-y-3">
                        {exerciseTypes.map((type, i) => (
                            <div key={type.id} className="flex items-center justify-between p-4 bg-background-dark rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold">{i + 1}</div>
                                    <span className="font-bold text-white">{type.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-text-dark-secondary">{type.count} exerciții</span>
                                    <button className="text-white/20 hover:text-white transition-colors"><Icons.PencilIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Import / Export</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-6 rounded-2xl bg-background-dark border border-white/5 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all flex flex-col items-center gap-3 text-center group">
                                <Icons.CloudArrowDownIcon className="w-8 h-8 text-white/40 group-hover:text-primary-500" />
                                <span className="text-xs font-bold text-white uppercase">Import Excel</span>
                            </button>
                            <button className="p-6 rounded-2xl bg-background-dark border border-white/5 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all flex flex-col items-center gap-3 text-center group">
                                <Icons.CloudArrowUpIcon className="w-8 h-8 text-white/40 group-hover:text-primary-500" />
                                <span className="text-xs font-bold text-white uppercase">Backup DB</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-900/40 to-card-dark rounded-[2.5rem] border border-white/5 p-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary-500 rounded-xl">
                                <Icons.VideoCameraIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Integrare Video</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs text-white/60">Vimeo Connected</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-white/60 mb-6">Toate exercițiile se sincronizează automat cu biblioteca video pentru redarea pe dispozitivele clienților.</p>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-colors">Configurează API</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutConfigSettings;