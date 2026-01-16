import React, { useState } from 'react';
import * as Icons from '../icons';

interface DocumentTemplate {
    id: string;
    title: string;
    type: 'waiver' | 'contract' | 'gdpr';
    isRequired: boolean;
    lastUpdated: string;
}

const FormsWaiversSettings: React.FC = () => {
    const [templates, setTemplates] = useState<DocumentTemplate[]>([
        { id: '1', title: 'Termeni și Condiții Generale', type: 'contract', isRequired: true, lastUpdated: '2024-01-10' },
        { id: '2', title: 'Politica GDPR & Confidențialitate', type: 'gdpr', isRequired: true, lastUpdated: '2023-11-05' },
        { id: '3', title: 'Declarație Sănătate & Răspundere', type: 'waiver', isRequired: true, lastUpdated: '2024-02-01' },
    ]);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
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
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Formulare & Acorduri</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Gestionează documentele legale și semnăturile digitale.</p>
                </div>
                <button onClick={handleSave} className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all">
                    Salvează Modificările
                </button>
            </div>

            <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10 space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Documente Active</h3>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                        <Icons.PlusIcon className="w-4 h-4" />
                        Template Nou
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(doc => (
                        <div key={doc.id} className="group bg-background-dark/50 rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${doc.type === 'contract' ? 'bg-blue-500/10 text-blue-400' : doc.type === 'waiver' ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    <Icons.DocumentTextIcon className="w-6 h-6" />
                                </div>
                                {doc.isRequired && (
                                    <span className="px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider">
                                        Mandatory
                                    </span>
                                )}
                            </div>

                            <h4 className="font-bold text-white mb-2 line-clamp-2 min-h-[3rem]">{doc.title}</h4>

                            <div className="flex items-center text-xs text-white/40 mb-6">
                                <Icons.ClockIcon className="w-3 h-3 mr-1" /> Updated: {doc.lastUpdated}
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors">
                                    Editează
                                </button>
                                <button className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                    <Icons.EyeIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-8 md:col-span-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Setări Semnătură</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">Semnătură Digitală</span>
                            <div className="w-10 h-5 bg-primary-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">Trimite Email Copie</span>
                            <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-900/40 to-card-dark rounded-[2.5rem] border border-white/5 p-8 md:col-span-2 flex flex-col justify-center items-center text-center">
                    <Icons.PencilSquareIcon className="w-12 h-12 text-primary-400 mb-4" />
                    <h3 className="text-xl font-black text-white mb-2">Editor Template-uri</h3>
                    <p className="text-white/60 text-sm max-w-md">Folosește editorul nostru drag-and-drop pentru a crea contracte personalizate cu variabile dinamice.</p>
                </div>
            </div>
        </div>
    );
};

export default FormsWaiversSettings;