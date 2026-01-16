
import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Asset, TaxonomyItem } from '../types';
import * as Icons from '../components/icons';
import { format, parseISO, isPast, add, differenceInDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';
import { useNotifications } from '../context/NotificationContext';

const AssetHealthIndicator: React.FC<{ asset: Asset }> = ({ asset }) => {
    const today = new Date();
    const nextDate = parseISO(asset.nextMaintenance);
    const lastDate = parseISO(asset.lastMaintenance);
    
    // Calculăm procentul de sănătate bazat pe intervalul de mentenanță (6 luni implicit)
    const totalIntervalDays = differenceInDays(nextDate, lastDate) || 180;
    const daysSinceLast = differenceInDays(today, lastDate);
    const daysRemaining = differenceInDays(nextDate, today);

    let percentage = Math.max(0, Math.min(100, 100 - (daysSinceLast / totalIntervalDays * 100)));
    
    if (asset.status === 'repair') percentage = 0;
    if (asset.status === 'needs_service') percentage = Math.min(percentage, 30);
    if (isPast(nextDate)) percentage = Math.min(percentage, 10);

    const color = percentage > 70 ? 'bg-green-500' : percentage > 30 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="w-full space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-40">
                <span>Health Score</span>
                <span>{Math.round(percentage)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-[8px] font-bold opacity-30 text-right uppercase">
                {daysRemaining > 0 ? `Revizie peste ${daysRemaining} zile` : 'Termen mentenanță depășit'}
            </p>
        </div>
    );
};

const AssetsPage: React.FC = () => {
    const { assets, addAsset, updateAsset, deleteAsset, locations, assetCategories } = useDatabase();
    const { notify } = useNotifications();
    
    const [activeCategoryId, setActiveCategoryId] = useState<string | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<Partial<Asset>>({
        name: '',
        category: '',
        status: 'operational',
        locationId: locations[0]?.id || 'loc_central'
    });
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

    const filteredAssets = useMemo(() => {
        return assets.filter(a => {
            const matchesCategory = activeCategoryId === 'All' || a.category === activeCategoryId;
            const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [assets, activeCategoryId, searchTerm]);

    const stats = useMemo(() => {
        const total = assets.length;
        const operational = assets.filter(a => a.status === 'operational').length;
        const needsService = assets.filter(a => a.status === 'needs_service' || isPast(parseISO(a.nextMaintenance))).length;
        const inRepair = assets.filter(a => a.status === 'repair').length;
        return { total, operational, needsService, inRepair };
    }, [assets]);

    const handleSave = () => {
        if (!currentAsset.name || !currentAsset.category) {
            alert('Denumirea și categoria sunt necesare.');
            return;
        }
        
        const now = new Date().toISOString();
        const next = add(new Date(), { months: 6 }).toISOString();

        if (currentAsset.id) {
            updateAsset(currentAsset as Asset);
            notify("Echipament actualizat cu succes.", "success");
        } else {
            addAsset({
                ...currentAsset as Omit<Asset, 'id'>,
                lastMaintenance: now,
                nextMaintenance: next
            });
            notify("Echipament nou indexat în inventar.", "success");
        }
        setIsFormOpen(false);
    };

    const handleDelete = () => {
        if (assetToDelete) {
            deleteAsset(assetToDelete.id);
            setIsDeleteOpen(false);
            setAssetToDelete(null);
            notify("Activul a fost eliminat din baza de date.", "info");
        }
    };

    const handlePerformMaintenance = (asset: Asset) => {
        const updated: Asset = {
            ...asset,
            lastMaintenance: new Date().toISOString(),
            nextMaintenance: add(new Date(), { months: 6 }).toISOString(),
            status: 'operational'
        };
        updateAsset(updated);
        notify(`Mentenanță confirmată pentru ${asset.name}. Următoarea revizie programată: ${format(add(new Date(), {months: 6}), 'dd MMM yyyy')}`, "success");
    };

    const getStatusUI = (status: Asset['status']) => {
        switch(status) {
            case 'operational': return { label: 'Funcțional', color: 'bg-green-500/10 text-green-500', dot: 'bg-green-500' };
            case 'needs_service': return { label: 'Revizie Necesară', color: 'bg-yellow-500/10 text-yellow-500', dot: 'bg-yellow-500' };
            case 'repair': return { label: 'Inoperabil / Reparație', color: 'bg-red-500/10 text-red-500', dot: 'bg-red-500' };
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-fadeIn">
            <Modal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                title="Eliminare Activ" 
                description={`Ești sigur că vrei să ștergi definitiv ${assetToDelete?.name}? Această acțiune va șterge și istoricul de mentenanță.`} 
                onConfirm={handleDelete} 
                confirmText="Șterge Activ" 
                confirmColor="red" 
            />

            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentAsset.id ? 'Editare Activ' : 'Adăugare Activ Pegasus'}>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary opacity-60 ml-1">Nume Echipament / Serie</label>
                        <input type="text" value={currentAsset.name} onChange={e => setCurrentAsset({...currentAsset, name: e.target.value})} placeholder="ex: Matrix T70 Treadmill #01" className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none focus:ring-2 focus:ring-primary-500 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary opacity-60 ml-1">Categorie Core</label>
                            <select value={currentAsset.category} onChange={e => setCurrentAsset({...currentAsset, category: e.target.value})} className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none text-white">
                                <option value="">Selectează...</option>
                                {assetCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary opacity-60 ml-1">Locație Nod</label>
                            <select value={currentAsset.locationId} onChange={e => setCurrentAsset({...currentAsset, locationId: e.target.value})} className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none text-white">
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary opacity-60 ml-1">Status Operațional</label>
                        <select value={currentAsset.status} onChange={e => setCurrentAsset({...currentAsset, status: e.target.value as any})} className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none text-white">
                            <option value="operational">Operațional</option>
                            <option value="needs_service">Mentenanță Planificată</option>
                            <option value="repair">Defect / Reparație Capitală</option>
                        </select>
                    </div>
                </div>
                <div className="mt-10 flex gap-3">
                    <button onClick={() => setIsFormOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white/5 hover:bg-white/10 transition-all text-white">Anulează</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-primary-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Salvează Activ</button>
                </div>
            </FormModal>

            <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white leading-none italic">Asset Hub Explorer</h1>
                    <p className="text-white/40 mt-4 font-bold text-lg tracking-tight">Monitorizarea integrității infrastructurii mecanice.</p>
                </div>
                <button onClick={() => { setCurrentAsset({ name: '', category: assetCategories[0]?.id || '', status: 'operational', locationId: locations[0]?.id || 'loc_central' }); setIsFormOpen(true); }} className="bg-primary-500 text-black px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3 active:scale-95">
                    <Icons.PlusIcon className="w-6 h-6" /> Adaugă Activ Nou
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Totale', value: stats.total, icon: Icons.ArchiveIcon, color: 'text-primary-500' },
                    { label: 'Operaționale', value: stats.operational, icon: Icons.CheckCircleIcon, color: 'text-green-500' },
                    { label: 'Revizie Urgentă', value: stats.needsService, icon: Icons.ClockIcon, color: 'text-yellow-500' },
                    { label: 'Inoperabile', value: stats.inRepair, icon: Icons.WrenchScrewdriverIcon, color: 'text-red-500' },
                ].map((s, i) => (
                    <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                        <div className="flex justify-between items-start mb-6">
                             <div className="p-3 bg-white/5 rounded-xl">
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                             </div>
                             <span className="text-3xl font-black">{s.value}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 p-1.5 bg-card-dark rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                    <button 
                        onClick={() => setActiveCategoryId('All')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategoryId === 'All' ? 'bg-primary-500 text-black' : 'text-white/40 hover:text-white'}`}
                    >
                        Toate Activele
                    </button>
                    {assetCategories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCategoryId(cat.id)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-primary-500 text-black' : 'text-white/40 hover:text-white'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-80">
                    <Icons.SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 opacity-40" />
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Caută activ după nume..." 
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredAssets.map(asset => {
                    const status = getStatusUI(asset.status);
                    const category = assetCategories.find(c => c.id === asset.category);
                    const isOverdue = isPast(parseISO(asset.nextMaintenance)) && asset.status !== 'repair';

                    return (
                        <div key={asset.id} className={`glass-card rounded-[3rem] border transition-all duration-500 group overflow-hidden ${isOverdue ? 'border-red-500/30' : 'border-white/5 hover:border-primary-500/50'}`}>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-primary-500 transition-colors">{asset.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{category?.name || 'Diverse'} • {locations.find(l => l.id === asset.locationId)?.name}</p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${status.color} border-current/20`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${asset.status === 'needs_service' ? 'animate-pulse' : ''}`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{status.label}</span>
                                    </div>
                                </div>

                                <AssetHealthIndicator asset={asset} />

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Ultima Revizie</p>
                                        <p className="text-[11px] font-black">{format(parseISO(asset.lastMaintenance), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-black/20 border-white/5'}`}>
                                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isOverdue ? 'text-red-400' : 'text-white/20'}`}>Următoarea Dată</p>
                                        <p className={`text-[11px] font-black ${isOverdue ? 'text-red-400' : 'text-white'}`}>{format(parseISO(asset.nextMaintenance), 'dd MMM yyyy')}</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <button 
                                        onClick={() => handlePerformMaintenance(asset)}
                                        className="flex-1 bg-white dark:bg-card-dark text-text-light-primary dark:text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-white/10 hover:bg-primary-500 hover:text-black transition-all active:scale-95 shadow-sm"
                                    >
                                        Efectuează Mentenanță
                                    </button>
                                    <button 
                                        onClick={() => { setCurrentAsset(asset); setIsFormOpen(true); }}
                                        className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-primary-500 hover:bg-white/10 transition-all border border-white/5"
                                    >
                                        <Icons.PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => { setAssetToDelete(asset); setIsDeleteOpen(true); }}
                                        className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"
                                    >
                                        <Icons.TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredAssets.length === 0 && (
                    <div className="col-span-full py-32 text-center opacity-20">
                         <Icons.WrenchScrewdriverIcon className="w-20 h-20 mx-auto mb-6" />
                         <p className="font-black text-xl uppercase tracking-widest italic">Niciun activ găsit în această bază de date.</p>
                    </div>
                )}
            </div>
            
            <div className="p-10 bg-accent-600 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 gold-shimmer opacity-10 pointer-events-none"></div>
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-xl">
                            <Icons.ShieldCheckIcon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter text-white italic">Mentenanță Predictivă AI</h4>
                            <p className="text-white/60 font-medium text-sm max-w-md mt-1 leading-relaxed">Pegasus Core v4.0 analizează frecvența de utilizare a fiecărui nod pentru a propune automat intervale de mentenanță optimizate.</p>
                        </div>
                    </div>
                    <button className="px-10 py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-white hover:text-black transition-all">Descarcă Jurnal Service (PDF)</button>
                 </div>
            </div>
        </div>
    );
};

export default AssetsPage;
