
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { OfertaSpeciala } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';

const SpecialOffersSettings: React.FC = () => {
    const { oferteSpeciale, addOfertaSpeciala, updateOfertaSpeciala, deleteOfertaSpeciala, addLinkGenerator } = useDatabase();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentO, setCurrentO] = useState<Partial<OfertaSpeciala>>({ nume: '', descriere: '', pret: 0, tipTinta: 'abonament', slug: '', textBadge: 'PROMO' });
    const [itemToDelete, setItemToDelete] = useState<OfertaSpeciala | null>(null);

    const openAdd = () => {
        setCurrentO({ nume: '', descriere: '', pret: 0, tipTinta: 'abonament', slug: '', textBadge: 'PROMO', valabilaPanaLa: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
        setIsFormOpen(true);
    };

    const handleSave = () => {
        if (!currentO.nume || !currentO.slug) return;
        if (currentO.id) {
            updateOfertaSpeciala(currentO as OfertaSpeciala);
        } else {
            addOfertaSpeciala(currentO as Omit<OfertaSpeciala, 'id'>);
        }
        setIsFormOpen(false);
    };

    const handleGenerateLink = (o: OfertaSpeciala) => {
        addLinkGenerator({
            name: `Oferta: ${o.nume}`,
            type: 'offer',
            targetId: o.id,
            targetType: 'oferta_speciala',
            slug: o.slug,
            isEnabled: true,
            heroText: o.nume,
            theme: 'bright_energetic'
        });
        alert('Link-ul de achiziție a fost generat în Online Growth Hub!');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <Modal 
                isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} 
                title="Șterge Oferta" description={`Ești sigur că vrei să elimini oferta ${itemToDelete?.nume}? Link-urile asociate nu vor mai funcționa.`} 
                onConfirm={() => { deleteOfertaSpeciala(itemToDelete!.id); setIsDeleteOpen(false); }} confirmText="Șterge" confirmColor="red" 
            />
            
            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentO.id ? 'Editare Ofertă' : 'Creare Ofertă Specială'}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Nume Promoție</label>
                        <input type="text" value={currentO.nume} onChange={e => setCurrentO({...currentO, nume: e.target.value})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-bold" placeholder="ex: Black Friday PT" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Preț Oferta (RON)</label>
                            <input type="number" value={currentO.pret} onChange={e => setCurrentO({...currentO, pret: parseFloat(e.target.value)})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Slug URL (unic)</label>
                            <input type="text" value={currentO.slug} onChange={e => setCurrentO({...currentO, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="oferta-limitata" className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-mono text-xs" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 opacity-60">Valabilă Până la</label>
                        <input type="date" value={currentO.valabilaPanaLa?.split('T')[0]} onChange={e => setCurrentO({...currentO, valabilaPanaLa: e.target.value})} className="p-3 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl font-bold text-text-light-secondary transition-colors">Anulează</button>
                    <button onClick={handleSave} className="px-8 py-2 bg-primary-500 text-white rounded-xl font-black shadow-lg">Activează Oferta</button>
                </div>
            </FormModal>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-primary-500">Motor Oferte Speciale</h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1">Configurează pachete promoționale și link-uri de vânzare directă.</p>
                </div>
                <button onClick={openAdd} className="bg-primary-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3">
                    <Icons.GiftIcon className="w-6 h-6" /> Ofertă Nouă
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {oferteSpeciale.map(o => (
                    <div key={o.id} className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col md:flex-row">
                        <div className="p-8 flex-1 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="px-3 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">{o.textBadge}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentO(o); setIsFormOpen(true); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Icons.PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => { setItemToDelete(o); setIsDeleteOpen(true); }} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Icons.TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">{o.nume}</h3>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary italic">"{o.descriere}"</p>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                                <Icons.ClockIcon className="w-4 h-4" /> Expiră pe {o.valabilaPanaLa}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-background-dark/50 p-8 w-full md:w-64 flex flex-col justify-between items-center border-l border-border-light dark:border-border-dark text-center">
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Preț Special</p>
                                <p className="text-4xl font-black text-primary-500">{o.pret} RON</p>
                             </div>
                             <button onClick={() => handleGenerateLink(o)} className="w-full mt-6 py-4 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm">
                                Generează Link Achiziție
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecialOffersSettings;
