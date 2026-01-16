
import React, { useState } from 'react';
import * as Icons from '../../icons';
import LinkGeneratorSettings from '../LinkGeneratorSettings';
import NotificationSettingsPage from '../../../pages/NotificationSettingsPage';
import MemberPortalSettings from '../MemberPortalSettings';
import UpcomingReminders from '../UpcomingReminders';

const CRMHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'links' | 'notifications' | 'portal' | 'reminders'>('links');

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Growth & CRM</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Atrage, reține și comunică eficient cu membrii tăi.</p>
                </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-card-dark rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
                {[
                    { id: 'links', label: 'Generator Link-uri', icon: Icons.LinkIcon },
                    { id: 'reminders', label: 'Remindere Ședințe', icon: Icons.ClockIcon },
                    { id: 'notifications', label: 'Centru Notificări', icon: Icons.BellIcon },
                    { id: 'portal', label: 'Portal Membri', icon: Icons.UserCircleIcon },
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-text-dark-secondary hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'links' && <LinkGeneratorSettings />}
                {activeTab === 'notifications' && <NotificationSettingsPage />}
                {activeTab === 'portal' && <MemberPortalSettings />}
                {activeTab === 'reminders' && <UpcomingReminders />}
            </main>
        </div>
    );
};

export default CRMHub;
