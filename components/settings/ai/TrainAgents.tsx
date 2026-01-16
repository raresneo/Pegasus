import React, { useState } from 'react';
import * as Icons from '../../icons';

interface KnowledgeFile {
    id: string;
    name: string;
    type: 'pdf' | 'csv' | 'txt' | 'web';
    status: 'indexed' | 'processing';
    size: string;
}

const TrainAgents: React.FC = () => {
    const [files, setFiles] = useState<KnowledgeFile[]>([
        { id: '1', name: 'Regulament_Intern_2025.pdf', type: 'pdf', status: 'indexed', size: '2.4 MB' },
        { id: '2', name: 'Oferte_Promotionale.csv', type: 'csv', status: 'indexed', size: '156 KB' },
        { id: '3', name: 'Manual_Utilizare_Echipamente.txt', type: 'txt', status: 'indexed', size: '45 KB' },
    ]);

    const handleUpload = () => {
        const newFile: KnowledgeFile = {
            id: Date.now().toString(),
            name: 'Nou_Document.pdf',
            type: 'pdf',
            status: 'processing',
            size: '1.0 MB'
        };
        setFiles([newFile, ...files]);
        setTimeout(() => {
            setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: 'indexed' } : f));
        }, 3000);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Train Agents</h1>
                    <p className="text-text-dark-secondary mt-1">Antrenează "Creierul" Fitable cu propriile date comerciale.</p>
                </div>
                <button onClick={handleUpload} className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2">
                    <Icons.PlusIcon className="w-5 h-5" />
                    Adaugă Cunoștințe
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-dark p-6 rounded-2xl border border-border-dark col-span-2">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-primary-400 mb-4">Documente Încărcate</h3>
                    <div className="space-y-3">
                        {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-4 bg-background-dark/50 rounded-xl border border-border-dark group hover:border-primary-500/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary-900/30 rounded-lg text-primary-400">
                                        <Icons.DocumentTextIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-dark-primary">{file.name}</p>
                                        <p className="text-xs text-text-dark-secondary">{file.type.toUpperCase()} • {file.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${file.status === 'indexed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${file.status === 'indexed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                                        {file.status}
                                    </span>
                                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all">
                                        <Icons.TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
                        <h3 className="font-black text-xl mb-2">AI Stats</h3>
                        <div className="space-y-4 mt-4">
                            <div>
                                <p className="text-xs text-white/70 uppercase font-bold tracking-widest">Cunoștințe Totale</p>
                                <p className="text-2xl font-black">1.2 GB</p>
                            </div>
                            <div>
                                <p className="text-xs text-white/70 uppercase font-bold tracking-widest">Acuratețe Răspuns</p>
                                <p className="text-2xl font-black">98.4%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card-dark p-6 rounded-2xl border border-border-dark">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-text-dark-primary mb-4">Sincronizare Web</h3>
                        <div className="p-4 bg-background-dark rounded-xl border border-border-dark border-dashed text-center">
                            <Icons.GlobeAltIcon className="w-8 h-8 mx-auto mb-2 text-text-dark-secondary" />
                            <p className="text-xs text-text-dark-secondary">Adaugă un URL pentru a extrage automat informații din site-ul tău.</p>
                            <button className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300">Conectează Sursă &rarr;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainAgents;