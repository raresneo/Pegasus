
import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { NotificationTemplate, MessageLocalizationSettings } from '../types';
import * as Icons from '../components/icons';
import FormModal from '../components/FormModal';

const VARIABLES = [
    'endTime', 'name', 'businessName', 'phoneNumber', 'staffName', 
    'clientFirstName', 'location', 'service', 'totalPrice', 'notes', 
    'bookingLink', 'appointmentLink', 'date', 'startTime'
];

const NotificationSettingsPage: React.FC = () => {
    const { 
        notificationTemplates, 
        addNotificationTemplate, 
        updateNotificationTemplate, 
        deleteNotificationTemplate,
        messageLocalization,
        updateMessageLocalization
    } = useDatabase();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<NotificationTemplate> | null>(null);
    const [previewEnabled, setPreviewEnabled] = useState(true);

    const openAdd = () => {
        setEditingTemplate({
            name: '',
            type: 'custom',
            channel: 'whatsapp',
            content: 'Salut {{clientFirstName}}!',
            autoEnabled: false,
            sendTimeOffset: 0
        });
        setIsEditorOpen(true);
    };

    const handleSave = () => {
        if (!editingTemplate?.name || !editingTemplate?.content) return;
        if (editingTemplate.id) {
            updateNotificationTemplate(editingTemplate as NotificationTemplate);
        } else {
            addNotificationTemplate(editingTemplate as Omit<NotificationTemplate, 'id'>);
        }
        setIsEditorOpen(false);
    };

    const insertVariable = (variable: string) => {
        if (!editingTemplate) return;
        const newContent = (editingTemplate.content || '') + `{{${variable}}}`;
        setEditingTemplate({ ...editingTemplate, content: newContent });
    };

    const renderPreview = (content: string) => {
        const mockData: any = {
            clientFirstName: 'Alex',
            startTime: '10:00',
            service: 'Yoga',
            location: 'Fitable Central',
            staffName: 'Trainer Bob',
            date: 'Miercuri, 15 Octombrie'
        };
        let preview = content;
        VARIABLES.forEach(v => {
            const regex = new RegExp(`{{${v}}}`, 'g');
            preview = preview.replace(regex, mockData[v] || `[${v}]`);
        });
        return preview;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn pb-20">
            <header>
                <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-text-dark-primary uppercase">Centru Notificări</h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary">Personalizează modul în care comunici cu clienții tăi.</p>
            </header>

            {/* Localization Settings */}
            <section className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Icons.GlobeAltIcon className="w-5 h-5 text-primary-500" /> Formatare Mesaje</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Limbă Mesaj</label>
                        <select 
                            value={messageLocalization.language}
                            onChange={e => updateMessageLocalization({...messageLocalization, language: e.target.value as any})}
                            className="w-full p-2.5 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark"
                        >
                            <option value="ro">Română (Miercuri, 15 Octombrie)</option>
                            <option value="en">English (Wednesday, October 15)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Format Oră</label>
                        <select 
                             value={messageLocalization.timeFormat}
                             onChange={e => updateMessageLocalization({...messageLocalization, timeFormat: e.target.value as any})}
                             className="w-full p-2.5 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark"
                        >
                            <option value="24h">24 Ore (14:30)</option>
                            <option value="12h">12 Ore (2:30 PM)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Format Dată</label>
                        <input 
                            type="text" 
                            value={messageLocalization.dateFormat}
                            onChange={e => updateMessageLocalization({...messageLocalization, dateFormat: e.target.value})}
                            className="w-full p-2.5 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark font-mono text-xs"
                        />
                    </div>
                </div>
            </section>

            {/* Template List */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Template-uri Mesaje</h3>
                    <button onClick={openAdd} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-600 transition-all">
                        <Icons.PlusIcon className="w-4 h-4" /> Adaugă Template
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notificationTemplates.map(t => (
                        <div key={t.id} className="bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-5 hover:border-primary-500 transition-all group shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-text-light-primary dark:text-text-dark-primary">{t.name}</h4>
                                    <span className="text-[10px] uppercase font-black tracking-tighter text-primary-500">{t.channel} • {t.type}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingTemplate(t); setIsEditorOpen(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-background-dark rounded-lg"><Icons.PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => deleteNotificationTemplate(t.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><Icons.TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary line-clamp-2 italic mb-4">"{t.content}"</p>
                            <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={t.autoEnabled} onChange={() => updateNotificationTemplate({...t, autoEnabled: !t.autoEnabled})} className="h-4 w-4 rounded border-border-light dark:bg-background-dark text-primary-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Adaugă automat la programări</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Template Editor Modal */}
            <FormModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title={editingTemplate?.id ? 'Editare Template' : 'Template Nou'}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Nume Intern</label>
                        <input value={editingTemplate?.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} className="w-full p-2.5 bg-background-dark rounded-xl border border-border-dark text-sm" placeholder="ex: Reminder WhatsApp 24h" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Canal</label>
                            <select value={editingTemplate?.channel} onChange={e => setEditingTemplate({...editingTemplate, channel: e.target.value as any})} className="w-full p-2.5 bg-background-dark rounded-xl border border-border-dark text-sm">
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sms">SMS</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Tip</label>
                            <select value={editingTemplate?.type} onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value as any})} className="w-full p-2.5 bg-background-dark rounded-xl border border-border-dark text-sm">
                                <option value="reminder">Reminder</option>
                                <option value="followup">Follow-up / Rebooking</option>
                                <option value="instant">Instant (la creare)</option>
                                <option value="custom">Personalizat</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-xs font-black uppercase text-text-dark-secondary tracking-widest">Template Mesaj</label>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-text-dark-secondary">Preview</span>
                                <button onClick={() => setPreviewEnabled(!previewEnabled)} className={`w-8 h-4 rounded-full transition-all relative ${previewEnabled ? 'bg-primary-500' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${previewEnabled ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                             </div>
                        </div>
                        <textarea 
                            value={editingTemplate?.content} 
                            onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                            rows={5} 
                            className="w-full p-4 bg-background-dark rounded-2xl border border-border-dark text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        
                        <div className="mt-3">
                            <p className="text-[10px] font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Variabile Disponibile (Click pentru a insera)</p>
                            <div className="flex flex-wrap gap-1.5">
                                {VARIABLES.map(v => (
                                    <button key={v} onClick={() => insertVariable(v)} className="px-2 py-1 bg-primary-500/10 hover:bg-primary-500 hover:text-white text-primary-500 text-[10px] font-bold rounded-md transition-all border border-primary-500/20">
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {previewEnabled && (
                        <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-black uppercase text-text-dark-secondary mb-2 tracking-widest">Previzualizare Mesaj</p>
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm text-sm border border-border-light dark:border-border-dark relative">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                                </div>
                                {renderPreview(editingTemplate?.content || '')}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-sm font-bold hover:bg-gray-100 dark:hover:bg-background-dark rounded-xl transition-colors">Anulează</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20">Salvează Template</button>
                </div>
            </FormModal>
        </div>
    );
};

export default NotificationSettingsPage;
