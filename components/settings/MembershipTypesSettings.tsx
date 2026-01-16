
import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';

const MembershipTypesSettings: React.FC = () => {
    const { membershipTiers, beneficii } = useDatabase();

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Planuri Abonament</h1>
                    <p className="text-text-dark-secondary mt-1 font-semibold">Configurați planurile de acces recurente și categoriile de beneficii incluse.</p>
                </div>
                <button className="flex items-center bg-primary-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black gap-2">
                    <Icons.PlusIcon className="w-5 h-5" /> Plan Nou
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {membershipTiers.map(tier => (
                    <div key={tier.id} className="bg-white dark:bg-card-dark rounded-[3rem] border border-border-light dark:border-border-dark overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                        <div className="p-10 flex-1 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{tier.name}</h3>
                                    {tier.popular && <span className="px-3 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mt-2 inline-block">Cel mai popular</span>}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-background-dark rounded-2xl group-hover:scale-110 transition-transform">
                                    <Icons.TicketIcon className="w-8 h-8 text-primary-500" />
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-text-light-primary dark:text-text-dark-primary">{tier.price}</span>
                                <span className="text-sm font-black text-text-light-secondary dark:text-text-dark-secondary uppercase opacity-60">RON / {tier.billingCycle === 'monthly' ? 'lună' : 'an'}</span>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 border-b border-border-light dark:border-border-dark pb-2">Beneficii și Facilități</h4>
                                <ul className="space-y-3">
                                    {tier.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-tight">
                                            <Icons.CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                    {tier.benefitIds?.map(bid => {
                                        const benefit = beneficii.find(b => b.id === bid);
                                        const BenefitIcon = Icons[benefit?.icon as keyof typeof Icons] || Icons.CheckCircleIcon;
                                        return (
                                            <li key={bid} className="flex items-center gap-3 text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-tight">
                                                <BenefitIcon className="w-5 h-5 flex-shrink-0" />
                                                {benefit?.nume}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        
                        <div className="p-8 bg-gray-50 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark flex gap-3">
                            <button className="flex-1 py-3 bg-white dark:bg-card-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-primary-500 hover:text-white transition-all border border-border-light dark:border-border-dark">Editează Abonament</button>
                            <button className="p-3 bg-white dark:bg-card-dark rounded-xl text-red-500 border border-border-light dark:border-border-dark hover:bg-red-500 hover:text-white transition-all"><Icons.TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MembershipTypesSettings;
