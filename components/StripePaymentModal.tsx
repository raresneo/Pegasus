
import React, { useState, useEffect } from 'react';
import * as Icons from './icons';
import FormModal from './FormModal';

interface StripePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    onSuccess: (ref: string) => void;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({ isOpen, onClose, amount, description, onSuccess }) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });

    const handlePay = () => {
        if (!cardData.number || cardData.number.length < 16) {
            alert('Te rugăm să introduci un număr de card valid.');
            return;
        }
        
        setStatus('processing');
        
        // Simulare apel API Stripe
        setTimeout(() => {
            if (cardData.number === '4242424242424242') { // Mock succes card
                setStatus('success');
                setTimeout(() => {
                    onSuccess(`st_ref_${Math.random().toString(36).substr(2, 9)}`);
                    onClose();
                    setStatus('idle');
                    setCardData({ number: '', expiry: '', cvc: '' });
                }, 2000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Stripe Secure Checkout">
            <div className="space-y-6">
                <div className="flex items-center justify-center mb-2">
                    <div className="bg-accent px-3 py-1 rounded text-white font-black italic text-xs tracking-tighter">stripe</div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 dark:bg-background-dark p-4 rounded-2xl border border-border-light dark:border-border-dark">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1">Sumă de plată</p>
                        <p className="text-3xl font-black text-primary-500">{amount.toLocaleString()} <span className="text-sm font-bold opacity-60">RON</span></p>
                    </div>
                    <div className="text-right">
                         <p className="text-[11px] font-black uppercase text-text-light-primary dark:text-text-dark-primary tracking-tighter">{description}</p>
                         <p className="text-[9px] font-bold text-text-light-secondary dark:text-text-dark-secondary italic">Plată securizată prin Gym Master</p>
                    </div>
                </div>

                {status === 'processing' ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-fadeIn">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-accent/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest animate-pulse text-accent">Securing Transaction...</p>
                            <p className="text-[10px] font-bold text-text-light-secondary opacity-60">Criptare end-to-end activă</p>
                        </div>
                    </div>
                ) : status === 'success' ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-scaleIn">
                        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                            <Icons.CheckCircleIcon className="w-12 h-12" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black uppercase tracking-tighter text-green-600">Plată Reușită!</p>
                            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary font-medium">Factura a fost emisă și trimisă pe email.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex items-start gap-3">
                             <Icons.ShieldCheckIcon className="w-6 h-6 text-accent mt-0.5" />
                             <p className="text-[11px] font-semibold text-accent/80 dark:text-accent leading-relaxed">Fitable este conform PCI-DSS Level 1. Datele tale de card nu sunt stocate pe serverele noastre, ci procesate direct de Stripe.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2 ml-1">Număr Card</label>
                                <div className="relative group">
                                    <Icons.CreditCardIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                                    <input 
                                        type="text" 
                                        maxLength={16}
                                        placeholder="4242 4242 4242 4242"
                                        value={cardData.number}
                                        onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, '')})}
                                        className="w-full pl-12 p-4 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm font-bold focus:ring-2 focus:ring-accent outline-none transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2 ml-1">Expiră (MM/YY)</label>
                                    <input 
                                        type="text" 
                                        placeholder="12/26"
                                        value={cardData.expiry}
                                        onChange={e => setCardData({...cardData, expiry: e.target.value})}
                                        className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm font-bold focus:ring-2 focus:ring-accent outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-2 ml-1">CVC</label>
                                    <input 
                                        type="text" 
                                        maxLength={3}
                                        placeholder="123"
                                        value={cardData.cvc}
                                        onChange={e => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                                        className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm font-bold focus:ring-2 focus:ring-accent outline-none" 
                                    />
                                </div>
                            </div>
                        </div>

                        {status === 'error' && (
                             <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 text-xs font-bold flex items-center gap-2">
                                <Icons.XCircleIcon className="w-4 h-4" /> Card declinat. Te rugăm să verifici datele introduse.
                             </div>
                        )}

                        <button 
                            onClick={handlePay}
                            className="w-full py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-accent/30 hover:bg-opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Icons.ShieldCheckIcon className="w-5 h-5" /> Plătește în Siguranță
                        </button>
                    </div>
                )}
            </div>
        </FormModal>
    );
};

export default StripePaymentModal;
