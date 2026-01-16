import React, { useState } from 'react';
import * as Icons from '../icons';

const MeasurementConfigSettings: React.FC = () => {
    const [units, setUnits] = useState({
        weight: 'kg',
        length: 'cm',
        volume: 'liters',
        energy: 'kcal'
    });

    const [metrics, setMetrics] = useState([
        { id: '1', name: 'Greutate Corp', type: 'basic', unit: 'kg', active: true },
        { id: '2', name: 'Grăsime Corporală', type: 'composition', unit: '%', active: true },
        { id: '3', name: 'Masă Musculară', type: 'composition', unit: 'kg', active: true },
        { id: '4', name: 'Circumferință Piept', type: 'girth', unit: 'cm', active: true },
        { id: '5', name: 'Circumferință Talie', type: 'girth', unit: 'cm', active: true },
        { id: '6', name: 'VO2 Max', type: 'performance', unit: 'ml/kg/min', active: false },
    ]);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const toggleMetric = (id: string) => {
        setMetrics(metrics.map(m => m.id === id ? { ...m, active: !m.active } : m));
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            {showSuccess && (
                <div className="fixed top-20 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-fadeIn flex items-center gap-2 font-bold">
                    <Icons.CheckCircleIcon className="w-5 h-5" />
                    Preferințe actualizate
                </div>
            )}

            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Măsurători & Metrice</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Personalizează unitățile de măsură și indicatorii de performanță urmăriți.</p>
                </div>
                <button onClick={handleSave} className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all">
                    Salvează
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Unit Preferences */}
                <div className="lg:col-span-4 bg-card-dark rounded-[2.5rem] border border-white/5 p-8 flex flex-wrap gap-8 items-center justify-around">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Icons.ScaleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Masă</div>
                            <select
                                value={units.weight}
                                onChange={e => setUnits({ ...units, weight: e.target.value })}
                                className="bg-transparent text-xl font-bold text-white border-none focus:ring-0 cursor-pointer hover:text-primary-500 transition-colors"
                            >
                                <option value="kg">Kilograme (kg)</option>
                                <option value="lbs">Livre (lbs)</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-px h-12 bg-white/5 hidden md:block"></div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                            <Icons.ArrowsUpDownIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Lungime</div>
                            <select
                                value={units.length}
                                onChange={e => setUnits({ ...units, length: e.target.value })}
                                className="bg-transparent text-xl font-bold text-white border-none focus:ring-0 cursor-pointer hover:text-primary-500 transition-colors"
                            >
                                <option value="cm">Centimetri (cm)</option>
                                <option value="in">Inci (in)</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-px h-12 bg-white/5 hidden md:block"></div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                            <Icons.FireIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Energie</div>
                            <select
                                value={units.energy}
                                onChange={e => setUnits({ ...units, energy: e.target.value })}
                                className="bg-transparent text-xl font-bold text-white border-none focus:ring-0 cursor-pointer hover:text-primary-500 transition-colors"
                            >
                                <option value="kcal">Kilocalorii (kCal)</option>
                                <option value="kj">Kilojouli (kJ)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Indicatori Monitorizați</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.map(metric => (
                        <div
                            key={metric.id}
                            onClick={() => toggleMetric(metric.id)}
                            className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${metric.active ? 'bg-primary-500/5 border-primary-500/20' : 'bg-background-dark border-white/5 hover:border-white/10'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${metric.active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 text-white/20 group-hover:bg-white/10'}`}>
                                    {metric.active ? <Icons.CheckIcon className="w-5 h-5" /> : <Icons.PlusIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h5 className={`font-bold transition-colors ${metric.active ? 'text-white' : 'text-white/40'}`}>{metric.name}</h5>
                                    <span className="text-xs font-mono opacity-50">{metric.unit}</span>
                                </div>
                            </div>
                            {metric.type === 'composition' && <Icons.ChartPieIcon className="w-5 h-5 text-purple-400 opacity-20" />}
                            {metric.type === 'performance' && <Icons.BoltIcon className="w-5 h-5 text-yellow-400 opacity-20" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MeasurementConfigSettings;