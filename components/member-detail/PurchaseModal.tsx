
import React, { useState, useMemo } from 'react';
import { Member, MembershipTier, Payment } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import { membershipTiers } from '../../lib/data';
import StripePaymentModal from '../StripePaymentModal';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

const MembershipCard: React.FC<{
    tier: MembershipTier;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ tier, isSelected, onSelect }) => (
    <div onClick={onSelect} className={`border-2 rounded-[1.5rem] p-4 cursor-pointer transition-all duration-300 relative ${isSelected ? 'border-primary-500 bg-primary-500/5 shadow-lg' : 'bg-gray-50 dark:bg-background-dark border-border-light dark:border-border-dark hover:border-primary-400'}`}>
        {tier.popular && <div className="absolute top-0 right-4 -mt-2.5 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Cel mai popular</div>}
        <h3 className="text-md font-bold mb-1">{tier.name}</h3>
        <p className="text-xl font-black text-primary-500">{tier.price.toLocaleString()} RON <span className="text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary">/{tier.billingCycle === 'monthly' ? 'lună' : 'an'}</span></p>
    </div>
);

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, member }) => {
    const { purchaseMembership, onlineHubSettings } = useDatabase();
    const [selectedTierId, setSelectedTierId] = useState<string | null>(membershipTiers.find(t => t.popular)?.id || null);
    const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Card');
    const [step, setStep] = useState<'selection' | 'success'>('selection');
    
    // Stripe
    const [isStripeOpen, setIsStripeOpen] = useState(false);

    const selectedTier = useMemo(() => membershipTiers.find(t => t.id === selectedTierId), [selectedTierId]);

    const handleConfirm = () => {
        if (!selectedTierId) return;

        if (paymentMethod === 'Card' && onlineHubSettings.stripe.enabled) {
            setIsStripeOpen(true);
        } else {
            purchaseMembership(member.id, selectedTierId, paymentMethod);
            setStep('success');
        }
    };

    const handleStripeSuccess = (ref: string) => {
        if (selectedTierId) {
            purchaseMembership(member.id, selectedTierId, 'Stripe');
            setStep('success');
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep('selection');
            setSelectedTierId(membershipTiers.find(t => t.popular)?.id || null);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fadeIn" onClick={handleClose}>
            <StripePaymentModal 
                isOpen={isStripeOpen}
                onClose={() => setIsStripeOpen(false)}
                amount={selectedTier?.price || 0}
                description={`Abonament ${selectedTier?.name}`}
                onSuccess={handleStripeSuccess}
            />

            <div className="bg-white dark:bg-card-dark rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-scaleIn flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {step === 'selection' ? (
                    <>
                        <header className="p-8 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-background-dark/30">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Achiziție Abonament Nou</h3>
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Client: <span className="font-bold text-text-light-primary dark:text-text-dark-primary">{member.firstName} {member.lastName}</span></p>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><Icons.XIcon className="w-6 h-6" /></button>
                        </header>
                        <main className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary-500">1. Alege Tipul</h4>
                                <div className="space-y-3">
                                    {membershipTiers.map(tier => (
                                        <MembershipCard key={tier.id} tier={tier} isSelected={selectedTierId === tier.id} onSelect={() => setSelectedTierId(tier.id)} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                {selectedTier && (
                                    <div className="bg-gray-100 dark:bg-background-dark rounded-[1.5rem] p-6 space-y-6 sticky top-0 border border-border-light dark:border-border-dark">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-primary-500 border-b border-border-light dark:border-border-dark pb-3">Sumar Comandă</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm">{selectedTier.name}</span>
                                            <span className="font-black text-lg">{selectedTier.price.toLocaleString()} RON</span>
                                        </div>
                                        <ul className="text-[10px] font-bold text-text-light-secondary dark:text-text-dark-secondary space-y-2 uppercase tracking-tight">
                                            {selectedTier.features.map(f => <li key={f} className="flex items-center gap-2"><Icons.CheckCircleIcon className="w-3 h-3 text-green-500" /> {f}</li>)}
                                        </ul>
                                        <div className="border-t border-border-light dark:border-border-dark pt-4">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2">2. Metodă Plată</label>
                                            <select 
                                                value={paymentMethod} 
                                                onChange={e => setPaymentMethod(e.target.value as any)} 
                                                className="w-full p-3 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="Card">{onlineHubSettings.stripe.enabled ? 'Card (Stripe Online)' : 'Card (La Terminal)'}</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Other">Altă Metodă</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                        <footer className="p-8 border-t border-border-light dark:border-border-dark flex justify-end gap-3 bg-gray-50 dark:bg-background-dark/30">
                            <button onClick={handleClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors">Anulează</button>
                            <button onClick={handleConfirm} disabled={!selectedTierId} className="px-10 py-3 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all disabled:opacity-50">
                                Confirmă Plata
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="p-16 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-green-500/20 animate-scaleIn">
                            <Icons.CheckCircleIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Cumpărare Reușită!</h3>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary max-w-sm mx-auto">Noul abonament <strong>{selectedTier?.name}</strong> este acum activ pentru {member.firstName}.</p>
                        <button onClick={handleClose} className="mt-8 px-10 py-4 bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all">
                            Închide
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseModal;
