
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { LinkGenerator, LinkGeneratorType, OnlineHubSettings } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';
import { useLanguage } from '../../context/LanguageContext';

const LinkGeneratorSettings: React.FC = () => {
    const { linkGenerators, addLinkGenerator, updateLinkGenerator, deleteLinkGenerator, onlineHubSettings, updateOnlineHubSettings } = useDatabase();
    const { t } = useLanguage();
    
    const [activeTab, setActiveTab] = useState<'links' | 'page_designer' | 'protection' | 'referral' | 'social'>('links');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    
    const [currentLg, setCurrentLg] = useState<Partial<LinkGenerator>>({ 
        name: '', type: 'booking', slug: '', isEnabled: true,
        heroText: 'Vino la antrenament!', theme: 'modern',
        protection: { enabled: false, type: 'card_on_file', feeAmount: 50 },
        dynamicPricing: { enabled: false, occupancyThreshold: 75, priceMultiplier: 1.2 }
    });
    const [selectedLg, setSelectedLg] = useState<LinkGenerator | null>(null);

    const openAdd = () => {
        setCurrentLg({ 
            name: '', type: 'booking', slug: '', isEnabled: true,
            heroText: 'Ești gata pentru o schimbare?', theme: 'modern',
            protection: { enabled: false, type: 'card_on_file', feeAmount: 50 },
            dynamicPricing: { enabled: false, occupancyThreshold: 75, priceMultiplier: 1.2 }
        });
        setIsFormOpen(true);
    };

    const handleSaveLink = () => {
        if (!currentLg.name || !currentLg.slug) {
            alert('Numele și slug-ul sunt obligatorii.');
            return;
        }
        if (currentLg.id) {
            updateLinkGenerator(currentLg as LinkGenerator);
        } else {
            addLinkGenerator(currentLg as Omit<LinkGenerator, 'id' | 'hits' | 'createdAt'>);
        }
        setIsFormOpen(false);
    };

    const getLinkUrl = (slug: string) => `${window.location.origin}/book/${slug}`;

    const renderLinkManager = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {linkGenerators.map(lg => (
                <div key={lg.id} className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl ${lg.isEnabled ? 'bg-primary-500/10 text-primary-500' : 'bg-gray-100 dark:bg-background-dark text-gray-400'}`}>
                                <Icons.LinkIcon className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${lg.isEnabled ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500' : 'bg-red-100 text-red-700'}`}>
                                    {lg.isEnabled ? 'Activ' : 'Inactiv'}
                                </span>
                                <button onClick={() => { setCurrentLg(lg); setIsFormOpen(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-background-dark rounded-lg text-text-light-secondary dark:text-text-dark-secondary">
                                    <Icons.PencilIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">{lg.name}</h3>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1 truncate font-mono">.../{lg.slug}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                            {lg.protection?.enabled && <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 text-[10px] font-bold rounded-md">Protejat</span>}
                            {lg.dynamicPricing?.enabled && <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 text-[10px] font-bold rounded-md">Dinamic</span>}
                        </div>
                    </div>
                    <div className="mt-auto border-t border-border-light dark:border-border-dark p-3 bg-gray-50 dark:bg-background-dark/30 flex justify-between items-center">
                        <span className="text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary flex items-center gap-1.5">
                            <Icons.ChartBarIcon className="w-3.5 h-3.5" /> {lg.hits} Vizite
                        </span>
                        <div className="flex gap-2">
                             <button onClick={() => { setSelectedLg(lg); setIsQrOpen(true); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-card-dark rounded-lg text-text-light-secondary dark:text-text-dark-secondary" title="Cod QR"><Icons.ViewGridIcon className="w-4 h-4" /></button>
                             <button onClick={() => { setSelectedLg(lg); setIsDeleteOpen(true); }} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg"><Icons.TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={openAdd} className="bg-white dark:bg-background-dark/30 rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark flex flex-col items-center justify-center p-8 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                <div className="p-4 bg-gray-100 dark:bg-card-dark rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Icons.PlusIcon className="w-8 h-8 text-primary-500" />
                </div>
                <span className="font-bold text-text-light-primary dark:text-text-dark-primary">Link Nou de Conversie</span>
                <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1 text-center">Transformă urmăritorii în clienți</span>
            </button>
        </div>
    );

    const renderPageDesigner = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn">
            <div className="space-y-8">
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-6">
                    <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary mb-6 flex items-center gap-2"><Icons.TemplateIcon className="w-5 h-5 text-primary-500" /> Configurare Aspect</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                            <div>
                                <p className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary">Permite Rezervări Online</p>
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Activat implicit pentru toate paginile noi.</p>
                            </div>
                            <button onClick={() => updateOnlineHubSettings({...onlineHubSettings, letCustomersBookOnline: !onlineHubSettings.letCustomersBookOnline})} 
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${onlineHubSettings.letCustomersBookOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${onlineHubSettings.letCustomersBookOnline ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-3">Tema Vizuală</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['modern', 'fitness_dark', 'bright_energetic'].map(t => (
                                    <button key={t} onClick={() => setCurrentLg({...currentLg, theme: t as any})} className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${currentLg.theme === t ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'border-border-light dark:border-border-dark hover:border-primary-400 text-text-light-primary dark:text-text-dark-primary'}`}>{t.replace('_', ' ')}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2">Titlu Principal (Hero)</label>
                            <input type="text" value={currentLg.heroText} onChange={e => setCurrentLg({...currentLg, heroText: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 outline-none font-bold" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-6">
                    <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary mb-2 flex items-center gap-2"><Icons.GlobeAltIcon className="w-5 h-5 text-blue-500" /> Google Business Profile</h3>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-6">Afișează automat recenziile de pe Google Maps direct pe pagină.</p>
                    <button onClick={() => updateOnlineHubSettings({...onlineHubSettings, googleBusinessConnected: !onlineHubSettings.googleBusinessConnected})} 
                            className={`w-full py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${onlineHubSettings.googleBusinessConnected ? 'bg-green-50 border-green-500 text-green-700' : 'border-border-light dark:border-border-dark hover:bg-gray-50 text-text-light-primary dark:text-text-dark-primary'}`}>
                        {onlineHubSettings.googleBusinessConnected ? <Icons.CheckCircleIcon className="w-5 h-5"/> : <Icons.PlusIcon className="w-5 h-5"/>}
                        {onlineHubSettings.googleBusinessConnected ? 'Conectat la Google' : 'Conectează Google My Business'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-4">Previzualizare Live Mobil</p>
                <div className="w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[10px] border-gray-800 shadow-2xl overflow-hidden relative">
                    <div className="h-full w-full bg-white dark:bg-background-dark overflow-y-auto pb-10">
                        <div className={`h-40 p-6 flex flex-col justify-end ${currentLg.theme === 'modern' ? 'bg-gradient-to-br from-primary-600 to-indigo-700' : currentLg.theme === 'fitness_dark' ? 'bg-gray-900' : 'bg-orange-500'}`}>
                            <h4 className="text-white font-black text-xl leading-tight uppercase">Fitable</h4>
                            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Performanță fără limite</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-1">
                                <h5 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{currentLg.heroText}</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">Rezervă o sesiune și începe azi</p>
                            </div>
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{i === 1 ? 'Personal Training' : 'Yoga Morning'}</span>
                                            <span className="text-xs font-black text-primary-500">25 Lei</span>
                                        </div>
                                        <button className={`w-full mt-3 py-2 text-white rounded-xl text-xs font-black uppercase shadow-md ${currentLg.theme === 'bright_energetic' ? 'bg-orange-500' : 'bg-primary-500'}`}>Rezervă Locul</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
                </div>
            </div>
        </div>
    );

    const renderProtectionPricing = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-8">
                    <h3 className="text-xl font-black flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2"><Icons.ShieldCheckIcon className="w-6 h-6" /> Protecție No-Show</h3>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-8">Reduce rata de absențe prin colectarea garanțiilor.</p>
                    
                    <div className="space-y-6">
                        <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 space-y-5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-5 w-5 rounded text-purple-600 border-purple-300 dark:bg-card-dark" />
                                <span className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary">Activează Penalizările</span>
                            </label>
                            <div className="grid grid-cols-1 gap-3 pl-8 text-sm text-text-light-primary dark:text-text-dark-primary font-semibold">
                                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="prot" defaultChecked /> Garanție Card (Se taxează doar la absență)</label>
                                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="prot" /> Depozit Fix (Lei)</label>
                                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="prot" /> Plată Integrală</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-text-light-secondary dark:text-text-dark-secondary mb-2 tracking-widest">Suma Penalizare (Lei)</label>
                            <input type="number" defaultValue="50" className="w-full p-3 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary font-bold focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-8">
                    <h3 className="text-xl font-black flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2"><Icons.FireIcon className="w-6 h-6" /> Prețuri Dinamice</h3>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-8">Ajustează automat prețul în funcție de cerere.</p>
                    
                    <div className="space-y-6">
                        <div className="p-5 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-5 w-5 rounded text-orange-600 border-orange-300 dark:bg-card-dark" />
                                <span className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary">Activare Tarif Vârf (Surge)</span>
                            </label>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-3">
                                <span>Prag Ocupare Sala</span>
                                <span className="text-orange-600 dark:text-orange-400 font-black">75% Plină</span>
                            </div>
                            <input type="range" className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                            <p className="mt-4 text-[11px] text-text-light-secondary dark:text-text-dark-secondary italic leading-relaxed">
                                Când sala atinge acest prag, prețul serviciilor rezervate online va crește cu multiplicatorul setat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReferralSettings = () => (
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-8 animate-fadeIn max-w-4xl">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
                        <Icons.GiftIcon className="w-6 h-6" /> Configurare Comisioane Recomandări
                    </h3>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Definește recompensele oferite clienților care devin agenți de marketing pentru sala ta.</p>
                </div>
                <button onClick={() => updateOnlineHubSettings({...onlineHubSettings, referralEnabled: !onlineHubSettings.referralEnabled})} 
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${onlineHubSettings.referralEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${onlineHubSettings.referralEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
            </div>
            
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-3">Model Recompensă</label>
                            <div className="space-y-3">
                                {[
                                    { id: 'fixed', label: 'Sumă Fixă (Cashback)', desc: 'Fonduri adăugate în portofelul virtual.' },
                                    { id: 'percentage', label: 'Procent din Achiziție', desc: '% din valoarea primului abonament.' },
                                    { id: 'days', label: 'Zile Bonus', desc: 'Extinderea automată a abonamentului.' }
                                ].map(model => (
                                    <label key={model.id} className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${onlineHubSettings.referralRewardType === model.id ? 'border-primary-500 bg-primary-500/5' : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-background-dark'}`}>
                                        <input 
                                            type="radio" 
                                            name="rewardType" 
                                            checked={onlineHubSettings.referralRewardType === model.id} 
                                            onChange={() => updateOnlineHubSettings({...onlineHubSettings, referralRewardType: model.id as any})} 
                                            className="mt-1 h-4 w-4 text-primary-500" 
                                        />
                                        <div>
                                            <p className="text-sm font-bold">{model.label}</p>
                                            <p className="text-[11px] opacity-60 leading-tight">{model.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-3">Valoare Comision per Conversie</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={onlineHubSettings.referralRewardAmount} 
                                    onChange={e => updateOnlineHubSettings({...onlineHubSettings, referralRewardAmount: parseInt(e.target.value) || 0})}
                                    className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark text-xl font-black pr-20 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-primary-500 uppercase">
                                    {onlineHubSettings.referralRewardType === 'fixed' ? onlineHubSettings.referralRewardCurrency : onlineHubSettings.referralRewardType === 'percentage' ? '%' : 'Zile'}
                                </span>
                            </div>
                            <p className="mt-3 text-xs text-text-light-secondary dark:text-text-dark-secondary italic leading-relaxed">
                                Sfat: Un comision de {onlineHubSettings.referralRewardType === 'percentage' ? '15-20%' : '50 RON'} este de obicei suficient pentru a motiva clienții activi.
                            </p>
                        </div>
                        
                        <div className="p-6 bg-yellow-500/5 rounded-2xl border border-yellow-500/20">
                             <h4 className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-2">Regulă de Validare</h4>
                             <p className="text-xs opacity-80 leading-relaxed">Comisionul este eliberat doar după ce noul client efectuează plata și trece de perioada de "Cooling off" (implicit 24h).</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSocialIntegrations = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {[
                { name: 'Google Business', desc: 'Sincronizează cu Maps și adaugă butonul "Rezervă".', icon: Icons.MapPinIcon, color: 'text-blue-500', btn: 'Conectează' },
                { name: 'Facebook Hub', desc: 'Conversie directă de pe pagina ta prin butonul "Now".', icon: Icons.UsersIcon, color: 'text-blue-700', btn: 'Link Pagina' },
                { name: 'Instagram Flow', desc: 'Buton de programare direct în profilul tău de fitness.', icon: Icons.FaceSmileIcon, color: 'text-pink-500', btn: 'Activare IG' },
                { name: 'TikTok Link', desc: 'Sursă dedicată pentru link-ul din Bio-ul TikTok.', icon: Icons.SparklesIcon, color: 'text-gray-900 dark:text-white', btn: 'Setări Bio' }
            ].map(i => (
                <div key={i.name} className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-border-light dark:border-border-dark flex flex-col items-center text-center group transition-all hover:border-primary-500/50">
                    <div className={`p-4 bg-gray-100 dark:bg-background-dark rounded-2xl mb-4 group-hover:scale-110 transition-transform ${i.color}`}>
                        <i.icon className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-text-light-primary dark:text-text-dark-primary text-lg">{i.name}</h4>
                    <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-2 mb-6 flex-grow leading-relaxed">{i.desc}</p>
                    <button className="w-full py-2.5 rounded-xl bg-gray-50 dark:bg-background-dark text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white text-text-light-primary dark:text-text-dark-primary transition-all border border-border-light dark:border-border-dark">{i.btn}</button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Șterge Link" description="Sigur vrei să elimini acest link? Clienții care îl accesează vor vedea o pagină de eroare." onConfirm={() => { deleteLinkGenerator(selectedLg!.id); setIsDeleteOpen(false); }} confirmText="Șterge" confirmColor="red" />
            
            <FormModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title={`Cod QR: ${selectedLg?.name}`}>
                <div className="flex flex-col items-center p-6 text-center">
                    <div className="bg-white p-6 rounded-3xl mb-8 shadow-xl border border-gray-100">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getLinkUrl(selectedLg?.slug || ''))}`} alt="QR" width="250" height="250" />
                    </div>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-8 font-semibold">Descarcă acest cod pentru afișele din sală sau flyere promotionale.</p>
                    <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-3 bg-primary-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
                        <Icons.PrinterIcon className="w-6 h-6" /> Printează QR
                    </button>
                </div>
            </FormModal>

            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentLg.id ? 'Editare Campanie' : 'Generare Campanie Nouă'}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2">Nume Intern Link</label>
                        <input type="text" value={currentLg.name} onChange={e => setCurrentLg({...currentLg, name: e.target.value})} placeholder="ex: Reducere Black Friday IG" className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary font-bold" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2">Tip Conversie</label>
                            <select value={currentLg.type} onChange={e => setCurrentLg({...currentLg, type: e.target.value as LinkGeneratorType})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary font-bold">
                                <option value="booking">Rezervare Online</option>
                                <option value="service">Vânzare Abonament</option>
                                <option value="form">Captare Lead-uri</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2">Slug URL (Personalizat)</label>
                            <input type="text" value={currentLg.slug} onChange={e => setCurrentLg({...currentLg, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="oferta-limitata" className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary font-mono" />
                        </div>
                    </div>
                </div>
                <div className="mt-10 flex justify-end gap-3">
                    <button onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-background-dark transition-colors">Anulează</button>
                    <button onClick={handleSaveLink} className="px-8 py-3 bg-primary-500 text-white rounded-xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Salvează Link-ul</button>
                </div>
            </FormModal>

            <div className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-text-light-primary dark:text-text-dark-primary">Online Growth Hub</h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 font-semibold">Gestionează prezența digitală și fluxul de clienți online.</p>
                    </div>
                    <button onClick={openAdd} className="bg-primary-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3">
                        <Icons.PlusIcon className="w-6 h-6" /> Generează Link Nou
                    </button>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-card-dark rounded-2xl w-fit border border-border-light dark:border-border-dark overflow-x-auto">
                    {[
                        { id: 'links', label: 'Link Manager', icon: Icons.LinkIcon },
                        { id: 'page_designer', label: 'Designer Pagină', icon: Icons.TemplateIcon },
                        { id: 'protection', label: 'Protecție & Prețuri', icon: Icons.ShieldCheckIcon },
                        { id: 'referral', label: 'Comisioane Recomandări', icon: Icons.GiftIcon },
                        { id: 'social', label: 'Integrări Sociale', icon: Icons.GlobeAltIcon }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-background-dark shadow-sm text-primary-500' : 'text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main>
                {activeTab === 'links' && renderLinkManager()}
                {activeTab === 'page_designer' && renderPageDesigner()}
                {activeTab === 'protection' && renderProtectionPricing()}
                {activeTab === 'referral' && renderReferralSettings()}
                {activeTab === 'social' && renderSocialIntegrations()}
            </main>
        </div>
    );
};

export default LinkGeneratorSettings;
