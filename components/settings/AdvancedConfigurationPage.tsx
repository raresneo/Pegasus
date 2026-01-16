
import React from 'react';
import { menuItems } from '../../lib/menu';
import { MenuItem } from '../../types';
import * as Icons from '../icons';

interface AdvancedConfigurationPageProps {
    onNavigate: (item: MenuItem) => void;
}

const SettingsCard: React.FC<{ item: MenuItem, onClick: () => void }> = ({ item, onClick }) => {
    const Icon = Icons[item.icon as keyof typeof Icons] || Icons.CogIcon;
    return (
        <div 
            onClick={onClick}
            className="bg-card-dark p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-start border border-border-dark group"
        >
            <div className="p-3 bg-primary-900/50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-text-dark-primary mb-2">{item.label}</h3>
            <p className="text-xs text-text-dark-secondary leading-relaxed opacity-60">Configurați opțiunile pentru {item.label.toLowerCase()} și setările de sistem.</p>
        </div>
    );
};


const AdvancedConfigurationPage: React.FC<AdvancedConfigurationPageProps> = ({ onNavigate }) => {
    const settingsSubMenu = menuItems.find(item => item.id === 'settings')?.children || [];

    return (
        <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Configurare Avansată</h1>
                    <p className="text-text-dark-secondary mt-1 font-semibold">Control total asupra fiecărui modul al ecosistemului Fitable.</p>
                </div>
                <button className="flex items-center bg-primary-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all font-black text-xs uppercase tracking-widest">
                    <Icons.WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                    Asistent Configurare
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {settingsSubMenu.map(item => (
                    <SettingsCard key={item.id} item={item} onClick={() => onNavigate(item)} />
                ))}
            </div>
            
            <div className="bg-primary-500/5 border border-primary-500/10 p-8 rounded-[2.5rem] flex items-start gap-6">
                <div className="p-4 bg-primary-500 text-white rounded-2xl shadow-lg">
                    <Icons.ShieldCheckIcon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Securitate și Audit</h3>
                    <p className="text-sm text-text-dark-secondary mt-1 leading-relaxed">Toate modificările efectuate în această secțiune sunt înregistrate în jurnalul de activitate al administratorului pentru a asigura trasabilitatea configurărilor de sistem.</p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedConfigurationPage;
