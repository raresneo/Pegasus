
import React, { useState, useMemo } from 'react';
import { Member, CommunicationType, NotificationTemplate } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import { useDatabase } from '../../context/DatabaseContext';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { generateNotificationUrls } from '../../lib/notifications';

interface CommunicationTabProps {
    member: Member;
}

const commIcons: Record<CommunicationType, React.FC<any>> = {
    email: Icons.MailIcon,
    sms: Icons.ChatBubbleLeftEllipsisIcon,
    call: Icons.PhoneIcon,
    note: Icons.DocumentTextIcon,
    absence: Icons.TagIcon,
    whatsapp: Icons.WhatsAppIcon,
    review_request: Icons.StarIcon,
};

const TimelineItem: React.FC<{ comm: any, isLast: boolean }> = ({ comm, isLast }) => {
    const Icon = commIcons[comm.type] || Icons.DocumentTextIcon;
    const date = new Date(comm.date);

    return (
        <div className="relative pl-10 pb-8 group">
            {!isLast && <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-border-dark group-hover:bg-primary-500/30 transition-colors"></div>}
            
            <div className={`absolute left-0 top-0 w-8 h-8 rounded-xl flex items-center justify-center z-10 border-2 transition-all group-hover:scale-110 shadow-sm ${
                comm.type === 'note' ? 'bg-gray-100 dark:bg-background-dark border-gray-200 dark:border-border-dark text-gray-500' :
                comm.type === 'whatsapp' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                comm.type === 'email' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                'bg-primary-500/10 border-primary-500/30 text-primary-500'
            }`}>
                <Icon className="w-4 h-4" />
            </div>

            <div className="bg-white dark:bg-card-dark p-6 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-tight text-text-light-primary dark:text-text-dark-primary">{comm.subject}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary opacity-60">{comm.author}</span>
                            <span className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary opacity-30">•</span>
                            <span className="text-[10px] font-bold text-text-light-secondary dark:text-text-dark-secondary opacity-60">
                                {format(date, 'd MMM yyyy, HH:mm', { locale: ro })}
                            </span>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-gray-50 dark:bg-background-dark rounded-lg text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary border border-border-light dark:border-border-dark">
                        {comm.type}
                    </span>
                </div>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed italic">
                    "{comm.notes}"
                </p>
                
                {(comm.type === 'email' || comm.type === 'sms' || comm.type === 'whatsapp') && (
                    <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex gap-3">
                         <button className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:underline">Re-trimite Mesaj</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CommunicationTab: React.FC<CommunicationTabProps> = ({ member }) => {
    const { addCommunication, notificationTemplates, messageLocalization, locations, currentLocationId } = useDatabase();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [newComm, setNewComm] = useState({ 
        type: 'note' as CommunicationType, 
        subject: '', 
        notes: ''
    });

    const location = locations.find(l => l.id === currentLocationId) || locations[0];
    
    // Generăm link-urile de comunicare live
    const directLinks = useMemo(() => {
        return generateNotificationUrls(member, undefined, notificationTemplates, messageLocalization, undefined, undefined, location);
    }, [member, notificationTemplates, messageLocalization, location]);

    const handleSave = () => {
        if (!newComm.subject || !newComm.notes) {
            alert("Vă rugăm să completați subiectul și notele.");
            return;
        }
        addCommunication(member.id, newComm);
        setNewComm({ type: 'note', subject: '', notes: '' });
        setIsModalOpen(false);
    };

    const handleApplyTemplate = (template: NotificationTemplate) => {
        let content = template.content.replace(/{{clientFirstName}}/g, member.firstName);
        setNewComm({
            type: template.channel as any,
            subject: template.name,
            notes: content
        });
        setSelectedTemplateId(template.id);
    };

    const comms = [...(member.communications || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-12 animate-fadeIn">
             <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Comunicare nouă: ${member.firstName}`}>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-dark-secondary mb-2 opacity-60">Tip Comunicare</label>
                            <select 
                                value={newComm.type} 
                                onChange={e => setNewComm(p => ({...p, type: e.target.value as CommunicationType}))}
                                className="p-3 w-full bg-background-dark rounded-xl border border-border-dark text-sm outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                            >
                                <option value="note">Notă Internă</option>
                                <option value="email">Email</option>
                                <option value="call">Apel Telefon</option>
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-dark-secondary mb-2 opacity-60">Folosește Template</label>
                            <select 
                                value={selectedTemplateId}
                                onChange={e => {
                                    const template = notificationTemplates.find(t => t.id === e.target.value);
                                    if (template) handleApplyTemplate(template);
                                }}
                                className="p-3 w-full bg-background-dark rounded-xl border border-border-dark text-sm outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                            >
                                <option value="">Fără Template (Manual)</option>
                                {notificationTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-dark-secondary mb-2 opacity-60">Subiect</label>
                        <input type="text" value={newComm.subject} onChange={e => setNewComm(p => ({...p, subject: e.target.value}))} className="p-3 w-full bg-background-dark rounded-xl border border-border-dark text-sm outline-none focus:ring-2 focus:ring-primary-500 font-bold" placeholder="ex: Discuție prelungire abonament"/>
                    </div>
                     <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-text-dark-secondary mb-2 opacity-60">Conținut Mesaj / Note</label>
                        <textarea value={newComm.notes} onChange={e => setNewComm(p => ({...p, notes: e.target.value}))} rows={5} className="p-3 w-full bg-background-dark rounded-xl border border-border-dark text-sm outline-none focus:ring-2 focus:ring-primary-500 font-medium" placeholder="Ce s-a discutat sau conținutul mesajului..."></textarea>
                    </div>
                </div>
                 <div className="mt-10 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-background-dark transition-colors">Anulează</button>
                    <button onClick={handleSave} className="px-8 py-3 text-xs font-black uppercase tracking-widest bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Salvează Activitatea</button>
                </div>
            </FormModal>

            {/* Hub Comunicare Directă */}
            <section className="bg-white dark:bg-card-dark rounded-[2.5rem] p-10 border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-text-light-primary dark:text-text-dark-primary flex items-center gap-3">
                        <Icons.GlobeAltIcon className="w-6 h-6 text-primary-500" /> Acțiuni Directe Mesagerie
                    </h3>
                    <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* WhatsApp Action */}
                    <a 
                        href={directLinks.whatsapp.direct}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-green-600 text-white font-black transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl shadow-green-600/30"
                    >
                        <Icons.WhatsAppIcon className="w-12 h-12 mb-4" />
                        <span className="text-[11px] uppercase tracking-[0.2em]">Deschide WhatsApp</span>
                        <p className="text-[9px] opacity-70 mt-2 font-bold">{member.phone}</p>
                    </a>

                    {/* Email Action */}
                    <a 
                        href={directLinks.email.direct}
                        className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-blue-600 text-white font-black transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl shadow-blue-600/30"
                    >
                        <Icons.MailIcon className="w-12 h-12 mb-4" />
                        <span className="text-[11px] uppercase tracking-[0.2em]">Trimite Email</span>
                        <p className="text-[9px] opacity-70 mt-2 font-bold truncate max-w-full px-4">{member.email}</p>
                    </a>

                    {/* SMS Action */}
                    <a 
                        href={directLinks.sms.direct}
                        className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-indigo-600 text-white font-black transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl shadow-indigo-600/30"
                    >
                        <Icons.ChatBubbleLeftEllipsisIcon className="w-12 h-12 mb-4" />
                        <span className="text-[11px] uppercase tracking-[0.2em]">Mesaj SMS Rapid</span>
                        <p className="text-[9px] opacity-70 mt-2 font-bold">{member.phone}</p>
                    </a>
                </div>

                <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => window.location.href = directLinks.whatsapp.payment}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-background-dark border border-green-500/30 text-green-600 dark:text-green-400 font-black uppercase text-[10px] tracking-widest hover:bg-green-500/10 transition-all"
                    >
                        <Icons.CurrencyDollarIcon className="w-4 h-4" /> Reminder Plată WhatsApp
                    </button>
                    <button 
                        onClick={() => window.open(`tel:${member.phone}`)}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-background-dark border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500/10 transition-all"
                    >
                        <Icons.PhoneIcon className="w-4 h-4" /> Apel Vocale
                    </button>
                </div>
            </section>

            <section className="space-y-10">
                 <div className="flex justify-between items-end px-2">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic border-l-4 border-primary-500 pl-4">Istoric Interacțiuni</h3>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">Urmărește evoluția relației cu {member.firstName}.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95">
                        <Icons.PlusIcon className="w-5 h-5"/> Adaugă Notă / Log Mesaj
                    </button>
                </div>

                <div className="relative">
                    {comms.length > 0 ? (
                        <div className="space-y-2">
                            {comms.map((c, index) => (
                                <TimelineItem key={c.id} comm={c} isLast={index === comms.length - 1} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark p-20 text-center flex flex-col items-center opacity-30 italic">
                             <Icons.ClipboardListIcon className="w-16 h-16 mb-4" />
                             <p className="font-black uppercase tracking-widest text-xs">Nicio activitate înregistrată încă.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CommunicationTab;
