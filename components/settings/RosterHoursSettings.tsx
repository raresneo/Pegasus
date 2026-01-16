import React, { useState } from 'react';
import * as Icons from '../icons';

const RosterHoursSettings: React.FC = () => {
    const days = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

    const [schedule, setSchedule] = useState(
        days.map(day => ({
            day,
            isOpen: !['Sâmbătă', 'Duminică'].includes(day),
            open: '06:00',
            close: '23:00'
        }))
    );

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const toggleDay = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].isOpen = !newSchedule[index].isOpen;
        setSchedule(newSchedule);
    };

    const updateTime = (index: number, field: 'open' | 'close', value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            {showSuccess && (
                <div className="fixed top-20 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-fadeIn flex items-center gap-2 font-bold">
                    <Icons.CheckCircleIcon className="w-5 h-5" />
                    Program actualizat
                </div>
            )}

            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Program & Ture</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Setează orele de funcționare ale clubului și regulile de pontaj.</p>
                </div>
                <button onClick={handleSave} className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all">
                    Salvează Programul
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Program de Funcționare</h3>

                    <div className="space-y-4">
                        {schedule.map((day, index) => (
                            <div key={day.day} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${day.isOpen ? 'bg-background-dark border-white/5' : 'bg-background-dark/30 border-transparent opacity-50'}`}>
                                <div className="flex items-center gap-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={day.isOpen} onChange={() => toggleDay(index)} />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                    <span className="font-bold text-white w-24">{day.day}</span>
                                </div>

                                {day.isOpen ? (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="time"
                                            value={day.open}
                                            onChange={(e) => updateTime(index, 'open', e.target.value)}
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                        />
                                        <span className="text-white/20">-</span>
                                        <input
                                            type="time"
                                            value={day.close}
                                            onChange={(e) => updateTime(index, 'close', e.target.value)}
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-xs font-black uppercase tracking-widest text-white/20 px-8">Închis</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Vârfuri de Activitate</h3>
                        <div className="h-40 flex items-end justify-between gap-1 px-4 pb-4 bg-background-dark rounded-2xl border border-white/5 relative overflow-hidden">
                            {/* Mock Graph */}
                            {[20, 35, 60, 85, 95, 70, 45, 30, 80, 50, 20, 10].map((h, i) => (
                                <div key={i} className="w-full bg-primary-500/20 hover:bg-primary-500/50 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">{h}% load</div>
                                </div>
                            ))}
                            <div className="absolute bottom-2 left-4 text-[10px] font-black uppercase tracking-widest text-white/40">Estimare Trafic Săptămânal</div>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            <Icons.LightBulbIcon className="w-4 h-4 text-yellow-500 inline mr-1" />
                            <strong>Insight:</strong> Intervalul 17:00 - 20:00 este cel mai aglomerat. Recomandăm suplimentarea personalului la recepție și în sală.
                        </p>
                    </div>

                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Reguli Sărbători</h3>
                        <button className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-all flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest">
                            <Icons.CalendarDaysIcon className="w-5 h-5" />
                            Adaugă Excepție Calendar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RosterHoursSettings;