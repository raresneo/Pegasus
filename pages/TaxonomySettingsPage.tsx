
import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TaxonomyItem } from '../types';
import * as Icons from '../components/icons';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';

type DictionaryType = 'asset' | 'product' | 'client' | 'task';

const TaxonomySettingsPage: React.FC = () => {
    const { 
        assetCategories, productCategories, clientTags, taskTags,
        addTaxonomyItem, updateTaxonomyItem, deleteTaxonomyItem 
    } = useDatabase();

    const [activeDict, setActiveDict] = useState<DictionaryType>('asset');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<TaxonomyItem>>({ name: '', description: '', color: '', icon: 'ArchiveIcon' });
    const [itemToDelete, setItemToDelete] = useState<TaxonomyItem | null>(null);

    const getDictData = () => {
        switch(activeDict) {
            case 'asset': return assetCategories;
            case 'product': return productCategories;
            case 'client': return clientTags;
            case 'task': return taskTags;
        }
    };

    const handleSave = () => {
        if (!currentItem.name) return;
        if (currentItem.id) {
            updateTaxonomyItem(activeDict, currentItem as TaxonomyItem);
        } else {
            addTaxonomyItem(activeDict, currentItem as Omit<TaxonomyItem, 'id'>);
        }
        setIsFormOpen(false);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteTaxonomyItem(activeDict, itemToDelete.id);
            setIsDeleteOpen(false);
            setItemToDelete(null);
        }
    };

    const dictTabs = [
        { id: 'asset', label: 'Categorii Echipamente', icon: Icons.WrenchScrewdriverIcon },
        { id: 'product', label: 'Categorii POS', icon: Icons.ShoppingCartIcon },
        { id: 'client', label: 'Etichete Clienți', icon: Icons.UsersIcon },
        { id: 'task', label: 'Tipuri Task-uri', icon: Icons.ClipboardListIcon },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn pb-20">
            <Modal 
                isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} 
                title="Șterge Element" description={`Sigur vrei să elimini "${itemToDelete?.name}"? Această acțiune poate afecta datele asociate.`} 
                onConfirm={confirmDelete} confirmText="Șterge" confirmColor="red" 
            />

            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentItem.id ? 'Editare Element' : 'Adăugare Element Nou'}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Nume Afișat</label>
                        <input type="text" value={currentItem.name} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-bold outline-none focus:ring-2 focus:ring-primary-500" placeholder="ex: Diagnostic Imagistic" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Descriere (Opțional)</label>
                        <textarea value={currentItem.description} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm" />
                    </div>
                    { (activeDict === 'client' || activeDict === 'task') && (
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Culoare Etichetă (Tailwind Class)</label>
                            <input type="text" value={currentItem.color} onChange={e => setCurrentItem({...currentItem, color: e.target.value})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-mono text-xs" placeholder="ex: bg-blue-500/20 text-blue-500" />
                        </div>
                    )}
                </div>
                <div className="mt-10 flex justify-end gap-3">
                    <button onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors uppercase text-xs">Anulează</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-primary-500 text-white rounded-xl font-black shadow-lg shadow-primary-500/20 uppercase text-xs tracking-widest">Salvează</button>
                </div>
            </FormModal>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Nomenclatoare Core</h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary font-medium mt-1">Configurează structura de date pentru a se potrivi modelului tău de business.</p>
                </div>
                <button onClick={() => { setCurrentItem({ name: '', description: '', color: '', icon: 'ArchiveIcon' }); setIsFormOpen(true); }} className="bg-primary-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3 active:scale-95">
                    <Icons.PlusIcon className="w-6 h-6" /> Element Nou
                </button>
            </header>

            <div className="flex gap-2 overflow-x-auto p-1.5 bg-gray-100 dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark w-fit">
                {dictTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveDict(tab.id as DictionaryType)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeDict === tab.id ? 'bg-white dark:bg-background-dark shadow-sm text-primary-500' : 'text-gray-500 hover:text-text-light-primary dark:hover:text-white'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDictData().map(item => (
                    <div key={item.id} className="bg-white dark:bg-card-dark p-6 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col justify-between">
                        <div>
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl group-hover:scale-110 transition-transform">
                                    <Icons.ArchiveIcon className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentItem(item); setIsFormOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-background-dark rounded-lg"><Icons.PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => { setItemToDelete(item); setIsDeleteOpen(true); }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Icons.TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight">{item.name}</h3>
                            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-2 line-clamp-2 leading-relaxed">{item.description || 'Nicio descriere adăugată.'}</p>
                        </div>
                        {(activeDict === 'client' || activeDict === 'task') && item.color && (
                            <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.color}`}>Mostră Etichetă</span>
                            </div>
                        )}
                    </div>
                ))}
                {getDictData().length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-background-dark/30 rounded-[3rem] border-2 border-dashed border-border-light dark:border-border-dark flex flex-col items-center">
                        <Icons.ArchiveIcon className="w-16 h-16 opacity-10 mb-4" />
                        <p className="font-black text-xs uppercase tracking-widest opacity-30">Niciun element definit în acest dicționar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxonomySettingsPage;
