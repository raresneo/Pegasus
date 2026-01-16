
import React, { useState } from 'react';
import * as Icons from '../icons';
import { useLanguage } from '../../context/LanguageContext';
import { useDatabase } from '../../context/DatabaseContext';

const ClubDetailsSettings: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const { onlineHubSettings, updateOnlineHubSettings } = useDatabase();
    
    const [formData, setFormData] = useState({
        gymName: 'Pegas Fitness Club',
        slogan: 'Excelență în Mișcare',
        website: 'https://www.pegas.fit',
        email: 'office@pegas.fit',
        phone: '0700 000 000',
        currency: 'RON',
        taxRate: 19,
        invoicePrefix: 'PEG-'
    });
    
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            {showSuccess && (
                <div className="fixed top-20 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-fadeIn flex items-center gap-2 font-bold">
                    <Icons.CheckCircleIcon className="w-5 h-5" />
                    Setări salvate cu succes
                </div>
            )}

            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Identitate & Locale</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Definește imaginea publică a clubului tău și setările regionale.</p>
                </div>
                <button onClick={handleSave} className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all">
                    Salvează Tot
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Branding & Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500 mb-2">Profil Public Pegas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nume Club</label>
                                <input type="text" value={formData.gymName} onChange={e => setFormData({...formData, gymName: e.target.value})} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Slogan</label>
                                <input type="text" value={formData.slogan} onChange={e => setFormData({...formData, slogan: e.target.value})} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Website</label>
                                <input type="text" value={formData.website} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Email Oficial Suport</label>
                                <input type="email" value={formData.email} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500 mb-2">Configurări Financiare</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Monedă Sistem</label>
                                <select value={formData.currency} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white">
                                    <option>RON</option><option>EUR</option><option>USD</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Prefix Facturi</label>
                                <input type="text" value={formData.invoicePrefix} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">TVA (%)</label>
                                <input type="number" value={formData.taxRate} className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Language & Logo */}
                <div className="space-y-8">
                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 w-full text-center">Logo Platformă</h3>
                        <div className="w-32 h-32 bg-background-dark rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center group hover:border-primary-500 transition-colors cursor-pointer mb-6 shadow-inner">
                            <Icons.PlusIcon className="w-8 h-8 text-white/20 group-hover:text-primary-500" />
                            <span className="text-[8px] font-black uppercase mt-2 opacity-20 group-hover:opacity-100">Upload SVG</span>
                        </div>
                        <p className="text-[9px] text-center text-white/30 uppercase leading-relaxed px-4 italic">Recomandat: format vectorial .svg sau .png transparent (min 512px).</p>
                    </div>

                    <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 text-center">Limbă Interfață Hub</h3>
                        <div className="space-y-3">
                            {[
                                { id: 'ro', label: 'Română', flag: '🇷🇴' },
                                { id: 'en', label: 'English', flag: '🇺🇸' }
                            ].map(btn => (
                                <button 
                                    key={btn.id}
                                    onClick={() => setLanguage(btn.id as any)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${language === btn.id ? 'border-primary-500 bg-primary-500/5 text-white' : 'border-white/5 text-white/40 hover:border-white/20'}`}
                                >
                                    <span className="font-bold flex items-center gap-3"><span className="text-xl">{btn.flag}</span> {btn.label}</span>
                                    {language === btn.id && <Icons.CheckCircleIcon className="w-5 h-5 text-primary-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDetailsSettings;
