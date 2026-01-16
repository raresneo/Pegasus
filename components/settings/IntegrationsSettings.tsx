
import React, { useState } from 'react';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';

const IntegrationsSettings: React.FC = () => {
    const { onlineHubSettings, updateStripeConfig } = useDatabase();
    const [isStripeEditing, setIsStripeEditing] = useState(false);
    const [stripeForm, setStripeForm] = useState(onlineHubSettings.stripe);

    const handleStripeSave = () => {
        updateStripeConfig(stripeForm);
        setIsStripeEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
            <header>
                <h1 className="text-3xl font-black tracking-tight uppercase">Integrări Externe</h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary">Conectează Fitable cu instrumentele tale preferate.</p>
            </header>

            <div className="space-y-6">
                {/* Stripe Card */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50 dark:bg-background-dark/30">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                <Icons.CreditCardIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Stripe Payments</h3>
                                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Procesează plăți online cu cardul, abonamente recurente și Apple Pay.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${onlineHubSettings.stripe.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                {onlineHubSettings.stripe.enabled ? 'Conectat' : 'Inactiv'}
                            </span>
                            <button 
                                onClick={() => setIsStripeEditing(!isStripeEditing)}
                                className="px-5 py-2 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                {isStripeEditing ? 'Anulează' : 'Configurează'}
                            </button>
                        </div>
                    </div>

                    {isStripeEditing && (
                        <div className="p-8 border-t border-border-light dark:border-border-dark space-y-6 animate-fadeIn">
                             <div className="flex items-center justify-between p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                                <div>
                                    <p className="font-bold text-sm">Activează Procesarea Online</p>
                                    <p className="text-xs opacity-60">Permite clienților să plătească direct din link-urile de înscriere.</p>
                                </div>
                                <button onClick={() => setStripeForm({...stripeForm, enabled: !stripeForm.enabled})} 
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${stripeForm.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${stripeForm.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dark-secondary mb-2">Mod Operare</label>
                                    <div className="flex p-1 bg-gray-100 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                                        <button onClick={() => setStripeForm({...stripeForm, mode: 'test'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${stripeForm.mode === 'test' ? 'bg-white dark:bg-card-dark shadow-sm text-orange-500' : 'text-text-dark-secondary'}`}>TEST (Safe)</button>
                                        <button onClick={() => setStripeForm({...stripeForm, mode: 'live'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${stripeForm.mode === 'live' ? 'bg-white dark:bg-card-dark shadow-sm text-green-500' : 'text-text-dark-secondary'}`}>LIVE (Producție)</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dark-secondary mb-2">Publishable Key</label>
                                    <input type="text" value={stripeForm.publishableKey} onChange={e => setStripeForm({...stripeForm, publishableKey: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-xs font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dark-secondary mb-2">Secret Key</label>
                                    <input type="password" value={stripeForm.secretKey} onChange={e => setStripeForm({...stripeForm, secretKey: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-xs font-mono" />
                                </div>
                                <div className="flex items-end">
                                     <button onClick={handleStripeSave} className="w-full py-3 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Salvează Configurația Stripe</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* WhatsApp Integration Mock */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark p-6 flex justify-between items-center shadow-sm group hover:border-green-500/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                            <Icons.WhatsAppIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">WhatsApp Business Cloud</h3>
                            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Trimite confirmări de plată și remindere direct prin WhatsApp.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Conectează</button>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsSettings;
