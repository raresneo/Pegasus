
import React, { useState } from 'react';
import * as Icons from '../../icons';
import BookingClassesSettings from '../BookingClassesSettings';
import AbsenceReasonsSettings from '../AbsenceReasonsSettings';
import TaxonomySettingsPage from '../../../pages/TaxonomySettingsPage';

const OperationsHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'booking' | 'absences' | 'taxonomy'>('booking');

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Operațiuni & Acces</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Gestionează fluxul de lucru și regulile de acces la resurse.</p>
                </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-card-dark rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
                {[
                    { id: 'booking', label: 'Reguli Agenda', icon: Icons.CalendarIcon },
                    { id: 'absences', label: 'Motive Absență', icon: Icons.XCircleIcon },
                    { id: 'taxonomy', label: 'Categorii & Tag-uri', icon: Icons.ListBulletIcon },
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-text-dark-secondary hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'booking' && <BookingClassesSettings />}
                {activeTab === 'absences' && <AbsenceReasonsSettings />}
                {activeTab === 'taxonomy' && <TaxonomySettingsPage />}
            </main>
        </div>
    );
};

export default OperationsHub;
