
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { CustomFieldDefinition, CustomFieldType } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';
import { useNotifications } from '../../context/NotificationContext';

const FIELD_TYPES: { id: CustomFieldType; label: string; icon: any }[] = [
    { id: 'text', label: 'Text Scurt', icon: Icons.DocumentTextIcon },
    { id: 'number', label: 'Număr', icon: Icons.ChartBarIcon },
    { id: 'boolean', label: 'Comutator (Da/Nu)', icon: Icons.AdjustmentsIcon },
    { id: 'date', label: 'Dată', icon: Icons.CalendarIcon },
    { id: 'select', label: 'Listă Selecție', icon: Icons.ViewListIcon },
];

const CustomFieldsSettings: React.FC = () => {
    const { memberCustomFields, addCustomField, updateCustomField, deleteCustomField } = useDatabase();
    const { notify } = useNotifications();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<CustomFieldDefinition | null>(null);
    const [editingField, setEditingField] = useState<Partial<CustomFieldDefinition>>({
        name: '',
        label: '',
        type: 'text',
        required: false,
        options: []
    });

    const [newOption, setNewOption] = useState('');

    const openAdd = () => {
        setEditingField({ name: '', label: '', type: 'text', required: false, options: [] });
        setIsFormOpen(true);
    };

    const openEdit = (field: CustomFieldDefinition) => {
        setEditingField(field);
        setIsFormOpen(true);
    };

    const handleSave = () => {
        if (!editingField.name || !editingField.label) {
            alert('Numele și eticheta sunt obligatorii.');
            return;
        }

        if (editingField.id) {
            updateCustomField(editingField as CustomFieldDefinition);
            notify("Câmp actualizat.");
        } else {
            addCustomField(editingField as Omit<CustomFieldDefinition, 'id'>);
            notify("Câmp nou adăugat în sistem.");
        }
        setIsFormOpen(false);
    };

    const handleAddOption = () => {
        if (!newOption.trim()) return;
        setEditingField(prev => ({
            ...prev,
            options: [...(prev.options || []), newOption.trim()]
        }));
        setNewOption('');
    };

    const removeOption = (idx: number) => {
        setEditingField(prev => ({
            ...prev,
            options: prev.options?.filter((_, i) => i !== idx)
        }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn pb-20">
            <Modal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                title="Eliminare Câmp" 
                description={`Sigur vrei să ștergi câmpul "${fieldToDelete?.name}"? Datele deja salvate în profilele membrilor nu vor mai fi vizibile.`} 
                onConfirm={() => { deleteCustomField(fieldToDelete!.id); setIsDeleteOpen(false); }} 
                confirmText="Șterge" 
                confirmColor="red" 
            />

            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingField.id ? 'Editare Câmp' : 'Adăugare Atribut Nou'}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nume Intern (Slug)</label>
                            <input 
                                type="text" 
                                value={editingField.name} 
                                onChange={e => setEditingField({...editingField, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                placeholder="ex: clothing_size"
                                className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none focus:ring-2 focus:ring-primary-500 text-white" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Etichetă Afișată</label>
                            <input 
                                type="text" 
                                value={editingField.label} 
                                onChange={e => setEditingField({...editingField, label: e.target.value})}
                                placeholder="ex: Mărime Echipament"
                                className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none focus:ring-2 focus:ring-primary-500 text-white" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Tip de Date</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {FIELD_TYPES.map(ft => (
                                <button 
                                    key={ft.id}
                                    onClick={() => setEditingField({...editingField, type: ft.id})}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${editingField.type === ft.id ? 'border-primary-500 bg-primary-500/10 text-white shadow-lg' : 'border-white/5 bg-background-dark text-white/40 hover:border-white/20'}`}
                                >
                                    <ft.icon className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{ft.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {editingField.type === 'select' && (
                        <div className="space-y-4 p-5 bg-background-dark rounded-2xl border border-white/10">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Opțiuni Listă</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newOption} 
                                    onChange={e => setNewOption(e.target.value)}
                                    placeholder="Adaugă opțiune..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold outline-none"
                                />
                                <button onClick={handleAddOption} className="bg-primary-500 text-black px-4 rounded-xl font-black uppercase text-[10px]">+</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {editingField.options?.map((opt, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold flex items-center gap-2">
                                        {opt}
                                        <button onClick={() => removeOption(i)} className="text-red-500 hover:text-red-400 font-black">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                        <div>
                            <p className="font-bold text-sm text-white">Câmp Obligatoriu</p>
                            <p className="text-[10px] opacity-40 uppercase font-black">Forțează completarea în profilele noi</p>
                        </div>
                        <button onClick={() => setEditingField({...editingField, required: !editingField.required})} 
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingField.required ? 'bg-green-500' : 'bg-white/10'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingField.required ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
                <div className="mt-10 flex gap-3">
                    <button onClick={() => setIsFormOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white/5 hover:bg-white/10 transition-all text-white">Anulează</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-primary-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Salvează Configurația</button>
                </div>
            </FormModal>

            <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white leading-none italic">Câmpuri Personalizate</h1>
                    <p className="text-white/40 mt-4 font-bold text-lg tracking-tight">Extinde arhitectura Pegasus pentru a colecta date specifice business-ului tău.</p>
                </div>
                <button onClick={openAdd} className="bg-primary-500 text-black px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3 active:scale-95">
                    <Icons.PlusIcon className="w-6 h-6" /> Crează Atribut
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {memberCustomFields.map(field => {
                    const TypeIcon = FIELD_TYPES.find(ft => ft.id === field.type)?.icon || Icons.DocumentTextIcon;
                    return (
                        <div key={field.id} className="group relative glass-card p-8 rounded-[2.5rem] border border-white/10 transition-all duration-500 flex flex-col justify-between hover:border-primary-500/50 hover:-translate-y-1">
                             <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-[2.5rem]"></div>
                             
                             <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-primary-500/10 rounded-2xl border border-primary-500/20 text-primary-500">
                                        <TypeIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(field)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white/40 hover:text-white">
                                            <Icons.PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => { setFieldToDelete(field); setIsDeleteOpen(true); }} className="p-2.5 bg-red-500/5 hover:bg-red-500/20 rounded-xl text-red-500/40 hover:text-red-500 transition-all border border-red-500/10">
                                            <Icons.TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">{field.label}</h3>
                                        {field.required && <span className="text-red-500 font-black">*</span>}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 opacity-60">ID: {field.name}</p>
                                    <p className="text-xs mt-3 font-medium leading-relaxed text-white/50">{field.description || 'Câmp dinamic pentru profilele membrilor.'}</p>
                                </div>
                             </div>

                             <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Mod: {field.type}</span>
                                {field.type === 'select' && <span className="text-[9px] font-black uppercase tracking-widest text-primary-400">{field.options?.length} opțiuni</span>}
                             </div>
                        </div>
                    );
                })}

                {memberCustomFields.length === 0 && (
                    <div className="col-span-full py-32 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                         <Icons.ViewGridAddIcon className="w-20 h-20 mx-auto mb-6" />
                         <p className="font-black text-xl uppercase tracking-widest italic text-white">Arhitectură Versatilă: Adaugă primele câmpuri proprii</p>
                    </div>
                )}
            </div>

            <div className="p-10 bg-primary-500/5 border border-primary-500/10 rounded-[3rem] flex items-start gap-8 relative overflow-hidden group">
                <div className="absolute inset-0 gold-shimmer opacity-5 pointer-events-none"></div>
                <div className="p-4 bg-primary-500 text-black rounded-[1.5rem] shadow-2xl relative z-10">
                    <Icons.PuzzleIcon className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-xl font-black uppercase tracking-tighter text-primary-500 mb-2 italic">Flexibilitate Totală</h4>
                    <p className="text-sm text-text-dark-secondary leading-relaxed font-bold max-w-3xl">
                        Câmpurile create aici apar automat în formularul de editare al fiecărui membru. Le poți folosi pentru date medicale, preferințe de echipament sau istoricul vânzărilor consultative. Pegasus AI poate indexa aceste date pentru a oferi sugestii mai precise.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomFieldsSettings;
