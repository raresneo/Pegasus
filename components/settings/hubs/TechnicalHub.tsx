
import React, { useState } from 'react';
import * as Icons from '../../icons';
import UserAdminSettings from '../UserAdminSettings';
import ModuleVisibilitySettings from '../ModuleVisibilitySettings';
import ActivityLogPage from '../ActivityLogPage';
import IntegrationsSettings from '../IntegrationsSettings';

const TechnicalHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'modules' | 'audit' | 'integrations'>('users');

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Echipă & Sistem</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Securitate, permisiuni și monitorizarea activității globale.</p>
                </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-card-dark rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
                {[
                    { id: 'users', label: 'Echipa Staff', icon: Icons.UsersIcon },
                    { id: 'modules', label: 'Module Active', icon: Icons.ViewGridIcon },
                    { id: 'integrations', label: 'Integrări API', icon: Icons.PuzzleIcon },
                    { id: 'audit', label: 'Jurnal Audit', icon: Icons.ClipboardListIcon },
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
                {activeTab === 'users' && <UserAdminSettings />}
                {activeTab === 'modules' && <ModuleVisibilitySettings />}
                {activeTab === 'integrations' && <IntegrationsSettings />}
                {activeTab === 'audit' && <ActivityLogPage />}
            </main>
        </div>
    );
};

export default TechnicalHub;
