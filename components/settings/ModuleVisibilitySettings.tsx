
import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { menuItems } from '../../lib/menu';
import * as Icons from '../icons';
import { useLanguage } from '../../context/LanguageContext';

const ModuleVisibilitySettings: React.FC = () => {
    const { onlineHubSettings, toggleModuleVisibility } = useDatabase();
    const { t } = useLanguage();

    // Do not allow hiding 'settings' and 'home' as they are critical gateways
    const coreModules = ['settings', 'home'];
    const modules = menuItems.filter(m => m.roles.includes('admin'));

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-32">
            <header className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-white leading-none italic">{t('settings.modules.title')}</h1>
                <p className="text-white/40 font-bold text-lg tracking-tight">{t('settings.modules.desc')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => {
                    const isVisible = onlineHubSettings.visibleModuleIds.includes(module.id);
                    const isCore = coreModules.includes(module.id);
                    const Icon = Icons[module.icon as keyof typeof Icons] || Icons.CogIcon;
                    
                    return (
                        <div key={module.id} 
                             className={`group relative glass-card p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col justify-between h-full ${
                                 isVisible 
                                 ? 'bg-white/[0.03] border-white/10' 
                                 : 'bg-black/40 border-transparent opacity-40 grayscale'
                             } ${isCore ? 'cursor-default' : 'cursor-pointer hover:border-primary-500/50 hover:-translate-y-1'}`}
                             onClick={() => !isCore && toggleModuleVisibility(module.id)}
                        >
                            <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-[2.5rem]"></div>
                            
                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className={`p-4 rounded-2xl transition-all duration-500 border ${
                                        isVisible 
                                        ? 'bg-primary-500/10 border-primary-500/20 text-primary-500 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                                        : 'bg-white/5 border-white/10 text-white/20'
                                    }`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    
                                    {isCore ? (
                                        <div className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-primary-500/20">
                                            Sistem Core
                                        </div>
                                    ) : (
                                        <button 
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner border ${
                                                isVisible 
                                                ? 'bg-green-500 border-green-400' 
                                                : 'bg-white/5 border-white/10'
                                            }`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-transform duration-300 ${
                                                isVisible ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className={`text-xl font-black uppercase tracking-tighter transition-colors ${isVisible ? 'text-white' : 'text-white/20'}`}>
                                        {t(module.label)}
                                    </h3>
                                    <p className={`text-xs mt-2 font-medium leading-relaxed transition-opacity ${isVisible ? 'text-white/50' : 'text-white/10'}`}>
                                        {module.description || 'Configurare opțiune meniu pentru fluxul de lucru Pegasus.'}
                                    </p>
                                </div>
                            </div>

                            {isVisible && (
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500/60">Activ în Sidebar</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-10 bg-primary-500/5 border border-primary-500/10 rounded-[3rem] flex items-start gap-8 relative overflow-hidden group">
                <div className="absolute inset-0 gold-shimmer opacity-5 pointer-events-none"></div>
                <div className="p-4 bg-primary-500 text-black rounded-[1.5rem] shadow-2xl relative z-10 group-hover:scale-110 transition-transform">
                    <Icons.ShieldCheckIcon className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-xl font-black uppercase tracking-tighter text-primary-500 mb-2 italic">Securitate Interfață</h4>
                    <p className="text-sm text-text-dark-secondary leading-relaxed font-bold max-w-3xl">
                        {t('settings.modules.safeguard')} Orice modificare efectuată aici se aplică instantaneu pentru toți utilizatorii cu rol de Administrator conectați la acest nod Pegasus.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModuleVisibilitySettings;
