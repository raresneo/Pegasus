
import React, { useState } from 'react';
import * as Icons from '../components/icons';
import ReferralModal from '../components/ReferralModal';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

const ReferralsPage: React.FC = () => {
    const { user } = useAuth();
    const { onlineHubSettings, members } = useDatabase();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Generate a unique referral link (simulated)
    const referralLink = `https://fitable.app/signup?ref=${user?.id || 'guest'}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        alert("Link copiat în clipboard!");
    };

    const mockReferrals = [
        { name: 'Alex Ionescu', date: '20 Oct 2024', status: 'Abonament Activ', reward: `50 ${onlineHubSettings.referralRewardCurrency}` },
        { name: 'Maria Popa', date: '15 Nov 2024', status: 'Înregistrat', reward: 'Pendent' },
        { name: 'George Enache', date: '01 Dec 2024', status: 'Abonament Activ', reward: `50 ${onlineHubSettings.referralRewardCurrency}` },
    ];

    const rewardSuffix = onlineHubSettings.referralRewardType === 'fixed' ? onlineHubSettings.referralRewardCurrency : onlineHubSettings.referralRewardType === 'percentage' ? '%' : ' Zile';

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">
            <ReferralModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-light-primary dark:text-text-dark-primary uppercase">Centru Recomandări</h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 font-semibold">Invită-ți prietenii și fii recompensat pentru fiecare membru nou adus în comunitatea Fitable.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3 active:scale-95"
                >
                    <Icons.GiftIcon className="w-6 h-6" /> Invită Prieteni
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between h-64">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Venit Total Generat</p>
                        <p className="text-5xl font-black">150 {onlineHubSettings.referralRewardCurrency}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                        <Icons.CheckCircleIcon className="w-4 h-4" /> 3 Recomandări finalizate
                    </div>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-500/10 rounded-xl">
                            <Icons.LinkIcon className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="font-black text-xl text-text-light-primary dark:text-text-dark-primary uppercase tracking-tighter">Link-ul tău de partener</h3>
                    </div>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-6 italic leading-relaxed">
                        Trimite acest link prietenilor tăi. Odată ce își activează primul abonament folosind acest link, comisionul tău va fi adăugat automat în cont.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 bg-gray-50 dark:bg-background-dark p-4 rounded-2xl border border-border-light dark:border-border-dark font-mono text-xs text-text-light-primary dark:text-text-dark-primary flex items-center overflow-hidden">
                            <span className="truncate">{referralLink}</span>
                        </div>
                        <button onClick={handleCopy} className="bg-primary-500 text-white px-6 py-4 rounded-2xl font-black hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95">
                            COPIAZĂ
                        </button>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-primary-500">Distribuie rapid pe:</p>
                        <div className="flex gap-2">
                            <a href={`https://wa.me/?text=${encodeURIComponent('Vino cu mine la sală! Înregistrează-te aici: ' + referralLink)}`} target="_blank" className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"><Icons.WhatsAppIcon className="w-5 h-5"/></a>
                            <button className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Icons.UsersIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commissions breakdown for the specific client */}
            <section className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark/30 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tighter text-text-light-primary dark:text-text-dark-primary">Activitate Recomandări</h3>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Urmărește statusul prietenilor tăi invitați.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-primary-500 tracking-widest">Bonus curent</p>
                        <p className="text-xl font-black">{onlineHubSettings.referralRewardAmount} {rewardSuffix}</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase bg-gray-50 dark:bg-background-dark/50 text-text-light-secondary dark:text-text-dark-secondary font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Prieten Invitat</th>
                                <th className="px-8 py-4">Dată Înscriere</th>
                                <th className="px-8 py-4">Status Conversie</th>
                                <th className="px-8 py-4 text-right">Comision Câștigat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark text-text-light-primary dark:text-text-dark-primary">
                            {mockReferrals.map((ref, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-background-dark/30 transition-colors">
                                    <td className="px-8 py-5 font-bold">{ref.name}</td>
                                    <td className="px-8 py-5 text-sm opacity-70">{ref.date}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${ref.status === 'Abonament Activ' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-700'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-primary-500">{ref.reward}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            <div className="p-8 bg-primary-500/5 rounded-[2rem] border border-primary-500/10 flex items-start gap-4">
                <Icons.InformationCircleIcon className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
                    <p className="font-bold text-text-light-primary dark:text-text-dark-primary mb-1 uppercase tracking-tight">Cum funcționează?</p>
                    Bonusul se acordă automat în portofelul tău virtual imediat ce prietenul recomandat achită primul său abonament (minim 1 lună). Poți folosi aceste fonduri pentru a-ți achita propriul abonament sau pentru a cumpăra produse din zona de recepție.
                </div>
            </div>
        </div>
    );
};

export default ReferralsPage;
