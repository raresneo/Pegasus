import React, { useState } from 'react';
import * as Icons from '../icons';

const TemplatesSettings: React.FC = () => {
    const [templates, setTemplates] = useState([
        { id: '1', title: 'Bun venit în club', type: 'email', subject: 'Bine ai venit la Pegas!', uses: 1240 },
        { id: '2', title: 'Confirmare Rezervare', type: 'sms', subject: 'Rezervare confirmată', uses: 850 },
        { id: '3', title: 'Factură Emisă', type: 'email', subject: 'Factura ta Pegas', uses: 3200 },
        { id: '4', title: 'Recuperare Parolă', type: 'email', subject: 'Resetare parolă cont', uses: 156 },
    ]);

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn space-y-10">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Template-uri Comunicate</h1>
                    <p className="text-text-dark-secondary font-medium mt-2">Mesaje predefinite pentru email, SMS și notificări push.</p>
                </div>
                <button className="bg-primary-500 text-white px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <Icons.PlusIcon className="w-4 h-4" />
                    Creează Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {templates.map(tpl => (
                    <div key={tpl.id} className="bg-card-dark rounded-[2rem] border border-white/5 p-8 hover:border-white/10 transition-all hover:-translate-y-1 group cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl ${tpl.type === 'email' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                {tpl.type === 'email' ? <Icons.EnvelopeIcon className="w-6 h-6" /> : <Icons.ChatBubbleLeftEllipsisIcon className="w-6 h-6" />}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono text-white/40">{tpl.uses} trimiteri</div>
                        </div>
                        <h4 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors mb-2">{tpl.title}</h4>
                        <p className="text-sm text-white/40 line-clamp-2">Subiect: {tpl.subject}</p>

                        <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                            <button className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Editează</button>
                            <button className="px-3 py-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Icons.PaperAirplaneIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}

                <div className="bg-background-dark/30 rounded-[2rem] border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center text-center hover:border-primary-500/30 hover:bg-primary-500/5 transition-all cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-primary-500/20 flex items-center justify-center mb-4 transition-colors">
                        <Icons.PlusIcon className="w-8 h-8 text-white/20 group-hover:text-primary-500" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-primary-400">Template Nou</h4>
                </div>
            </div>

            <div className="bg-card-dark rounded-[2.5rem] border border-white/5 p-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Variabile Disponibile</h3>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {['{{member_first_name}}', '{{member_last_name}}', '{{membership_type}}', '{{expiry_date}}', '{{club_name}}', '{{booking_time}}'].map(v => (
                        <span key={v} className="px-3 py-1.5 rounded-lg bg-black/40 text-green-400 border border-white/5 hover:border-white/20 cursor-copy active:scale-95 transition-all">{v}</span>
                    ))}
                </div>
                <p className="text-xs text-white/40 mt-4 italic">Click pe variabilă pentru a copia în clipboard.</p>
            </div>
        </div>
    );
};

export default TemplatesSettings;