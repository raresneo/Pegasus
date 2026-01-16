
import React, { useState } from 'react';
import * as Icons from '../../icons';
import MembershipTypesSettings from '../MembershipTypesSettings';
import ServicesSettings from '../ServicesSettings';
import SpecialOffersSettings from '../SpecialOffersSettings';

const BusinessModelHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tiers' | 'services' | 'offers'>('tiers');

    return (
        <div className="space-y-10 animate-fadeIn">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Model de Business</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Configurările fundamentale ale veniturilor și produselor.</p>
                </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-card-dark rounded-2xl border border-white/5 w-fit">
                {[
                    { id: 'tiers', label: 'Planuri Abonament', icon: Icons.TicketIcon },
                    { id: 'services', label: 'Servicii & Sesiuni', icon: Icons.ClockIcon },
                    { id: 'offers', label: 'Oferte Speciale', icon: Icons.GiftIcon },
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
                {activeTab === 'tiers' && <MembershipTypesSettings />}
                {activeTab === 'services' && <ServicesSettings />}
                {activeTab === 'offers' && <SpecialOffersSettings />}
            </main>
        </div>
    );
};

export default BusinessModelHub;
