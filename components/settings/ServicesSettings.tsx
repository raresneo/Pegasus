
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Serviciu } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';

const ServicesSettings: React.FC = () => {
    const { servicii, addServiciu, updateServiciu, deleteServiciu, locations } = useDatabase();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentS, setCurrentS] = useState<Partial<Serviciu>>({ nume: '', descriere: '', pret: 0, categorie: 'Fitness', durataMinute: 60 });
    const [itemToDelete, setItemToDelete] = useState<Serviciu | null>(null);

    const openAdd = () => {
        setCurrentS({ nume: '', descriere: '', pret: 0, categorie: 'Fitness', durataMinute: 60, locatieId: locations[0]?.id });
        setIsFormOpen(true);
    };

    const handleSave = () => {
        if (!currentS.nume) return;
        if (currentS.id) {
            updateServiciu(currentS as Serviciu);
        } else {
            addServiciu(currentS as Omit<Serviciu, 'id'>);
        }
        setIsFormOpen(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <Modal 
                isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} 
                title="Șterge Serviciu" description={`Ești sigur că vrei să elimini serviciul ${itemToDelete?.nume}? Această acțiune este ireversibilă.`} 
                onConfirm={() => { deleteServiciu(itemToDelete!.id); setIsDeleteOpen(false); }} confirmText="Șterge" confirmColor="red" 
            />
            
            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentS.id ? 'Editare Serviciu' : 'Adăugare Serviciu Nou'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Nume Serviciu</label>
                        <input type="text" value={currentS.nume} onChange={e => setCurrentS({...currentS, nume: e.target.value})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-bold" placeholder="ex: Masaj Relaxare" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Preț (RON)</label>
                            <input type="number" value={currentS.pret} onChange={e => setCurrentS({...currentS, pret: parseFloat(e.target.value)})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Durată (min)</label>
                            <input type="number" value={currentS.durataMinute} onChange={e => setCurrentS({...currentS, durataMinute: parseInt(e.target.value)})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-bold" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Descriere Detaliată</label>
                        <textarea value={currentS.descriere} onChange={e => setCurrentS({...currentS, descriere: e.target.value})} rows={3} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl font-bold text-text-light-secondary transition-colors">Anulează</button>
                    <button onClick={handleSave} className="px-8 py-2 bg-primary-500 text-white rounded-xl font-black shadow-lg shadow-primary-500/20">Salvează Serviciul</button>
                </div>
            </FormModal>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Catalog Servicii</h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1">Servicii individuale, sesiuni de antrenament sau consultanță.</p>
                </div>
                <button onClick={openAdd} className="bg-primary-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-2">
                    <Icons.PlusIcon className="w-5 h-5" /> Serviciu Nou
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicii.map(s => (
                    <div key={s.id} className="bg-white dark:bg-card-dark p-6 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                         <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
                                <Icons.ClockIcon className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setCurrentS(s); setIsFormOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-background-dark rounded-xl transition-colors"><Icons.PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => { setItemToDelete(s); setIsDeleteOpen(true); }} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Icons.TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">{s.nume}</h3>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-2 line-clamp-2">{s.descriere}</p>
                        <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                            <span className="text-xl font-black text-primary-500">{s.pret} RON</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-60">{s.durataMinute} minute</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesSettings;
