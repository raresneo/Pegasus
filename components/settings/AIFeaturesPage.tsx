import React from 'react';
import { menuItems } from '../../lib/menu';
import { MenuItem } from '../../types';
import * as Icons from '../icons';

interface AIFeaturesPageProps {
    onNavigate: (item: MenuItem) => void;
}

const SettingsCard: React.FC<{ item: MenuItem, onClick: () => void }> = ({ item, onClick }) => {
    const Icon = Icons[item.icon as keyof typeof Icons] || Icons.CogIcon;
    return (
        <div 
            onClick={onClick}
            className="bg-card-dark p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-start border border-border-dark"
        >
            <div className="p-3 bg-primary-900/50 rounded-full mb-4">
                <Icon className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-md text-text-dark-primary mb-2">{item.label}</h3>
            <p className="text-sm text-text-dark-secondary flex-grow">Configure {item.label.toLowerCase()} settings and options.</p>
        </div>
    );
};

const AIFeaturesPage: React.FC<AIFeaturesPageProps> = ({ onNavigate }) => {
    const aiSettingsMenu = menuItems.find(item => item.id === 'settings')?.children?.find(child => child.id === 'settings-ai')?.children || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">AI Features</h1>
                <p className="text-text-dark-secondary mt-1">Train, configure, and automate tasks with Fitable's intelligent engine.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {aiSettingsMenu.map(item => (
                    <SettingsCard key={item.id} item={item} onClick={() => onNavigate(item)} />
                ))}
            </div>
        </div>
    );
};

export default AIFeaturesPage;